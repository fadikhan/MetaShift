/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { Analytics } from '@vercel/analytics/react';
import { Navbar } from './components/Navbar';
import { useAuth } from './context/AuthContext';
import { Hero } from './sections/Hero';
import { AppInterface } from './components/AppInterface';
import { UserProfile } from './components/UserProfile';
import { SignUp } from './components/SignUp';
import { Features } from './sections/Features';
import { HowItWorks, FormatSupport } from './sections/Process';
import { Blogs } from './sections/Blogs';
import { BlogArchive } from './components/BlogArchive';
import { PrivacySection, FinalCTA } from './sections/Conversion';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';

export default function App() {
  const [isAppOpen, setIsAppOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isBlogArchiveOpen, setIsBlogArchiveOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user } = useAuth();

  const handleLaunch = () => {
    if (user) {
      setIsAppOpen(true);
    } else {
      setIsSignUpOpen(true);
    }
  };

  const handleSignUpSuccess = () => {
    setIsSignUpOpen(false);
    setIsAppOpen(true);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0b0b0c] text-white selection:bg-brand/30 selection:text-brand">
      {/* Cinematic Background Simulation */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#8b5cf6] opacity-10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#d946ef] opacity-10 blur-[150px]"></div>
        <div className="absolute inset-0 bg-carbon opacity-[0.03] mix-blend-overlay"></div>
        {/* Vertical Guide Lines */}
        <div className="absolute inset-0 flex justify-between px-4 md:px-20 pointer-events-none opacity-50">
          <div className="w-px h-full bg-white/5"></div>
          <div className="w-px h-full bg-white/5"></div>
          <div className="w-px h-full bg-white/5"></div>
          <div className="w-px h-full bg-white/5"></div>
        </div>
      </div>
      
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover opacity-30 pointer-events-none z-0 scale-[1.02]"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260506_081238_406ed0e3-5d83-436e-a512-0bbff7ec5b95.mp4"
      />
      
      {/* Overlay Gradient */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-0 pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10">
        <Navbar onLaunch={handleLaunch} onOpenProfile={() => setIsProfileOpen(true)} />
        
        <main>
          <Hero onLaunch={handleLaunch} />
          <Features />
          <HowItWorks />
          <FormatSupport />
          <Blogs onViewAll={() => setIsBlogArchiveOpen(true)} />
          <PrivacySection />
          <FinalCTA onLaunch={handleLaunch} />
        </main>

        <Footer />
        <ScrollToTop />
      </div>

      <AnimatePresence>
        {isSignUpOpen && (
          <SignUp 
            onBack={() => setIsSignUpOpen(false)} 
            onSuccess={handleSignUpSuccess} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAppOpen && (
          <AppInterface onClose={() => setIsAppOpen(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isProfileOpen && (
          <UserProfile onClose={() => setIsProfileOpen(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isBlogArchiveOpen && (
          <div className="fixed inset-0 z-[100] overflow-y-auto">
            <BlogArchive onBack={() => setIsBlogArchiveOpen(false)} />
          </div>
        )}
      </AnimatePresence>

      {/* Scroll to top shadow */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0b0b0c] to-transparent pointer-events-none z-20" />
      
      {/* Vercel Analytics */}
      <Analytics />
    </div>
  );
}

