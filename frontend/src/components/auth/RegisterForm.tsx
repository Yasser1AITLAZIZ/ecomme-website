'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/lib/store/authStore';
import { authApi } from '@/lib/api/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SimplePhoneInput } from '@/components/ui/SimplePhoneInput';
import { useI18n } from '@/lib/i18n/context';
import { extractErrorMessage } from '@/lib/utils/errorHandler';
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
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const onSubmit = async (data: RegisterFormData) => {
    // #region agent log
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        fetch('http://127.0.0.1:7242/ingest/5a2dc156-7002-40c6-bde1-4df847d61e58',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'RegisterForm.tsx:47',message:'Register form submitted',data:{email:data.email,hasName:!!data.name,hasPhone:!!data.phone},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      }, 0);
    }
    // #endregion
    try {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);
      // #region agent log
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          fetch('http://127.0.0.1:7242/ingest/5a2dc156-7002-40c6-bde1-4df847d61e58',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'RegisterForm.tsx:52',message:'Calling authApi.register',data:{email:data.email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        }, 0);
      }
      // #endregion
      const response = await authApi.register(data.email, data.password, data.name, data.phone);
      // #region agent log
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          fetch('http://127.0.0.1:7242/ingest/5a2dc156-7002-40c6-bde1-4df847d61e58',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'RegisterForm.tsx:53',message:'authApi.register response received',data:{hasToken:!!response.token,hasUser:!!response.user,hasMessage:!!response.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        }, 0);
      }
      // #endregion
      
      // If token is provided, user is logged in (shouldn't happen with email verification)
      // Otherwise, show verification message
      if (response.token) {
        await login(response.user, response.token);
        router.push('/account');
      } else {
        // Email verification required - backend returns translated message
        setSuccessMessage(response.message || 'Please check your email to verify your account before logging in.');
      }
    } catch (err) {
      // #region agent log
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          fetch('http://127.0.0.1:7242/ingest/5a2dc156-7002-40c6-bde1-4df847d61e58',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'RegisterForm.tsx:63',message:'Register form error caught',data:{errorMessage:err instanceof Error?err.message:String(err),errorType:err instanceof Error?'Error':typeof err,hasOriginalError:!!(err as any)?.originalError},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        }, 0);
      }
      // #endregion
      // Backend now returns translated error messages based on Accept-Language header
      // Use extractErrorMessage to get user-friendly translated message
      const errorMessage = extractErrorMessage(err);
      setError(errorMessage || t.auth.login.loginFailed || 'Registration failed. Please try again.');
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
        placeholder="Nom et prénom"
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

      <Controller
        name="phone"
        control={control}
        render={({ field }) => (
          <SimplePhoneInput
            label={t.checkout.phone}
            placeholder="6XX XXX XXX"
            error={errors.phone?.message}
            value={field.value}
            onChange={field.onChange}
          />
        )}
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

