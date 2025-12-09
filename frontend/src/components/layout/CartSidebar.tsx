'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { useCartStore } from '@/lib/store/cartStore';
import { useUIStore } from '@/lib/store/uiStore';
import { useI18n } from '@/lib/i18n/context';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import Image from 'next/image';

export function CartSidebar() {
  const { t, isRTL } = useI18n();
  const { cartSidebarOpen, closeCartSidebar } = useUIStore();
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCartStore();
  const total = getTotal();

  return (
    <AnimatePresence>
      {cartSidebarOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCartSidebar}
            className="fixed inset-0 bg-black/50 z-[10001]"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-black-100 border-l border-gold-600/20 z-[10002] flex flex-col"
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-6 border-b border-gold-600/20 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <h2 className="text-xl font-bold text-gold-600">{t.nav.cart}</h2>
              <button
                onClick={closeCartSidebar}
                className="text-gray-400 hover:text-gold-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-gray-400 mb-4">{t.cart.empty}</p>
                  <Link href="/products" onClick={closeCartSidebar}>
                    <Button variant="primary">{t.products.allProducts}</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={item.product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-4 p-4 bg-black-50 rounded-lg border border-gold-600/10"
                    >
                      <div className="relative w-20 h-20 bg-black-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.product.images[0] ? (
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-black-50 flex items-center justify-center text-gray-600 text-xs">
                            {t.products.noImage}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-white truncate">
                          {item.product.name}
                        </h3>
                        <p className="text-gold-600 font-semibold mt-1">
                          {item.product.price.toFixed(2)} MAD
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 text-gray-400 hover:text-gold-600 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-white text-sm w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 text-gray-400 hover:text-gold-600 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="ml-auto p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-gold-600/20 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">{t.cart.total}</span>
                  <span className="text-2xl font-bold text-gold-600">
                    {total.toFixed(2)} MAD
                  </span>
                </div>
                <Link href="/cart" onClick={closeCartSidebar} className="block">
                  <Button variant="primary" className="w-full">
                    {t.nav.cart}
                  </Button>
                </Link>
                <Link href="/checkout" onClick={closeCartSidebar} className="block">
                  <Button variant="outline" className="w-full">
                    {t.checkout.title}
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

