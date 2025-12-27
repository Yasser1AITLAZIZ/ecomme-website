'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Smartphone, Tablet, Headphones } from 'lucide-react';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { ParallaxSection } from '@/components/animations/ParallaxSection';
import { DynamicProductShowcase } from '@/components/animations/DynamicProductShowcase';
import { productsApi } from '@/lib/api/products';
import { useI18n } from '@/lib/i18n/context';
import type { Product } from '@/types';
import { Button } from '@/components/ui/Button';
import { AnimatedGradientText } from '@/components/ui/AnimatedGradientText';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { AnimatedTooltip } from '@/components/ui/AnimatedTooltip';
import { FeaturedProductsMerged } from '@/components/ui/FeaturedProductsMerged';
import { PrioritiesAndPayment } from '@/components/ui/PrioritiesAndPayment';
import { StoreLocation } from '@/components/ui/StoreLocation';
import { cn } from '@/lib/utils/cn';

export default function HomePage() {
  const { t, isRTL } = useI18n();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsApi.getFeatured().then((products) => {
      setFeaturedProducts(products);
      setLoading(false);
    });
  }, []);

  const categories = [
    {
      name: t.home.categories.iphone,
      href: '/products?category=iphone',
      description: t.home.categories.iphoneDesc,
      icon: Smartphone,
    },
    {
      name: t.home.categories.android,
      href: '/products?category=android',
      description: t.home.categories.androidDesc,
      icon: Tablet,
    },
    {
      name: t.home.categories.accessories,
      href: '/products?category=accessories',
      description: t.home.categories.accessoriesDesc,
      icon: Headphones,
    },
  ];

  return (
    <div className="overflow-hidden relative">
      {/* Spacer for scrolling ticker bar */}
      <div className="h-[52px]" />
      
      {/* Enhanced Hero Section with Integrated Categories */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 pb-16">
        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(212,175,55,0.1)_0%,transparent_70%)]" />
        
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(212, 175, 55, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(212, 175, 55, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />

        <div className="container mx-auto px-4 relative z-10 max-w-[1400px]">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Text Content */}
            <ScrollReveal direction="right" delay={0.2}>
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500/10 border border-gold-500/30 rounded-full text-gold-500 text-sm font-semibold"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{t.home.hero.tagline}</span>
                </motion.div>

                <h1 className={cn('text-4xl md:text-6xl lg:text-7xl font-bold leading-tight font-serif', isRTL && 'text-right')}>
                  <AnimatedGradientText className="text-4xl md:text-6xl lg:text-7xl">
                    {t.home.hero.title}
                  </AnimatedGradientText>
                  <br />
                  <span className="text-obsidian-50">{t.home.hero.subtitle}</span>
                </h1>

                <p className={cn('text-xl text-obsidian-300 max-w-lg leading-relaxed', isRTL && 'text-right')}>
                  {t.home.hero.description}
                </p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className={cn('flex items-center gap-2 text-obsidian-400 text-sm', isRTL && 'flex-row-reverse')}
                >
                  <span>{t.home.hero.location}</span>
                  <AnimatedTooltip content={t.home.hero.shippingInfo}>
                    <span className="text-gold-600 cursor-help">ℹ️</span>
                  </AnimatedTooltip>
                </motion.div>

                <div className={cn('flex flex-wrap gap-4', isRTL && 'flex-row-reverse')}>
                  <MagneticButton>
                    <Link href="/products">
                      <Button variant="primary" size="lg">
                        {t.home.hero.shopNow}
                        <ArrowRight className={isRTL ? 'w-5 h-5 mr-2 rotate-180' : 'w-5 h-5 ml-2'} />
                      </Button>
                    </Link>
                  </MagneticButton>
                </div>

                {/* Integrated Quick Category Navigation */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="pt-8"
                >
                  <p className={cn('text-sm text-gray-400 mb-4', isRTL && 'text-right')}>
                    {t.home.categories.title} {t.home.categories.titleHighlight}:
                  </p>
                  <div className={cn('flex flex-wrap gap-3', isRTL && 'flex-row-reverse')}>
                    {categories.map((category, index) => {
                      const Icon = category.icon;
                      return (
                        <motion.div
                          key={category.name}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.8 + index * 0.1 }}
                          whileHover={{ scale: 1.05, y: -2 }}
                        >
                          <Link href={category.href}>
                            <div className="flex items-center gap-2 px-4 py-2 bg-obsidian-800/50 border border-gold-600/20 rounded-lg hover:border-gold-600/40 hover:bg-obsidian-800 transition-all cursor-pointer group">
                              <Icon className="w-4 h-4 text-gold-600 group-hover:scale-110 transition-transform" />
                              <span className="text-sm font-medium text-gray-300 group-hover:text-gold-600 transition-colors">
                                {category.name}
                              </span>
                            </div>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              </div>
            </ScrollReveal>

            {/* Dynamic Product Showcase */}
            <div className="relative hidden lg:block">
              <DynamicProductShowcase 
                products={featuredProducts
                  .filter(product => product.category === 'iphone' || product.category === 'android')
                  .slice(0, 5)} 
              />
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-gold-600 rounded-full flex justify-center">
            <motion.div
              className="w-1 h-3 bg-gold-600 rounded-full mt-2"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Merged Featured Products Section */}
      <FeaturedProductsMerged products={featuredProducts} loading={loading} />

      {/* Priorities and Payment Section */}
      <PrioritiesAndPayment />

      {/* Store Location Section */}
      <StoreLocation />

      {/* Simplified Final CTA */}
      <ParallaxSection speed={0.3}>
        <section className="py-20 bg-gradient-to-r from-gold-600/10 to-gold-700/10 border-y border-gold-600/20">
          <div className="container mx-auto px-4 text-center">
            <ScrollReveal>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className={cn('text-4xl md:text-5xl font-bold mb-6', isRTL && 'text-right')}>
                  <AnimatedGradientText>{t.home.cta.title}</AnimatedGradientText>
                </h2>
                <p className={cn('text-xl text-gray-400 mb-8 max-w-2xl mx-auto', isRTL && 'text-right')}>
                  {t.home.cta.description}
                </p>
                <MagneticButton>
                  <Link href="/products">
                    <Button variant="primary" size="lg">
                      {t.home.cta.startShopping}
                      <ArrowRight className={isRTL ? 'w-5 h-5 mr-2 rotate-180' : 'w-5 h-5 ml-2'} />
                    </Button>
                  </Link>
                </MagneticButton>
              </motion.div>
            </ScrollReveal>
          </div>
        </section>
      </ParallaxSection>
    </div>
  );
}
