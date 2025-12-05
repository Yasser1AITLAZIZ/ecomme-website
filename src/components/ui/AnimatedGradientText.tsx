'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface AnimatedGradientTextProps {
  children: React.ReactNode;
  className?: string;
  gradient?: string;
}

export function AnimatedGradientText({
  children,
  className,
  gradient = 'from-gold-400 via-gold-500 to-gold-600',
}: AnimatedGradientTextProps) {
  return (
    <motion.span
      className={cn(
        'bg-gradient-to-r bg-clip-text text-transparent bg-[length:200%_auto]',
        gradient,
        className
      )}
      animate={{
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      {children}
    </motion.span>
  );
}

