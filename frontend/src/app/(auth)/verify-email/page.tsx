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
  const [message, setMessage] = useState<string>(t.auth.verifyEmail.verifying);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      // Check for error parameter first
      const errorParam = searchParams.get('error');
      if (errorParam === 'no_token') {
        setStatus('error');
        setError(t.auth.verifyEmail.noTokenFound);
        return;
      }
      
      // Extract token from URL
      // Supabase verification links typically have tokens in the hash or query params
      // Format: ?token=... or #access_token=...&type=signup&token=...
      const token = searchParams.get('token') || searchParams.get('access_token');
      const type = searchParams.get('type') || 'signup';
      
      // Also check hash fragment (Supabase often puts tokens there)
      let hashToken: string | null = null;
      let hashType: string | null = null;
      if (typeof window !== 'undefined') {
        const hash = window.location.hash;
        if (hash) {
          const hashParams = new URLSearchParams(hash.substring(1));
          hashToken = hashParams.get('access_token') || hashParams.get('token');
          hashType = hashParams.get('type');
        }
      }

      const verificationToken = token || hashToken;
      const verificationType = type || hashType || 'signup';

      if (!verificationToken) {
        setStatus('error');
        setError(t.auth.verifyEmail.noTokenFound);
        return;
      }

      try {
        setStatus('verifying');
        setMessage(t.auth.verifyEmail.verifying);
        
        const response = await authApi.verifyEmail(verificationToken, verificationType);
        
        if (response.token && response.user) {
          // Successfully verified and logged in
          await login(response.user, response.token);
          setStatus('success');
          setMessage(response.message || t.auth.verifyEmail.success);
          
          // Redirect to account page after a short delay
          setTimeout(() => {
            router.push('/account');
          }, 2000);
        } else {
          setStatus('error');
          setError(t.auth.verifyEmail.failed);
        }
      } catch (err) {
        setStatus('error');
        if (err instanceof Error) {
          const errMsg = err.message.toLowerCase();
          if (errMsg.includes('expired') || errMsg.includes('invalid')) {
            setError(t.auth.verifyEmail.expired);
          } else {
            setError(err.message || t.auth.verifyEmail.failed);
          }
        } else {
          setError(t.auth.verifyEmail.failed);
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
              {t.auth.verifyEmail.title} <span className="text-gold-600">{t.auth.verifyEmail.titleHighlight}</span>
            </h1>
            <p className="text-gray-400">{t.auth.verifyEmail.subtitle}</p>
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
                <p className="text-gray-400 text-sm">{t.auth.verifyEmail.redirecting}</p>
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
                    {t.auth.verifyEmail.goToLogin}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => router.push('/register')}
                    className="w-full"
                  >
                    {t.auth.verifyEmail.backToRegister}
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

