'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp } from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';
import { useUIStore } from '@/lib/store/uiStore';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils/cn';

export function LiveVisitorCounter() {
  const [visitorCount, setVisitorCount] = useState(1247);
  const [isVisible, setIsVisible] = useState(false);
  const cartSidebarOpen = useUIStore((state) => state.cartSidebarOpen);
  const { isRTL } = useI18n();

  useEffect(() => {
    setIsVisible(true);
    
    // Simulate live visitor updates
    const interval = setInterval(() => {
      setVisitorCount((prev) => {
        const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
        return Math.max(1000, prev + change);
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Hide when cart is open to avoid overlap
  if (!isVisible || cartSidebarOpen) return null;

  // RTL-aware positioning
  const positionClass = isRTL 
    ? 'fixed top-24 left-4 z-[9998]' 
    : 'fixed top-24 right-4 z-[9998]';

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(positionClass, 'hidden lg:block')}
    >
      <motion.div
        className="backdrop-blur-xl bg-black/60 border border-gold-600/30 rounded-lg p-4 shadow-2xl"
        whileHover={{ scale: 1.05 }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="relative"
          >
            <Users className="w-5 h-5 text-gold-600" />
            <motion.div
              className="absolute inset-0 bg-gold-600 rounded-full blur-md opacity-50"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
          <div>
            <p className="text-xs text-gray-400">Live Visitors</p>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white">
                <AnimatedCounter value={visitorCount} />
              </span>
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <TrendingUp className="w-4 h-4 text-green-400" />
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

