'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface CursorPoint {
  x: number;
  y: number;
  id: number;
}

export function CursorTrail() {
  const [cursorPoints, setCursorPoints] = useState<CursorPoint[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let pointId = 0;
    const points: CursorPoint[] = [];

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });

      const newPoint: CursorPoint = {
        x: e.clientX,
        y: e.clientY,
        id: pointId++,
      };

      points.push(newPoint);
      setCursorPoints([...points]);

      // Remove old points after animation
      setTimeout(() => {
        setCursorPoints((prev) => prev.filter((p) => p.id !== newPoint.id));
      }, 1000);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <>
      {/* Main cursor dot */}
      <motion.div
        className="fixed top-0 left-0 w-4 h-4 bg-gold-500 rounded-full pointer-events-none z-[9999] mix-blend-difference"
        style={{
          x: mousePosition.x - 8,
          y: mousePosition.y - 8,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      />

      {/* Trail dots */}
      {cursorPoints.slice(-20).map((point, index) => (
        <motion.div
          key={point.id}
          className="fixed top-0 left-0 w-2 h-2 bg-gold-600 rounded-full pointer-events-none z-[9998] opacity-30"
          style={{
            x: point.x - 4,
            y: point.y - 4,
          }}
          initial={{ opacity: 0.6, scale: 1 }}
          animate={{ opacity: 0, scale: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      ))}
    </>
  );
}

