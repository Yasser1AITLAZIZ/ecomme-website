'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils/cn';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar?: string;
}

export function TestimonialCarousel() {
  const { t, isRTL } = useI18n();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Get testimonials from translations
  const testimonials: Testimonial[] = [
    {
      id: '1',
      name: t.home.testimonials.testimonial1.name,
      role: t.home.testimonials.testimonial1.role,
      content: t.home.testimonials.testimonial1.content,
      rating: t.home.testimonials.testimonial1.rating,
    },
    {
      id: '2',
      name: t.home.testimonials.testimonial2.name,
      role: t.home.testimonials.testimonial2.role,
      content: t.home.testimonials.testimonial2.content,
      rating: t.home.testimonials.testimonial2.rating,
    },
    {
      id: '3',
      name: t.home.testimonials.testimonial3.name,
      role: t.home.testimonials.testimonial3.role,
      content: t.home.testimonials.testimonial3.content,
      rating: t.home.testimonials.testimonial3.rating,
    },
    {
      id: '4',
      name: t.home.testimonials.testimonial4.name,
      role: t.home.testimonials.testimonial4.role,
      content: t.home.testimonials.testimonial4.content,
      rating: t.home.testimonials.testimonial4.rating,
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <section className="py-24 bg-obsidian-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(212,175,55,0.05)_0%,transparent_70%)]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal>
          <div className={cn('text-center mb-16', isRTL && 'text-right')}>
            <h2 className={cn('text-4xl md:text-5xl font-bold mb-4', isRTL && 'text-right')}>
              {t.home.testimonials.title} <span className="text-gold-600">{t.home.testimonials.titleHighlight}</span>
            </h2>
            <p className={cn('text-gray-400 text-lg', isRTL && 'text-right')}>
              {t.home.testimonials.subtitle}
            </p>
          </div>
        </ScrollReveal>

        <div className="max-w-4xl mx-auto relative">
          <div className="relative h-64 overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              {testimonials.map((testimonial, index) => {
                if (index !== currentIndex) return null;
                
                return (
                  <motion.div
                    key={testimonial.id}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0"
                  >
                    <GlassCard>
                      <div className="p-8">
                        <Quote className="w-12 h-12 text-gold-600/50 mb-4" />
                        <p className={cn('text-gray-300 text-lg mb-6 italic', isRTL && 'text-right')}>
                          &ldquo;{testimonial.content}&rdquo;
                        </p>
                        <div className={cn('flex items-center justify-between', isRTL && 'flex-row-reverse')}>
                          <div className={cn(isRTL && 'text-right')}>
                            <p className="text-white font-semibold text-lg">
                              {testimonial.name}
                            </p>
                            <p className="text-gray-400 text-sm">{testimonial.role}</p>
                          </div>
                          <div className={cn('flex gap-1', isRTL && 'flex-row-reverse')}>
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <motion.div
                                key={i}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                              >
                                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className={cn('flex items-center justify-center gap-4 mt-8', isRTL && 'flex-row-reverse')}>
            <button
              onClick={goToPrevious}
              className="p-2 bg-gold-600/20 hover:bg-gold-600/30 rounded-full transition-colors"
            >
              {isRTL ? (
                <ChevronRight className="w-5 h-5 text-gold-600" />
              ) : (
                <ChevronLeft className="w-5 h-5 text-gold-600" />
              )}
            </button>
            
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all',
                    index === currentIndex
                      ? 'bg-gold-600 w-8'
                      : 'bg-gray-600 hover:bg-gray-500'
                  )}
                />
              ))}
            </div>

            <button
              onClick={goToNext}
              className="p-2 bg-gold-600/20 hover:bg-gold-600/30 rounded-full transition-colors"
            >
              {isRTL ? (
                <ChevronLeft className="w-5 h-5 text-gold-600" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gold-600" />
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}


