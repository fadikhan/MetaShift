/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import React, { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  id?: string;
  key?: React.Key;
}

export const GlassCard = ({ children, className = '', id }: GlassCardProps) => {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`liquid-glass rounded-2xl p-4 md:p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
};
