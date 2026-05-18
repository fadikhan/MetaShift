/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Zap, Lock, EyeOff, CheckCircle2, ChevronRight } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';

export const PrivacySection = () => {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <motion.div
           initial={{ opacity: 0, x: -30 }}
           whileInView={{ opacity: 1, x: 0 }}
           viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-8">Your files never leave your control.</h2>
          <p className="text-base md:text-lg text-white/50 mb-8 leading-relaxed">
            All metadata processing happens securely and instantly inside your browser. MetaShift is built for creators, journalists, investigators, agencies, and privacy-conscious users.
          </p>

          <div className="space-y-4">
            {[
              'No permanent storage server-side',
              'Instant local processing',
              'Secure ZIP packaging',
              'Bulk privacy cleanup'
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-brand/20 flex items-center justify-center">
                  <CheckCircle2 size={12} className="text-brand" />
                </div>
                <span className="text-sm font-medium text-white/80">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="absolute inset-0 bg-brand/20 blur-3xl opacity-20" />
          <GlassCard className="aspect-square flex flex-col items-center justify-center gap-8 relative z-10 overflow-visible">
            {/* Animated Shield Visualization */}
            <div className="relative">
               <motion.div 
                 animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                 transition={{ duration: 4, repeat: Infinity }}
                 className="absolute inset-0 bg-brand/30 blur-2xl rounded-full"
               />
                <div className="w-40 h-40 rounded-full border-2 border-brand/50 flex items-center justify-center relative bg-black shadow-[0_0_50px_rgba(139,92,246,0.2)]">
                  <Shield size={64} className="text-white fill-brand/20" />
               </div>
               
               {/* Floating Orbs */}
               {[...Array(6)].map((_, i) => (
                 <motion.div
                   key={i}
                   animate={{ 
                     y: [0, -20, 0],
                     x: [0, Math.sin(i) * 20, 0],
                     opacity: [0.2, 0.5, 0.2]
                   }}
                   transition={{ 
                     duration: 3 + Math.random() * 2, 
                     repeat: Infinity,
                     delay: i * 0.5
                   }}
                   className="absolute w-2 h-2 rounded-full bg-brand"
                   style={{ 
                     top: `${50 + Math.cos(i) * 60}%`, 
                     left: `${50 + Math.sin(i) * 60}%` 
                   }}
                 />
               ))}
            </div>
            
            <div className="text-center">
               <p className="text-xl font-black uppercase tracking-tighter italic">Security Grade: Military</p>
               <p className="text-[10px] text-brand/60 uppercase tracking-[0.3em] font-black mt-1">Live Encryption Active</p>
            </div>
            
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-brand/5 rounded-full blur-3xl" />
          </GlassCard>
          
          {/* Grid Background */}
          <div className="absolute -inset-10 -z-10 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        </motion.div>
      </div>
    </section>
  );
};

export const FinalCTA = ({ onLaunch }: { onLaunch: () => void }) => {
  return (
    <section className="py-20 md:py-32 px-6 relative">
      <div className="max-w-5xl mx-auto">
        <GlassCard className="p-8 md:p-16 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-brand/5 group-hover:bg-brand/10 transition-colors" />
          <motion.div
            initial={{ opacity: 0, scale: 1.2 }}
            whileInView={{ opacity: 0.05 }}
            className="absolute -top-10 md:-top-20 -left-10 md:-left-20 text-[100px] md:text-[200px] font-black pointer-events-none italic"
          >
            META
          </motion.div>
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-7xl font-black italic uppercase mb-6 tracking-tighter leading-tight">
              Clean metadata.<br />
              Professional workflow.
            </h2>
            <p className="text-xs md:text-sm text-white/40 mb-12 max-w-xl mx-auto font-black uppercase tracking-[0.3em]">
               Process thousands of images in seconds with AI-powered metadata automation.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={onLaunch}
                className="w-full sm:w-auto px-10 py-5 rounded-xl bg-brand text-black font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-xl"
              >
                Launch MetaShift
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="absolute -bottom-20 -right-20 w-[600px] h-[600px] bg-brand/10 blur-[100px] rounded-full pointer-events-none" />
        </GlassCard>
      </div>
    </section>
  );
};
