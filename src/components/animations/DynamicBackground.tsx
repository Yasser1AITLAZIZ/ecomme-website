'use client';

import { useScroll, useTransform, motion } from 'framer-motion';
import { useRef } from 'react';

export function DynamicBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Animated gradient positions based on scroll
  const gradientX1 = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const gradientY1 = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const gradientX2 = useTransform(scrollYProgress, [0, 1], [100, 0]);
  const gradientY2 = useTransform(scrollYProgress, [0, 1], [100, 0]);

  // Opacity changes
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 0.6, 0.3]);

  // Scale effect
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);

  return (
    <div ref={containerRef} className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base background */}
      <div className="absolute inset-0 bg-obsidian-950" />
      
      {/* Animated gradient orbs - matching HTML radial gradients */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-[600px] h-[600px] rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(212, 175, 55, 0.1) 0%, transparent 70%)',
          x: gradientX1,
          y: gradientY1,
          opacity,
        }}
      />
      <motion.div
        className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%)',
          x: gradientX1,
          y: gradientY1,
          opacity,
          scale,
        }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%)',
          x: gradientX2,
          y: gradientY2,
          opacity: useTransform(scrollYProgress, [0, 1], [0.2, 0.5]),
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 w-[500px] h-[500px] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
        style={{
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 70%)',
          rotate: useTransform(scrollYProgress, [0, 1], [0, 360]),
          scale: useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.2, 0.8]),
        }}
      />
      
      {/* Grid pattern overlay - matching HTML hero-grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(212, 175, 55, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212, 175, 55, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
    </div>
  );
}

