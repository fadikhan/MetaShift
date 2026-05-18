/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { 
  Layers, Sparkles, Archive, ShieldCheck, 
  Search, FileCode, Zap, Globe, Cpu 
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';

const features = [
  {
    icon: Layers,
    title: 'Batch Processing',
    description: 'Process thousands of images simultaneously. Edit, remove, or randomize metadata across your entire library in seconds.',
    color: 'from-purple-500/20 to-brand/20'
  },
  {
    icon: Sparkles,
    title: 'AI Metadata Generator',
    description: 'Use advanced AI presets to regenerate realistic camera and device metadata, perfect for creative professionals.',
    color: 'from-brand/20 to-brand-alt/20'
  },
  {
    icon: Archive,
    title: 'ZIP Export Downloads',
    description: 'Instantly package your processed assets into secure, optimized ZIP files for easy sharing and backup.',
    color: 'from-brand-alt/20 to-pink-500/20'
  },
  {
    icon: ShieldCheck,
    title: 'Privacy Protection',
    description: 'Strip GPS, author, and device data locally in your browser. Your files never leave your machine.',
    color: 'from-pink-500/20 to-purple-500/20'
  },
  {
    icon: Search,
    title: 'EXIF Preview Engine',
    description: 'High-speed metadata extraction engine that supports over 500+ metadata tags including GPS and RAW data.',
    color: 'from-brand/20 to-brand-alt/20'
  },
  {
    icon: FileCode,
    title: 'Multi-format Support',
    description: 'Comprehensive support for JPG, PNG, WEBP, TIFF, RAW, HEIC, and BMP. No conversion needed.',
    color: 'from-purple-500/20 to-brand/20'
  }
];

export const Features = () => {
  return (
    <section id="features" className="py-24 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-brand/10 border border-brand/20 text-brand text-[10px] font-black uppercase tracking-[0.2em] mb-6"
          >
            <Zap size={14} className="fill-current" />
            Core Capabilities
          </motion.div>
          <h2 className="text-3xl md:text-6xl font-black tracking-tighter italic uppercase mb-6 leading-tight">Built for the next era of <br className="hidden md:block" /> digital asset management.</h2>
          <p className="text-white/40 max-w-2xl mx-auto text-xs uppercase font-black tracking-[0.2em]">MetaShift combines powerful automation with military-grade privacy to give you total control over your image data.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <GlassCard className="h-full group hover:border-brand/30 transition-colors rounded-3xl">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${feature.color} mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tighter italic mb-3 group-hover:text-brand transition-colors">{feature.title}</h3>
                <p className="text-white/40 text-[13px] leading-relaxed font-medium">{feature.description}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
