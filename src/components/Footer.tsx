/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Zap, Github, Twitter, Disc as Discord, ArrowUpRight } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="pt-20 pb-10 px-6 border-t border-white/5 bg-black/50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 md:col-span-1">
             <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
                  <Zap className="text-black fill-current" size={18} />
                </div>
                <span className="text-lg font-bold tracking-tighter">MetaShift</span>
             </div>
             <p className="text-sm text-white/40 leading-relaxed max-w-xs">
                Advanced metadata manipulation for creative professionals and privacy-focused users. Built for the future of digital assets.
             </p>
          </div>

          <div>
             <h4 className="text-xs font-bold uppercase tracking-widest text-white/20 mb-6">Product</h4>
             <ul className="space-y-4">
                {['Features', 'Pricing', 'Privacy', 'Security', 'Roadmap'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-white/50 hover:text-brand transition-colors flex items-center group">
                      {item}
                      <ArrowUpRight size={12} className="ml-1 opacity-0 group-hover:opacity-100 -translate-y-0.5 transition-all" />
                    </a>
                  </li>
                ))}
             </ul>
          </div>

          <div>
             <h4 className="text-xs font-bold uppercase tracking-widest text-white/20 mb-6">Resources</h4>
             <ul className="space-y-4">
                {['Documentation', 'Metadata Guide', 'EXIF Library', 'Blog'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-white/50 hover:text-brand transition-colors flex items-center group">
                      {item}
                      <ArrowUpRight size={12} className="ml-1 opacity-0 group-hover:opacity-100 -translate-y-0.5 transition-all" />
                    </a>
                  </li>
                ))}
             </ul>
          </div>

          <div>
             <h4 className="text-xs font-bold uppercase tracking-widest text-white/20 mb-6">Connect</h4>
             <div className="flex gap-4">
                {[
                  { icon: Github, label: 'GitHub' },
                  { icon: Twitter, label: 'Twitter' },
                  { icon: Discord, label: 'Discord' }
                ].map((social) => (
                  <a key={social.label} href="#" className="w-10 h-10 rounded-xl liquid-glass flex items-center justify-center hover:bg-white/10 hover:text-brand transition-all">
                    <social.icon size={18} />
                  </a>
                ))}
             </div>
             <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Service Status</p>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                   <span className="text-xs font-medium">All Systems Operational</span>
                </div>
             </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-white/30">
             © 2026 MetaShift. Developed by Antigravity Design Systems.
          </p>
          <div className="flex gap-8">
             <a href="#" className="text-[11px] text-white/30 hover:text-white transition-colors">Privacy Policy</a>
             <a href="#" className="text-[11px] text-white/30 hover:text-white transition-colors">Terms of Service</a>
             <a href="#" className="text-[11px] text-white/30 hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
