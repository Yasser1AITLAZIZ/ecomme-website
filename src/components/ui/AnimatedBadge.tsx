'use client';

import { motion } from 'framer-motion';
import { Sparkles, Zap, Flame, Star } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface AnimatedBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'sale' | 'new' | 'featured' | 'hot';
  className?: string;
  icon?: boolean;
}

export function AnimatedBadge({
  children,
  variant = 'default',
  className,
  icon = false,
}: AnimatedBadgeProps) {
  const variants = {
    default: 'bg-gold-600/20 text-gold-600 border-gold-600/30',
    sale: 'bg-red-600/20 text-red-400 border-red-600/30',
    new: 'bg-blue-600/20 text-blue-400 border-blue-600/30',
    featured: 'bg-purple-600/20 text-purple-400 border-purple-600/30',
    hot: 'bg-orange-600/20 text-orange-400 border-orange-600/30',
  };

  const icons = {
    default: Sparkles,
    sale: Zap,
    new: Star,
    featured: Sparkles,
    hot: Flame,
  };

  const Icon = icons[variant];

  return (
    <motion.div
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold',
        variants[variant],
        className
      )}
      whileHover={{ scale: 1.05 }}
      animate={{
        boxShadow: [
          '0 0 0px rgba(212, 175, 55, 0)',
          '0 0 10px rgba(212, 175, 55, 0.3)',
          '0 0 0px rgba(212, 175, 55, 0)',
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
      }}
    >
      {icon && (
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          <Icon className="w-3 h-3" />
        </motion.div>
      )}
      {children}
    </motion.div>
  );
}

