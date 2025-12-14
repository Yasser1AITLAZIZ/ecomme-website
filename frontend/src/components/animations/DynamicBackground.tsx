'use client';

import { useScroll, useTransform, motion } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { isMobile, prefersReducedMotion } from '@/lib/utils/device';

export function DynamicBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldAnimate, setShouldAnimate] = useState(true);
  
  useEffect(() => {
    // Disable complex animations on mobile or if user prefers reduced motion
    if (isMobile() || prefersReducedMotion()) {
      setShouldAnimate(false);
    }
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Always call hooks, but use static values if animations disabled
  const gradientX1Transform = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const gradientY1Transform = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const gradientX2Transform = useTransform(scrollYProgress, [0, 1], [100, 0]);
  const gradientY2Transform = useTransform(scrollYProgress, [0, 1], [100, 0]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 0.6, 0.3]);
  const scaleTransform = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  const rotateTransform = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const scaleRotateTransform = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.2, 0.8]);
  const opacityRotateTransform = useTransform(scrollYProgress, [0, 1], [0.2, 0.5]);

  // Use transforms if animations enabled, otherwise static values
  const gradientX1 = shouldAnimate ? gradientX1Transform : 0;
  const gradientY1 = shouldAnimate ? gradientY1Transform : 0;
  const gradientX2 = shouldAnimate ? gradientX2Transform : 0;
  const gradientY2 = shouldAnimate ? gradientY2Transform : 0;
  const opacity = shouldAnimate ? opacityTransform : 0.3;
  const scale = shouldAnimate ? scaleTransform : 1;

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
          opacity: shouldAnimate ? opacityRotateTransform : 0.3,
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 w-[500px] h-[500px] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
        style={{
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 70%)',
          rotate: shouldAnimate ? rotateTransform : 0,
          scale: shouldAnimate ? scaleRotateTransform : 1,
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

