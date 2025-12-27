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
import { createPasswordSchema } from '@/lib/validations/password';
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
    password: createPasswordSchema({
      minLength: t.errors.passwordMinLength,
      lowercase: t.errors.passwordLowercase,
      uppercase: t.errors.passwordUppercase,
      number: t.errors.passwordNumber,
      special: t.errors.passwordSpecial,
    }),
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
            setError(t.auth.resetPassword.noTokenFound);
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
      setError(t.auth.resetPassword.noTokenFound);
    }
  }, [searchParams]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError(t.auth.resetPassword.noTokenFound);
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
          throw new Error(t.auth.resetPassword.noActiveSession);
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
      // Default error message using i18n
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/5a2dc156-7002-40c6-bde1-4df847d61e58',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ResetPasswordForm.tsx:192',message:'Initial errorMessage type check',data:{passwordResetFailedType:typeof t.errors.passwordResetFailed,passwordResetFailedValue:t.errors.passwordResetFailed,resetTokenExpiredType:typeof t.errors.resetTokenExpired,resetTokenExpiredValue:t.errors.resetTokenExpired},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      let errorMessage: string = t.errors.passwordResetFailed;
      
      if (err instanceof Error) {
        const errMsg = err.message.toLowerCase();
        
        // Map specific error messages to user-friendly translated messages
        if (errMsg.includes('expired') || errMsg.includes('expiré')) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/5a2dc156-7002-40c6-bde1-4df847d61e58',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ResetPasswordForm.tsx:199',message:'Before assigning resetTokenExpired',data:{errorMessageType:typeof errorMessage,errorMessageValue:errorMessage,resetTokenExpiredType:typeof t.errors.resetTokenExpired,resetTokenExpiredValue:t.errors.resetTokenExpired},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
          errorMessage = t.errors.resetTokenExpired;
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/5a2dc156-7002-40c6-bde1-4df847d61e58',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ResetPasswordForm.tsx:201',message:'After assigning resetTokenExpired',data:{errorMessageType:typeof errorMessage,errorMessageValue:errorMessage},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
        } else if (errMsg.includes('invalid') || errMsg.includes('token') || errMsg.includes('invalide')) {
          errorMessage = t.errors.resetTokenInvalid;
        } else if (errMsg.includes('session') || errMsg.includes('session')) {
          errorMessage = t.errors.resetSessionInvalid;
        } else if (errMsg.includes('network') || errMsg.includes('connection') || errMsg.includes('timeout') || errMsg.includes('connexion')) {
          errorMessage = t.errors.connectionError;
        } else if (errMsg.includes('password should contain') || 
                   errMsg.includes('password must contain') || 
                   errMsg.includes('mot de passe doit contenir')) {
          // Supabase password requirements error - use translated message
          errorMessage = t.errors.passwordRequirementsNotMet;
        } else if (errMsg.includes('abcdefghijklmnopqrstuvwxyz') || 
                   errMsg.includes('uppercase') || 
                   errMsg.includes('lowercase') ||
                   errMsg.includes('majuscule') ||
                   errMsg.includes('minuscule')) {
          // Supabase password requirements error (detailed format) - use translated message
          errorMessage = t.errors.passwordRequirementsNotMet;
        } else if (!errMsg.includes('status code') && 
                   !errMsg.includes('request failed') &&
                   !errMsg.includes('axios') &&
                   err.message.length < 200) {
          // Use the error message from backend if it's user-friendly (backend sends translated messages)
          // The backend already sends messages in the correct language based on Accept-Language header
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      
      // Log technical details only in development
      if (process.env.NODE_ENV === 'development' && err instanceof Error) {
        console.error('Password reset error:', err);
      }
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
            {t.auth.resetPassword.passwordResetSuccess}
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="space-y-6">
        <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-sm">
          {error || t.auth.resetPassword.noTokenFound}
        </div>
        <div className="text-center">
          <Link href="/forgot-password" className="text-gold-600 hover:text-gold-500 transition-colors">
            {t.auth.resetPassword.requestNewLink}
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
          {t.auth.resetPassword.enterNewPassword}
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
        {t.auth.resetPassword.resetButton}
      </Button>

      <div className="text-center">
        <Link href="/login" className="text-sm text-gray-400 hover:text-gold-600 transition-colors">
          {t.auth.resetPassword.backToLogin}
        </Link>
      </div>
    </form>
  );
}

