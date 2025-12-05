'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Plus, Star, Zap, Award, TrendingUp } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [language, setLanguage] = useState<'en' | 'fr' | 'ar'>('en');

  useEffect(() => {
    // Get language from localStorage
    const savedLang = localStorage.getItem('language') as 'en' | 'fr' | 'ar';
    if (savedLang && ['en', 'fr', 'ar'].includes(savedLang)) {
      setLanguage(savedLang);
    }

    // Complete after 3.5 seconds - more time to showcase animations
    const completeTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 600);
    }, 3500);

    return () => {
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  const welcomeText = {
    en: 'Welcome',
    fr: 'Bienvenue',
    ar: 'مرحباً',
  };

  const taglineText = {
    en: 'Quality & Affordable Prices',
    fr: 'Qualité & Prix Abordables',
    ar: 'جودة وأسعار معقولة',
  };

  const locationText = {
    en: 'Casablanca, Morocco',
    fr: 'Casablanca, Maroc',
    ar: 'الدار البيضاء، المغرب',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="fixed inset-0 z-[9999] overflow-hidden bg-black"
        >
          {/* Subtle Background Glow */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold-600/5 to-transparent" />
            <motion.div
              className="absolute top-0 left-0 w-full h-full"
              style={{
                background: 'radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.08) 0%, rgba(0, 0, 0, 1) 60%)',
              }}
              animate={{
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            
            {/* Moroccan Geometric Pattern Overlay - Animated */}
            <motion.div 
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(212, 175, 55, 0.1) 2px, rgba(212, 175, 55, 0.1) 4px),
                  repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(212, 175, 55, 0.1) 2px, rgba(212, 175, 55, 0.1) 4px),
                  repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(212, 175, 55, 0.05) 2px, rgba(212, 175, 55, 0.05) 4px),
                  repeating-linear-gradient(-45deg, transparent, transparent 2px, rgba(212, 175, 55, 0.05) 2px, rgba(212, 175, 55, 0.05) 4px)
                `,
                backgroundSize: '40px 40px, 40px 40px, 28px 28px, 28px 28px',
              }}
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%'],
                opacity: [0.03, 0.06, 0.03],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
            
            {/* Floating Golden Particles */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={`particle-${i}`}
                className="absolute rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: `${2 + Math.random() * 3}px`,
                  height: `${2 + Math.random() * 3}px`,
                  background: 'radial-gradient(circle, rgba(212, 175, 55, 0.8), rgba(255, 215, 0, 0.4))',
                  boxShadow: '0 0 6px rgba(212, 175, 55, 0.6)',
                }}
                animate={{
                  y: [0, -30, 0],
                  x: [0, Math.sin(i) * 20, 0],
                  opacity: [0.3, 0.8, 0.3],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>

          {/* Main Content - Centered Panel */}
          <div className="relative z-10 h-full flex items-center justify-center px-4">
            <motion.div
              className="relative w-full max-w-md"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {/* Main Panel with Golden Glow Border */}
              <div className="relative">
                {/* Golden Glow Border */}
                <motion.div
                  className="absolute inset-0 rounded-[2.5rem] md:rounded-[3rem]"
                  style={{
                    boxShadow: '0 0 40px rgba(212, 175, 55, 0.5), 0 0 80px rgba(212, 175, 55, 0.3), inset 0 0 30px rgba(212, 175, 55, 0.1)',
                  }}
                  animate={{
                    boxShadow: [
                      '0 0 40px rgba(212, 175, 55, 0.5), 0 0 80px rgba(212, 175, 55, 0.3), inset 0 0 30px rgba(212, 175, 55, 0.1)',
                      '0 0 60px rgba(212, 175, 55, 0.7), 0 0 100px rgba(212, 175, 55, 0.4), inset 0 0 30px rgba(212, 175, 55, 0.15)',
                      '0 0 40px rgba(212, 175, 55, 0.5), 0 0 80px rgba(212, 175, 55, 0.3), inset 0 0 30px rgba(212, 175, 55, 0.1)',
                    ],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />

                {/* Black Panel Background */}
                <div className="relative bg-black rounded-[2.5rem] md:rounded-[3rem] p-12 md:p-16 min-h-[500px] md:min-h-[600px] flex flex-col items-center justify-center overflow-hidden">
                  {/* Animated Background Glow Inside Panel */}
                  <motion.div
                    className="absolute inset-0 rounded-[2.5rem] md:rounded-[3rem]"
                    style={{
                      background: 'radial-gradient(ellipse at 50% 50%, rgba(212, 175, 55, 0.05) 0%, transparent 70%)',
                    }}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                  
                  {/* Decorative Corner Elements - Moroccan Style with Animation */}
                  <motion.div
                    className="absolute top-4 left-4 w-20 h-20"
                    initial={{ opacity: 0, scale: 0, rotate: -90 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1, 
                      rotate: 0,
                    }}
                    transition={{ delay: 0.3, duration: 0.6, type: 'spring' }}
                  >
                    <div className="w-full h-full border-t-2 border-l-2 border-gold-600/40 relative">
                      <motion.div
                        className="absolute -top-1 -left-1 w-3 h-3 bg-gold-600 rounded-full"
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.6, 1, 0.6],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                      />
                    </div>
                  </motion.div>
                  <motion.div
                    className="absolute top-4 right-4 w-20 h-20"
                    initial={{ opacity: 0, scale: 0, rotate: 90 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1, 
                      rotate: 0,
                    }}
                    transition={{ delay: 0.4, duration: 0.6, type: 'spring' }}
                  >
                    <div className="w-full h-full border-t-2 border-r-2 border-gold-600/40 relative">
                      <motion.div
                        className="absolute -top-1 -right-1 w-3 h-3 bg-gold-600 rounded-full"
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.6, 1, 0.6],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: 0.5,
                        }}
                      />
                    </div>
                  </motion.div>
                  <motion.div
                    className="absolute bottom-4 left-4 w-20 h-20"
                    initial={{ opacity: 0, scale: 0, rotate: 90 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1, 
                      rotate: 0,
                    }}
                    transition={{ delay: 0.5, duration: 0.6, type: 'spring' }}
                  >
                    <div className="w-full h-full border-b-2 border-l-2 border-gold-600/40 relative">
                      <motion.div
                        className="absolute -bottom-1 -left-1 w-3 h-3 bg-gold-600 rounded-full"
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.6, 1, 0.6],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: 1,
                        }}
                      />
                    </div>
                  </motion.div>
                  <motion.div
                    className="absolute bottom-4 right-4 w-20 h-20"
                    initial={{ opacity: 0, scale: 0, rotate: -90 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1, 
                      rotate: 0,
                    }}
                    transition={{ delay: 0.6, duration: 0.6, type: 'spring' }}
                  >
                    <div className="w-full h-full border-b-2 border-r-2 border-gold-600/40 relative">
                      <motion.div
                        className="absolute -bottom-1 -right-1 w-3 h-3 bg-gold-600 rounded-full"
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.6, 1, 0.6],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: 1.5,
                        }}
                      />
                    </div>
                  </motion.div>

                  {/* Floating Golden Stars - Enhanced */}
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute"
                      style={{
                        left: `${10 + (i % 4) * 28}%`,
                        top: `${15 + Math.floor(i / 4) * 35}%`,
                      }}
                      initial={{ opacity: 0, scale: 0, rotate: 0 }}
                      animate={{
                        opacity: [0, 0.6, 0],
                        scale: [0, 1.2, 0],
                        rotate: 360,
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: 'easeInOut',
                      }}
                    >
                      <Star 
                        className="w-4 h-4 text-gold-600 fill-gold-600/30" 
                        style={{
                          filter: 'drop-shadow(0 0 4px rgba(212, 175, 55, 0.8))',
                        }}
                      />
                    </motion.div>
                  ))}
                  
                  {/* Feature Icons - Modern Touch */}
                  <motion.div
                    className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-6 opacity-60"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 0.6 }}
                    transition={{ delay: 1.2, duration: 0.6 }}
                  >
                    {[
                      { Icon: Zap, color: 'text-gold-600' },
                      { Icon: Award, color: 'text-gold-500' },
                      { Icon: TrendingUp, color: 'text-gold-600' },
                    ].map(({ Icon, color }, idx) => (
                      <motion.div
                        key={idx}
                        animate={{
                          y: [0, -8, 0],
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: idx * 0.3,
                          ease: 'easeInOut',
                        }}
                      >
                        <Icon className={`w-5 h-5 ${color}`} />
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Logo Section */}
                  <motion.div
                    className="mb-8 flex flex-col items-center relative z-10"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                  >
                    {/* Sparkle Icon with Circle and Plus */}
                    <div className="relative mb-8">
                      {/* Outer Rotating Ring */}
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        animate={{
                          rotate: [0, 360],
                        }}
                        transition={{
                          duration: 20,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      >
                        <div className="w-24 h-24 md:w-28 md:h-28 border-2 border-gold-600/40 rounded-full" />
                      </motion.div>

                      {/* Inner Rotating Ring (opposite direction) */}
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        animate={{
                          rotate: [360, 0],
                        }}
                        transition={{
                          duration: 15,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      >
                        <div className="w-16 h-16 md:w-20 md:h-20 border border-gold-600/20 rounded-full" />
                      </motion.div>

                      {/* Sparkle Icon */}
                      <div className="relative z-10 flex items-center justify-center">
                        <motion.div
                          animate={{
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        >
                          <Sparkles className="w-16 h-16 md:w-20 md:h-20 text-gold-600" />
                        </motion.div>
                      </div>

                      {/* Plus Sign */}
                      <motion.div
                        className="absolute -bottom-1 -right-1 z-20"
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                      >
                        <div className="w-6 h-6 md:w-7 md:h-7 bg-gold-600 rounded-full flex items-center justify-center shadow-lg shadow-gold-600/50">
                          <Plus className="w-4 h-4 md:w-5 md:h-5 text-black" strokeWidth={3} />
                        </div>
                      </motion.div>
                    </div>

                    {/* Store Name */}
                    <motion.h1
                      className="text-4xl md:text-5xl font-bold mb-2 text-center"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4, duration: 0.6 }}
                    >
                      <span className="bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(212,175,55,0.5)]">
                        Primo Store
                      </span>
                    </motion.h1>

                    {/* Tagline */}
                    <motion.p
                      className="text-base md:text-lg text-gold-500/70 text-center mb-2"
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.6, duration: 0.6 }}
                    >
                      {taglineText[language]}
                    </motion.p>

                    {/* Location Badge */}
                    <motion.div
                      className="mt-3 px-4 py-1.5 rounded-full bg-gold-600/10 border border-gold-600/30 backdrop-blur-sm"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.7, type: 'spring', stiffness: 200 }}
                    >
                      <p className="text-xs md:text-sm text-gold-500/80 font-medium">
                        📍 {locationText[language]}
                      </p>
                    </motion.div>
                  </motion.div>

                  {/* Welcome Text with Arabic Support */}
                  <motion.div
                    className="mt-auto pt-8 relative z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                  >
                    <p className="text-lg md:text-xl text-gold-500/80 text-center font-medium">
                      {welcomeText[language]}
                    </p>
                    {/* Enhanced Loading Indicator with Progress Bar */}
                    <motion.div
                      className="w-full max-w-xs mt-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                    >
                      {/* Progress Bar Background */}
                      <div className="h-1 bg-gold-600/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 rounded-full"
                          initial={{ width: '0%' }}
                          animate={{ width: '100%' }}
                          transition={{
                            duration: 3.5,
                            ease: 'easeInOut',
                          }}
                        />
                      </div>
                      
                      {/* Loading Dots */}
                      <div className="flex gap-2 justify-center mt-4">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-2.5 h-2.5 rounded-full bg-gold-600"
                            animate={{
                              scale: [1, 1.4, 1],
                              opacity: [0.5, 1, 0.5],
                            }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              delay: i * 0.2,
                              ease: 'easeInOut',
                            }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Subtle Corner Glows */}
          <motion.div
            className="absolute top-0 left-0 w-96 h-96 bg-gold-600/3 rounded-full blur-3xl pointer-events-none"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-96 h-96 bg-gold-600/3 rounded-full blur-3xl pointer-events-none"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
