'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface FloatingPhoneProps {
  className?: string;
}

export function FloatingPhone({ className = '' }: FloatingPhoneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), {
    stiffness: 150,
    damping: 15,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), {
    stiffness: 150,
    damping: 15,
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const x = (e.clientX - centerX) / (rect.width / 2);
      const y = (e.clientY - centerY) / (rect.height / 2);
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div
      ref={containerRef}
      className={`relative flex justify-center items-center ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ perspective: '1000px' }}
    >
      {/* Ambient Gold Glow */}
      <motion.div
        className="absolute w-[400px] h-[400px] bg-gold-500 rounded-full blur-[120px] opacity-30"
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

      {/* Animated Gold Rings */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`ring-${i}`}
          className="absolute rounded-full border border-gold-600/20"
          style={{
            width: `${300 + i * 100}px`,
            height: `${300 + i * 100}px`,
          }}
          animate={{
            rotate: [0, 360],
            opacity: [0.1, 0.3, 0.1],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: 'linear',
            delay: i * 0.5,
          }}
        />
      ))}

      {/* 3D Phone Container */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        animate={{
          y: [0, -25, 0],
        }}
        transition={{
          y: {
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }}
        className="relative"
      >
        {/* Phone Frame - 3D Effect */}
        <div className="relative w-[300px] h-[600px]">
          {/* Phone Back with Gold Accents */}
          <motion.div
            className="absolute inset-0 rounded-[45px] p-[3px]"
            style={{
              background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 50%, #d4af37 100%)',
              boxShadow: isHovered
                ? '0 0 60px rgba(212, 175, 55, 0.6), 0 0 100px rgba(212, 175, 55, 0.3)'
                : '0 0 40px rgba(212, 175, 55, 0.4), 0 0 80px rgba(212, 175, 55, 0.2)',
            }}
            animate={{
              boxShadow: isHovered
                ? [
                    '0 0 60px rgba(212, 175, 55, 0.6), 0 0 100px rgba(212, 175, 55, 0.3)',
                    '0 0 80px rgba(212, 175, 55, 0.8), 0 0 120px rgba(212, 175, 55, 0.4)',
                    '0 0 60px rgba(212, 175, 55, 0.6), 0 0 100px rgba(212, 175, 55, 0.3)',
                  ]
                : [
                    '0 0 40px rgba(212, 175, 55, 0.4), 0 0 80px rgba(212, 175, 55, 0.2)',
                    '0 0 50px rgba(212, 175, 55, 0.5), 0 0 90px rgba(212, 175, 55, 0.25)',
                    '0 0 40px rgba(212, 175, 55, 0.4), 0 0 80px rgba(212, 175, 55, 0.2)',
                  ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {/* Inner Black Frame */}
            <div className="relative w-full h-full bg-gradient-to-br from-obsidian-950 via-obsidian-900 to-obsidian-950 rounded-[42px] overflow-hidden">
              {/* Screen with Animated Gradient */}
              <div className="relative w-full h-full rounded-[42px] overflow-hidden">
                {/* Animated Background Gradient */}
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 25%, #0a0a0a 50%, #1a1a1a 75%, #0a0a0a 100%)',
                    backgroundSize: '200% 200%',
                  }}
                  animate={{
                    backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />

                {/* Gold Shimmer Effect */}
                <motion.div
                  className="absolute inset-0 opacity-30"
                  style={{
                    background: 'linear-gradient(135deg, transparent 0%, rgba(212, 175, 55, 0.1) 25%, transparent 50%, rgba(212, 175, 55, 0.1) 75%, transparent 100%)',
                    backgroundSize: '200% 200%',
                  }}
                  animate={{
                    backgroundPosition: ['0% 0%', '200% 200%'],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />

                {/* Dynamic Island */}
                <motion.div
                  className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-8 bg-obsidian-950 rounded-full z-20 border border-gold-600/20"
                  style={{
                    boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)',
                  }}
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(212, 175, 55, 0.3)',
                      '0 0 30px rgba(212, 175, 55, 0.5)',
                      '0 0 20px rgba(212, 175, 55, 0.3)',
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  {/* Camera Cutout */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-gold-600/40" />
                  </div>
                </motion.div>

                {/* Screen Content - Elegant Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-10">
                  {/* Gold Logo/Icon */}
                  <motion.div
                    className="mb-6"
                    animate={{
                      scale: [1, 1.05, 1],
                      opacity: [0.8, 1, 0.8],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <div className="w-20 h-20 rounded-full border-2 border-gold-600/50 flex items-center justify-center bg-gold-600/10">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center">
                        <span className="text-obsidian-950 text-2xl font-bold">P</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Animated Text */}
                  <motion.div
                    className="text-center space-y-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <motion.h3
                      className="text-2xl font-bold bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 bg-clip-text text-transparent"
                      animate={{
                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                      style={{
                        backgroundSize: '200% 200%',
                      }}
                    >
                      iPhone 15 Pro Max
                    </motion.h3>
                    <p className="text-gold-600/60 text-sm font-medium">Titane Naturel</p>
                  </motion.div>

                  {/* Floating Gold Particles */}
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={`particle-${i}`}
                      className="absolute rounded-full bg-gold-600/40"
                      style={{
                        width: `${4 + Math.random() * 4}px`,
                        height: `${4 + Math.random() * 4}px`,
                        left: `${20 + (i % 3) * 30}%`,
                        top: `${30 + Math.floor(i / 3) * 30}%`,
                      }}
                      animate={{
                        y: [0, -30, 0],
                        opacity: [0, 0.8, 0],
                        scale: [0.5, 1.2, 0.5],
                      }}
                      transition={{
                        duration: 3 + Math.random() * 2,
                        repeat: Infinity,
                        delay: i * 0.5,
                        ease: 'easeInOut',
                      }}
                    />
                  ))}
                </div>

                {/* Side Gold Accent Lines */}
                <div className="absolute left-0 top-1/4 w-1 h-1/2 bg-gradient-to-b from-transparent via-gold-600/60 to-transparent rounded-r-full" />
                <div className="absolute right-0 top-1/4 w-1 h-1/2 bg-gradient-to-b from-transparent via-gold-600/60 to-transparent rounded-l-full" />

                {/* Bottom Gold Accent */}
                <motion.div
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-gold-600/80 to-transparent rounded-full"
                  animate={{
                    opacity: [0.4, 0.8, 0.4],
                    scaleX: [0.8, 1, 0.8],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </div>

              {/* Gold Side Buttons (3D effect) */}
              <div className="absolute left-0 top-1/3 w-1 h-16 bg-gradient-to-b from-gold-600/40 via-gold-600/60 to-gold-600/40 rounded-r-full" />
              <div className="absolute right-0 top-1/3 w-1 h-16 bg-gradient-to-b from-gold-600/40 via-gold-600/60 to-gold-600/40 rounded-l-full" />
            </div>
          </motion.div>

          {/* 3D Depth Shadow */}
          <motion.div
            className="absolute inset-0 rounded-[45px] bg-obsidian-950/50 blur-xl -z-10"
            style={{
              transform: 'translateZ(-20px)',
            }}
            animate={{
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

      {/* Floating Gold Orbs */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={`orb-${i}`}
          className="absolute rounded-full bg-gold-600/20 blur-md"
          style={{
            width: `${60 + i * 20}px`,
            height: `${60 + i * 20}px`,
            left: `${i % 2 === 0 ? '10%' : '80%'}`,
            top: `${20 + i * 25}%`,
          }}
          animate={{
            x: [0, i % 2 === 0 ? 30 : -30, 0],
            y: [0, -20, 0],
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            delay: i * 0.5,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

