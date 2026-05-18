/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { ChevronRight, Play } from 'lucide-react';

export const Hero = ({ onLaunch }: { onLaunch: () => void }) => {
  return (
    <section className="relative pt-12 pb-20 px-6 md:px-10 flex flex-col items-center text-center overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand/10 blur-[150px] rounded-full pointer-events-none opacity-40" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-alt/5 blur-[120px] rounded-full pointer-events-none opacity-20" />
      
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-2xl sm:text-6xl md:text-7xl lg:text-[120px] font-black tracking-tight leading-[0.85] mb-8 italic uppercase"
      >
        METADATA.<br />
        <span className="text-gradient-immersive">REIMAGINED.</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="mt-4 max-w-xl text-white/50 text-sm leading-relaxed font-medium"
      >
        MetaShift helps creators, agencies, photographers, and privacy-focused users instantly edit, remove, or regenerate image metadata using AI-powered automation. Local, secure, professional.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="flex gap-4 mt-10"
      >
        <div className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-[11px] uppercase tracking-[0.2em] text-brand font-black">
          JPG / PNG / WEBP / HEIC / RAW / TIFF
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12"
      >
        <button 
          onClick={onLaunch}
          className="w-full sm:w-auto px-10 py-5 rounded-xl bg-brand text-black font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:scale-105 active:scale-95"
        >
          Start Processing Files
          <ChevronRight size={16} strokeWidth={3} />
        </button>
        <button 
          onClick={onLaunch}
          className="w-full sm:w-auto px-10 py-5 rounded-xl liquid-glass flex items-center justify-center gap-2 hover:bg-white/10 transition-all text-white font-black uppercase tracking-widest text-xs border border-white/10"
        >
          <Play size={16} className="fill-current" />
          View Workflow
        </button>
      </motion.div>
    </section>
  );
};
