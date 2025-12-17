'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Eye } from 'lucide-react';
import { Product } from '@/types';
import { useCartStore } from '@/lib/store/cartStore';
import { Button } from '@/components/ui/Button';
import { SafeImage } from '@/components/ui/SafeImage';
import { useI18n } from '@/lib/i18n/context';

interface QuickViewProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickView({ product, isOpen, onClose }: QuickViewProps) {
  const { t } = useI18n();
  const addToCart = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addToCart(product);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-obsidian-900 border border-gold-600/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto backdrop-blur-xl">
              <div className="relative">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full hover:bg-black/80 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>

                <div className="grid md:grid-cols-2 gap-6 p-6">
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-obsidian-800">
                    <SafeImage
                      src={product.images[0] || ''}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gold-600 mb-2">{product.name}</h2>
                      <p className="text-3xl font-bold text-white mb-4">{product.price} MAD</p>
                      <p className="text-gray-400">{product.description}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-gold-600/20 text-gold-600 rounded-full text-sm font-semibold">
                        {product.category}
                      </span>
                      {product.featured && (
                        <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm font-semibold">
                          {t.products.featuredBadge}
                        </span>
                      )}
                    </div>

                    <div className="pt-4">
                      <Button
                        variant="primary"
                        size="lg"
                        className="w-full"
                        onClick={handleAddToCart}
                      >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface QuickViewTriggerProps {
  product: Product;
  children?: React.ReactNode;
}

export function QuickViewTrigger({ product, children }: QuickViewTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/50 rounded-lg z-10 cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        {children || (
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-4 bg-gold-600 rounded-full"
          >
            <Eye className="w-6 h-6 text-black" />
          </motion.div>
        )}
      </div>
      <QuickView product={product} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

