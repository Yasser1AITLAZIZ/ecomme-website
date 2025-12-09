'use client';

import { useRef } from 'react';
import { useScroll, useTransform, motion, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { useI18n } from '@/lib/i18n/context';

interface iPhoneOutlineParallaxProps {
  className?: string;
  model?: string;
  price?: string;
  color?: string;
  sticky?: boolean;
  direction?: 'left' | 'right';
}

/**
 * Stylized iPhone outline with parallax effect
 * Similar to the reference site with outline-based design
 */
export function IPhoneOutlineParallax({
  className,
  model = 'iPhone 15 Pro Max',
  price = '1,199 MAD',
  color = 'Natural Titanium',
  sticky = true,
  direction = 'right',
}: iPhoneOutlineParallaxProps) {
  const { t, isRTL } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const smoothProgress = useSpring(scrollYProgress, springConfig);

  // Parallax movement
  const x = useTransform(
    smoothProgress,
    [0, 1],
    direction === 'right' ? [0, 100] : [0, -100]
  );
  const y = useTransform(smoothProgress, [0, 1], [0, -30]);

  // Rotation
  const rotate = useTransform(smoothProgress, [0, 0.5, 1], [-8, 0, 8]);

  // Opacity
  const opacity = useTransform(smoothProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0.8]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full',
        sticky ? 'h-[200vh]' : 'h-screen',
        className
      )}
    >
      <motion.div
        style={{
          x,
          y,
          rotate,
          opacity,
        }}
        className={cn(
          'relative w-full h-full flex items-center justify-center',
          sticky && 'sticky top-0'
        )}
      >
        <div className="relative w-full max-w-2xl mx-auto px-4">
          {/* Large iPhone Outline */}
          <div className="relative">
            <svg
              viewBox="0 0 400 800"
              className="w-full h-auto max-h-[800px]"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Outer glow */}
              <motion.rect
                x="30"
                y="50"
                width="340"
                height="700"
                rx="50"
                fill="none"
                stroke="rgba(212, 175, 55, 0.1)"
                strokeWidth="4"
                animate={{
                  strokeOpacity: [0.1, 0.3, 0.1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              
              {/* Main phone outline */}
              <rect
                x="30"
                y="50"
                width="340"
                height="700"
                rx="50"
                fill="none"
                stroke="url(#goldGradientMain)"
                strokeWidth="3"
              />
              
              {/* Screen */}
              <rect
                x="60"
                y="120"
                width="280"
                height="560"
                rx="30"
                fill="none"
                stroke="rgba(212, 175, 55, 0.2)"
                strokeWidth="2"
              />
              
              {/* Dynamic Island */}
              <motion.ellipse
                cx="200"
                cy="140"
                rx="50"
                ry="10"
                fill="rgba(212, 175, 55, 0.15)"
                animate={{
                  rx: [50, 60, 50],
                  opacity: [0.15, 0.3, 0.15],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              
              {/* Camera lenses */}
              <g>
                <circle cx="120" cy="120" r="12" fill="rgba(212, 175, 55, 0.2)" />
                <circle cx="120" cy="120" r="6" fill="rgba(212, 175, 55, 0.5)" />
                <circle cx="150" cy="120" r="10" fill="rgba(212, 175, 55, 0.2)" />
                <circle cx="150" cy="120" r="5" fill="rgba(212, 175, 55, 0.5)" />
                <circle cx="180" cy="120" r="8" fill="rgba(212, 175, 55, 0.2)" />
                <circle cx="180" cy="120" r="4" fill="rgba(212, 175, 55, 0.5)" />
              </g>
              
              {/* Gradient definitions */}
              <defs>
                <linearGradient id="goldGradientMain" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#d4af37" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#ffd700" stopOpacity="1" />
                  <stop offset="100%" stopColor="#d4af37" stopOpacity="0.9" />
                </linearGradient>
              </defs>
            </svg>

            {/* Model badge - top left */}
            <motion.div
              className={cn(
                "absolute top-24 bg-black-100/80 border border-gold-600/50 rounded-lg px-4 py-3 backdrop-blur-md",
                isRTL ? "right-4" : "left-4"
              )}
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-white text-sm font-medium">{model}</p>
              <p className="text-gold-600 font-bold text-xs mt-1">{color}</p>
            </motion.div>

            {/* Price badge - bottom right */}
            <motion.div
              className={cn(
                "absolute bottom-40 bg-black-100/80 border border-gold-600/50 rounded-lg px-4 py-3 backdrop-blur-md",
                isRTL ? "left-4" : "right-4"
              )}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-gray-400 text-xs">{t.home.showcase.startingFrom}</p>
              <p className="text-gold-600 font-bold text-xl mt-1">{price}</p>
            </motion.div>
          </div>

          {/* Animated glow rings */}
          <motion.div
            className="absolute inset-0 bg-gold-600/5 blur-3xl rounded-full -z-10"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}

