'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/lib/store/cartStore';
import { useI18n } from '@/lib/i18n/context';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function CartPage() {
  const router = useRouter();
  const { t, isRTL } = useI18n();
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCartStore();
  const total = getTotal();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24">
        <ScrollReveal>
          <div className="text-center max-w-md mx-auto">
            <ShoppingBag className="w-24 h-24 text-gray-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">{t.cart.empty}</h1>
            <p className="text-gray-400 mb-8">
              {t.cart.emptyDescription}
            </p>
            <Link href="/products">
              <Button variant="primary" size="lg">
                {t.cart.startShopping}
                <ArrowRight className={isRTL ? 'w-5 h-5 mr-2 rotate-180' : 'w-5 h-5 ml-2'} />
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <ScrollReveal>
        <h1 className="text-4xl md:text-5xl font-bold mb-8">
          {t.cart.title} <span className="text-gold-600">{t.cart.titleHighlight}</span>
        </h1>
      </ScrollReveal>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item, index) => (
            <ScrollReveal key={item.product.id} delay={index * 0.1}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 p-6 bg-black-100 rounded-lg border border-gold-600/10"
              >
                <Link href={`/products/${item.product.id}`}>
                  <div className="relative w-24 h-24 bg-black-50 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer">
                    {item.product.images[0] ? (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-black-100 flex items-center justify-center text-gray-600 text-xs">
                        {t.products.noImage}
                      </div>
                    )}
                  </div>
                </Link>

                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.product.id}`}>
                    <h3 className="text-lg font-semibold text-white hover:text-gold-600 transition-colors mb-2">
                      {item.product.name}
                    </h3>
                  </Link>
                  <p className="text-gold-600 font-bold text-lg mb-4">
                    {item.product.price.toFixed(2)} MAD
                  </p>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-8 h-8 border border-gold-600/20 rounded-lg hover:bg-gold-600/10 transition-colors flex items-center justify-center"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-white w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-8 h-8 border border-gold-600/20 rounded-lg hover:bg-gold-600/10 transition-colors flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="ml-auto p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}

          <ScrollReveal delay={0.3}>
            <Button
              variant="ghost"
              onClick={clearCart}
              className="text-red-500 hover:text-red-600"
            >
              {t.cart.clearCart}
            </Button>
          </ScrollReveal>
        </div>

        {/* Order Summary */}
        <ScrollReveal direction="left" delay={0.2}>
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-black-100 rounded-lg border border-gold-600/10 p-6 space-y-6">
              <h2 className="text-2xl font-bold text-gold-600">{t.cart.title}</h2>

              <div className="space-y-3">
                <div className="flex justify-between text-gray-400">
                  <span>{t.cart.subtotal}</span>
                  <span>{total.toFixed(2)} MAD</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>{t.cart.shipping}</span>
                  <span>{t.cart.free}</span>
                </div>
                <div className="border-t border-gold-600/20 pt-3">
                  <div className="flex justify-between text-xl font-bold">
                    <span>{t.cart.total}</span>
                    <span className="text-gold-600">{total.toFixed(2)} MAD</span>
                  </div>
                </div>
              </div>

              <Link href="/checkout" className="block">
                <Button variant="primary" size="lg" className="w-full">
                  {t.cart.proceedToCheckout}
                  <ArrowRight className={isRTL ? 'w-5 h-5 mr-2 rotate-180' : 'w-5 h-5 ml-2'} />
                </Button>
              </Link>

              <Link href="/products" className="block">
                <Button variant="outline" className="w-full">
                  {t.cart.continueShopping}
                </Button>
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}

