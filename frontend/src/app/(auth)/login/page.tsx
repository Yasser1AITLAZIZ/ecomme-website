'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/authStore';
import { LoginForm } from '@/components/auth/LoginForm';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { useI18n } from '@/lib/i18n/context';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const redirect = searchParams.get('redirect');

  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirect || '/account');
    }
  }, [isAuthenticated, router, redirect]);

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="max-w-md mx-auto">
        <ScrollReveal>
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">
              {t.auth.loginPage.welcomeBack} <span className="text-gold-600">{t.auth.loginPage.welcomeBackHighlight}</span>
            </h1>
            <p className="text-gray-400">{t.auth.loginPage.subtitle}</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="bg-black-100 rounded-lg border border-gold-600/10 p-8">
            <LoginForm />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <p className="text-center text-gray-400 mt-6">
            {t.auth.loginPage.noAccount}{' '}
            <Link href="/register" className="text-gold-600 hover:text-gold-500 transition-colors">
              {t.auth.loginPage.signUp}
            </Link>
          </p>
        </ScrollReveal>
      </div>
    </div>
  );
}

