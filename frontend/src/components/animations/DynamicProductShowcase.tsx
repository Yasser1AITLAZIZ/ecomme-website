'use client';

import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles, TrendingUp, Star, Zap } from 'lucide-react';
import type { Product } from '@/types';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils/cn';
import { getProductPrice } from '@/lib/utils/productPrice';

interface DynamicProductShowcaseProps {
  className?: string;
  products?: Product[];
}

export function DynamicProductShowcase({ className = '', products = [] }: DynamicProductShowcaseProps) {
  const { t, isRTL } = useI18n();
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), {
    stiffness: 150,
    damping: 15,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
    stiffness: 150,
    damping: 15,
  });

  // Filter to only show smartphones
  const smartphoneProducts = products.filter(
    product => product.category === 'iphone' || product.category === 'android'
  );

  useEffect(() => {
    if (smartphoneProducts.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentProductIndex((prev) => (prev + 1) % smartphoneProducts.length);
    }, 6000); // Rotate every 6 seconds

    return () => clearInterval(interval);
  }, [smartphoneProducts.length]);

  useEffect(() => {
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

  const currentProduct = smartphoneProducts[currentProductIndex] || null;
  const priceInfo = currentProduct ? getProductPrice(currentProduct) : null;

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  // Get key specifications to display
  const getKeySpecs = (product: Product | null): string[] => {
    if (!product || !product.specifications) return [];
    
    const specs = product.specifications;
    const keySpecs: string[] = [];
    
    // Prioritize important specs
    if (specs.storage) keySpecs.push(`${specs.storage} Storage`);
    if (specs.ram) keySpecs.push(`${specs.ram} RAM`);
    if (specs.screen) keySpecs.push(specs.screen);
    if (specs.camera) keySpecs.push(specs.camera);
    if (specs.battery) keySpecs.push(specs.battery);
    
    return keySpecs.slice(0, 3); // Show max 3 specs
  };

  if (smartphoneProducts.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative flex justify-center items-center', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ perspective: '1200px' }}
    >
      {/* Ambient Gold Glow */}
      <motion.div
        className="absolute w-[500px] h-[500px] bg-gold-500 rounded-full blur-[120px] opacity-20"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* 3D Container */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        animate={{
          y: [0, -15, 0],
        }}
        transition={{
          y: {
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }}
        className="relative w-full max-w-lg"
      >
        <AnimatePresence mode="wait">
          {currentProduct && (
            <motion.div
              key={currentProduct.id}
              initial={{ opacity: 0, rotateY: -15, scale: 0.95 }}
              animate={{ opacity: 1, rotateY: 0, scale: 1 }}
              exit={{ opacity: 0, rotateY: 15, scale: 0.95 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative"
            >
              {/* Main Card */}
              <div className="relative bg-gradient-to-br from-obsidian-900 via-obsidian-800 to-obsidian-900 rounded-3xl p-8 border border-gold-600/30 shadow-2xl overflow-hidden">
                {/* Animated Background Pattern */}
                <motion.div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: `radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.3) 0%, transparent 70%)`,
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.15, 0.1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />

                {/* Product Image */}
                <div className="relative h-64 mb-6 rounded-2xl overflow-hidden bg-obsidian-950">
                  {currentProduct.images[0] ? (
                    <motion.div
                      className="relative w-full h-full"
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Image
                        src={currentProduct.images[0]}
                        alt={currentProduct.name}
                        fill
                        className="object-contain"
                        priority
                      />
                    </motion.div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                      {t.products.noImage}
                    </div>
                  )}
                  
                  {/* Badge */}
                  <motion.div
                    className="absolute top-4 right-4 bg-gold-600/90 backdrop-blur-sm px-3 py-1 rounded-full"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                  >
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-black fill-black" />
                      <span className="text-black text-xs font-bold">{t.products.featuredBadge}</span>
                    </div>
                  </motion.div>

                  {/* Price Badge */}
                  <motion.div
                    className={cn(
                      "absolute bottom-4 left-4 bg-black/80 backdrop-blur-md border border-gold-600/50 rounded-xl px-4 py-2",
                      isRTL && "left-auto right-4"
                    )}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <p className="text-gray-400 text-xs mb-0.5">
                      {t.home.showcase.startingFrom || 'À partir de'}
                    </p>
                    {priceInfo?.isOnPromo && priceInfo.discountPercentage && (
                      <p className="text-red-500 text-xs font-bold mb-0.5">
                        -{priceInfo.discountPercentage}%
                      </p>
                    )}
                    <p className="text-gold-600 font-bold text-xl">
                      {priceInfo ? formatPrice(priceInfo.currentPrice) : formatPrice(currentProduct.price)} MAD
                    </p>
                    {priceInfo?.originalPrice && (
                      <p className="text-gray-500 text-xs line-through mt-0.5">
                        {formatPrice(priceInfo.originalPrice)} MAD
                      </p>
                    )}
                  </motion.div>
                </div>

                {/* Product Info */}
                <div className="relative z-10">
                  {/* Brand & Name */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {currentProduct.brand && (
                      <p className="text-gold-600/70 text-sm font-medium mb-1">
                        {currentProduct.brand}
                      </p>
                    )}
                    <h3 className="text-2xl font-bold text-white mb-2 line-clamp-2">
                      {currentProduct.name}
                    </h3>
                  </motion.div>

                  {/* Key Specifications */}
                  {getKeySpecs(currentProduct).length > 0 && (
                    <motion.div
                      className="flex flex-wrap gap-2 mb-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {getKeySpecs(currentProduct).map((spec, index) => (
                        <motion.div
                          key={index}
                          className="px-3 py-1 bg-gold-600/10 border border-gold-600/30 rounded-lg"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                        >
                          <p className="text-gold-600/80 text-xs font-medium">{spec}</p>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}

                  {/* Description */}
                  {currentProduct.description && (
                    <motion.p
                      className="text-gray-400 text-sm mb-6 line-clamp-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      {currentProduct.description}
                    </motion.p>
                  )}

                  {/* CTA Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Link href={`/products/${currentProduct.id}`}>
                      <motion.div
                        className="flex items-center justify-center gap-2 bg-gold-600 hover:bg-gold-500 text-black font-bold py-3 px-6 rounded-xl transition-colors cursor-pointer group"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span>{t.home.hero.shopNow || 'Shop Now'}</span>
                        <ArrowRight className={cn('w-5 h-5 transition-transform group-hover:translate-x-1', isRTL && 'rotate-180')} />
                      </motion.div>
                    </Link>
                  </motion.div>
                </div>

                {/* Progress Indicators */}
                <div className="flex gap-2 justify-center mt-6">
                  {smartphoneProducts.map((_, index) => (
                    <motion.button
                      key={index}
                      onClick={() => setCurrentProductIndex(index)}
                      className={cn(
                        'h-1.5 rounded-full transition-all',
                        index === currentProductIndex
                          ? 'bg-gold-600 w-8'
                          : 'bg-gray-600 w-1.5 hover:bg-gray-500'
                      )}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    />
                  ))}
                </div>
              </div>

              {/* Floating Icons */}
              <motion.div
                className="absolute -top-4 -right-4 w-16 h-16 bg-gold-600/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-gold-600/30"
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                  scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
                }}
              >
                <Sparkles className="w-8 h-8 text-gold-600" />
              </motion.div>

              <motion.div
                className="absolute -bottom-4 -left-4 w-12 h-12 bg-gold-600/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-gold-600/30"
                animate={{
                  rotate: [360, 0],
                  scale: [1, 1.15, 1],
                }}
                transition={{
                  rotate: { duration: 15, repeat: Infinity, ease: 'linear' },
                  scale: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
                }}
              >
                <TrendingUp className="w-6 h-6 text-gold-600" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Floating Particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute rounded-full bg-gold-600/30 blur-sm"
          style={{
            width: `${4 + Math.random() * 4}px`,
            height: `${4 + Math.random() * 4}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, Math.sin(i) * 30, 0],
            opacity: [0, 0.6, 0],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.5,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

