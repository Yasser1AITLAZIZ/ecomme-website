'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Product } from '@/types';
import { TiltCard } from './TiltCard';
import { AnimatedBadge } from './AnimatedBadge';
import { MagneticButton } from './MagneticButton';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils/cn';

interface ProductSpotlightProps {
  products: Product[];
}

export function ProductSpotlight({ products }: ProductSpotlightProps) {
  const { t, isRTL } = useI18n();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [products.length]);

  if (products.length === 0) return null;

  const currentProduct = products[currentIndex];

  return (
    <section className="py-24 bg-gradient-to-b from-obsidian-950 to-obsidian-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(212,175,55,0.1)_0%,transparent_70%)]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-16">
            <AnimatedBadge variant="featured" icon className="mb-4">
              {t.home.spotlight.badge}
            </AnimatedBadge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gold-600">{t.home.spotlight.title}</span>{' '}
              <span className="text-white">{t.home.spotlight.titleHighlight}</span>
            </h2>
            <p className="text-gray-400 text-lg">
              {t.home.spotlight.subtitle}
            </p>
          </div>
        </ScrollReveal>

        <div className="max-w-5xl mx-auto">
          <TiltCard>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentProduct.id}
                initial={{ opacity: 0, y: 30, rotateX: -10 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                exit={{ opacity: 0, y: -30, rotateX: 10 }}
                transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
                whileHover={{
                  y: -5,
                  transition: { duration: 0.3 },
                }}
                className="bg-gradient-to-br from-obsidian-900 to-obsidian-800 border border-gold-600/30 rounded-2xl overflow-hidden shadow-2xl"
                style={{
                  transformStyle: 'preserve-3d',
                }}
              >
                <div className="grid md:grid-cols-2 gap-8 p-8">
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-obsidian-800">
                    {currentProduct.images[0] ? (
                      <motion.img
                        src={currentProduct.images[0]}
                        alt={currentProduct.name}
                        className="w-full h-full object-cover"
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5 }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        {t.products.noImage}
                      </div>
                    )}
                    <div className={cn('absolute top-4', isRTL ? 'right-4' : 'left-4')}>
                      <AnimatedBadge variant="featured" icon>
                        {t.home.spotlight.featured}
                      </AnimatedBadge>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center space-y-6">
                    <div>
                      <h3 className="text-3xl font-bold text-white mb-2">
                        {currentProduct.name}
                      </h3>
                      <p className="text-gray-400 mb-4">{currentProduct.description}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-4xl font-bold text-gold-600">
                        {currentProduct.price.toFixed(2)} MAD
                      </span>
                      {currentProduct.originalPrice && (
                        <span className="text-xl text-gray-500 line-through">
                          {currentProduct.originalPrice.toFixed(2)} MAD
                        </span>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <MagneticButton className="flex-1">
                        <Link href={`/products/${currentProduct.id}`}>
                          <button className={cn(
                            'w-full bg-gold-600 text-black font-bold py-3 px-6 rounded-lg hover:bg-gold-500 transition-colors flex items-center justify-center gap-2',
                            isRTL && 'flex-row-reverse'
                          )}>
                            {t.home.spotlight.viewDetails}
                            <ArrowRight className={cn('w-5 h-5', isRTL && 'rotate-180')} />
                          </button>
                        </Link>
                      </MagneticButton>
                    </div>

                    {/* Indicators */}
                    <div className="flex gap-2 justify-center pt-4">
                      {products.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentIndex(index)}
                          className={cn(
                            'w-2 h-2 rounded-full transition-all',
                            index === currentIndex
                              ? 'bg-gold-600 w-8'
                              : 'bg-gray-600 hover:bg-gray-500'
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </TiltCard>
        </div>
      </div>
    </section>
  );
}


