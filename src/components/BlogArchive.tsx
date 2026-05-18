import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, User, Search, Filter } from 'lucide-react';
import { GlassCard } from './GlassCard';

const allPosts = [
  {
    title: 'The Future of Digital Privacy in Photography',
    excerpt: 'How AI-driven metadata refinement is changing the landscape for professional photographers and creative agencies.',
    date: 'May 12, 2026',
    author: 'Elena Vance',
    category: 'Privacy',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'Optimizing Workflow with Batch Metadata Ops',
    excerpt: 'Deep dive into industrial-grade batch processing and how it saves hundreds of hours in post-production cycles.',
    date: 'May 08, 2026',
    author: 'Mark Scout',
    category: 'Workflow',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'Understanding EXIF: Beyond GPS and Shutter Speed',
    excerpt: 'A comprehensive guide to the hidden layers of image metadata and why they matter for your professional brand.',
    date: 'May 01, 2026',
    author: 'Helly R.',
    category: 'Technical',
    image: 'https://images.unsplash.com/photo-1542744094-24638eff58bb?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'AI and Ethical Metadata Generation',
    excerpt: 'Where do we draw the line? Exploring the ethics of AI-generated camera profiles in commercial photography.',
    date: 'April 25, 2026',
    author: 'Burt G.',
    category: 'Ethics',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'Securing Your Agency Assets',
    excerpt: 'A blueprint for creative agencies to handle sensitive client data using local-first processing tools.',
    date: 'April 18, 2026',
    author: 'Milchick',
    category: 'Security',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800'
  },
  {
     title: 'Mastering Batch Uploads for High-Volume Studios',
     excerpt: 'Strategies for scaling your image throughput using MetaShift’s industrial batch engine.',
     date: 'April 12, 2026',
     author: 'Elena Vance',
     category: 'Workflow',
     image: 'https://images.unsplash.com/photo-1519389950473-acc756f67751?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'The Hidden Risks of RAW Metadata',
    excerpt: 'Why shooting in RAW isn’t enough to protect your creative IP and location data.',
    date: 'April 05, 2026',
    author: 'Mark Scout',
    category: 'Privacy',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'ZIP Export Workflows: Deployment Speed',
    excerpt: 'How instant ZIP packaging accelerates the handoff process in fast-paced commercial environments.',
    date: 'March 28, 2026',
    author: 'Helly R.',
    category: 'Workflow',
    image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'Sanitizing JPEGs for Social Media Distribution',
    excerpt: 'The essential checklist for removing sensitive trackers before your photos go viral.',
    date: 'March 20, 2026',
    author: 'Burt G.',
    category: 'Security',
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'Image Security for Photojournalists',
    excerpt: 'Protecting sources and sensitive locations in high-risk zones through metadata stripping.',
    date: 'March 15, 2026',
    author: 'Dylan G.',
    category: 'Privacy',
    image: 'https://images.unsplash.com/photo-1504917595217-d4dc5f666d41?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'EXIF Automation: The New Industry Standard',
    excerpt: 'Why manual metadata entry is obsolete and how AI is taking over the labeling process.',
    date: 'March 08, 2026',
    author: 'Elena Vance',
    category: 'Technical',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'Local vs. Cloud Metadata Processing',
    excerpt: 'A performance comparison: Why local-first processing wins for privacy and speed.',
    date: 'March 01, 2026',
    author: 'Mark Scout',
    category: 'Technical',
    image: 'https://images.unsplash.com/photo-1496065187459-642bbb126d5c?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'Preserving Color Profiles in Batch Ops',
    excerpt: 'How to maintain color accuracy while stripping identifying hardware signatures.',
    date: 'February 22, 2026',
    author: 'Helly R.',
    category: 'Workflow',
    image: 'https://images.unsplash.com/photo-1550439062-609e1531270e?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'Metadata and Copyright Protection',
    excerpt: 'Using IPTC fields to embed licensing information without compromising user privacy.',
    date: 'February 15, 2026',
    author: 'Burt G.',
    category: 'Ethics',
    image: 'https://images.unsplash.com/photo-1589254065878-42c9da997008?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'The Role of Metadata in DAM Systems',
    excerpt: 'How clean EXIF data improves searchability in Digital Asset Management platforms.',
    date: 'February 08, 2026',
    author: 'Milchick',
    category: 'Workflow',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'Deep Learning for Image Scene Recognition',
    excerpt: 'The technology behind MetaShift’s automatic scene and keyword generation.',
    date: 'February 01, 2026',
    author: 'Dylan G.',
    category: 'Technical',
    image: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'Privacy Benchmarks for Creative Apps',
    excerpt: 'How we audited 50+ photography tools for metadata leakage and what we found.',
    date: 'January 25, 2026',
    author: 'Elena Vance',
    category: 'Security',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'Streamlining Stock Photo Submissions',
    excerpt: 'Meeting the strict metadata requirements of major stock agencies in one click.',
    date: 'January 18, 2026',
    author: 'Mark Scout',
    category: 'Workflow',
    image: 'https://images.unsplash.com/photo-1472289065668-ce650ac443d2?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'History of EXIF: From 1995 to AI',
    excerpt: 'Tracing the evolution of image metadata from basic timestamps to complex AI arrays.',
    date: 'January 10, 2026',
    author: 'Helly R.',
    category: 'Technical',
    image: 'https://images.unsplash.com/photo-1516110833967-0b5716ca1387?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'GDPR Compliance for Professional Photographers',
    excerpt: 'Is your image metadata breaking the law? A guide to GDPR in the creative industry.',
    date: 'January 03, 2026',
    author: 'Burt G.',
    category: 'Privacy',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'Optimizing HEIC Metadata for Web Delivery',
    excerpt: 'The specific challenges of Apple’s high-efficiency format and how to solve them.',
    date: 'December 20, 2025',
    author: 'Milchick',
    category: 'Technical',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'Metadata Forensics: The Hidden Story',
    excerpt: 'How researchers use metadata to solve mysteries and verify image authenticity.',
    date: 'December 12, 2025',
    author: 'Dylan G.',
    category: 'Security',
    image: 'https://images.unsplash.com/photo-1484417894907-623942c8ee29?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'Scaling AI Processing for Enterprise',
    excerpt: 'Architecting MetaShift for agencies handling millions of images per month.',
    date: 'December 05, 2025',
    author: 'Elena Vance',
    category: 'Technical',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc51?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'Why Location Data is the New Goldmine',
    excerpt: 'Understanding why big tech wants your photo GPS data and how to reclaim it.',
    date: 'November 28, 2025',
    author: 'Mark Scout',
    category: 'Privacy',
    image: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'Automation Scripts for Metadata Cleanup',
    excerpt: 'A developer’s guide to writing custom logic for specialized metadata requirements.',
    date: 'November 20, 2025',
    author: 'Helly R.',
    category: 'Technical',
    image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'The Psychology of Privacy in Art',
    excerpt: 'How knowing an image is "cleansed" changes the viewer’s relationship with the work.',
    date: 'November 12, 2025',
    author: 'Burt G.',
    category: 'Ethics',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'Metadata Injection in TIFF Files',
    excerpt: 'Dealing with the heavy hitters: specialized processing for ultra-high-res TIFFs.',
    date: 'November 05, 2025',
    author: 'Milchick',
    category: 'Technical',
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'Ensuring Clean Handouts for Freelancers',
    excerpt: 'A project manager’s guide to verifying freelancer output is privacy-compliant.',
    date: 'October 28, 2025',
    author: 'Dylan G.',
    category: 'Workflow',
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'The Ethics of Geotagging Nature',
    excerpt: 'How stripping metadata saves endangered species and hidden hiking spots.',
    date: 'October 20, 2025',
    author: 'Elena Vance',
    category: 'Ethics',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'MetaShift: Version 4.0 Technical Log',
    excerpt: 'Breaking down the newest algorithm updates and engine improvements.',
    date: 'October 12, 2025',
    author: 'Mark Scout',
    category: 'Technical',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800'
  }
];

