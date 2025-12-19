'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import type { Product } from '@/types';
import { useCartStore } from '@/lib/store/cartStore';
import { useUIStore } from '@/lib/store/uiStore';
import { useI18n } from '@/lib/i18n/context';
import { Button } from '@/components/ui/Button';
import { TiltCard } from '@/components/ui/TiltCard';
import { QuickViewTrigger } from '@/components/product/QuickView';
import { cn } from '@/lib/utils/cn';
import { getProductPrice } from '@/lib/utils/productPrice';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { t } = useI18n();
  const addItem = useCartStore((state) => state.addItem);
  const openCartSidebar = useUIStore((state) => state.openCartSidebar);
  const priceInfo = getProductPrice(product);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    openCartSidebar();
  };

  return (
    <TiltCard className={cn('h-full', className)}>
      <Link href={`/products/${product.id}`}>
        <motion.div
          className={cn(
            'group relative bg-black-100 rounded-lg overflow-hidden border border-gold-600/10 hover:border-gold-600/30 transition-all duration-300 h-full flex flex-col',
            className
          )}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Image */}
          <div className="relative aspect-square bg-black-50 overflow-hidden">
            {product.images[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-black-50 flex items-center justify-center text-gray-600">
                {t.products.noImage}
              </div>
            )}
            {priceInfo.isOnPromo && (
              <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-20">
                {priceInfo.discountPercentage ? `-${priceInfo.discountPercentage}%` : t.products.sale || 'Promo'}
              </div>
            )}
            <QuickViewTrigger product={product} />
          </div>

          {/* Content */}
          <div className="p-4 flex-1 flex flex-col">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg mb-1 line-clamp-1">
                  {product.name}
                </h3>
                {product.brand && (
                  <p className="text-gray-400 text-sm">{product.brand}</p>
                )}
              </div>
            </div>

            <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-1">
              {product.description}
            </p>

            {/* Price */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-gold-600 font-bold text-xl">
                {priceInfo.currentPrice.toFixed(2)} MAD
              </span>
              {priceInfo.originalPrice && (
                <span className="text-gray-500 text-sm line-through">
                  {priceInfo.originalPrice.toFixed(2)} MAD
                </span>
              )}
            </div>

            {/* Add to Cart Button */}
            <Button
              variant="primary"
              size="sm"
              className="w-full"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {t.products.addToCart}
            </Button>
          </div>
        </motion.div>
      </Link>
    </TiltCard>
  );
}

