'use client';

import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { useI18n } from '@/lib/i18n/context';

export default function ForgotPasswordPage() {
  const { t } = useI18n();

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="max-w-md mx-auto">
        <ScrollReveal>
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">
              {t.auth.forgotPassword.title} <span className="text-gold-600">{t.auth.forgotPassword.titleHighlight}</span>
            </h1>
            <p className="text-gray-400">{t.auth.forgotPassword.subtitle}</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="bg-black-100 rounded-lg border border-gold-600/10 p-8">
            <ForgotPasswordForm />
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}

