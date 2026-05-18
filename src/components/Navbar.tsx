/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, Zap, X, LogOut, User as UserIcon, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { logout } from '../lib/firebase';

export const Navbar = ({ onLaunch, onOpenProfile }: { onLaunch: () => void; onOpenProfile: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  const menuItems = ['Features', 'Formats', 'Blogs'];

  return (
    <>
    <header>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-50 flex items-center justify-between px-6 md:px-10 py-6 md:py-8"
      >
      <div className="text-left">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 md:w-8 md:h-8 rounded bg-gradient-to-tr from-brand to-brand-alt flex items-center justify-center">
            <Zap size={14} className="text-white fill-white" />
          </div>
          <span className="text-base md:text-xl font-black tracking-tighter uppercase italic truncate max-w-[120px] md:max-w-none">MetaShift</span>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
        {['Features', 'Formats', 'Blogs'].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase().replace(' ', '-')}`}
            className="hover:text-brand transition-colors relative group"
          >
            {item}
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-brand transition-all group-hover:w-full" />
          </a>
        ))}
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
             <div className="hidden lg:flex flex-col items-end mr-1">
                <span className="text-[10px] font-black text-white uppercase tracking-wider">{user.displayName}</span>
                <div className="flex gap-3">
                  <button 
                    onClick={onOpenProfile}
                    className="text-[8px] font-bold text-brand uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1"
                  >
                    <Settings size={8} /> Profile
                  </button>
                  <button 
                    onClick={logout}
                    className="text-[8px] font-bold text-white/30 uppercase tracking-widest hover:text-red-500 transition-colors flex items-center gap-1"
                  >
                    <LogOut size={8} /> Terminate
                  </button>
                </div>
             </div>
             <button
               onClick={onOpenProfile}
               className="relative group transition-transform active:scale-95"
             >
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || ''} className="w-8 h-8 md:w-10 md:h-10 rounded-xl border border-white/10 group-hover:border-brand/50" />
                ) : (
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 group-hover:border-brand/50 group-hover:text-brand">
                      <UserIcon size={18} />
                  </div>
                )}
             </button>
          </div>
        ) : (
          <button 
            onClick={onLaunch}
            className="px-4 md:px-8 py-1.5 md:py-3 rounded-xl bg-white text-black text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-brand transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)] focus:outline-none"
          >
            Launch App
          </button>
        )}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          className="md:hidden p-2 rounded-xl liquid-glass text-white/80 hover:text-white transition-colors"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </motion.nav>
    </header>

    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden absolute top-24 left-6 right-6 z-[60] bg-[#0d1015]/95 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
        >
          <div className="flex flex-col p-6 gap-4">
            {menuItems.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                onClick={() => setIsOpen(false)}
                className="text-lg font-black uppercase tracking-tighter italic text-white/50 hover:text-brand transition-colors"
              >
                {item}
              </a>
            ))}
            {user ? (
              <div className="pt-4 border-t border-white/5 mt-2 flex flex-col gap-4">
                <div className="flex items-center gap-3 px-1">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || ''} className="w-10 h-10 rounded-xl border border-white/10" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                      <UserIcon size={20} />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-white uppercase tracking-wider">{user.displayName}</span>
                    <span className="text-[10px] font-medium text-white/30 truncate max-w-[150px]">{user.email}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      onOpenProfile();
                      setIsOpen(false);
                    }}
                    className="py-4 rounded-xl bg-brand text-black font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2"
                  >
                    <UserIcon size={14} /> Profile
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="py-4 rounded-xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-[10px] hover:bg-red-500/10 hover:text-red-500 transition-all flex items-center justify-center gap-2"
                  >
                    <LogOut size={14} /> Log Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-4 border-t border-white/5 mt-2">
                <button
                  onClick={() => {
                    onLaunch();
                    setIsOpen(false);
                  }}
                  className="w-full py-4 rounded-xl bg-brand text-black font-black uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(0,210,255,0.2)]"
                >
                  Launch Console
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </>
);
};
