'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Truck } from 'lucide-react';
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

export function ScrollingTickerBar() {
  const [currentOrder, setCurrentOrder] = useState<OrderNotification | null>(null);
  const { t, isRTL } = useI18n();

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
    const orderInterval = setInterval(() => {
      setCurrentOrder(generateOrder());
    }, 8000 + Math.random() * 7000);

    return () => {
      clearInterval(orderInterval);
    };
  }, []);

  if (!currentOrder) return null;

  const productText = currentOrder.quantity === 1 
    ? currentOrder.product 
    : `${currentOrder.quantity} ${currentOrder.product}s`;

  // Get translations
  const orderText = t.home.tickerBar?.orderText || '{product} ordered {timeAgo}';
  const deliveryText = t.home.deliveryBar?.message || 'We deliver everywhere in Morocco, just by paying 150 dirhams MAD';

  // Create messages array
  const messages = [
    {
      type: 'order' as const,
      icon: ShoppingBag,
      text: orderText
        .replace('{product}', `<span class="text-gold-400 font-semibold">${productText}</span>`)
        .replace('{timeAgo}', `<span class="text-gold-300">${currentOrder.timeAgo}</span>`),
    },
    {
      type: 'delivery' as const,
      icon: Truck,
      text: `<span class="text-gold-400 font-semibold">${deliveryText}</span>`,
    },
  ];

  // Duplicate messages multiple times for seamless scrolling
  const scrollingMessages = [...messages, ...messages, ...messages, ...messages];

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn(
        'fixed top-0 left-0 right-0 z-[60]',
        'bg-gradient-to-r from-gold-600/20 via-gold-500/15 to-gold-600/20',
        'backdrop-blur-md border-b border-gold-500/30',
        'shadow-lg overflow-hidden'
      )}
    >
      <div className="relative h-[52px] flex items-center overflow-hidden">
        {/* Continuous horizontal scrolling ticker - scrolls right to left */}
        <motion.div
          key={`ticker-${currentOrder.id}`}
          className="flex items-center gap-8 whitespace-nowrap"
          animate={{
            x: isRTL ? ['0%', '-50%'] : ['-50%', '0%'],
          }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {scrollingMessages.map((message, index) => (
            <div
              key={`${message.type}-${index}-${currentOrder.id}`}
              className={cn(
                'flex items-center gap-3 flex-shrink-0',
                isRTL && 'flex-row-reverse'
              )}
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                className="flex items-center gap-2 text-gold-500 flex-shrink-0"
              >
                <message.icon className="w-5 h-5" />
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </motion.div>
              
              <p
                className={cn(
                  'text-sm md:text-base text-obsidian-50 font-medium',
                  isRTL && 'text-right'
                )}
                dangerouslySetInnerHTML={{ __html: message.text }}
              />
              
              {/* Separator dot */}
              <div className="w-1 h-1 bg-gold-600/40 rounded-full mx-6" />
            </div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
