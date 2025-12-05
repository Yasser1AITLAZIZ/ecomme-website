'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { cn } from '@/lib/utils/cn';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar?: string;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Tech Enthusiast',
    content: 'Amazing quality and fast shipping! The iPhone I bought exceeded my expectations. The customer service was outstanding.',
    rating: 5,
  },
  {
    id: '2',
    name: 'Michael Chen',
    role: 'Business Owner',
    content: 'Best prices I\'ve found online. The product arrived in perfect condition and the packaging was excellent.',
    rating: 5,
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    role: 'Designer',
    content: 'Love the variety of accessories available. Great quality products and the website is so easy to navigate!',
    rating: 5,
  },
  {
    id: '4',
    name: 'David Thompson',
    role: 'Developer',
    content: 'Quick delivery and authentic products. Will definitely shop here again. Highly recommended!',
    rating: 5,
  },
];

export function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

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
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              What Our <span className="text-gold-600">Customers Say</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Real reviews from satisfied customers
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
                        <p className="text-gray-300 text-lg mb-6 italic">
                          "{testimonial.content}"
                        </p>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-semibold text-lg">
                              {testimonial.name}
                            </p>
                            <p className="text-gray-400 text-sm">{testimonial.role}</p>
                          </div>
                          <div className="flex gap-1">
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
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={goToPrevious}
              className="p-2 bg-gold-600/20 hover:bg-gold-600/30 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gold-600" />
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
              <ChevronRight className="w-5 h-5 text-gold-600" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}


