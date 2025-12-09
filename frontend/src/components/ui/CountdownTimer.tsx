'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';
import { GlassCard } from './GlassCard';

interface CountdownTimerProps {
  targetDate: Date;
  title?: string;
  onComplete?: () => void;
}

export function CountdownTimer({ targetDate, title = 'Limited Time Offer', onComplete }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference <= 0) {
        setIsComplete(true);
        onComplete?.();
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate, onComplete]);

  if (isComplete) {
    return (
      <GlassCard>
        <div className="p-6 text-center">
          <p className="text-red-400 font-semibold">Offer Expired</p>
        </div>
      </GlassCard>
    );
  }

  const timeUnits = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <GlassCard>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-gold-600" />
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {timeUnits.map((unit, index) => (
            <motion.div
              key={unit.label}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <motion.div
                className="bg-obsidian-800 rounded-lg p-3 mb-2"
                animate={{
                  boxShadow: [
                    '0 0 0px rgba(212, 175, 55, 0)',
                    '0 0 15px rgba(212, 175, 55, 0.5)',
                    '0 0 0px rgba(212, 175, 55, 0)',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.2,
                }}
              >
                <div className="text-2xl font-bold text-gold-600">
                  <AnimatedCounter value={unit.value} />
                </div>
              </motion.div>
              <p className="text-xs text-gray-400">{unit.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

