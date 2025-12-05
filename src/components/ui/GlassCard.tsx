'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className, hover = true }: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        'relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl',
        'shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]',
        'before:absolute before:inset-0 before:rounded-2xl before:p-[1px]',
        'before:bg-gradient-to-br before:from-gold-500/20 before:to-transparent',
        'before:-z-10 before:opacity-0 before:transition-opacity before:duration-300',
        'hover:before:opacity-100',
        'hover:bg-white/10 hover:border-gold-500/30',
        'transition-all duration-300',
        className
      )}
      whileHover={hover ? { y: -8, scale: 1.02 } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

