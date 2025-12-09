'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShoppingCart, ArrowLeft, Check } from 'lucide-react';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductSpecs } from '@/components/product/ProductSpecs';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { productsApi } from '@/lib/api/products';
import { useCartStore } from '@/lib/store/cartStore';
import { useUIStore } from '@/lib/store/uiStore';
import { useI18n } from '@/lib/i18n/context';
import { Button } from '@/components/ui/Button';
import type { Product } from '@/types';

export default function ProductDetailPage() {
  const { t, isRTL } = useI18n();
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const openCartSidebar = useUIStore((state) => state.openCartSidebar);

  useEffect(() => {
    if (productId) {
      productsApi.getById(productId).then((data) => {
        setProduct(data);
        setLoading(false);
      });
    }
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity);
    setAddedToCart(true);
    openCartSidebar();
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold mb-4">{t.products.noProducts}</h1>
        <Button onClick={() => router.push('/products')} variant="primary">
          {t.nav.products}
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <ScrollReveal>
        <button
          onClick={() => router.back()}
          className={`flex items-center gap-2 text-gray-400 hover:text-gold-600 transition-colors mb-8 ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <ArrowLeft className={isRTL ? 'w-5 h-5 rotate-180' : 'w-5 h-5'} />
          {t.nav.products}
        </button>
      </ScrollReveal>

      <div className="grid lg:grid-cols-2 gap-12 mb-16">
        {/* Product Gallery */}
        <ScrollReveal direction="right">
          <ProductGallery images={product.images} productName={product.name} />
        </ScrollReveal>

        {/* Product Info */}
        <ScrollReveal direction="left">
          <div className="space-y-6">
            <div>
              {product.brand && (
                <p className="text-gold-600 font-semibold mb-2">{product.brand}</p>
              )}
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{product.name}</h1>
              <p className="text-gray-400 text-lg leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="text-4xl font-bold text-gold-600">
                {product.price.toFixed(2)} MAD
              </span>
              {product.originalPrice && (
                <span className="text-2xl text-gray-500 line-through">
                  {product.originalPrice.toFixed(2)} MAD
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div>
              {product.stock > 0 ? (
                <p className="text-green-500 flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  {t.products.inStock} ({product.stock} {t.products.quantity.toLowerCase()})
                </p>
              ) : (
                <p className="text-red-500">{t.products.outOfStock}</p>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <label className="text-gray-400">{t.products.quantity}:</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-gold-600/20 rounded-lg hover:bg-gold-600/10 transition-colors"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="w-12 text-center text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-10 h-10 border border-gold-600/20 rounded-lg hover:bg-gold-600/10 transition-colors"
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleAddToCart}
              disabled={product.stock === 0 || addedToCart}
            >
              {addedToCart ? (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  {t.products.addedToCart}
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {t.products.addToCart}
                </>
              )}
            </Button>
          </div>
        </ScrollReveal>
      </div>

      {/* Specifications */}
      {product.specifications && (
        <ScrollReveal delay={0.3}>
          <ProductSpecs product={product} />
        </ScrollReveal>
      )}
    </div>
  );
}

