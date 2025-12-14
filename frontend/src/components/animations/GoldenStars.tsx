'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Star {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
  rotation: number;
}

export function GoldenStars() {
  const [mounted, setMounted] = useState(false);
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    setMounted(true);
    
    // Generate golden stars with random properties - smaller and more stylish
    const starArray: Star[] = Array.from({ length: 80 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 8 + Math.random() * 12,
      size: 2 + Math.random() * 3, // Smaller size range (2-5px) - more stylish
      opacity: 0.3 + Math.random() * 0.5, // More subtle (0.3-0.8)
      rotation: Math.random() * 360,
    }));
    
    setStars(starArray);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute"
          style={{
            left: `${star.left}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            top: '-20px',
          }}
          initial={{ 
            y: -20,
            x: 0,
            rotate: star.rotation,
          }}
          animate={{
            y: 2000,
            x: Math.sin(star.id) * 30,
            rotate: star.rotation + 360,
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            ease: 'linear',
            delay: star.delay,
          }}
        >
          {/* Star shape with enhanced glow */}
          <div
            className="w-full h-full relative"
            style={{
              filter: 'drop-shadow(0 0 2px rgba(212, 175, 55, 0.8)) drop-shadow(0 0 4px rgba(255, 215, 0, 0.6))',
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(circle, rgba(212, 175, 55, 1) 0%, rgba(255, 215, 0, 0.8) 40%, rgba(255, 215, 0, 0.4) 70%, transparent 100%)',
                clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
              }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

