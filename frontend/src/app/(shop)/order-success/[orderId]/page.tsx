'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, Package, Truck, MapPin, CreditCard, ArrowLeft, Mail, Download } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { ordersApi } from '@/lib/api/orders';
import type { Order } from '@/types';
import { Button } from '@/components/ui/Button';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import Image from 'next/image';
import Link from 'next/link';

export default function OrderSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const { t, isRTL } = useI18n();
  const orderId = params.orderId as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const orderData = await ordersApi.getById(orderId);
        if (orderData) {
          setOrder(orderData);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Failed to fetch order:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600 mx-auto"></div>
        <p className="mt-4 text-gray-400">{t.orderSuccess.preparingOrder}...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <ScrollReveal>
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Package className="w-12 h-12 text-red-600" />
            </motion.div>
            <h1 className="text-4xl font-bold mb-4">{t.orderSuccess.orderNotFound}</h1>
            <p className="text-gray-400 text-lg mb-8">{t.orderSuccess.orderNotFoundDesc}</p>
            <Link href="/">
              <Button variant="primary">{t.orderSuccess.backToHome}</Button>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    );
  }

  const shippingAddress = order.shippingAddress;
  const addressString = shippingAddress
    ? `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode || ''}, ${shippingAddress.country}`
    : '';

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <ScrollReveal>
        {/* Success Animation */}
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-24 h-24 bg-gradient-to-br from-gold-600 to-gold-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-gold-600/50"
            >
              <CheckCircle2 className="w-16 h-16 text-black" strokeWidth={2.5} />
            </motion.div>
            
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-gold-600 to-gold-400 bg-clip-text text-transparent"
            >
              {t.orderSuccess.title}
            </motion.h1>
            
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-400 mb-2"
            >
              {t.orderSuccess.subtitle}
            </motion.p>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-2 text-gold-600 mb-8"
            >
              <Package className="w-5 h-5" />
              <p className="font-semibold">{t.orderSuccess.preparingOrder}</p>
            </motion.div>
            
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-gray-500 mb-8"
            >
              {t.orderSuccess.preparingOrderDesc}
            </motion.p>

            {/* Email Sent Notification */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="inline-flex items-center gap-2 bg-gold-600/10 border border-gold-600/20 rounded-lg px-4 py-2 mb-8"
            >
              <Mail className="w-4 h-4 text-gold-600" />
              <span className="text-sm text-gold-600">{t.orderSuccess.emailSent}</span>
            </motion.div>
          </motion.div>

          {/* Order Number */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="bg-black-100 rounded-lg border border-gold-600/20 p-6 mb-8 text-center"
          >
            <p className="text-gray-400 mb-2">{t.orderSuccess.orderNumber}</p>
            <p className="text-2xl font-bold text-gold-600">
              #{order.orderNumber || orderId.slice(0, 8).toUpperCase()}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Order Summary */}
            <motion.div
              initial={{ x: isRTL ? 50 : -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="bg-black-100 rounded-lg border border-gold-600/10 p-6"
            >
              <h2 className="text-2xl font-bold text-gold-600 mb-6 flex items-center gap-2">
                <Package className="w-6 h-6" />
                {t.orderSuccess.orderSummary}
              </h2>
              
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {order.items.map((item, index) => (
                  <motion.div
                    key={item.product.id}
                    initial={{ x: isRTL ? 20 : -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1 + index * 0.1 }}
                    className="flex gap-4"
                  >
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
                      <p className="text-white font-medium truncate">{item.product.name}</p>
                      <p className="text-sm text-gray-400">
                        {t.products.quantity}: {item.quantity}
                      </p>
                      <p className="text-gold-600 font-semibold">
                        {(item.product.price * item.quantity).toFixed(2)} MAD
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="border-t border-gold-600/20 pt-4 space-y-2">
                <div className="flex justify-between text-gray-400">
                  <span>{t.orderSuccess.subtotal}</span>
                  <span>
                    {order.subtotal !== undefined
                      ? order.subtotal.toFixed(2)
                      : order.items
                          .reduce((sum, item) => sum + item.product.price * item.quantity, 0)
                          .toFixed(2)}{' '}
                    MAD
                  </span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>{t.orderSuccess.shipping}</span>
                  <span className={order.shippingCost === 0 || !order.shippingCost ? 'text-green-400 font-semibold' : ''}>
                    {order.shippingCost === 0 || !order.shippingCost
                      ? t.cart.free
                      : `${order.shippingCost.toFixed(2)} MAD`}
                  </span>
                </div>
                {order.discountAmount && order.discountAmount > 0 && (
                  <div className="flex justify-between text-gray-400">
                    <span>{t.orderSuccess.discount}</span>
                    <span className="text-green-400 font-semibold">
                      -{order.discountAmount.toFixed(2)} MAD
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold pt-2 border-t border-gold-600/20">
                  <span>{t.orderSuccess.total}</span>
                  <span className="text-gold-600">{order.total.toFixed(2)} MAD</span>
                </div>
              </div>
            </motion.div>

            {/* Shipping & Payment Info */}
            <motion.div
              initial={{ x: isRTL ? -50 : 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.95 }}
              className="space-y-6"
            >
              {/* Shipping Address */}
              <div className="bg-black-100 rounded-lg border border-gold-600/10 p-6">
                <h3 className="text-xl font-bold text-gold-600 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  {t.orderSuccess.shippingAddress}
                </h3>
                {addressString ? (
                  <p className="text-gray-300 leading-relaxed">{addressString}</p>
                ) : (
                  <p className="text-gray-500">{t.orderSuccess.pickup}</p>
                )}
              </div>

              {/* Delivery Method */}
              <div className="bg-black-100 rounded-lg border border-gold-600/10 p-6">
                <h3 className="text-xl font-bold text-gold-600 mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  {t.orderSuccess.deliveryMethod}
                </h3>
                <p className="text-gray-300">
                  {order.deliveryType === 'pickup' ? t.orderSuccess.pickup : t.orderSuccess.delivery}
                </p>
              </div>

              {/* Payment Method */}
              <div className="bg-black-100 rounded-lg border border-gold-600/10 p-6">
                <h3 className="text-xl font-bold text-gold-600 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  {t.orderSuccess.paymentMethod}
                </h3>
                <p className="text-gray-300">
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : order.paymentMethod || 'N/A'}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto"
              onClick={async () => {
                if (!order) return;
                try {
                  setDownloadingPdf(true);
                  await ordersApi.downloadInvoice(order.id);
                } catch (error) {
                  console.error('Failed to download order confirmation:', error);
                  alert(t.orderSuccess.downloadError);
                } finally {
                  setDownloadingPdf(false);
                }
              }}
              disabled={downloadingPdf}
            >
              {downloadingPdf ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                  {t.orderSuccess.downloading}
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2 inline-block" />
                  {t.orderSuccess.downloadOrder}
                </>
              )}
            </Button>
            <Link href="/account/orders">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                {t.orderSuccess.viewOrders}
              </Button>
            </Link>
            <Link href="/products">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                {t.orderSuccess.continueShopping}
              </Button>
            </Link>
          </motion.div>
        </div>
      </ScrollReveal>
    </div>
  );
}

