/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Upload, Sliders, Download, Zap } from 'lucide-react';

export const HowItWorks = () => {
  const steps = [
    {
      icon: Upload,
      title: 'Upload Images',
      description: 'Drag and drop single or multiple images. Supports batch uploads for thousands of files at once.',
    },
    {
      icon: Sliders,
      title: 'Edit or Randomize',
      description: 'Use the editor to manually set tags, or use AI to randomize and regenerate new metadata instantly.',
    },
    {
      icon: Download,
      title: 'Download ZIP',
      description: 'Export all processed images in a single, secure ZIP package with optimized metadata structures.',
    },
  ];

  return (
    <section className="py-24 px-6 bg-black/40">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold mb-4">How it Works</h2>
          <p className="text-white/40">Three steps to complete control over your metadata.</p>
        </div>

        <div className="relative">
          {/* Connector Line */}
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent hidden lg:block" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 rounded-full liquid-glass flex items-center justify-center mb-8 relative z-10 group hover:scale-110 transition-transform">
                  <div className="absolute inset-0 bg-brand/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <step.icon size={32} className="text-brand" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white text-black text-xs font-bold flex items-center justify-center border-4 border-black">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed max-w-[280px]">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export const FormatSupport = () => {
  const formats = ['JPG', 'JPEG', 'PNG', 'WEBP', 'HEIC', 'RAW', 'TIFF', 'BMP'];

  return (
    <section id="formats" className="py-24 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h2 className="text-3xl font-bold mb-4">Built for every major image format.</h2>
        <p className="text-white/40">From professional RAW files to web-optimized formats.</p>
      </div>

      <div className="relative flex overflow-x-hidden group">
        <div className="animate-marquee flex gap-8 py-4 whitespace-nowrap items-center">
          {[...formats, ...formats, ...formats].map((format, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
              className="px-10 py-4 rounded-full liquid-glass border border-white/10 text-xl font-bold tracking-widest text-white/60 hover:text-brand transition-all cursor-default"
            >
              {format}
            </motion.div>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      ` }} />
    </section>
  );
};
