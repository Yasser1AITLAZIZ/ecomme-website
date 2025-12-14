'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Check, ArrowLeft } from 'lucide-react';
import { useCartStore } from '@/lib/store/cartStore';
import { useAuthStore } from '@/lib/store/authStore';
import { useI18n } from '@/lib/i18n/context';
import { ordersApi } from '@/lib/api/orders';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { phoneSchema } from '@/lib/validations/phone';
import Image from 'next/image';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { t, isRTL } = useI18n();
  const { items, getTotal, clearCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const checkoutSchema = z.object({
    firstName: z.string().min(2, t.checkout.firstName + ' is required'),
    lastName: z.string().min(2, t.checkout.lastName + ' is required'),
    email: z.string().email(t.checkout.invalidEmail),
    phone: phoneSchema,
    street: z.string().min(5, t.checkout.street + ' is required'),
    city: z.string().min(2, t.checkout.city + ' is required'),
    state: z.string().min(2, t.checkout.state + ' is required'),
    zipCode: z.string().min(5, t.checkout.zipCode + ' is required'),
    country: z.string().min(2, t.checkout.country + ' is required'),
  });

  type CheckoutFormData = z.infer<typeof checkoutSchema>;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: user?.email || '',
    },
  });

  const total = getTotal();

  const onSubmit = async (data: CheckoutFormData) => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout');
      return;
    }

    try {
      setIsSubmitting(true);
      const order = await ordersApi.create(
        items,
        {
          street: data.street,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          country: data.country,
        }
      );
      setOrderId(order.id);
      clearCart();
    } catch (error) {
      console.error('Checkout failed:', error);
      alert(t.checkout.checkoutFailed);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !orderId) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold mb-4">{t.cart.empty}</h1>
        <Link href="/products">
          <Button variant="primary">{t.cart.startShopping}</Button>
        </Link>
      </div>
    );
  }

  if (orderId) {
    return (
      <div className="container mx-auto px-4 py-24">
        <ScrollReveal>
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 bg-gold-600 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Check className="w-12 h-12 text-black" />
            </motion.div>
            <h1 className="text-4xl font-bold mb-4">{t.checkout.orderConfirmed}</h1>
            <p className="text-gray-400 text-lg mb-2">
              {t.checkout.orderConfirmedDesc}
            </p>
            <p className="text-gold-600 font-semibold mb-8">
              {t.checkout.orderId}: #{orderId}
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/account/orders">
                <Button variant="primary">{t.checkout.viewOrders}</Button>
              </Link>
              <Link href="/products">
                <Button variant="outline">{t.cart.continueShopping}</Button>
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <ScrollReveal>
        <Link href="/cart" className={`flex items-center gap-2 text-gray-400 hover:text-gold-600 transition-colors mb-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <ArrowLeft className={isRTL ? 'w-5 h-5 rotate-180' : 'w-5 h-5'} />
          {t.cart.title}
        </Link>

        <h1 className="text-4xl md:text-5xl font-bold mb-8">
          {t.checkout.title}
        </h1>
      </ScrollReveal>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <ScrollReveal direction="right">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="bg-black-100 rounded-lg border border-gold-600/10 p-6 space-y-6">
                <h2 className="text-2xl font-bold text-gold-600">{t.checkout.shippingInfo}</h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label={t.checkout.firstName}
                    error={errors.firstName?.message}
                    {...register('firstName')}
                  />
                  <Input
                    label={t.checkout.lastName}
                    error={errors.lastName?.message}
                    {...register('lastName')}
                  />
                </div>

                <Input
                  label={t.checkout.email}
                  type="email"
                  error={errors.email?.message}
                  {...register('email')}
                />

                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <PhoneInput
                      label={t.checkout.phone}
                      error={errors.phone?.message}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />

                <Input
                  label={t.checkout.street}
                  error={errors.street?.message}
                  {...register('street')}
                />

                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label={t.checkout.city}
                    error={errors.city?.message}
                    {...register('city')}
                  />
                  <Input
                    label={t.checkout.state}
                    error={errors.state?.message}
                    {...register('state')}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label={t.checkout.zipCode}
                    error={errors.zipCode?.message}
                    {...register('zipCode')}
                  />
                  <Input
                    label={t.checkout.country}
                    error={errors.country?.message}
                    {...register('country')}
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isSubmitting}
              >
                {t.checkout.placeOrder}
              </Button>
            </form>
          </ScrollReveal>
        </div>

        {/* Order Summary */}
        <ScrollReveal direction="left" delay={0.2}>
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-black-100 rounded-lg border border-gold-600/10 p-6 space-y-4">
              <h2 className="text-2xl font-bold text-gold-600">{t.cart.title}</h2>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3">
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
                      <p className="text-sm text-white truncate">{item.product.name}</p>
                      <p className="text-xs text-gray-400">{t.products.quantity}: {item.quantity}</p>
                      <p className="text-gold-600 font-semibold">
                        {(item.product.price * item.quantity).toFixed(2)} MAD
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gold-600/20 pt-4 space-y-2">
                <div className="flex justify-between text-gray-400">
                  <span>{t.cart.subtotal}</span>
                  <span>{total.toFixed(2)} MAD</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>{t.cart.shipping}</span>
                  <span>{t.cart.free}</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-2 border-t border-gold-600/20">
                  <span>{t.cart.total}</span>
                  <span className="text-gold-600">{total.toFixed(2)} MAD</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}

