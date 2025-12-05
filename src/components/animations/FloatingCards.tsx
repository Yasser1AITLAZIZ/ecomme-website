'use client';

import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n/context';

interface FloatingCardProps {
  label: string;
  value: string;
  position: 'left' | 'right';
  delay?: number;
}

function FloatingCard({ label, value, position, delay = 0 }: FloatingCardProps) {
  const positionClasses = {
    left: 'left-[-60px] top-[25%]',
    right: 'right-[-40px] bottom-[30%]',
  };

  return (
    <motion.div
      className={`absolute ${positionClasses[position]} px-6 py-4 bg-obsidian-900/90 backdrop-blur-xl border border-gold-500/30 rounded-xl`}
      animate={{
        x: [0, -10, 0],
        y: [0, 10, 0],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    >
      <div className="text-xs text-obsidian-400 mb-1">{label}</div>
      <div className="text-xl font-bold text-gold-500">{value}</div>
    </motion.div>
  );
}

interface FloatingCardsProps {
  cards?: Array<{
    label: string;
    value: string;
    position: 'left' | 'right';
    delay?: number;
  }>;
}

export function FloatingCards({
  cards,
}: FloatingCardsProps) {
  const { t } = useI18n();
  
  // Use translations if cards are not provided
  const defaultCards = cards || [
    { 
      label: t.home.showcase.startingFrom, 
      value: t.home.showcase.priceProMax, 
      position: 'left' as const 
    },
    { 
      label: t.home.showcase.iphone15ProMax, 
      value: t.home.showcase.naturalTitanium, 
      position: 'right' as const, 
      delay: -2 
    },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none">
      {defaultCards.map((card, index) => (
        <FloatingCard
          key={index}
          label={card.label}
          value={card.value}
          position={card.position}
          delay={card.delay}
        />
      ))}
    </div>
  );
}

