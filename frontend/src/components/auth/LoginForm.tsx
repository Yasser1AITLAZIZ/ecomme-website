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
import { useI18n } from '@/lib/i18n/context';
import Link from 'next/link';

export function LoginForm() {
  const { t } = useI18n();
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loginSchema = z.object({
    email: z.string().email(t.checkout.invalidEmail),
    password: z.string().min(6, t.auth.login.password + ' must be at least 6 characters'),
  });

  type LoginFormData = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authApi.login(data.email, data.password);
      login(response.user, response.token);
      router.push('/account');
    } catch (err) {
      // Backend now returns translated error messages based on Accept-Language header
      // Use the error message directly from the backend
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Login failed. Please try again.');
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

      <Input
        label={t.auth.login.email}
        type="email"
        placeholder="your@email.com"
        error={errors.email?.message}
        {...register('email')}
      />

      <div>
        <Input
          label={t.auth.login.password}
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />
        <div className="mt-2 text-right">
          <Link href="/forgot-password" className="text-sm text-gold-600 hover:text-gold-500 transition-colors">
            Forgot Password?
          </Link>
        </div>
      </div>

      <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
        {t.auth.login.signIn}
      </Button>

      <p className="text-center text-sm text-gray-400">
        {t.auth.login.demoCredentials}
      </p>
    </form>
  );
}

