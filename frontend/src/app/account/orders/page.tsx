'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Package } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { ordersApi } from '@/lib/api/orders';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { useI18n } from '@/lib/i18n/context';
import type { Order } from '@/types';

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
        return 'text-yellow-500';
      case 'processing':
        return 'text-blue-500';
      case 'shipped':
        return 'text-purple-500';
      case 'delivered':
        return 'text-green-500';
      case 'cancelled':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusText = (status: Order['status']) => {
    return t.orders.status[status];
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <ScrollReveal>
        <Link
          href="/account"
          className={`flex items-center gap-2 text-gray-400 hover:text-gold-600 transition-colors mb-8 ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <ArrowLeft className={isRTL ? 'w-5 h-5 rotate-180' : 'w-5 h-5'} />
          {t.orders.backToAccount}
        </Link>

        <h1 className="text-4xl md:text-5xl font-bold mb-8">
          {t.orders.title} <span className="text-gold-600">{t.orders.titleHighlight}</span>
        </h1>
      </ScrollReveal>

      {loading ? (
        <div className="text-center py-24">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600" />
        </div>
      ) : orders.length === 0 ? (
        <ScrollReveal>
          <div className="text-center py-24">
            <Package className="w-24 h-24 text-gray-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">{t.orders.noOrders}</h2>
            <p className="text-gray-400 mb-8">
              {t.orders.noOrdersDesc}
            </p>
            <Link href="/products">
              <button className="px-6 py-3 bg-gold-600 text-black rounded-lg font-semibold hover:bg-gold-500 transition-colors">
                {t.orders.browseProducts}
              </button>
            </Link>
          </div>
        </ScrollReveal>
      ) : (
        <div className="space-y-6">
          {orders.map((order, index) => (
            <ScrollReveal key={order.id} delay={index * 0.1}>
              <div className="bg-black-100 rounded-lg border border-gold-600/10 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {t.orders.orderNumber}{order.id}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString(language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-FR' : 'en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="mt-2 md:mt-0">
                    <span className={`font-semibold ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                    <p className="text-gold-600 font-bold text-xl mt-1">
                      {order.total.toFixed(2)} MAD
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.product.id} className="flex gap-4 py-3 border-t border-gold-600/10 first:border-0">
                      <div className="relative w-16 h-16 bg-black-50 rounded-lg overflow-hidden flex-shrink-0">
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
                        <h4 className="text-white font-medium">{item.product.name}</h4>
                        <p className="text-gray-400 text-sm">{t.orders.quantity}: {item.quantity}</p>
                        <p className="text-gold-600 font-semibold">
                          {(item.product.price * item.quantity).toFixed(2)} MAD
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gold-600/10">
                  <p className="text-sm text-gray-400">
                    <span className="font-medium">{t.orders.shippingTo}</span>{' '}
                    {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
                    {order.shippingAddress.state} {order.shippingAddress.zipCode}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  );
}