export const BlogArchive = ({ onBack }: { onBack: () => void }) => {
  return (
    <div className="min-h-screen bg-black pt-32 pb-20 px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        {/* Navigation */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onBack}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-brand transition-colors mb-12 group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Return to System
        </motion.button>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl text-left">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-8xl font-black tracking-tighter italic uppercase mb-6 leading-[0.85]"
            >
              System<br />
              <span className="text-gradient-immersive">Archives.</span>
            </motion.h1>
            <p className="text-white/40 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em]">
              Complete repository of technical logs, workflow insights, and security bulletins.
            </p>
          </div>

          <div className="flex gap-4">
             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-brand transition-colors" size={16} />
                <input 
                  type="text" 
                  placeholder="SEARCH MODULES..." 
                  className="bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-6 text-[10px] font-black uppercase tracking-widest text-white placeholder:text-white/20 focus:outline-none focus:border-brand/40 min-w-[280px]"
                />
             </div>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-3 mb-16">
          {['All Cycles', 'Privacy', 'Workflow', 'Technical', 'Ethics', 'Security'].map((cat, i) => (
            <button 
              key={cat}
              className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border transition-all ${i === 0 ? 'bg-brand text-black border-brand' : 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allPosts.map((post, index) => (
            <motion.div
              key={post.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <GlassCard className="h-full flex flex-col p-0 overflow-hidden group hover:border-brand/30 transition-all duration-500 rounded-3xl">
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-black/80 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-widest text-brand border border-white/10">
                    {post.category}
                  </div>
                </div>
                
                <div className="p-8 flex flex-col flex-grow">
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">
                    <span className="flex items-center gap-1.5"><Calendar size={12} /> {post.date}</span>
                    <span className="flex items-center gap-1.5"><User size={12} /> {post.author}</span>
                  </div>
                  
                  <h3 className="text-xl font-black uppercase tracking-tighter italic mb-4 group-hover:text-brand transition-colors">
                    {post.title}
                  </h3>
                  
                  <p className="text-white/40 text-sm leading-relaxed mb-8">
                    {post.excerpt}
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
