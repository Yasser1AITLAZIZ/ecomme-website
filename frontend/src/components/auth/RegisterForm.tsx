'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/lib/store/authStore';
import { authApi } from '@/lib/api/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { useI18n } from '@/lib/i18n/context';
import { phoneSchema } from '@/lib/validations/phone';

export function RegisterForm() {
  const { t } = useI18n();
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const registerSchema = z.object({
    name: z.string().min(2, t.auth.register.name + ' must be at least 2 characters'),
    email: z.string().email(t.checkout.invalidEmail),
    phone: phoneSchema,
    password: z.string().min(6, t.auth.register.password + ' must be at least 6 characters'),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t.auth.register.confirmPassword + " don't match",
    path: ['confirmPassword'],
  });

  type RegisterFormData = z.infer<typeof registerSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);
      const response = await authApi.register(data.email, data.password, data.name, data.phone);
      
      // If token is provided, user is logged in (shouldn't happen with email verification)
      // Otherwise, show verification message
      if (response.token) {
        login(response.user, response.token);
        router.push('/account');
      } else {
        // Email verification required - backend returns translated message
        setSuccessMessage(response.message || 'Please check your email to verify your account before logging in.');
      }
    } catch (err) {
      // Backend now returns translated error messages based on Accept-Language header
      // Use the error message directly from the backend
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-sm">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-green-500/10 border border-green-500 rounded-lg text-green-500 text-sm">
          {successMessage}
        </div>
      )}

      <Input
        label={t.auth.register.name}
        type="text"
        placeholder="Youssef Alami"
        error={errors.name?.message}
        {...register('name')}
      />

      <Input
        label={t.auth.register.email}
        type="email"
        placeholder="your@email.com"
        error={errors.email?.message}
        {...register('email')}
      />

      <PhoneInput
        label={t.checkout.phone}
        placeholder="+212 6XX XXX XXX"
        error={errors.phone?.message}
        {...register('phone')}
      />

      <Input
        label={t.auth.register.password}
        type="password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register('password')}
      />

      <Input
        label={t.auth.register.confirmPassword}
        type="password"
        placeholder="••••••••"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
        {t.auth.register.createAccount}
      </Button>
    </form>
  );
}

