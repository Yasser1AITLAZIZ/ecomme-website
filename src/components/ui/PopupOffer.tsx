'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, ArrowRight, Gift } from 'lucide-react';
import { useToast } from './Toast';
import { MagneticButton } from './MagneticButton';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils/cn';

interface PopupOfferProps {
  title?: string;
  description?: string;
  discount?: number;
  code?: string;
  image?: string;
  delay?: number;
  storageKey?: string; // Key for localStorage to prevent spam
}

const STORAGE_PREFIX = 'popup_offer_';
const SESSION_STORAGE_KEY = 'popup_offer_shown_session';

export function PopupOffer({
  title,
  description,
  discount = 15,
  code = 'WELCOME15',
  image,
  delay = 3000, // Default 3 seconds after splash screen (splash is 2.5s)
  storageKey = 'welcome_offer',
}: PopupOfferProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const { showToast } = useToast();
  const { t, isRTL } = useI18n();

  // Use translations if not provided
  const popupTitle = title || t.home.popup.title;
  const popupDescription = description || t.home.popup.description;

  useEffect(() => {
    // Check if popup was already shown in this session
    const shownInSession = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (shownInSession === 'true') {
      return;
    }

    // Check if popup was dismissed today (using localStorage)
    const storageKeyFull = `${STORAGE_PREFIX}${storageKey}`;
    const lastShown = localStorage.getItem(storageKeyFull);
    if (lastShown) {
      const lastShownDate = new Date(lastShown);
      const today = new Date();
      // If shown today, don't show again
      if (
        lastShownDate.getDate() === today.getDate() &&
        lastShownDate.getMonth() === today.getMonth() &&
        lastShownDate.getFullYear() === today.getFullYear()
      ) {
        return;
      }
    }

    // Show popup after delay
    const timer = setTimeout(() => {
      setIsVisible(true);
      // Mark as shown in session
      sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
      // Mark as shown today
      localStorage.setItem(storageKeyFull, new Date().toISOString());
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, storageKey]);

  // Prevent body scroll when popup is visible
  useEffect(() => {
    if (isVisible && !isClosing) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isVisible, isClosing]);

  const handleClose = (event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, 300);
  };

  const handleClaim = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (code) {
      navigator.clipboard.writeText(code).catch(() => {
        // Fallback if clipboard API fails
        showToast({
          message: `${t.home.popup.code || 'Code'}: ${code}`,
          type: 'info',
        });
      });
      showToast({
        message: t.home.popup.codeCopied || `Code "${code}" copied to clipboard!`,
        type: 'success',
      });
    }
    handleClose();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isClosing ? 0 : 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => handleClose(e)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[10001] cursor-pointer"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{
              opacity: isClosing ? 0 : 1,
              scale: isClosing ? 0.8 : 1,
              y: isClosing ? 50 : 0,
            }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[10002] flex items-center justify-center p-4 pointer-events-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              className={cn(
                'relative bg-gradient-to-br from-obsidian-900 via-obsidian-800 to-obsidian-900 border-2 border-gold-600/50 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl pointer-events-auto',
                isRTL && 'text-right'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold-600/10 rounded-full -mr-16 -mt-16 blur-2xl" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-600/10 rounded-full -ml-20 -mb-20 blur-2xl" />

              <button
                onClick={(e) => handleClose(e)}
                className={cn(
                  'absolute top-4 z-10 p-2 bg-black/50 rounded-full hover:bg-black/80 transition-colors',
                  isRTL ? 'left-4' : 'right-4'
                )}
                aria-label="Close popup"
                type="button"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              <div className="relative p-8">
                {discount && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className={cn(
                      'absolute -top-4 bg-gradient-to-br from-gold-500 to-gold-700 text-black font-bold text-2xl px-6 py-3 rounded-full shadow-lg',
                      isRTL ? '-left-4' : '-right-4'
                    )}
                  >
                    {discount}% OFF
                  </motion.div>
                )}

                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className={cn('flex items-center gap-2 mb-4', isRTL && 'flex-row-reverse')}
                >
                  <Zap className="w-6 h-6 text-gold-600" />
                  <h3 className="text-2xl font-bold text-white">{popupTitle}</h3>
                </motion.div>

                <motion.p
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-gray-300 mb-6"
                >
                  {popupDescription}
                </motion.p>

                {code && (
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mb-6 p-4 bg-black/50 rounded-lg border border-gold-600/30"
                  >
                    <p className="text-sm text-gray-400 mb-2">
                      {t.home.popup.useCode || 'Use code:'}
                    </p>
                    <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                      <code className="text-2xl font-bold text-gold-600 font-mono">
                        {code}
                      </code>
                      <Gift className="w-5 h-5 text-gold-600" />
                    </div>
                  </motion.div>
                )}

                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className={cn('flex gap-3', isRTL && 'flex-row-reverse')}
                >
                  <MagneticButton className="flex-1">
                    <button
                      onClick={handleClaim}
                      className="w-full bg-gradient-to-r from-gold-600 to-gold-700 text-black font-bold py-3 px-6 rounded-lg hover:from-gold-500 hover:to-gold-600 transition-all flex items-center justify-center gap-2"
                      type="button"
                    >
                      {t.home.popup.claimOffer || 'Claim Offer'}
                      <ArrowRight className={cn('w-5 h-5', isRTL && 'rotate-180')} />
                    </button>
                  </MagneticButton>
                  <button
                    onClick={(e) => handleClose(e)}
                    className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:border-gray-500 hover:text-white transition-colors"
                    type="button"
                  >
                    {t.home.popup.maybeLater || 'Maybe Later'}
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
