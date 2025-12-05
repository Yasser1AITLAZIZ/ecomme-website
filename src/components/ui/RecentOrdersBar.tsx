'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils/cn';

interface OrderNotification {
  id: number;
  product: string;
  quantity: number;
  timeAgo: string;
}

// Sample order notifications
const orderTemplates = [
  { product: 'iPhone 15 Pro', quantity: 2 },
  { product: 'iPhone 15', quantity: 1 },
  { product: 'iPhone 14 Pro Max', quantity: 3 },
  { product: 'Samsung Galaxy S24', quantity: 1 },
  { product: 'iPhone 15 Pro Max', quantity: 2 },
  { product: 'AirPods Pro', quantity: 4 },
  { product: 'iPhone 13', quantity: 1 },
  { product: 'iPad Pro', quantity: 1 },
];

const timeOptions = [
  'just now',
  '1 minute ago',
  '2 minutes ago',
  '3 minutes ago',
  '4 minutes ago',
  '5 minutes ago',
  '6 minutes ago',
  '7 minutes ago',
  '8 minutes ago',
  '9 minutes ago',
  '10 minutes ago',
];

export function RecentOrdersBar() {
  const [isVisible, setIsVisible] = useState(true);
  const [currentOrder, setCurrentOrder] = useState<OrderNotification | null>(null);
  const { isRTL } = useI18n();

  useEffect(() => {
    // Generate initial order
    const generateOrder = (): OrderNotification => {
      const template = orderTemplates[Math.floor(Math.random() * orderTemplates.length)];
      const timeAgo = timeOptions[Math.floor(Math.random() * timeOptions.length)];
      
      return {
        id: Date.now(),
        product: template.product,
        quantity: template.quantity,
        timeAgo,
      };
    };

    setCurrentOrder(generateOrder());

    // Update order every 8-15 seconds
    const interval = setInterval(() => {
      setCurrentOrder(generateOrder());
    }, 8000 + Math.random() * 7000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible || !currentOrder) return null;

  const productText = currentOrder.quantity === 1 
    ? currentOrder.product 
    : `${currentOrder.quantity} ${currentOrder.product}s`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={cn(
          'fixed top-0 left-0 right-0 z-[60]',
          'bg-gradient-to-r from-gold-600/20 via-gold-500/15 to-gold-600/20',
          'backdrop-blur-md border-b border-gold-500/30',
          'shadow-lg'
        )}
        style={{ marginTop: 0 }}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-2 text-gold-500"
            >
              <ShoppingBag className="w-5 h-5" />
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </motion.div>
            
            <motion.p
              key={currentOrder.id}
              initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
              transition={{ duration: 0.3 }}
              className="text-sm md:text-base text-obsidian-50 font-medium"
            >
              <span className="text-gold-400 font-semibold">{productText}</span>
              {' '}ordered{' '}
              <span className="text-gold-300">{currentOrder.timeAgo}</span>
            </motion.p>

            <button
              onClick={() => setIsVisible(false)}
              className={cn(
                'ml-auto p-1 rounded-full',
                'text-obsidian-300 hover:text-obsidian-50',
                'hover:bg-gold-500/20 transition-colors'
              )}
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

