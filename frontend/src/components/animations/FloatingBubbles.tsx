'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Bubble {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
  initialY: number;
}

export function FloatingBubbles() {
  const [mounted, setMounted] = useState(false);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    setMounted(true);
    
    // Generate floating bubbles with random properties
    const bubbleArray: Bubble[] = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 15 + Math.random() * 20, // 15-35 seconds
      size: 20 + Math.random() * 40, // 20-60px - larger than stars/snow
      opacity: 0.05 + Math.random() * 0.15, // Very subtle (0.05-0.2)
      initialY: Math.random() * 100, // Start at random vertical position
    }));
    
    setBubbles(bubbleArray);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className="absolute rounded-full"
          style={{
            left: `${bubble.left}%`,
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            opacity: bubble.opacity,
            top: `${bubble.initialY}%`,
            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, rgba(212, 175, 55, 0.1) 50%, transparent 100%)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            filter: 'blur(1px)',
          }}
          initial={{ 
            y: 0,
            x: 0,
            scale: 0.8,
          }}
          animate={{
            y: [0, -100, -200, -300],
            x: [0, Math.sin(bubble.id) * 50, Math.cos(bubble.id) * 30, Math.sin(bubble.id * 2) * 40],
            scale: [0.8, 1, 1.1, 0.9],
            opacity: [bubble.opacity, bubble.opacity * 1.5, bubble.opacity * 1.2, bubble.opacity * 0.5],
          }}
          transition={{
            duration: bubble.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: bubble.delay,
          }}
        />
      ))}
    </div>
  );
}

