'use client';

import { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Product } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { useI18n } from '@/lib/i18n/context';
import { Button } from './Button';
import { MagneticButton } from './MagneticButton';
import { AnimatedBadge } from './AnimatedBadge';
import { cn } from '@/lib/utils/cn';

interface FeaturedProductsMergedProps {
  products: Product[];
  loading?: boolean;
}

export function FeaturedProductsMerged({ products, loading = false }: FeaturedProductsMergedProps) {
  const { t, isRTL } = useI18n();
  const [activeTab, setActiveTab] = useState<'featured' | 'popular'>('featured');
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [3, -3]), {
    stiffness: 200,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-3, 3]), {
    stiffness: 200,
    damping: 20,
  });

  useEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth < 1024) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const x = (e.clientX - centerX) / (rect.width / 2);
      const y = (e.clientY - centerY) / (rect.height / 2);
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // Split products: featured (all) and popular (first 3 for spotlight)
  const featuredProducts = products;
  const popularProducts = products.slice(0, 3);
  const displayProducts = activeTab === 'featured' ? featuredProducts : popularProducts;

  return (
    <section className="relative py-24 bg-gradient-to-b from-obsidian-950 via-obsidian-900 to-obsidian-950 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(212,175,55,0.15)_0%,transparent_70%)]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {/* Floating Gold Particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full bg-gold-600/20 blur-sm"
            style={{
              width: `${4 + Math.random() * 6}px`,
              height: `${4 + Math.random() * 6}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -50, 0],
              x: [0, Math.sin(i) * 30, 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: i * 0.3,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10 max-w-7xl">
        {/* Header with Tabs */}
        <ScrollReveal>
          <div className={cn('text-center mb-12', isRTL && 'text-right')}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500/10 border border-gold-500/30 rounded-full text-gold-500 text-sm font-semibold mb-6"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t.home.featured.subtitle}</span>
            </motion.div>

            <h2 className={cn('text-4xl md:text-5xl lg:text-6xl font-bold mb-6', isRTL && 'text-right')}>
              {activeTab === 'featured' ? (
                <>
                  <span className="text-white">{t.home.featured.title}</span>{' '}
                  <span className="text-gold-600">{t.home.featured.titleHighlight}</span>
                </>
              ) : (
                <>
                  <span className="text-gold-600">{t.home.spotlight.title}</span>{' '}
                  <span className="text-white">{t.home.spotlight.titleHighlight}</span>
                </>
              )}
            </h2>

            {/* Tab Switcher */}
            <div className={cn('flex items-center justify-center gap-4 mb-8', isRTL && 'flex-row-reverse')}>
              <button
                onClick={() => setActiveTab('featured')}
                className={cn(
                  'px-6 py-3 rounded-lg font-semibold transition-all relative',
                  activeTab === 'featured'
                    ? 'text-gold-600 bg-gold-600/20 border border-gold-600/40'
                    : 'text-gray-400 hover:text-gray-300 bg-obsidian-800/50 border border-transparent'
                )}
              >
                {t.home.featured.title} {t.home.featured.titleHighlight}
                {activeTab === 'featured' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gold-600/10 border border-gold-600/40 rounded-lg"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab('popular')}
                className={cn(
                  'px-6 py-3 rounded-lg font-semibold transition-all relative',
                  activeTab === 'popular'
                    ? 'text-gold-600 bg-gold-600/20 border border-gold-600/40'
                    : 'text-gray-400 hover:text-gray-300 bg-obsidian-800/50 border border-transparent'
                )}
              >
                {t.home.spotlight.title} {t.home.spotlight.titleHighlight}
                {activeTab === 'popular' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gold-600/10 border border-gold-600/40 rounded-lg"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            </div>
          </div>
        </ScrollReveal>

        {/* Products Display */}
        <div
          ref={containerRef}
          className="relative"
          style={{ perspective: '1200px' }}
        >
          {loading ? (
            <div className="text-center py-12">
              <motion.div
                className="inline-block w-16 h-16 border-4 border-gold-600 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            </div>
          ) : displayProducts.length > 0 ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                style={{
                  rotateX: typeof window !== 'undefined' && window.innerWidth >= 1024 ? rotateX : 0,
                  rotateY: typeof window !== 'undefined' && window.innerWidth >= 1024 ? rotateY : 0,
                  transformStyle: typeof window !== 'undefined' && window.innerWidth >= 1024 ? 'preserve-3d' : 'flat',
                }}
                className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {displayProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    style={{
                      transform: `translateZ(${index * 10}px)`,
                    }}
                    initial={{ opacity: 0, y: 50, rotateX: -15 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{
                      duration: 0.6,
                      delay: index * 0.1,
                      type: 'spring',
                      stiffness: 100,
                    }}
                    whileHover={{
                      y: -10,
                      scale: 1.02,
                      transition: { duration: 0.3 },
                    }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <p>{t.products.noProducts}</p>
            </div>
          )}

          {/* 3D Glow Effect */}
          <motion.div
            className="absolute inset-0 bg-gold-600/5 blur-3xl -z-10 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        {/* View All Button */}
        {displayProducts.length > 0 && (
          <ScrollReveal delay={0.5}>
            <motion.div
              className="text-center mt-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <MagneticButton>
                <Link href="/products">
                  <Button variant="outline" size="lg">
                    {t.home.featured.viewAll}
                    <ArrowRight className={isRTL ? 'w-5 h-5 mr-2 rotate-180' : 'w-5 h-5 ml-2'} />
                  </Button>
                </Link>
              </MagneticButton>
            </motion.div>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}
