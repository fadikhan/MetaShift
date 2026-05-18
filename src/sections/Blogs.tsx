import React from 'react';
import { motion } from 'motion/react';
import { GlassCard } from '../components/GlassCard';
import { ArrowRight, Calendar, User } from 'lucide-react';

const blogPosts = [
  {
    title: 'The Future of Digital Privacy in Photography',
    excerpt: 'How AI-driven metadata refinement is changing the landscape for professional photographers and creative agencies.',
    date: 'May 12, 2026',
    author: 'Elena Vance',
    category: 'Privacy',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'Mastering Batch Uploads for High-Volume Studios',
    excerpt: 'Strategies for scaling your image throughput using MetaShift’s industrial batch engine and parallel processing.',
    date: 'April 28, 2026',
    author: 'Mark Scout',
    category: 'Workflow',
    image: 'https://images.unsplash.com/photo-1519389950473-acc756f67751?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'The Hidden Risks of RAW Metadata',
    excerpt: 'Why shooting in RAW isn’t enough to protect your creative IP and location data from sophisticated scrapers.',
    date: 'April 15, 2026',
    author: 'Helly R.',
    category: 'Privacy',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800'
  }
];

export const Blogs = ({ onViewAll }: { onViewAll: () => void }) => {
  return (
    <section id="blogs" className="py-24 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-brand/10 border border-brand/20 text-brand text-[10px] font-black uppercase tracking-[0.2em] mb-6"
            >
              Latest Intel
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter italic uppercase mb-2">Systems Output</h2>
            <p className="text-white/40 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em]">Insights from the core of MetaShift engine development.</p>
          </div>
          
          <button 
            onClick={onViewAll}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-brand transition-colors group"
          >
            View All Archives
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <motion.div
              key={post.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <GlassCard className="h-full flex flex-col p-0 overflow-hidden group hover:border-brand/30 transition-all duration-500 rounded-3xl">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-black/80 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-widest text-brand border border-white/10">
                    {post.category}
                  </div>
                </div>
                
                <div className="p-6 md:p-8 flex flex-col flex-grow">
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">
                    <span className="flex items-center gap-1.5"><Calendar size={12} /> {post.date}</span>
                    <span className="flex items-center gap-1.5"><User size={12} /> {post.author}</span>
                  </div>
                  
                  <h3 className="text-xl font-black uppercase tracking-tighter italic mb-4 group-hover:text-brand transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <p className="text-white/40 text-sm leading-relaxed mb-8 line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
