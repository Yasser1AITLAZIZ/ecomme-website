'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { ParallaxSection } from '@/components/animations/ParallaxSection';
import { ProductCard } from '@/components/product/ProductCard';
import { FloatingPhone } from '@/components/animations/FloatingPhone';
import { FloatingCards } from '@/components/animations/FloatingCards';
import { productsApi } from '@/lib/api/products';
import { useI18n } from '@/lib/i18n/context';
import type { Product } from '@/types';
import { Button } from '@/components/ui/Button';
import { AnimatedGradientText } from '@/components/ui/AnimatedGradientText';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { StatsSection } from '@/components/ui/StatsSection';
import { PopupOffer } from '@/components/ui/PopupOffer';
import { TestimonialCarousel } from '@/components/ui/TestimonialCarousel';
import { ProductSpotlight } from '@/components/ui/ProductSpotlight';
import { CountdownTimer } from '@/components/ui/CountdownTimer';
import { PaymentFacilities } from '@/components/ui/PaymentFacilities';
import { FeaturedProducts3D } from '@/components/ui/FeaturedProducts3D';
import { OurPriorities } from '@/components/ui/OurPriorities';
import { AnimatedTooltip } from '@/components/ui/AnimatedTooltip';
import { StoreLocation } from '@/components/ui/StoreLocation';

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
    },
    {
      name: t.home.categories.android,
      href: '/products?category=android',
      description: t.home.categories.androidDesc,
    },
    {
      name: t.home.categories.accessories,
      href: '/products?category=accessories',
      description: t.home.categories.accessoriesDesc,
    },
  ];

  // No images - using stylized outlines instead

  return (
    <div className="overflow-hidden relative">
      {/* Spacer for scrolling ticker bar */}
      <div className="h-[52px]" />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 pb-16">
        {/* Radial gradient overlay matching HTML */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(212,175,55,0.1)_0%,transparent_70%)]" />
        
        {/* Grid pattern overlay matching HTML hero-grid */}
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

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight font-serif">
                  <AnimatedGradientText className="text-4xl md:text-6xl lg:text-7xl">
                    {t.home.hero.title}
                  </AnimatedGradientText>
                  <br />
                  <span className="text-obsidian-50">{t.home.hero.subtitle}</span>
                </h1>

                <p className="text-xl text-obsidian-300 max-w-lg leading-relaxed">
                  {t.home.hero.description}
                </p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-2 text-obsidian-400 text-sm"
                >
                  <span>{t.home.hero.location}</span>
                  <AnimatedTooltip content={t.home.hero.shippingInfo}>
                    <span className="text-gold-600 cursor-help">ℹ️</span>
                  </AnimatedTooltip>
                </motion.div>

                <div className="flex flex-wrap gap-4">
                  <MagneticButton>
                    <Link href="/products">
                      <Button variant="primary" size="lg">
                        {t.home.hero.shopNow}
                        <ArrowRight className={isRTL ? 'w-5 h-5 mr-2 rotate-180' : 'w-5 h-5 ml-2'} />
                      </Button>
                    </Link>
                  </MagneticButton>
                  <MagneticButton>
                    <Link href="/products?category=iphone">
                      <Button variant="outline" size="lg">
                        {t.home.hero.exploreIphone}
                      </Button>
                    </Link>
                  </MagneticButton>
                </div>
              </div>
            </ScrollReveal>

            {/* Phone Display with Floating Cards */}
            <div className="relative hidden lg:block">
              <FloatingPhone />
              <FloatingCards />
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

      {/* Categories Section */}
      <section className="py-20 bg-obsidian-900">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                {t.home.categories.title} <span className="text-gold-600">{t.home.categories.titleHighlight}</span>
              </h2>
              <p className="text-gray-400 text-lg">
                {t.home.categories.subtitle}
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <ScrollReveal key={category.name} delay={index * 0.1}>
                <Link href={category.href}>
                  <motion.div
                    className="group relative h-64 rounded-lg overflow-hidden border border-gold-600/10 hover:border-gold-600/30 transition-all"
                    whileHover={{ y: -8 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-gold-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-10">
                      <h3 className="text-2xl font-bold text-gold-600 mb-2">
                        {category.name}
                      </h3>
                      <p className="text-gray-400 text-center">{category.description}</p>
                    </div>
                  </motion.div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Our Priorities Section - Prominently Displayed */}
      <OurPriorities />

      {/* Featured Products Section - 3D Version */}
      <FeaturedProducts3D products={featuredProducts} loading={loading} />

      {/* Stats Section */}
      <StatsSection />

      {/* Product Spotlight */}
      {featuredProducts.length > 0 && (
        <ProductSpotlight products={featuredProducts.slice(0, 3)} />
      )}

      {/* Payment Facilities Section */}
      <PaymentFacilities />

      {/* Countdown Timer Section */}
      <section className="py-20 bg-obsidian-900">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <CountdownTimer
              targetDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
              title={t.home.countdown.title}
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialCarousel />

      {/* Store Location Section */}
      <StoreLocation />

      {/* Popup Offer */}
      <PopupOffer
        discount={15}
        code="WELCOME15"
        delay={3000}
      />

      {/* CTA Section */}
      <ParallaxSection speed={0.3}>
        <section className="py-20 bg-gradient-to-r from-gold-600/10 to-gold-700/10 border-y border-gold-600/20">
          <div className="container mx-auto px-4 text-center">
            <ScrollReveal>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <AnimatedGradientText>{t.home.cta.title}</AnimatedGradientText>
              </h2>
              <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
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
            </ScrollReveal>
          </div>
        </section>
      </ParallaxSection>
    </div>
  );
}

