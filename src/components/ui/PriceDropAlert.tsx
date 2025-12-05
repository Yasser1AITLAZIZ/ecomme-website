'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingDown, X, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useToast } from './Toast';
import { useUIStore } from '@/lib/store/uiStore';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils/cn';

interface PriceDrop {
  id: string;
  productName: string;
  oldPrice: number;
  newPrice: number;
  discount: number;
  productId: string;
  timestamp: number;
}

const AUTO_DISMISS_TIME = 8000; // 8 seconds
const MAX_ALERTS = 2; // Maximum number of alerts to show at once

export function PriceDropAlert() {
  const [alerts, setAlerts] = useState<PriceDrop[]>([]);
  const { showToast } = useToast();
  const cartSidebarOpen = useUIStore((state) => state.cartSidebarOpen);
  const { t, isRTL } = useI18n();
  const dismissTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    // Simulate price drops
    const priceDrops: PriceDrop[] = [
      {
        id: '1',
        productName: 'iPhone 15 Pro',
        oldPrice: 999,
        newPrice: 899,
        discount: 10,
        productId: '1',
        timestamp: Date.now(),
      },
      {
        id: '2',
        productName: 'AirPods Pro',
        oldPrice: 249,
        newPrice: 199,
        discount: 20,
        productId: '2',
        timestamp: Date.now(),
      },
    ];

    // Check if alerts were shown in this session
    const alertsShown = sessionStorage.getItem('price_drop_alerts_shown');
    if (alertsShown === 'true') {
      return;
    }

    // Show alerts with shorter delays (after splash screen completes)
    // First alert: 4 seconds (1.5s after splash), Second: 8 seconds
    priceDrops.forEach((drop, index) => {
      setTimeout(() => {
        setAlerts((prev) => {
          // Only show if we haven't reached max alerts
          if (prev.length < MAX_ALERTS) {
            return [...prev, drop];
          }
          return prev;
        });
      }, 4000 + (index * 4000)); // 4s, 8s instead of 5s, 10s
    });

    // Mark as shown in session
    sessionStorage.setItem('price_drop_alerts_shown', 'true');

    return () => {
      // Cleanup timers on unmount
      dismissTimersRef.current.forEach((timer) => clearTimeout(timer));
      dismissTimersRef.current.clear();
    };
  }, []);

  // Auto-dismiss alerts after a certain time
  useEffect(() => {
    alerts.forEach((alert) => {
      if (!dismissTimersRef.current.has(alert.id)) {
        const timer = setTimeout(() => {
          setAlerts((prev) => prev.filter((a) => a.id !== alert.id));
          dismissTimersRef.current.delete(alert.id);
        }, AUTO_DISMISS_TIME);
        dismissTimersRef.current.set(alert.id, timer);
      }
    });

    // Clean up timers for removed alerts
    const currentIds = new Set(alerts.map((a) => a.id));
    dismissTimersRef.current.forEach((timer, id) => {
      if (!currentIds.has(id)) {
        clearTimeout(timer);
        dismissTimersRef.current.delete(id);
      }
    });
  }, [alerts]);

  const removeAlert = (id: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    
    // Clear the timer if it exists
    const timer = dismissTimersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      dismissTimersRef.current.delete(id);
    }
    
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const handleViewProduct = (productId: string, alertId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    showToast({
      message: t.priceDropAlert.redirecting,
      type: 'info',
    });
    removeAlert(alertId);
  };

  // Hide alerts when cart is open to avoid overlap
  if (cartSidebarOpen || alerts.length === 0) return null;

  // RTL-aware positioning - use pointer-events-none on container, pointer-events-auto on children
  const positionClass = isRTL 
    ? 'fixed bottom-24 left-4 z-[9998] pointer-events-none' 
    : 'fixed bottom-24 right-4 z-[9998] pointer-events-none';

  // RTL-aware animation direction
  const animationX = isRTL ? -300 : 300;

  return (
    <div className={cn(positionClass, 'flex flex-col gap-3')}>
      <AnimatePresence mode="popLayout">
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: animationX, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: animationX, scale: 0.8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="pointer-events-auto backdrop-blur-xl bg-gradient-to-br from-red-600/20 to-orange-600/20 border-2 border-red-500/50 rounded-lg p-4 min-w-[280px] max-w-[320px] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={cn('flex items-start gap-3', isRTL && 'flex-row-reverse')}>
              <motion.div
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                className="p-2 bg-red-600/30 rounded-full flex-shrink-0"
              >
                <TrendingDown className="w-5 h-5 text-red-400" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 mb-1">{t.priceDropAlert.title}</p>
                <p className="text-sm font-semibold text-white mb-2 truncate">{alert.productName}</p>
                <div className={cn('flex items-center gap-2 mb-2 flex-wrap', isRTL && 'flex-row-reverse')}>
                  <span className="text-xs text-gray-400 line-through">
                    {alert.oldPrice} MAD
                  </span>
                  <span className="text-lg font-bold text-red-400">
                    {alert.newPrice} MAD
                  </span>
                  <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded">
                    -{alert.discount}%
                  </span>
                </div>
                <Link
                  href={`/products/${alert.productId}`}
                  onClick={(e) => handleViewProduct(alert.productId, alert.id, e)}
                  className={cn(
                    'flex items-center gap-1 text-xs text-gold-600 hover:text-gold-500 transition-colors w-fit',
                    isRTL && 'flex-row-reverse'
                  )}
                >
                  <ShoppingBag className="w-3 h-3" />
                  {t.priceDropAlert.viewProduct}
                </Link>
              </div>
              <button
                onClick={(e) => removeAlert(alert.id, e)}
                className="text-gray-400 hover:text-white transition-colors flex-shrink-0 p-1 -mt-1 -mr-1"
                aria-label="Close alert"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

