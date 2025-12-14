'use client';

import { useRef } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils/cn';

interface ScrolliPhoneProps {
  imageUrl: string;
  className?: string;
  startOffset?: number;
  endOffset?: number;
  rotationRange?: [number, number];
  scaleRange?: [number, number];
  xRange?: [number, number];
  yRange?: [number, number];
}

export function ScrolliPhone({
  imageUrl,
  className,
  startOffset = 0,
  endOffset = 1,
  rotationRange = [-15, 15],
  scaleRange = [0.8, 1.2],
  xRange = [-50, 50],
  yRange = [-100, 100],
}: ScrolliPhoneProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Transform scroll progress to rotation
  const rotate = useTransform(
    scrollYProgress,
    [startOffset, endOffset],
    rotationRange
  );

  // Transform scroll progress to scale
  const scale = useTransform(
    scrollYProgress,
    [startOffset, endOffset],
    scaleRange
  );

  // Transform scroll progress to X position
  const x = useTransform(
    scrollYProgress,
    [startOffset, endOffset],
    xRange
  );

  // Transform scroll progress to Y position
  const y = useTransform(
    scrollYProgress,
    [startOffset, endOffset],
    yRange
  );

  // Opacity based on scroll
  const opacity = useTransform(
    scrollYProgress,
    [startOffset, endOffset],
    [0.3, 1]
  );

  return (
    <div ref={ref} className={cn('relative w-full h-screen flex items-center justify-center', className)}>
      <motion.div
        style={{
          rotate,
          scale,
          x,
          y,
          opacity,
        }}
        className="relative w-64 h-[500px] md:w-80 md:h-[600px]"
      >
        <div className="relative w-full h-full">
          <Image
            src={imageUrl}
            alt="iPhone"
            fill
            className="object-contain"
            priority
            sizes="(max-width: 768px) 256px, 320px"
          />
        </div>
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 bg-gold-600/20 blur-3xl -z-10"
          style={{
            opacity: useTransform(scrollYProgress, [startOffset, endOffset], [0, 0.5]),
          }}
        />
      </motion.div>
    </div>
  );
}

