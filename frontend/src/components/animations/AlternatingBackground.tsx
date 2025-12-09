'use client';

import { useEffect, useState } from 'react';
import { SnowAnimation } from './SnowAnimation';
import { GoldenStars } from './GoldenStars';
import { FloatingBubbles } from './FloatingBubbles';

export function AlternatingBackground() {
  const [currentAnimation, setCurrentAnimation] = useState<'snow' | 'stars' | 'bubbles'>('snow');

  useEffect(() => {
    // Alternate between animations every 30 seconds
    const interval = setInterval(() => {
      setCurrentAnimation((prev) => {
        if (prev === 'snow') return 'stars';
        if (prev === 'stars') return 'bubbles';
        return 'snow';
      });
    }, 30000); // 30 seconds

    // Random initial animation
    const initialDelay = Math.random() * 5000;
    setTimeout(() => {
      const animations: ('snow' | 'stars' | 'bubbles')[] = ['snow', 'stars', 'bubbles'];
      setCurrentAnimation(animations[Math.floor(Math.random() * animations.length)]);
    }, initialDelay);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {currentAnimation === 'snow' && <SnowAnimation />}
      {currentAnimation === 'stars' && <GoldenStars />}
      {currentAnimation === 'bubbles' && <FloatingBubbles />}
    </>
  );
}

