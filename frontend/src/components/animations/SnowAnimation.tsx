'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Snowflake {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
  drift: number;
}

export function SnowAnimation() {
  const [mounted, setMounted] = useState(false);
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);

  useEffect(() => {
    setMounted(true);
    
    // Generate snowflakes with random properties - smaller and more stylish
    const flakes: Snowflake[] = Array.from({ length: 80 }, (_, i) => ({
      id: i,
      left: Math.random() * 100, // Random horizontal position (0-100%)
      delay: Math.random() * 10, // Random delay (0-10s)
      duration: 8 + Math.random() * 12, // Random duration (8-20s) - faster fall
      size: 1.5 + Math.random() * 2.5, // Random size (1.5-4px) - smaller and more stylish
      opacity: 0.3 + Math.random() * 0.4, // Random opacity (0.3-0.7) - more subtle
      drift: (Math.random() * 30 - 15), // Horizontal drift amount (-15 to 15px)
    }));
    
    setSnowflakes(flakes);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      {snowflakes.map((flake) => (
        <motion.div
          key={flake.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${flake.left}%`,
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            opacity: flake.opacity,
            top: '-20px',
            filter: 'blur(0.5px)',
          }}
          initial={{ 
            y: -20,
            x: 0,
          }}
          animate={{
            y: 2000, // Large enough to go off-screen for any viewport
            x: flake.drift,
          }}
          transition={{
            duration: flake.duration,
            repeat: Infinity,
            ease: 'linear',
            delay: flake.delay,
          }}
        />
      ))}
    </div>
  );
}

