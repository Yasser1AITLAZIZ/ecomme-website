'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  const searchParams = useSearchParams();
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
    // #region agent log
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        fetch('http://127.0.0.1:7242/ingest/5a2dc156-7002-40c6-bde1-4df847d61e58',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LoginForm.tsx:38',message:'Login form submitted',data:{email:data.email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      }, 0);
    }
    // #endregion
    try {
      setIsLoading(true);
      setError(null);
      // #region agent log
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          fetch('http://127.0.0.1:7242/ingest/5a2dc156-7002-40c6-bde1-4df847d61e58',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LoginForm.tsx:42',message:'Calling authApi.login',data:{email:data.email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        }, 0);
      }
      // #endregion
      const response = await authApi.login(data.email, data.password);
      // #region agent log
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          fetch('http://127.0.0.1:7242/ingest/5a2dc156-7002-40c6-bde1-4df847d61e58',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LoginForm.tsx:43',message:'authApi.login response received',data:{hasToken:!!response.token,hasUser:!!response.user},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        }, 0);
      }
      // #endregion
      if (!response.token) {
        throw new Error('Login failed: No token received');
      }
      await login(response.user, response.token);
      
      // Get redirect parameter from URL, default to /account
      const redirect = searchParams.get('redirect') || '/account';
      router.push(redirect);
    } catch (err) {
      // #region agent log
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          fetch('http://127.0.0.1:7242/ingest/5a2dc156-7002-40c6-bde1-4df847d61e58',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LoginForm.tsx:51',message:'Login form error caught',data:{errorMessage:err instanceof Error?err.message:String(err),errorType:err instanceof Error?'Error':typeof err,hasOriginalError:!!(err as any)?.originalError},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        }, 0);
      }
      // #endregion
      // Backend now returns translated error messages based on Accept-Language header
      // Use the error message directly from the backend
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t.auth.login.loginFailed);
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
            {t.auth.login.forgotPassword}
          </Link>
        </div>
      </div>

      <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
        {t.auth.login.signIn}
      </Button>
    </form>
  );
}

