'use client';

import { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { Language } from '@/lib/i18n/translations';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

const languages: { code: Language; name: string; flag: string }[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
];

export function LanguageSwitcher() {
  const { language, setLanguage, isRTL } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Set mounted state after client-side hydration to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLanguage = languages.find((lang) => lang.code === language) || languages.find((lang) => lang.code === 'fr') || languages[0];
  
  // Use default language (French) for initial render to prevent hydration mismatch
  // The language will update after mount from localStorage
  const displayLanguage = mounted ? currentLanguage : languages.find((lang) => lang.code === 'fr') || languages[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black-100 border border-gold-600/20 hover:border-gold-600/50 transition-colors"
        aria-label="Change language"
        suppressHydrationWarning
      >
        <Globe className="w-4 h-4 text-gold-600" />
        {/* Render both spans consistently - CSS handles visibility to prevent hydration mismatch */}
        <span className="text-sm font-medium text-white hidden sm:inline" suppressHydrationWarning>
          {displayLanguage.flag} {displayLanguage.name}
        </span>
        <span className="text-sm font-medium text-white sm:hidden" suppressHydrationWarning>
          {displayLanguage.flag}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={cn(
                'absolute top-full mt-2 right-0 z-50 bg-black-100 border border-gold-600/20 rounded-lg shadow-xl overflow-hidden min-w-[150px]',
                isRTL && 'right-auto left-0'
              )}
            >
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full px-4 py-3 text-left hover:bg-gold-600/10 transition-colors flex items-center gap-3',
                    language === lang.code && 'bg-gold-600/20 text-gold-600',
                    !isRTL && 'text-left',
                    isRTL && 'text-right'
                  )}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <span className="text-sm font-medium">{lang.name}</span>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

