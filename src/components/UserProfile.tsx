
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, User, Mail, Clock, Calendar, Shield, 
  Settings, History, LogOut, ChevronRight, 
  Zap, Bell, Eye, EyeOff, Loader2, Save
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db, logout } from '../lib/firebase';
import { collection, query, orderBy, limit, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';

interface HistoryItem {
  id: string;
  timestamp: any;
  fileCount: number;
  filenames: string[];
  status: 'completed' | 'failed';
}

interface UserPreferences {
  autoAI: boolean;
  batchMode: boolean;
  theme: 'dark' | 'light' | 'cyber';
}

export const UserProfile = ({ onClose }: { onClose: () => void }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'history' | 'settings'>('profile');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<UserPreferences>({
    autoAI: false,
    batchMode: true,
    theme: 'dark'
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch User Data for preferences
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data().preferences) {
          setPreferences(userDoc.data().preferences);
        }

        // Fetch History
        const historyQuery = query(
          collection(db, 'users', user.uid, 'history'),
          orderBy('timestamp', 'desc'),
          limit(10)
        );
        const historySnap = await getDocs(historyQuery);
        const historyData = historySnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as HistoryItem[];
        setHistory(historyData);
      } catch (err) {
        console.error('Error fetching profile data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleSavePreferences = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        preferences
      });
      // Optionally show a success message
    } catch (err) {
      console.error('Error saving preferences:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!user) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-6"
    >
      <div className="max-w-5xl w-full h-[90vh] md:h-auto md:max-h-[850px] bg-[#0d1015] rounded-[32px] border border-white/5 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-tr from-brand to-brand-alt p-[1px]">
              <div className="w-full h-full rounded-[15px] bg-[#0d1015] overflow-hidden">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20">
                    <User size={24} />
                  </div>
                )}
              </div>
            </div>
            <div>
              <h2 className="text-xl md:text-3xl font-black uppercase tracking-tighter italic">{user.displayName || 'Operator'}</h2>
              <p className="text-[10px] md:text-sm text-white/30 font-black uppercase tracking-widest">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all text-white/40 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Sidebar Nav */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/5 p-4 md:p-6 flex md:flex-col gap-2">
            {[
              { id: 'profile', label: 'Identity', icon: Shield },
              { id: 'history', label: 'Operations', icon: History },
              { id: 'settings', label: 'Protocols', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 md:flex-none flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === tab.id 
                    ? 'bg-brand text-black font-black uppercase italic' 
                    : 'text-white/40 hover:text-white hover:bg-white/5 font-bold uppercase'
                } text-[10px] tracking-widest`}
              >
                <tab.icon size={14} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
            
            <button
               onClick={logout}
               className="mt-auto hidden md:flex items-center gap-3 px-4 py-3 rounded-xl text-red-500/60 hover:text-red-500 hover:bg-red-500/5 transition-all text-[10px] font-black uppercase tracking-widest"
            >
               <LogOut size={14} />
               Terminate
            </button>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
                         <div className="flex items-center gap-3 text-brand">
                            <Clock size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Temporal Log</span>
                         </div>
                         <div>
                            <span className="block text-[8px] text-white/20 uppercase tracking-widest mb-1">Last Deployment</span>
                            <span className="text-sm font-bold text-white/80">{formatDate(user.metadata.lastSignInTime)}</span>
                         </div>
                         <div>
                            <span className="block text-[8px] text-white/20 uppercase tracking-widest mb-1">Origin Date</span>
                            <span className="text-sm font-bold text-white/80">{formatDate(user.metadata.creationTime)}</span>
                         </div>
                      </div>

                      <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
                         <div className="flex items-center gap-3 text-brand">
                            <Zap size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Engine Status</span>
                         </div>
                         <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white/60">Subscription Level</span>
                            <span className="px-3 py-1 rounded-full bg-brand/20 text-brand text-[9px] font-black uppercase tracking-widest">Base Tier</span>
                         </div>
                         <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white/60">Security Clearance</span>
                            <span className="text-xs font-bold text-green-400">Verified</span>
                         </div>
                      </div>
                   </div>

                   <div className="p-8 rounded-[32px] bg-gradient-to-br from-brand/10 to-transparent border border-brand/20">
                      <h4 className="text-xl font-black uppercase tracking-tighter italic mb-2">MetaShift Bio-Authentication</h4>
                      <p className="text-xs text-white/40 mb-6 font-medium leading-relaxed">Your identity is cryptographically linked to your Google Secure Auth provider. No local passwords are stored on this node.</p>
                      <button className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all">
                        Refresh Credentials
                      </button>
                   </div>
                </motion.div>
              )}

              {activeTab === 'history' && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-black uppercase tracking-tighter italic">Operation History</h3>
                      <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Last 10 processed batches</p>
                    </div>
                    {loading && <Loader2 size={16} className="animate-spin text-brand" />}
                  </div>

                  {history.length === 0 && !loading ? (
                    <div className="h-64 flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-white/5 rounded-[32px]">
                       <History size={48} className="text-white/5 mb-4" />
                       <p className="text-sm font-bold text-white/20 uppercase tracking-widest">No operations recorded yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {history.map((item) => (
                        <div 
                          key={item.id}
                          className="group p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-brand/40 transition-all flex items-center justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.status === 'completed' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-500'}`}>
                               <Zap size={18} />
                            </div>
                            <div className="flex flex-col">
                               <span className="text-xs font-black text-white/80 uppercase tracking-tighter italic">Bulk Sync ({item.fileCount} Assets)</span>
                               <span className="text-[9px] text-white/20 font-bold uppercase tracking-widest">{formatDate(item.timestamp)}</span>
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-white/10 group-hover:text-brand transition-colors" />
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                   <div className="space-y-6">
                      <div className="flex items-center justify-between p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                        <div className="space-y-1">
                          <h4 className="text-sm font-black uppercase tracking-widest">Automated Intelligence</h4>
                          <p className="text-[10px] text-white/30 font-medium italic">Enable AI-powered metadata analysis by default.</p>
                        </div>
                        <button 
                          onClick={() => setPreferences(prev => ({ ...prev, autoAI: !prev.autoAI }))}
                          className={`w-12 h-6 rounded-full p-1 transition-colors ${preferences.autoAI ? 'bg-brand' : 'bg-white/10'}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform ${preferences.autoAI ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                        <div className="space-y-1">
                          <h4 className="text-sm font-black uppercase tracking-widest">Industrial Batch Mode</h4>
                          <p className="text-[10px] text-white/30 font-medium italic">Propagates edits to all files in the stack simultaneously.</p>
                        </div>
                        <button 
                          onClick={() => setPreferences(prev => ({ ...prev, batchMode: !prev.batchMode }))}
                          className={`w-12 h-6 rounded-full p-1 transition-colors ${preferences.batchMode ? 'bg-brand' : 'bg-white/10'}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform ${preferences.batchMode ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
                        <h4 className="text-sm font-black uppercase tracking-widest">Interface Skin</h4>
                        <div className="grid grid-cols-3 gap-3">
                           {['dark', 'light', 'cyber'].map((t) => (
                             <button
                               key={t}
                               onClick={() => setPreferences(prev => ({ ...prev, theme: t as any }))}
                               className={`py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${
                                 preferences.theme === t 
                                   ? 'bg-brand text-black border-brand' 
                                   : 'bg-white/5 text-white/40 border-white/5 hover:border-white/20'
                               }`}
                             >
                               {t}
                             </button>
                           ))}
                        </div>
                      </div>
                   </div>

                   <button 
                     onClick={handleSavePreferences}
                     disabled={isSaving}
                     className="w-full py-5 rounded-2xl bg-white text-black font-black uppercase tracking-[0.2em] italic text-xs shadow-xl flex items-center justify-center gap-3 hover:bg-brand transition-all active:scale-95 disabled:opacity-50"
                   >
                     {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                     Commit Preferences
                   </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
