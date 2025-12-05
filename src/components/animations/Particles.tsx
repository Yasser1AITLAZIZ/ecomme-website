'use client';

import { useEffect, useState } from 'react';

interface ParticleProps {
  left: number;
  delay: number;
}

function Particle({ left, delay }: ParticleProps) {
  return (
    <div
      className="absolute w-1 h-1 bg-gold-500 rounded-full opacity-30"
      style={{
        left: `${left}%`,
        animation: `particleFloat 15s linear infinite`,
        animationDelay: `${delay}s`,
      }}
    />
  );
}

export function Particles() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const particles = [
    { left: 10, delay: 0 },
    { left: 20, delay: 2 },
    { left: 30, delay: 4 },
    { left: 40, delay: 1 },
    { left: 50, delay: 3 },
    { left: 60, delay: 5 },
    { left: 70, delay: 2.5 },
    { left: 80, delay: 4.5 },
    { left: 90, delay: 1.5 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((particle, index) => (
        <Particle key={index} left={particle.left} delay={particle.delay} />
      ))}
    </div>
  );
}

