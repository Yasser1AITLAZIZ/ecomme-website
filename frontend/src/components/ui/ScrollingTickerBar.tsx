'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Truck } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils/cn';
import { ordersApi, type RecentOrder } from '@/lib/api/orders';
import { deliveryFeesApi } from '@/lib/api/deliveryFees';
import { formatTimeAgo } from '@/lib/utils/date';

interface OrderNotification {
  id: string;
  product: string;
  quantity: number;
  timeAgo: string;
}

export function ScrollingTickerBar() {
  const [currentOrder, setCurrentOrder] = useState<OrderNotification | null>(null);
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [defaultFee, setDefaultFee] = useState<number | null>(null);
  const { t, isRTL } = useI18n();

  // Set mounted state after client-side hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch recent orders and delivery fee on mount
  useEffect(() => {
    if (!mounted) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch delivery fee
        try {
          const feeData = await deliveryFeesApi.getDefaultFee();
          setDefaultFee(feeData.default_display_fee || 10.0);
        } catch (error) {
          console.error('Failed to fetch delivery fee:', error);
          setDefaultFee(10.0); // Fallback
        }
        
        // Fetch recent orders
        const recentOrders = await ordersApi.getRecent();
        setOrders(recentOrders);
        
        // If we have orders, set the first one
        if (recentOrders.length > 0) {
          const firstOrder = recentOrders[0];
          setCurrentOrder({
            id: firstOrder.id,
            product: firstOrder.product_name,
            quantity: firstOrder.quantity,
            timeAgo: formatTimeAgo(firstOrder.created_at),
          });
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        // On error, don't set currentOrder so only delivery message shows
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mounted]);

  // Rotate through orders if we have them
  useEffect(() => {
    if (orders.length === 0) return;

    let currentIndex = 0;
    
    const orderInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % orders.length;
      const order = orders[currentIndex];
      setCurrentOrder({
        id: order.id,
        product: order.product_name,
        quantity: order.quantity,
        timeAgo: formatTimeAgo(order.created_at),
      });
    }, 8000 + Math.random() * 7000);

    return () => {
      clearInterval(orderInterval);
    };
  }, [orders]);

  // Don't render on server or if still loading
  if (!mounted || loading || defaultFee === null) return null;

  // Build delivery message with dynamic fee
  const deliveryText = `Livraison partout au Maroc à partir de ${defaultFee.toFixed(2)} MAD • Délai maximum 48h`;

  // Create messages array
  const messages = [];
  
  // Only add order message if we have a current order
  if (currentOrder) {
    const productText = currentOrder.quantity === 1 
      ? currentOrder.product 
      : `${currentOrder.quantity} ${currentOrder.product}s`;
    
    const orderText = t.home.tickerBar?.orderText || '{product} ordered {timeAgo}';
    
    messages.push({
      type: 'order' as const,
      icon: ShoppingBag,
      text: orderText
        .replace('{product}', `<span class="text-gold-400 font-semibold">${productText}</span>`)
        .replace('{timeAgo}', `<span class="text-gold-300">${currentOrder.timeAgo}</span>`),
    });
  }
  
  // Always add delivery message
  messages.push({
    type: 'delivery' as const,
    icon: Truck,
    text: `<span class="text-gold-400 font-semibold">${deliveryText}</span>`,
  });

  // Don't render if no messages (shouldn't happen, but safety check)
  if (messages.length === 0) return null;

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
          key={`ticker-${currentOrder?.id || 'delivery'}`}
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
              key={`${message.type}-${index}-${currentOrder?.id || 'delivery'}`}
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
