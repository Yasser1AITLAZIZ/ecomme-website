'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, HelpCircle, ShoppingCart, X, Bell } from 'lucide-react';
import { useCartStore } from '@/lib/store/cartStore';
import { useUIStore } from '@/lib/store/uiStore';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils/cn';

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const itemCount = useCartStore((state) => state.getItemCount());
  const openCartSidebar = useUIStore((state) => state.openCartSidebar);
  const cartSidebarOpen = useUIStore((state) => state.cartSidebarOpen);
  const { isRTL } = useI18n();

  const actions = [
    {
      icon: ShoppingCart,
      label: 'Cart',
      onClick: () => {
        openCartSidebar();
        setIsOpen(false);
      },
      badge: itemCount > 0 ? itemCount : undefined,
      color: 'bg-gold-600',
    },
    {
      icon: MessageCircle,
      label: 'Chat',
      onClick: () => {
        alert('Chat feature coming soon!');
        setIsOpen(false);
      },
      color: 'bg-blue-600',
    },
    {
      icon: HelpCircle,
      label: 'Help',
      onClick: () => {
        alert('Help center coming soon!');
        setIsOpen(false);
      },
      color: 'bg-purple-600',
    },
  ];

  // Adjust position when cart is open or for RTL - move to left side to avoid overlap
  const positionClass = cartSidebarOpen 
    ? (isRTL ? 'fixed bottom-6 right-6 z-[9999]' : 'fixed bottom-6 left-6 z-[9999]')
    : (isRTL ? 'fixed bottom-6 left-6 z-[9999]' : 'fixed bottom-6 right-6 z-[9999]');

  return (
    <div className={cn(positionClass, 'transition-all duration-300')}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              'absolute bottom-20 mb-2 flex flex-col gap-3',
              cartSidebarOpen 
                ? (isRTL ? 'right-0' : 'left-0')
                : (isRTL ? 'left-0' : 'right-0')
            )}
          >
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.label}
                  initial={{ 
                    opacity: 0, 
                    x: cartSidebarOpen 
                      ? (isRTL ? 20 : -20) 
                      : (isRTL ? -20 : 20), 
                    scale: 0.8 
                  }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ 
                    opacity: 0, 
                    x: cartSidebarOpen 
                      ? (isRTL ? 20 : -20) 
                      : (isRTL ? -20 : 20), 
                    scale: 0.8 
                  }}
                  transition={{ delay: index * 0.1 }}
                  onClick={action.onClick}
                  className={cn(
                    'relative flex items-center gap-3 p-4 rounded-full text-white shadow-lg',
                    action.color,
                    'hover:scale-110 transition-transform'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium whitespace-nowrap">{action.label}</span>
                  {action.badge && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      {action.badge}
                    </motion.span>
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative w-14 h-14 rounded-full bg-gold-600 text-black shadow-2xl',
          'flex items-center justify-center',
          'hover:bg-gold-500 transition-colors'
        )}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ opacity: 0, rotate: 90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -90 }}
              className="relative"
            >
              <Bell className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
