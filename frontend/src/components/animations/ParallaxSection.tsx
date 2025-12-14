'use client';

import { useScroll, useTransform, motion } from 'framer-motion';
import { useRef } from 'react';
import { cn } from '@/lib/utils/cn';

interface ParallaxSectionProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}

export function ParallaxSection({
  children,
  className,
  speed = 0.5,
}: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -100 * speed]);

  return (
    <motion.div
      ref={ref}
      style={{ y }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

