'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/lib/i18n/context';

export default function ProfilePage() {
  const { t, isRTL } = useI18n();
  const router = useRouter();
  const { user, isAuthenticated, updateUser } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const profileSchema = z.object({
    name: z.string().min(2, t.account.name + ' must be at least 2 characters'),
    email: z.string().email(t.checkout.invalidEmail),
    phone: z.string().optional(),
  });

  type ProfileFormData = z.infer<typeof profileSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user) {
      reset({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
      });
    }
  }, [isAuthenticated, router, user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsSaving(true);
      updateUser(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

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
          {t.account.profile} <span className="text-gold-600"></span>
        </h1>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <div className="max-w-2xl">
          <div className="bg-black-100 rounded-lg border border-gold-600/10 p-8">
            {success && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500 rounded-lg text-green-500 text-sm">
                {t.account.profileUpdated}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                label={t.account.name}
                error={errors.name?.message}
                {...register('name')}
              />

              <Input
                label={t.account.email}
                type="email"
                error={errors.email?.message}
                {...register('email')}
              />

              <Input
                label={t.account.phone}
                type="tel"
                error={errors.phone?.message}
                {...register('phone')}
              />

              <Button type="submit" variant="primary" size="lg" isLoading={isSaving}>
                {t.account.saveChanges}
              </Button>
            </form>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}

