'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, Zap, ShoppingBag, Star } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useUIStore } from '@/lib/store/uiStore';
import { useI18n } from '@/lib/i18n/context';

type ToastType = 'success' | 'error' | 'info' | 'warning' | 'offer' | 'sale';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  const cartSidebarOpen = useUIStore((state) => state.cartSidebarOpen);
  const { isRTL } = useI18n();

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5" />;
      case 'offer':
        return <Zap className="w-5 h-5" />;
      case 'sale':
        return <ShoppingBag className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-green-600/20 border-green-500 text-green-400';
      case 'error':
        return 'bg-red-600/20 border-red-500 text-red-400';
      case 'warning':
        return 'bg-yellow-600/20 border-yellow-500 text-yellow-400';
      case 'offer':
        return 'bg-purple-600/20 border-purple-500 text-purple-400';
      case 'sale':
        return 'bg-gold-600/20 border-gold-500 text-gold-400';
      default:
        return 'bg-blue-600/20 border-blue-500 text-blue-400';
    }
  };

  // Adjust position when cart is open or for RTL
  const getPosition = () => {
    if (cartSidebarOpen) {
      return isRTL ? 'fixed top-20 right-4 z-[10000]' : 'fixed top-20 left-4 z-[10000]';
    }
    return isRTL ? 'fixed top-20 left-4 z-[10000]' : 'fixed top-20 right-4 z-[10000]';
  };

  const getAnimationX = () => {
    if (cartSidebarOpen) {
      return isRTL ? 300 : -300;
    }
    return isRTL ? -300 : 300;
  };

  return (
    <div className={cn(getPosition(), 'flex flex-col gap-2 pointer-events-none transition-all duration-300')}>
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: getAnimationX(), scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: getAnimationX(), scale: 0.8 }}
            className={cn(
              'pointer-events-auto backdrop-blur-xl border rounded-lg p-4 min-w-[300px] max-w-[400px] shadow-2xl',
              getStyles(toast.type)
            )}
          >
            <div className={cn('flex items-start gap-3', isRTL && 'flex-row-reverse')}>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
              >
                {getIcon(toast.type)}
              </motion.div>
              <div className="flex-1">
                <p className="text-sm font-medium">{toast.message}</p>
                {toast.action && (
                  <button
                    onClick={() => {
                      toast.action?.onClick();
                      removeToast(toast.id);
                    }}
                    className="mt-2 text-xs underline hover:no-underline"
                  >
                    {toast.action.label}
                  </button>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-current opacity-50 hover:opacity-100 transition-opacity"
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

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    const newToast: Toast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    const duration = toast.duration || 5000;
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

