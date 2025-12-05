'use client';

import { useRef } from 'react';
import { useScroll, useTransform, motion, useSpring } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils/cn';

interface ScrolliPhoneParallaxProps {
  imageUrl: string;
  className?: string;
  speed?: number;
  sticky?: boolean;
  direction?: 'left' | 'right' | 'up' | 'down';
  children?: React.ReactNode;
}

export function ScrolliPhoneParallax({
  imageUrl,
  className,
  speed = 0.5,
  sticky = false,
  direction = 'right',
  children,
}: ScrolliPhoneParallaxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const smoothProgress = useSpring(scrollYProgress, springConfig);

  // Calculate movement based on direction
  const getTransform = () => {
    const baseValue = useTransform(smoothProgress, [0, 1], [0, 100 * speed]);
    
    switch (direction) {
      case 'left':
        return { x: useTransform(baseValue, (v) => -v), y: 0 };
      case 'right':
        return { x: baseValue, y: 0 };
      case 'up':
        return { x: 0, y: useTransform(baseValue, (v) => -v) };
      case 'down':
        return { x: 0, y: baseValue };
      default:
        return { x: baseValue, y: 0 };
    }
  };

  const { x, y } = getTransform();

  // Rotation based on scroll
  const rotate = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    [-10, 0, 10]
  );

  // Scale based on scroll
  const scale = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    [0.9, 1, 0.9]
  );

  // Opacity
  const opacity = useTransform(
    smoothProgress,
    [0, 0.2, 0.8, 1],
    [0, 1, 1, 0]
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full',
        sticky ? 'sticky top-0 h-screen' : 'h-[150vh]',
        className
      )}
    >
      <motion.div
        style={{
          x,
          y,
          rotate,
          scale,
          opacity,
        }}
        className={cn(
          'relative w-64 h-[500px] md:w-80 md:h-[600px] mx-auto',
          sticky && 'top-1/2 -translate-y-1/2'
        )}
      >
        <div className="relative w-full h-full">
          <Image
            src={imageUrl}
            alt="iPhone"
            fill
            className="object-contain drop-shadow-2xl"
            sizes="(max-width: 768px) 256px, 320px"
          />
        </div>
        {/* Animated glow */}
        <motion.div
          className="absolute inset-0 bg-gold-600/30 blur-3xl -z-10 rounded-full"
          style={{
            scale: useTransform(smoothProgress, [0, 1], [0.8, 1.5]),
            opacity: useTransform(smoothProgress, [0, 0.5, 1], [0.3, 0.6, 0.3]),
          }}
        />
      </motion.div>
    </div>
  );
}

