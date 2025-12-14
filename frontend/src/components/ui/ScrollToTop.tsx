'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils/cn';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const { isRTL } = useI18n();

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when page is scrolled down 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0, y: 20 }}
          whileHover={{ scale: 1.1, y: -4 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          className={cn(
            'fixed bottom-24 z-[9998]',
            'w-12 h-12 rounded-full',
            'bg-gold-600 hover:bg-gold-500',
            'text-black shadow-2xl',
            'flex items-center justify-center',
            'transition-colors duration-200',
            'border-2 border-gold-400/50',
            isRTL ? 'left-6' : 'right-6'
          )}
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
          
          {/* Pulsing ring effect */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-gold-400"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.6, 0, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

