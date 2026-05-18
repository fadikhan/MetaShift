/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, Image as ImageIcon, X, Zap, 
  Trash2, RefreshCw, Sparkles, Download, 
  CheckCircle2, AlertCircle, Loader2, Archive,
  FileImage, Map, User, Clock, Copyright, Monitor, Sliders
} from 'lucide-react';
import exifr from 'exifr';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import piexif from 'piexifjs';
import { ImageFile, ImageMetadata } from '../types';
import { getEmptyMetadata, getRandomMetadata, formatSize, resizeImageForGemini } from '../utils/helpers';
import { GlassCard } from './GlassCard';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const AppInterface = ({ onClose }: { onClose: () => void }) => {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [workflowStep, setWorkflowStep] = useState<'upload' | 'choice' | 'edit' | 'processing' | 'download'>('upload');
  const [isFilesPreparing, setIsFilesPreparing] = useState(false);
  const [preparingFiles, setPreparingFiles] = useState<{ name: string; progress: number }[]>([]);
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);
  const [isBatchMode, setIsBatchMode] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeminiThinking, setIsGeminiThinking] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedFile = files.find(f => f.id === selectedFileId) || files[0];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement> | File[]) => {
    const incomingFiles = Array.isArray(e) ? e : Array.from(e.target.files || []);
    if (incomingFiles.length === 0) return;

    setIsFilesPreparing(true);
    setPreparingFiles(incomingFiles.map(f => ({ name: f.name, progress: 0 })));

    const newFiles: ImageFile[] = [];
    
    for (let i = 0; i < incomingFiles.length; i++) {
        const file = incomingFiles[i];
        const id = Math.random().toString(36).substring(7);
        const preview = URL.createObjectURL(file);
        
        // Progress Step 1: Initializing
        setPreparingFiles(prev => prev.map((f, idx) => idx === i ? { ...f, progress: 20 } : f));
        
        let originalMetadata: ImageMetadata = {};
        try {
          // Progress Step 2: Parsing
          setPreparingFiles(prev => prev.map((f, idx) => idx === i ? { ...f, progress: 50 } : f));
          const parsed = await exifr.parse(file) || {};
          
          // Progress Step 3: GPS
          setPreparingFiles(prev => prev.map((f, idx) => idx === i ? { ...f, progress: 80 } : f));
          const { latitude, longitude } = await exifr.gps(file) || {};
          
          originalMetadata = {
            cameraModel: parsed.Model || parsed.Make || '',
            author: parsed.Artist || parsed.Author || parsed.XPAuthor || '',
            timestamp: parsed.DateTimeOriginal ? new Date(parsed.DateTimeOriginal).toLocaleString() : '',
            copyright: parsed.Copyright || '',
            deviceInfo: parsed.SerialNumber || parsed.InternalSerialNumber || '',
            software: parsed.Software || '',
            exposureTime: parsed.ExposureTime ? `1/${Math.round(1/parsed.ExposureTime)}s` : '',
            fNumber: parsed.FNumber ? `f/${parsed.FNumber}` : '',
            iso: parsed.ISO ? String(parsed.ISO) : '',
            gpsCoordinates: latitude && longitude ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` : '',
          };
        } catch (err) {
          console.error('Error parsing EXIF:', err);
        }

        newFiles.push({
          id,
          file,
          preview,
          originalMetadata,
          editedMetadata: { ...originalMetadata },
          status: 'pending',
          progress: 0,
        });

        // Progress Step 4: Complete
        setPreparingFiles(prev => prev.map((f, idx) => idx === i ? { ...f, progress: 100 } : f));
        await new Promise(r => setTimeout(r, 150)); // Small delay for visual rhythm
    }

    setFiles((prev) => {
      const updated = [...prev, ...newFiles];
      if (!selectedFileId && updated.length > 0) setSelectedFileId(updated[0].id);
      return updated;
    });
    
    setIsFilesPreparing(false);
    setPreparingFiles([]);
    setWorkflowStep('choice');
  };

  const getGeminiMetadata = async (file: File): Promise<ImageMetadata | null> => {
    try {
      const base64 = await resizeImageForGemini(file, 800, 800);
      const response = await fetch('/api/gemini/suggest-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType: 'image/jpeg' }),
      });
      if (response.ok) {
        const data = await response.json();
        return data;
      }
      console.error('Gemini API error:', response.statusText);
      return null;
    } catch (err) {
      console.error('Gemini call failed:', err);
      return null;
    }
  };

  const handleChoice = async (mode: 'auto' | 'manual') => {
    if (mode === 'auto') {
      setIsGeminiThinking(true);
      setWorkflowStep('edit');
      
      try {
        // Update files one by one for better feedback
        for (let i = 0; i < files.length; i++) {
          const fileObj = files[i];
          const suggested = await getGeminiMetadata(fileObj.file);
          
          setFiles(prev => prev.map(f => f.id === fileObj.id ? {
            ...f,
            editedMetadata: suggested || getRandomMetadata()
          } : f));
        }
      } catch (err) {
        console.error('Batch generation failed:', err);
      } finally {
        setIsGeminiThinking(false);
      }
    } else {
      if (files.length > 0 && !selectedFileId) setSelectedFileId(files[0].id);
      setWorkflowStep('edit');
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const filtered = prev.filter((f) => f.id !== id);
      const removed = prev.find((f) => f.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      if (filtered.length === 0) {
        setWorkflowStep('upload');
        setSelectedFileId(null);
      } else if (selectedFileId === id) {
        setSelectedFileId(filtered[0].id);
      }
      return filtered;
    });
  };

  const updateMetadata = (id: string, field: keyof ImageMetadata, value: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, editedMetadata: { ...f.editedMetadata, [field]: value } } : f))
    );
  };

  const applyToAll = (field: keyof ImageMetadata, value: string) => {
    setFiles((prev) =>
      prev.map((f) => ({ ...f, editedMetadata: { ...f.editedMetadata, [field]: value } }))
    );
  };

  const generateAIPresets = async () => {
    if (isGeminiThinking) return;
    setIsGeminiThinking(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const fileObj = files[i];
        const suggested = await getGeminiMetadata(fileObj.file);
        
        setFiles(prev => prev.map(f => f.id === fileObj.id ? {
          ...f,
          editedMetadata: suggested || getRandomMetadata()
        } : f));
      }
    } catch (err) {
      console.error('Regeneration failed:', err);
    } finally {
      setIsGeminiThinking(false);
    }
  };

  const clearAllMetadata = () => {
    setFiles((prev) =>
      prev.map((f) => ({ ...f, editedMetadata: getEmptyMetadata() }))
    );
  };

  const updateExif = async (file: File, metadata: ImageMetadata): Promise<Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result as string;
        
        // piexif only handles JPEG
        if (!file.type.includes('jpeg') && !file.type.includes('jpg')) {
          console.warn('Metadata injection currently only supported for JPEG. Skipping for', file.name);
          resolve(file);
          return;
        }

        try {
          const zeroth: any = {};
          const exif: any = {};
          const gps: any = {};

          if (metadata.cameraModel) zeroth[piexif.ImageIFD.Model] = metadata.cameraModel;
          if (metadata.author) zeroth[piexif.ImageIFD.Artist] = metadata.author;
          if (metadata.software) zeroth[piexif.ImageIFD.Software] = metadata.software;
          if (metadata.copyright) zeroth[piexif.ImageIFD.Copyright] = metadata.copyright;
          
          if (metadata.timestamp) {
            // piexif expects YYYY:MM:DD HH:MM:SS
            const cleanDate = metadata.timestamp.replace(/-/g, ':').substring(0, 19);
            exif[piexif.ExifIFD.DateTimeOriginal] = cleanDate;
          }

          // Exposure Time
          if (metadata.exposureTime) {
            const parts = metadata.exposureTime.replace(/s$/, '').split('/');
            if (parts.length === 2) {
              const num = parseInt(parts[0]);
              const den = parseInt(parts[1]);
              if (!isNaN(num) && !isNaN(den)) exif[piexif.ExifIFD.ExposureTime] = [num, den];
            } else {
              const val = parseFloat(metadata.exposureTime);
              if (!isNaN(val)) exif[piexif.ExifIFD.ExposureTime] = [Math.round(val * 1000), 1000];
            }
          }

          // FNumber
          if (metadata.fNumber) {
            const val = parseFloat(metadata.fNumber.replace(/^f\//i, ''));
            if (!isNaN(val)) exif[piexif.ExifIFD.FNumber] = [Math.round(val * 100), 100];
          }

          // ISO
          if (metadata.iso) {
            const val = parseInt(metadata.iso);
            if (!isNaN(val)) exif[piexif.ExifIFD.ISOSpeedRatings] = val;
          }

          const degToExif = (deg: number) => {
            const d = Math.floor(Math.abs(deg));
            const minFloat = (Math.abs(deg) - d) * 60;
            const m = Math.floor(minFloat);
            const s = Math.round((minFloat - m) * 60 * 100);
            return [[d, 1], [m, 1], [s, 100]];
          };

          if (metadata.gpsCoordinates && metadata.gpsCoordinates.includes(',')) {
            const [lat, lon] = metadata.gpsCoordinates.split(',').map(s => parseFloat(s.trim()));
            if (!isNaN(lat) && !isNaN(lon)) {
              gps[piexif.GPSIFD.GPSLatitudeRef] = lat >= 0 ? 'N' : 'S';
              gps[piexif.GPSIFD.GPSLatitude] = degToExif(lat);
              gps[piexif.GPSIFD.GPSLongitudeRef] = lon >= 0 ? 'E' : 'W';
              gps[piexif.GPSIFD.GPSLongitude] = degToExif(lon);
            }
          }

          const exifObj = { "0th": zeroth, "Exif": exif, "GPS": gps };
          const exifStr = piexif.dump(exifObj);
          const newJpeg = piexif.insert(exifStr, data);
          
          // Convert base64 back to Blob
          const byteString = atob(newJpeg.split(',')[1]);
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          resolve(new Blob([ab], { type: 'image/jpeg' }));
        } catch (err) {
          console.error('Error injecting EXIF:', err);
          resolve(file); // Return original if fails
        }
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  };

  const downloadSingle = async (fileObj: ImageFile) => {
    const updatedBlob = await updateExif(fileObj.file, fileObj.editedMetadata);
    saveAs(updatedBlob, `shft_${fileObj.file.name}`);
  };

  const startProcessing = async () => {
    if (files.length === 0) return;
    setWorkflowStep('processing');
    setIsProcessing(true);
    setProcessedCount(0);
    setEstimatedTimeRemaining(null);

    const zip = new JSZip();
    const startTime = Date.now();
    
    for (let i = 0; i < files.length; i++) {
        const fileObj = files[i];
        setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'processing', progress: 50, error: undefined } : f));
        
        // Small delay to make processing status visible for fast operations
        await new Promise(resolve => setTimeout(resolve, 400));
        
        let processedBlob: Blob = fileObj.file;
        try {
          processedBlob = await updateExif(fileObj.file, fileObj.editedMetadata);
          setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'completed', progress: 100 } : f));
        } catch (e) {
          console.error("Processing failed for", fileObj.file.name, e);
          setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'error', progress: 0, error: (e as Error).message || 'Injection failed' } : f));
        }
        
        zip.file(fileObj.file.name, processedBlob);
        
        const nextCount = i + 1;
        setProcessedCount(nextCount);

        // Update estimated time
        const elapsed = Date.now() - startTime;
        const avgTimePerFile = elapsed / nextCount;
        const remainingFiles = files.length - nextCount;
        setEstimatedTimeRemaining(Math.ceil((avgTimePerFile * remainingFiles) / 1000));
    }

    const content = await zip.generateAsync({ type: 'blob' });

    // Record History in Firebase
    if (auth.currentUser) {
       try {
         await addDoc(collection(db, 'users', auth.currentUser.uid, 'history'), {
            timestamp: serverTimestamp(),
            fileCount: files.length,
            filenames: files.map(f => f.file.name),
            status: 'completed'
         });
       } catch (err) {
         console.error('Failed to record history:', err);
       }
    }

    setZipBlob(content);
    setIsProcessing(false);
    setTimeout(() => {
      setWorkflowStep('download');
    }, 500);
  };

  const downloadZip = () => {
    if (zipBlob) {
      saveAs(zipBlob, `metashift_export_${Date.now()}.zip`);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl md:p-10 flex flex-col overflow-y-auto overflow-x-hidden"
    >
      <div className="max-w-[1400px] mx-auto w-full flex flex-col min-h-full">
        <div className="flex items-center justify-between mb-4 md:mb-8">
           <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:xl bg-gradient-to-tr from-brand to-brand-alt flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                <Zap size={16} className="text-black fill-current md:w-5 md:h-5" />
              </div>
              <div>
                 <h2 className="text-base md:text-xl font-black uppercase tracking-tighter italic">MetaShift Engine</h2>
                 <p className="text-[8px] md:text-[10px] text-white/30 uppercase tracking-widest font-bold">Encrypted Subsystem</p>
              </div>
           </div>
           
           <button 
             onClick={onClose}
             className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:bg-red-500/20 hover:border-red-500/40 transition-all text-white/40 hover:text-white group"
           >
              <X size={20} className="group-hover:rotate-90 transition-transform md:w-6 md:h-6" />
           </button>
        </div>

        <motion.div 
          className="relative w-full flex-1 md:rounded-3xl p-[1px] bg-gradient-to-b from-white/20 to-white/0 overflow-visible md:overflow-hidden shadow-2xl flex flex-col"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="w-full min-h-0 md:rounded-[23px] bg-[#0d1015]/95 backdrop-blur-2xl flex flex-col flex-1 overflow-visible md:overflow-hidden">
            {/* Toolbar */}
            <div className="h-12 border-b border-white/5 flex items-center justify-between px-6 bg-white/[0.02]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <div className="w-3 h-3 rounded-full bg-[#28c840]" />
              </div>
              <span className="text-[9px] sm:text-[11px] font-bold text-white/30 tracking-[0.2em] uppercase">
                {workflowStep === 'upload' && 'Step 1: Init'}
                {workflowStep === 'choice' && 'Step 2: Logic'}
                {workflowStep === 'edit' && 'Step 3: Console'}
                {workflowStep === 'processing' && 'Step 4: Engine'}
                {workflowStep === 'download' && 'Step 5: Output'}
              </span>
              <div className="hidden sm:flex items-center gap-4">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
                    <span className="text-[9px] font-black uppercase text-brand">Secure Link Active</span>
                 </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              <AnimatePresence mode="wait">
                {workflowStep === 'upload' && (
                  <motion.div 
                    key="upload"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    className="flex-1 flex flex-col items-center justify-center p-4 md:p-10"
                  >
                    <div 
                      onClick={() => !isFilesPreparing && fileInputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (!isFilesPreparing) handleFileUpload(Array.from(e.dataTransfer.files));
                      }}
                      className={`max-w-xl w-full p-8 md:p-20 border-4 border-dashed border-white/5 rounded-[32px] md:rounded-[40px] bg-white/[0.02] flex flex-col items-center justify-center text-center gap-4 md:gap-6 transition-all ${isFilesPreparing ? 'opacity-50 cursor-not-allowed' : 'hover:border-brand/30 hover:bg-brand/5 cursor-pointer group'}`}
                    >
                      <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-3xl bg-brand/10 flex items-center justify-center text-brand group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-[0_0_50px_rgba(139,92,246,0.1)]">
                        {isFilesPreparing ? <Loader2 size={32} className="animate-spin" /> : <Upload size={32} className="md:w-12 md:h-12" strokeWidth={1.5} />}
                      </div>
                      <div className="space-y-1 md:space-y-2">
                        <h3 className="text-xl md:text-3xl font-black uppercase tracking-tighter italic">{isFilesPreparing ? 'Processing Stack' : 'Feed the Engine'}</h3>
                        <p className="text-xs md:text-sm text-white/30 font-medium max-w-sm">
                          {isFilesPreparing 
                            ? 'The engine is digesting your assets and extracting deep metadata.' 
                            : 'Drag your assets here to begin metadata manipulation.'}
                        </p>
                      </div>
                      
                      {isFilesPreparing && (
                        <div className="w-full mt-4 space-y-4 max-w-md">
                          {preparingFiles.map((file, idx) => (
                            <motion.div 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              key={idx} 
                              className="space-y-2"
                            >
                              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                                <span className="truncate max-w-[240px]">{file.name}</span>
                                <span className="text-brand">{file.progress}%</span>
                              </div>
                              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${file.progress}%` }}
                                  className="h-full bg-brand shadow-[0_0_10px_#00d2ff]"
                                />
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}

                      {!isFilesPreparing && (
                        <div className="flex gap-3 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                           JPG / PNG / WEBP / RAW / HEIC
                        </div>
                      )}
                      
                      <input 
                        ref={fileInputRef} 
                        type="file" 
                        multiple 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileUpload}
                      />
                    </div>
                  </motion.div>
                )}

                {workflowStep === 'choice' && (
                  <motion.div 
                    key="choice"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex-1 flex flex-col items-center justify-center p-4 md:p-10 max-w-4xl mx-auto w-full overflow-y-auto"
                  >
                    <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tighter italic mb-2 text-center">Engine is Primed</h3>
                    <p className="text-xs md:text-sm text-white/40 mb-8 md:mb-12 text-center font-medium">{files.length} assets successfully ingested.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 w-full">
                       <button 
                         onClick={() => handleChoice('auto')}
                         className="group p-6 md:p-10 rounded-3xl bg-white/5 border border-white/10 hover:border-brand hover:bg-brand/10 transition-all text-left flex flex-col gap-4 md:gap-6"
                       >
                          <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-brand/10 flex items-center justify-center text-brand group-hover:scale-110 transition-transform">
                             <Sparkles size={24} className="md:w-8 md:h-8" />
                          </div>
                          <div>
                             <h4 className="text-xl md:text-2xl font-black uppercase tracking-tighter italic mb-2">Automated</h4>
                             <p className="text-xs md:text-sm text-white/40 font-medium leading-relaxed">Gemini 3 Flash suggests hyper-realistic metadata based on visual content.</p>
                          </div>
                       </button>
 
                       <button 
                         onClick={() => handleChoice('manual')}
                         className="group p-6 md:p-10 rounded-3xl bg-white/5 border border-white/10 hover:border-white transition-all text-left flex flex-col gap-4 md:gap-6"
                       >
                          <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white/10 flex items-center justify-center text-white/60 group-hover:scale-110 transition-transform">
                             <Sliders size={24} className="md:w-8 md:h-8" />
                          </div>
                          <div>
                             <h4 className="text-xl md:text-2xl font-black uppercase tracking-tighter italic mb-2">Manual</h4>
                             <p className="text-xs md:text-sm text-white/40 font-medium leading-relaxed">Full control over EXIF, GPS, and device serials manually.</p>
                          </div>
                       </button>
                    </div>

                    <button 
                      onClick={() => setWorkflowStep('upload')}
                      className="mt-12 text-[11px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors"
                    >
                      ← Reset Stack
                    </button>
                  </motion.div>
                )}
                
                {workflowStep === 'edit' && (
                  <motion.div 
                    key="edit"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 flex flex-col lg:flex-row overflow-visible lg:overflow-hidden"
                  >
                    {/* LEFT PANEL: Navigator */}
                    <div className="lg:w-1/4 border-b lg:border-b-0 lg:border-r border-white/5 p-4 md:p-6 flex flex-col gap-4 bg-black/20 overflow-visible lg:overflow-hidden flex-shrink-0">
                      <div className="flex flex-col gap-3 min-h-0 flex-1">
                        <div className="flex justify-between text-[9px] md:text-[10px] font-black text-white/40 uppercase tracking-widest">
                          <span>Queue</span>
                          <span className="text-brand">{files.length} Assets</span>
                        </div>
                        <div className="flex-1 overflow-x-auto lg:overflow-x-hidden lg:overflow-y-auto flex flex-row lg:flex-col gap-2 p-1 pr-2 scrollbar-none min-h-[100px] lg:max-h-none">
                          {files.map((file) => (
                            <motion.div 
                              layout
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              key={file.id}
                              onClick={() => setSelectedFileId(file.id)}
                              className={`p-2 md:p-3 rounded-xl border flex-shrink-0 lg:flex-shrink flex items-center justify-between group transition-all cursor-pointer min-w-[140px] lg:min-w-0 ${
                                selectedFileId === file.id 
                                  ? 'bg-brand/10 border-brand/50 shadow-[0_0_15px_rgba(0,210,255,0.1)]' 
                                  : 'bg-white/5 border-white/5 hover:bg-white/10'
                              }`}
                            >
                              <div className="flex items-center gap-2 md:gap-3 min-w-0">
                                 <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-black overflow-hidden flex-shrink-0">
                                    <img src={file.preview} alt="p" className="w-full h-full object-cover" />
                                 </div>
                                 <div className="min-w-0">
                                    <span className="block text-[10px] md:text-[11px] truncate w-20 md:w-24 font-bold opacity-60 group-hover:opacity-100 uppercase">{file.file.name}</span>
                                    <span className="block text-[8px] opacity-30 mt-0.5">{formatSize(file.file.size)}</span>
                                 </div>
                              </div>
                              <div className="hidden lg:flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); downloadSingle(file); }}
                                  className="p-1 rounded-md hover:bg-brand/20 text-brand"
                                >
                                  <Download size={12} />
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                                  className="p-1 rounded-md hover:bg-red-500/20 text-red-400"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
 
                    {/* CENTER PANEL: Editor */}
                    <div className="flex-1 p-4 md:p-8 flex flex-col gap-4 md:gap-8 bg-white/[0.01] lg:overflow-y-auto">
                      <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 mb-2 border-b border-white/5 pb-4 md:pb-6">
                        <div className="w-16 h-16 md:w-32 md:h-32 rounded-xl md:rounded-2xl bg-black overflow-hidden border border-white/10 shadow-2xl flex-shrink-0">
                          <img src={selectedFile?.preview} alt="edit" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0 text-center sm:text-left overflow-hidden">
                          <h4 className="text-base md:text-xl font-black uppercase tracking-tighter italic truncate w-full">{selectedFile?.file.name}</h4>
                          <span className="text-[8px] md:text-[10px] text-white/30 font-bold tracking-widest uppercase">{formatSize(selectedFile?.file?.size || 0)} • READY</span>
                        </div>
                        <div className="flex items-center gap-3 px-4 py-3 md:py-2 rounded-xl bg-white/5 border border-white/10">
                          <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Batch Sync</span>
                          <button 
                            onClick={() => setIsBatchMode(!isBatchMode)}
                            className={`w-10 h-5 md:w-8 md:h-4 rounded-full p-0.5 transition-colors ${isBatchMode ? 'bg-brand' : 'bg-white/20'}`}
                          >
                            <div className={`w-4 h-4 md:w-3 md:h-3 rounded-full bg-white transition-transform ${isBatchMode ? 'translate-x-5 md:translate-x-4' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-x-12 md:gap-y-8">
                        {[
                          { label: 'Camera Model', field: 'cameraModel', icon: Monitor },
                          { label: 'Timestamp', field: 'timestamp', icon: Clock },
                          { label: 'GPS Coordinates', field: 'gpsCoordinates', icon: Map },
                          { label: 'Copyright Owner', field: 'author', icon: User },
                          { label: 'Device Serial', field: 'deviceInfo', icon: Sparkles },
                          { label: 'Software Suite', field: 'software', icon: Sliders },
                          { label: 'Exposure Info', field: 'exposureTime', icon: Zap },
                          { label: 'F-Number', field: 'fNumber', icon: Sliders },
                        ].map((item) => (
                          <div key={item.label} className="flex flex-col gap-1.5 md:gap-2">
                             <label className="text-[9px] md:text-[10px] uppercase tracking-widest text-white/40 font-black flex items-center gap-2">
                               <item.icon size={10} className="text-brand/50" />
                               {item.label}
                             </label>
                             <input 
                               type="text" 
                               className="bg-white/5 border border-white/10 rounded-xl md:rounded-2xl px-4 py-4 md:px-5 md:py-4 text-[13px] focus:border-brand outline-none transition-all placeholder:text-white/5 text-white/80 font-medium w-full"
                               value={selectedFile?.editedMetadata?.[item.field as keyof ImageMetadata] || ''}
                               onChange={(e) => {
                                  if (isBatchMode) applyToAll(item.field as keyof ImageMetadata, e.target.value);
                                  else if (selectedFile) updateMetadata(selectedFile.id, item.field as keyof ImageMetadata, e.target.value);
                               }}
                             />
                          </div>
                        ))}
                      </div>
 
                      <div className="mt-auto flex flex-col sm:flex-row gap-3 md:gap-4 pt-6 md:pt-10">
                          <motion.button 
                            whileHover={{ scale: 1.02, brightness: 1.1 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={isGeminiThinking}
                            onClick={generateAIPresets}
                            className="flex-1 py-4 md:py-5 rounded-xl md:rounded-2xl bg-brand text-black font-black text-xs uppercase tracking-widest hover:brightness-110 shadow-[0_0_30px_rgba(0,210,255,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {isGeminiThinking ? (
                              <>
                                <Loader2 size={16} className="animate-spin" />
                                Analyzing...
                              </>
                            ) : (
                              <>
                                <Sparkles size={16} />
                                AI Regenerate
                              </>
                            )}
                          </motion.button>
                        <motion.button 
                          whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                          whileTap={{ scale: 0.98 }}
                          onClick={clearAllMetadata}
                          className="flex-1 py-4 md:py-5 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 text-white font-black text-xs uppercase tracking-widest transition-all"
                        >
                          Clear
                        </motion.button>
                      </div>
                    </div>
 
                    {/* RIGHT PANEL: Status & Export */}
                    <div className="lg:w-1/4 border-t lg:border-t-0 lg:border-l border-white/5 p-4 md:p-6 flex flex-col gap-6 md:gap-8 bg-black/20 flex-shrink-0">
                      <div className="hidden lg:flex flex-col gap-3">
                        <div className="flex justify-between text-[10px] font-black tracking-widest uppercase mb-1">
                          <span className="text-white/40">Engine</span>
                          <span className="text-brand">Active</span>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            className="w-full h-full bg-brand shadow-[0_0_15px_#00d2ff]" 
                          />
                        </div>
                      </div>
 
                      <div className="bg-white/5 rounded-3xl p-4 md:p-6 border border-white/10 flex flex-col gap-4 md:gap-6 relative overflow-hidden group">
                        <div className="flex items-center gap-3 md:gap-4 relative z-10">
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-brand/10 flex items-center justify-center text-brand">
                            <Archive size={20} className="md:w-6 md:h-6" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs md:text-sm font-black uppercase tracking-tighter italic">Bulk Package</span>
                            <span className="text-[9px] text-white/30 font-bold tracking-widest">ENCRYPTED.ZIP</span>
                          </div>
                        </div>
                        
                        <div className="space-y-4 relative z-10">
                           <button 
                             disabled={files.length === 0 || isProcessing}
                             onClick={startProcessing}
                             className="w-full py-4 rounded-xl md:rounded-2xl bg-white text-black font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-brand transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-xl"
                           >
                             {isProcessing ? 'Processing...' : 'Start Export'}
                           </button>
                        </div>
                      </div>
 
                      <div className="hidden md:flex mt-auto space-y-3">
                         {[
                           { label: 'Security', value: 'Military', color: 'text-white' },
                           { label: 'Privacy', value: 'Safe', color: 'text-brand' },
                           { label: 'Status', value: 'Optimized', color: 'text-green-400' },
                         ].map((stat) => (
                           <div key={stat.label} className="flex justify-between items-center py-2 border-b border-white/5">
                              <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">{stat.label}</span>
                              <span className={`text-[9px] font-mono font-bold uppercase tracking-tight ${stat.color}`}>{stat.value}</span>
                           </div>
                         ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {workflowStep === 'processing' && (
                  <motion.div 
                    key="processing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col items-center justify-center p-4 md:p-10 overflow-hidden"
                  >
                    <div className="max-w-3xl w-full flex flex-col items-center gap-8 md:gap-12 min-h-0">
                       <div className="flex flex-col items-center text-center">
                          <div className="relative w-20 h-20 md:w-24 md:h-24 mb-6">
                            <motion.div 
                              animate={{ rotate: 360 }}
                              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                              className="absolute inset-0 rounded-full border-4 border-dashed border-brand/20"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                               <Zap size={32} className="text-brand animate-pulse" />
                            </div>
                          </div>
                          <h3 className="text-xl md:text-3xl font-black uppercase tracking-tighter italic">Engine Hot</h3>
                          <p className="text-[10px] md:text-sm text-white/40 font-medium uppercase tracking-[0.2em]">Sanitizing Data Streams</p>
                       </div>

                       <div className="w-full space-y-6">
                          <div className="space-y-3">
                             <div className="flex justify-between items-end">
                                <div className="space-y-1">
                                   <span className="block text-[10px] font-black uppercase tracking-widest text-white/40">Total Progress</span>
                                   <span className="block text-2xl font-black italic tracking-tighter">{processedCount} / {files.length}</span>
                                </div>
                                <div className="text-right space-y-1">
                                   <span className="block text-[10px] font-black uppercase tracking-widest text-white/40">Est. Time</span>
                                   <span className="block text-sm font-black text-brand uppercase tracking-widest">
                                      {estimatedTimeRemaining !== null ? `${estimatedTimeRemaining}s remaining` : 'Calculating...'}
                                   </span>
                                </div>
                             </div>
                             <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(processedCount / files.length) * 100}%` }}
                                  className="h-full bg-brand rounded-full shadow-[0_0_20px_rgba(0,210,255,0.5)]"
                                />
                             </div>
                          </div>

                          {/* Detailed Log */}
                          <div className="w-full bg-black/40 rounded-3xl border border-white/5 p-4 md:p-6 h-[250px] md:h-[350px] flex flex-col">
                             <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Operations Log</span>
                                <div className="flex gap-4">
                                   <div className="flex items-center gap-1.5">
                                      <div className="w-2 h-2 rounded-full bg-green-500" />
                                      <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{files.filter(f => f.status === 'completed').length} Ok</span>
                                   </div>
                                   <div className="flex items-center gap-1.5">
                                      <div className="w-2 h-2 rounded-full bg-red-500" />
                                      <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{files.filter(f => f.status === 'error').length} Failed</span>
                                   </div>
                                </div>
                             </div>
                             <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                {files.map((file, idx) => (
                                   <div 
                                     key={file.id} 
                                     className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                                       file.status === 'processing' ? 'bg-brand/5 border-brand/20' : 
                                       file.status === 'completed' ? 'bg-white/[0.02] border-white/5 opacity-40' : 
                                       file.status === 'error' ? 'bg-red-500/5 border-red-500/20' : 
                                       'opacity-20 border-transparent'
                                     }`}
                                   >
                                      <div className="flex items-center gap-3 min-w-0">
                                         {file.status === 'processing' && <Loader2 size={12} className="animate-spin text-brand" />}
                                         {file.status === 'completed' && <CheckCircle2 size={12} className="text-green-500" />}
                                         {file.status === 'error' && <AlertCircle size={12} className="text-red-500" />}
                                         {file.status === 'pending' && <Clock size={12} className="text-white/20" />}
                                         <span className="text-[10px] font-bold text-white/80 truncate uppercase tracking-tight italic">
                                            {file.file.name}
                                         </span>
                                      </div>
                                      <div className="flex items-center gap-3 flex-shrink-0">
                                         {file.status === 'error' && (
                                            <span className="text-[8px] font-black uppercase text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">
                                               {file.error || 'Err'}
                                            </span>
                                         )}
                                         <span className={`text-[9px] font-black uppercase tracking-widest ${
                                           file.status === 'processing' ? 'text-brand' : 
                                           file.status === 'completed' ? 'text-green-500' : 
                                           file.status === 'error' ? 'text-red-500' : 
                                           'text-white/10'
                                         }`}>
                                            {file.status}
                                         </span>
                                      </div>
                                   </div>
                                ))}
                             </div>
                          </div>
                       </div>
                    </div>
                  </motion.div>
                )}
                {workflowStep === 'download' && (
                  <motion.div 
                    key="download"
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex-1 flex flex-col p-4 md:p-12 overflow-hidden"
                  >
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 mb-6 md:mb-12 border-b border-white/5 pb-6 md:pb-12">
                       <div className="text-center md:text-left">
                          <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 mb-2 md:mb-4">
                             <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-green-500/10 flex items-center justify-center text-green-400">
                                <CheckCircle2 size={24} className="md:w-8 md:h-8" />
                             </div>
                             <div>
                                <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tighter italic">Ready</h3>
                                <p className="text-[10px] md:text-sm text-white/40 font-medium">Assets successfully sanitized.</p>
                             </div>
                          </div>
                       </div>
                       
                       <motion.button 
                         whileHover={{ scale: 1.05 }}
                         whileTap={{ scale: 0.95 }}
                         onClick={downloadZip}
                         className="w-full md:w-auto px-8 md:px-12 py-4 md:py-6 rounded-2xl md:rounded-3xl bg-brand text-black font-black text-xs md:text-sm uppercase tracking-widest shadow-[0_0_50px_rgba(0,210,255,0.3)] flex items-center justify-center gap-3 group transition-all"
                       >
                          <Archive size={18} className="md:w-5 md:h-5" />
                          Download All
                       </motion.button>
                    </div>

                    <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 pr-2 scrollbar-none pb-20">
                       {files.map((file) => (
                         <GlassCard key={file.id} className="group hover:border-brand/40 overflow-hidden flex flex-col min-h-[220px]">
                            <div className="h-32 md:h-40 overflow-hidden relative">
                               <img src={file.preview} alt="p" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                               <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-green-500/80 text-white text-[7px] font-black uppercase tracking-widest backdrop-blur-md">
                                  Done
                               </div>
                            </div>
                            <div className="p-3 md:p-4 border-t border-white/5 space-y-3">
                               <div className="flex flex-col gap-0.5">
                                  <span className="text-[10px] md:text-[11px] font-black uppercase tracking-tighter text-white/80 truncate">{file.file.name}</span>
                                  <span className="text-[8px] md:text-[9px] text-white/30 font-bold uppercase tracking-widest">{formatSize(file.file.size)}</span>
                               </div>
                               <button 
                                 onClick={() => downloadSingle(file)}
                                 className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-[8px] md:text-[9px] font-black uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                               >
                                  <Download size={10} className="md:w-3 md:h-3" />
                                  Download
                               </button>
                            </div>
                         </GlassCard>
                       ))}
                    </div>

                    <div className="mt-auto border-t border-white/5 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center gap-4 bg-[#0d1015]/95">
                       <button 
                         onClick={() => setWorkflowStep('upload')}
                         className="flex items-center gap-2 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors"
                       >
                         <RefreshCw size={12} className="md:w-3.5 md:h-3.5" />
                         Reset Stack
                       </button>
                       <div className="flex gap-4 md:gap-6">
                          <span className="text-[9px] md:text-[10px] font-bold text-white/20 uppercase tracking-widest">CDN: Active</span>
                          <span className="text-[9px] md:text-[10px] font-bold text-brand uppercase tracking-widest">Encrypted</span>
                       </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
