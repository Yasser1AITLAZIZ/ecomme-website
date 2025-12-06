'use client';

import { useRef } from 'react';
import { useScroll, useTransform, motion, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { useI18n } from '@/lib/i18n/context';

interface iPhoneOutlineProps {
  className?: string;
  model?: string;
  price?: string;
  color?: string;
  speed?: number;
}

/**
 * Stylized iPhone outline animation component
 * Creates animated iPhone outlines that move and transform on scroll
 */
export function IPhoneOutline({
  className,
  model = 'iPhone 15 Pro',
  price = '999 MAD',
  color = 'Natural Titanium',
  speed = 0.3,
}: iPhoneOutlineProps) {
  const { t, isRTL } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const smoothProgress = useSpring(scrollYProgress, springConfig);

  // Parallax movement
  const y = useTransform(smoothProgress, [0, 1], [100 * speed, -100 * speed]);
  const x = useTransform(smoothProgress, [0, 1], [-50 * speed, 50 * speed]);

  // Rotation based on scroll
  const rotate = useTransform(smoothProgress, [0, 0.5, 1], [-5, 0, 5]);

  // Scale effect
  const scale = useTransform(smoothProgress, [0, 0.5, 1], [0.9, 1, 0.9]);

  // Opacity
  const opacity = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0.8]);

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full h-[200vh] flex items-center justify-center bg-black', className)}
    >
      <motion.div
        style={{
          y,
          x,
          rotate,
          scale,
          opacity,
        }}
        className="sticky top-0 w-full max-w-6xl mx-auto px-4 py-20 flex items-center justify-center"
      >
        <div className="relative w-full max-w-md">
          {/* iPhone Outline SVG */}
          <svg
            viewBox="0 0 300 600"
            className="w-full h-auto"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Phone body outline */}
            <motion.rect
              x="20"
              y="40"
              width="260"
              height="520"
              rx="40"
              fill="none"
              stroke="url(#goldGradient)"
              strokeWidth="3"
            />
            
            {/* Screen area */}
            <rect
              x="40"
              y="80"
              width="220"
              height="420"
              rx="25"
              fill="none"
              stroke="rgba(212, 175, 55, 0.3)"
              strokeWidth="2"
            />
            
            {/* Dynamic Island */}
            <motion.ellipse
              cx="150"
              cy="100"
              rx="40"
              ry="8"
              fill="rgba(212, 175, 55, 0.2)"
              animate={{
                rx: [40, 45, 40],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            
            {/* Camera module */}
            <circle
              cx="80"
              cy="90"
              r="8"
              fill="rgba(212, 175, 55, 0.3)"
            />
            <circle
              cx="80"
              cy="90"
              r="4"
              fill="rgba(212, 175, 55, 0.6)"
            />
            
            {/* Gradient definition */}
            <defs>
              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#d4af37" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#ffd700" stopOpacity="1" />
                <stop offset="100%" stopColor="#d4af37" stopOpacity="0.8" />
              </linearGradient>
            </defs>
          </svg>

          {/* Model name badge */}
          <motion.div
            className={cn(
              "absolute top-20 bg-black-100 border border-gold-600/50 rounded-lg px-4 py-2 backdrop-blur-sm",
              isRTL ? "right-8" : "left-8"
            )}
            initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-white text-sm">{model}</p>
            <p className="text-gold-600 font-bold text-xs">{color}</p>
          </motion.div>

          {/* Price badge */}
          <motion.div
            className={cn(
              "absolute bottom-32 bg-black-100 border border-gold-600/50 rounded-lg px-4 py-2 backdrop-blur-sm",
              isRTL ? "left-8" : "right-8"
            )}
            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <p className="text-gray-400 text-xs">{t.home.showcase.startingFrom}</p>
            <p className="text-gold-600 font-bold text-lg">{price}</p>
          </motion.div>

          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 bg-gold-600/10 blur-3xl -z-10 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}

