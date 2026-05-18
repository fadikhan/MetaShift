/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Zap, Chrome, Eye, EyeOff, ChevronRight, Loader2 } from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';

export const SignUp = ({ onBack, onSuccess }: { onBack: () => void; onSuccess: () => void }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      onSuccess();
    } catch (err) {
      console.error(err);
      setError('System authentication failed. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full bg-black selection:bg-white/30 p-2 transition-all duration-500 lg:h-screen lg:overflow-hidden lg:p-4 fixed inset-0 z-[110]">
      {/* Left Column (Hero) */}
      <div className="relative hidden lg:flex w-[52%] flex-col items-center justify-end pb-32 px-12 rounded-3xl overflow-hidden shadow-2xl h-full">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260506_081238_406ed0e3-5d83-436e-a512-0bbff7ec5b95.mp4" type="video/mp4" />
        </video>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.15, delayChildren: 0.2 }}
          className="relative z-10 w-full max-w-xs space-y-8"
        >
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2"
          >
            <Zap className="text-brand fill-brand" size={20} />
            <span className="text-xl font-black tracking-tighter uppercase italic">MetaShift</span>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h1 className="text-4xl font-medium tracking-tight whitespace-nowrap uppercase italic font-black">Join MetaShift</h1>
            <p className="text-white/60 text-sm leading-relaxed px-4">
              Follow these 3 quick phases to activate your space.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <StepItem number={1} text="Register" active />
            <StepItem number={2} text="Setup" />
            <StepItem number={3} text="Start" />
          </motion.div>
        </motion.div>
      </div>

      {/* Right Column (Form) */}
      <div className="flex-1 flex flex-col items-center justify-center py-12 lg:py-6 px-4 sm:px-12 lg:px-16 xl:px-24 overflow-y-auto lg:overflow-hidden">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-xl space-y-8 lg:space-y-6 sm:space-y-10"
        >
          <div className="flex justify-between items-start">
             <div className="space-y-2">
                <button 
                  onClick={onBack}
                  className="mb-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 transition-all"
                >
                  <ChevronRight size={14} className="rotate-180" />
                  Back
                </button>
                <h2 className="text-3xl font-black uppercase tracking-tighter italic">Authentication Required</h2>
                <p className="text-white/40 text-sm font-medium">Verify your identity using Google Secure Auth to access the terminal.</p>
             </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <SocialButton 
              icon={isLoading ? <Loader2 className="animate-spin" size={20} /> : <Chrome size={20} />} 
              label={isLoading ? "INTERFACING..." : "Authorize with Google"} 
              onClick={handleGoogleLogin}
              disabled={isLoading}
            />
          </div>

          {error && (
            <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center">{error}</p>
          )}

          <div className="relative flex items-center opacity-20">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink mx-4 bg-black px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Restricted Access</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <p className="text-center text-[10px] text-white/30 uppercase tracking-[0.2em]">
            By authorizing, you agree to our <a href="#" className="text-white/60 hover:text-white underline transition-colors">Privacy Module</a> and <a href="#" className="text-white/60 hover:text-white underline transition-colors">System Protocols</a>.
          </p>
        </motion.div>
      </div>
    </main>
  );
};

// Reusable Components

const StepItem = ({ number, text, active }: { number: number; text: string; active?: boolean }) => (
  <div className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${
    active ? 'bg-white text-black border border-white' : 'bg-brand-gray text-white border-none opacity-40'
  }`}>
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
      active ? 'bg-black text-white' : 'bg-white/10 text-white/40'
    }`}>
      {number}
    </div>
    <span className="text-sm font-medium">{text}</span>
    {active && <ChevronRight size={16} className="ml-auto" />}
  </div>
);

const SocialButton = ({ icon, label, onClick, disabled }: { icon: React.ReactNode; label: string; onClick?: () => void; disabled?: boolean }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className="flex items-center justify-center gap-3 w-full h-16 bg-white text-black rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <div className="text-black transition-colors">
      {icon}
    </div>
    <span className="text-xs font-black uppercase tracking-[0.1em]">{label}</span>
  </button>
);

const InputGroup = ({ label, placeholder, type }: { label: string; placeholder: string; type: string }) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-medium text-white">{label}</label>
    <input 
      type={type}
      placeholder={placeholder}
      className="bg-brand-gray border-none rounded-xl h-12 px-4 text-white placeholder:text-white/20 focus:ring-2 focus:ring-white/20 outline-none transition-all"
      required
    />
  </div>
);
