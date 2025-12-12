'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Calendar, MapPin, ShoppingBag } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { ordersApi } from '@/lib/api/orders';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { useI18n } from '@/lib/i18n/context';
import type { Order } from '@/types';
import { Button } from '@/components/ui/Button';

export default function OrdersPage() {
  const router = useRouter();
  const { t, isRTL, language } = useI18n();
  const { isAuthenticated, user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const loadOrders = async () => {
      try {
        const data = await ordersApi.getByUserId(user?.id || '');
        setOrders(data);
      } catch (error) {
        console.error('Failed to load orders:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [isAuthenticated, router, user]);

  if (!isAuthenticated) {
    return null;
  }

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'processing':
        return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'shipped':
        return 'bg-purple-500/20 text-purple-500 border-purple-500/30';
      case 'delivered':
        return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-500 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusText = (status: Order['status']) => {
    return t.orders.status[status];
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <ScrollReveal>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-gold-600/20 flex items-center justify-center border border-gold-600/30">
            <Package className="w-6 h-6 text-gold-600" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              {t.orders.title} <span className="text-gold-600">{t.orders.titleHighlight}</span>
            </h1>
            <p className="text-gray-400 mt-1">
              {t.account.myOrdersDesc}
            </p>
          </div>
        </div>
      </ScrollReveal>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600" />
        </div>
      ) : orders.length === 0 ? (
        /* Empty State */
        <ScrollReveal>
          <div className="bg-black-100 rounded-xl border border-gold-600/10 p-12 md:p-16 text-center">
            <div className="w-24 h-24 rounded-full bg-gold-600/10 flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-gold-600/50" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{t.orders.noOrders}</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              {t.orders.noOrdersDesc}
            </p>
            <Link href="/products">
              <Button variant="primary" size="lg">
                <ShoppingBag className="w-5 h-5 mr-2" />
                {t.orders.browseProducts}
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      ) : (
        /* Orders List */
        <div className="space-y-6">
          {orders.map((order, index) => (
            <ScrollReveal key={order.id} delay={index * 0.1}>
              <div className="bg-black-100 rounded-xl border border-gold-600/10 p-6 md:p-8 shadow-lg hover:border-gold-600/30 transition-all">
                {/* Order Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-6 border-b border-gold-600/10">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg md:text-xl font-semibold text-white">
                        {t.orders.orderNumber}{order.id}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(order.createdAt).toLocaleDateString(
                            language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-FR' : 'en-US',
                            {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gold-600 font-bold text-2xl md:text-3xl">
                      {order.total.toFixed(2)} MAD
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-4 mb-6">
                  {order.items.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex gap-4 p-4 rounded-lg bg-black-50 border border-gold-600/5 hover:border-gold-600/20 transition-all"
                    >
                      <div className="relative w-20 h-20 bg-black-100 rounded-lg overflow-hidden flex-shrink-0 border border-gold-600/10">
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
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-semibold mb-1">{item.product.name}</h4>
                        <p className="text-gray-400 text-sm mb-2">
                          {t.orders.quantity}: <span className="text-white font-medium">{item.quantity}</span>
                        </p>
                        <p className="text-gold-600 font-bold text-lg">
                          {(item.product.price * item.quantity).toFixed(2)} MAD
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping Address */}
                <div className="pt-4 border-t border-gold-600/10">
                  <div className="flex items-start gap-3 text-sm text-gray-400">
                    <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-gray-300">{t.orders.shippingTo}:</span>{' '}
                      {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
                      {order.shippingAddress.state} {order.shippingAddress.zipCode}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  );
}

