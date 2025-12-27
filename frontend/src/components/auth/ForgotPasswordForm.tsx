'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/lib/api/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useI18n } from '@/lib/i18n/context';
import Link from 'next/link';

export function ForgotPasswordForm() {
  const { t } = useI18n();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const forgotPasswordSchema = z.object({
    email: z.string().email(t.checkout.invalidEmail),
  });

  type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      await authApi.forgotPassword(data.email);
      setSuccess(true);
    } catch (err) {
      let errorMessage: string = t.auth.forgotPassword.errorMessage;
      
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-6">
        <div className="p-4 bg-green-500/10 border border-green-500 rounded-lg text-green-500 text-sm">
          {t.auth.forgotPassword.successMessage}
        </div>
        <div className="text-center">
          <Link href="/login" className="text-gold-600 hover:text-gold-500 transition-colors">
            {t.auth.forgotPassword.backToLogin}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-sm">
          {error}
        </div>
      )}

      <div>
        <p className="text-gray-400 text-sm mb-4">
          {t.auth.forgotPassword.description}
        </p>
      </div>

      <Input
        label={t.auth.login.email}
        type="email"
        placeholder="your@email.com"
        error={errors.email?.message}
        {...register('email')}
      />

      <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
        {t.auth.forgotPassword.sendButton}
      </Button>

      <div className="text-center">
        <Link href="/login" className="text-sm text-gray-400 hover:text-gold-600 transition-colors">
          {t.auth.forgotPassword.backToLogin}
        </Link>
      </div>
    </form>
  );
}

