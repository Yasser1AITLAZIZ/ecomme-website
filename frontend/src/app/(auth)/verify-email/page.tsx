'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { authApi } from '@/lib/api/auth';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { useI18n } from '@/lib/i18n/context';
import { Button } from '@/components/ui/Button';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const login = useAuthStore((state) => state.login);
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState<string>('Verifying your email...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      // Extract token from URL
      // Supabase verification links typically have tokens in the hash or query params
      // Format: ?token=... or #access_token=...&type=signup&token=...
      const token = searchParams.get('token') || searchParams.get('access_token');
      const type = searchParams.get('type') || 'signup';
      
      // Also check hash fragment (Supabase often puts tokens there)
      let hashToken: string | null = null;
      if (typeof window !== 'undefined') {
        const hash = window.location.hash;
        if (hash) {
          const hashParams = new URLSearchParams(hash.substring(1));
          hashToken = hashParams.get('access_token') || hashParams.get('token');
          const hashType = hashParams.get('type');
          if (hashType) {
            // Use hash type if available
          }
        }
      }

      const verificationToken = token || hashToken;

      if (!verificationToken) {
        setStatus('error');
        setError('No verification token found. Please check your email and click the verification link again.');
        return;
      }

      try {
        setStatus('verifying');
        setMessage('Verifying your email...');
        
        const response = await authApi.verifyEmail(verificationToken, type);
        
        if (response.token && response.user) {
          // Successfully verified and logged in
          await login(response.user, response.token);
          setStatus('success');
          setMessage(response.message || 'Email verified successfully! You are now logged in.');
          
          // Redirect to account page after a short delay
          setTimeout(() => {
            router.push('/account');
          }, 2000);
        } else {
          setStatus('error');
          setError('Email verification failed. Please try again or contact support.');
        }
      } catch (err) {
        setStatus('error');
        if (err instanceof Error) {
          const errMsg = err.message.toLowerCase();
          if (errMsg.includes('expired') || errMsg.includes('invalid')) {
            setError('The verification link has expired or is invalid. Please request a new verification email.');
          } else {
            setError(err.message || 'Email verification failed. Please try again.');
          }
        } else {
          setError('Email verification failed. Please try again.');
        }
      }
    };

    verifyEmail();
  }, [searchParams, login, router]);

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="max-w-md mx-auto">
        <ScrollReveal>
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">
              Email <span className="text-gold-600">Verification</span>
            </h1>
            <p className="text-gray-400">Verifying your email address</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="bg-black-100 rounded-lg border border-gold-600/10 p-8">
            {status === 'verifying' && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600 mx-auto mb-4"></div>
                <p className="text-gray-300">{message}</p>
              </div>
            )}

            {status === 'success' && (
              <div className="text-center">
                <div className="text-green-500 text-5xl mb-4">✓</div>
                <p className="text-green-500 text-lg mb-4">{message}</p>
                <p className="text-gray-400 text-sm">Redirecting to your account...</p>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center">
                <div className="text-red-500 text-5xl mb-4">✗</div>
                <p className="text-red-500 mb-4">{error}</p>
                <div className="space-y-2">
                  <Button
                    variant="primary"
                    onClick={() => router.push('/login')}
                    className="w-full"
                  >
                    Go to Login
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => router.push('/register')}
                    className="w-full"
                  >
                    Back to Register
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-md mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600 mx-auto"></div>
          </div>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}

