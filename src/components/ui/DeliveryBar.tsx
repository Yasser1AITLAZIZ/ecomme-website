'use client';

import { motion } from 'framer-motion';
import { Truck } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils/cn';

export function DeliveryBar() {
  const { t, isRTL } = useI18n();

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn(
        'fixed top-0 left-0 right-0 z-[60]',
        'bg-gradient-to-r from-gold-600/20 via-gold-500/15 to-gold-600/20',
        'backdrop-blur-md border-b border-gold-500/30',
        'shadow-lg'
      )}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center gap-2 text-gold-500"
          >
            <Truck className="w-5 h-5" />
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={cn(
              'text-sm md:text-base text-obsidian-50 font-medium text-center',
              isRTL && 'text-right'
            )}
          >
            <span className="text-gold-400 font-semibold">
              {t.home.deliveryBar?.message || 'We deliver everywhere in Morocco, just by paying 150 dirhams MAD'}
            </span>
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}

