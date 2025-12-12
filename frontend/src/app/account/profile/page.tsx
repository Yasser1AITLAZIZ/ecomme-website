'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Settings, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { authApi } from '@/lib/api/auth';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/lib/i18n/context';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfilePage() {
  const { t, isRTL } = useI18n();
  const router = useRouter();
  const { user, isAuthenticated, updateUser } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError(null);
      setSuccess(false);
      
      // Check if user is still authenticated
      if (!isAuthenticated || !user) {
        setError('Session expired. Please log in again.');
        router.push('/login');
        return;
      }
      
      // Call API to update profile in database
      const response = await authApi.updateProfile({
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
      });
      
      // Update local store with the user from server response
      updateUser(response.user);
      
      // Show success message (which may include email confirmation info)
      setSuccess(true);
      if (response.message) {
        setError(null);
        // Show the message as success info (could be enhanced to show as info banner)
        console.log('Profile update message:', response.message);
      }
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile. Please try again.';
      
      // If it's an authentication error, redirect to login
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized') || errorMessage.includes('Not authenticated')) {
        setError('Session expired. Redirecting to login...');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <ScrollReveal>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-gold-600/20 flex items-center justify-center border border-gold-600/30">
            <Settings className="w-6 h-6 text-gold-600" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              {t.account.profile}
            </h1>
            <p className="text-gray-400 mt-1">
              {t.account.profileDesc}
            </p>
          </div>
        </div>
      </ScrollReveal>

      {/* Success Message */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            <p className="text-green-500 font-medium">{t.account.profileUpdated}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-500 font-medium">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Form */}
      <ScrollReveal delay={0.1}>
        <div className="bg-black-100 rounded-xl border border-gold-600/10 p-8 md:p-10 shadow-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
            <div className="space-y-6">
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
            </div>

            <div className="pt-4 border-t border-gold-600/10">
              <Button 
                type="submit" 
                variant="primary" 
                size="lg" 
                isLoading={isSaving}
                className="w-full md:w-auto"
              >
                {t.account.saveChanges}
              </Button>
            </div>
          </form>
        </div>
      </ScrollReveal>
    </div>
  );
}

