'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/lib/api/auth';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useI18n } from '@/lib/i18n/context';
import Link from 'next/link';

export function ResetPasswordForm() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const resetPasswordSchema = z.object({
    password: z.string().min(6, t.auth.register.password + ' must be at least 6 characters'),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t.auth.register.confirmPassword + " don't match",
    path: ['confirmPassword'],
  });

  type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    // Supabase password reset flow:
    // 1. User clicks link in email -> goes to Supabase callback
    // 2. Supabase processes token and creates a recovery session
    // 3. Supabase redirects to redirect_to URL with token in hash: #access_token=...&type=recovery
    // 4. Supabase client SDK automatically picks up the session from the hash
    
    let resetToken: string | null = null;
    let hasRecoverySession = false;

    if (typeof window !== 'undefined') {
      // Check if Supabase has established a recovery session
      // This happens automatically when the hash contains type=recovery
      const hash = window.location.hash;
      
      if (hash && hash.length > 1) {
        try {
          const hashString = hash.substring(1);
          const hashParams = new URLSearchParams(hashString);
          
          // Check if this is a recovery flow
          const hashType = hashParams.get('type');
          if (hashType === 'recovery') {
            hasRecoverySession = true;
            resetToken = hashParams.get('access_token');
          } else {
            // Try to extract token anyway
            resetToken = hashParams.get('access_token') || 
                        hashParams.get('token') || 
                        hashParams.get('recovery_token');
          }
          
          // Debug logging in development
          if (process.env.NODE_ENV === 'development') {
            console.log('Hash fragment:', hashString);
            console.log('Hash params:', Object.fromEntries(hashParams));
            console.log('Type:', hashType);
            console.log('Has recovery session:', hasRecoverySession);
            console.log('Extracted token:', resetToken ? 'Found' : 'Not found');
          }
        } catch (e) {
          console.error('Error parsing hash fragment:', e);
        }
      }

      // If not in hash, check query parameters
      if (!resetToken) {
        resetToken = searchParams.get('token') || searchParams.get('access_token');
      }

      // Final fallback: try regex extraction from hash
      if (!resetToken && hash) {
        const match = hash.match(/(?:access_token|token|recovery_token)=([^&]+)/);
        if (match && match[1]) {
          resetToken = decodeURIComponent(match[1]);
        }
      }

      // If we have a recovery session (type=recovery), check for Supabase session
      // Also check for session even if hash is empty (session might already be established)
      if (hasRecoverySession || !resetToken) {
        // Check if Supabase has a session (it should after redirect)
        supabase.auth.getSession().then(({ data: { session }, error: sessionError }) => {
          if (session && session.user) {
            // Session is established, we can use it for password reset
            setToken('session'); // Use a marker to indicate session-based reset
            setError(null); // Clear any previous errors
          } else if (resetToken) {
            // No session but we have token - use backend API
            setToken(resetToken);
          } else {
            // No session and no token
            if (process.env.NODE_ENV === 'development') {
              console.log('No session found:', sessionError);
            }
            setError('No reset session found. Please check your email and click the reset link again.');
          }
        });
      } else {
        // We have a token, use it
        setToken(resetToken);
      }

      // Debug logging
      if (process.env.NODE_ENV === 'development' && !resetToken) {
        console.log('Full URL:', window.location.href);
        console.log('Hash:', window.location.hash);
        console.log('Search params:', Object.fromEntries(searchParams));
      }
    } else {
      // No window object (SSR), set token if we have it
      setToken(resetToken);
    }

    // Set error if no token and not checking session
    if (!resetToken && typeof window === 'undefined') {
      setError('No reset token found. Please check your email and click the reset link again.');
    }
  }, [searchParams]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError('No reset token found. Please check your email and click the reset link again.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // If token is 'session', it means we're using Supabase recovery session
      // Otherwise, we have an explicit token to use with backend API
      if (token === 'session') {
        // Use Supabase client SDK with recovery session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !sessionData.session) {
          throw new Error('No active recovery session. Please request a new password reset link.');
        }

        const { error: updateError } = await supabase.auth.updateUser({
          password: data.password
        });

        if (updateError) {
          throw updateError;
        }

        // Success with Supabase SDK
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        // Use backend API with explicit token
        await authApi.resetPassword(token, data.password);
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (err) {
      let errorMessage = 'Failed to reset password. Please try again.';
      
      if (err instanceof Error) {
        const errMsg = err.message.toLowerCase();
        if (errMsg.includes('expired')) {
          errorMessage = 'The reset link has expired. Please request a new password reset link.';
        } else if (errMsg.includes('invalid') || errMsg.includes('token')) {
          errorMessage = 'The reset link is invalid. Please request a new password reset link.';
        } else if (errMsg.includes('session')) {
          errorMessage = 'The reset session is invalid. Please request a new password reset link.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="text-green-500 text-5xl mb-4">✓</div>
          <div className="p-4 bg-green-500/10 border border-green-500 rounded-lg text-green-500 text-sm mb-4">
            Password has been reset successfully! Redirecting to login...
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="space-y-6">
        <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-sm">
          {error || 'No reset token found. Please check your email and click the reset link again.'}
        </div>
        <div className="text-center">
          <Link href="/forgot-password" className="text-gold-600 hover:text-gold-500 transition-colors">
            Request New Reset Link
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
          Enter your new password below.
        </p>
      </div>

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
        Reset Password
      </Button>

      <div className="text-center">
        <Link href="/login" className="text-sm text-gray-400 hover:text-gold-600 transition-colors">
          Back to Login
        </Link>
      </div>
    </form>
  );
}

