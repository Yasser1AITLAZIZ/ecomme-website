'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/authStore';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { useI18n } from '@/lib/i18n/context';

export default function RegisterPage() {
  // #region agent log
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      fetch('http://127.0.0.1:7242/ingest/5a2dc156-7002-40c6-bde1-4df847d61e58',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'register/page.tsx:11',message:'RegisterPage component rendering',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'D'})}).catch(()=>{});
    }, 0);
  }
  // #endregion
  const router = useRouter();
  let t;
  try {
    const i18n = useI18n();
    t = i18n.t;
    // #region agent log
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        fetch('http://127.0.0.1:7242/ingest/5a2dc156-7002-40c6-bde1-4df847d61e58',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'register/page.tsx:13',message:'useI18n called successfully',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'D'})}).catch(()=>{});
      }, 0);
    }
    // #endregion
  } catch (err) {
    // #region agent log
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        fetch('http://127.0.0.1:7242/ingest/5a2dc156-7002-40c6-bde1-4df847d61e58',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'register/page.tsx:13',message:'useI18n error',data:{error:err instanceof Error?err.message:String(err)},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'D'})}).catch(()=>{});
      }, 0);
    }
    // #endregion
    throw err;
  }
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/account');
    }
  }, [isAuthenticated, router]);

  // #region agent log
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      fetch('http://127.0.0.1:7242/ingest/5a2dc156-7002-40c6-bde1-4df847d61e58',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'register/page.tsx:22',message:'About to return JSX',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'D'})}).catch(()=>{});
    }, 0);
  }
  // #endregion
  return (
    <div className="container mx-auto px-4 py-24">
      <div className="max-w-md mx-auto">
        <ScrollReveal>
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">
              {t.auth.registerPage.createAccount} <span className="text-gold-600">{t.auth.registerPage.createAccountHighlight}</span>
            </h1>
            <p className="text-gray-400">{t.auth.registerPage.subtitle}</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="bg-black-100 rounded-lg border border-gold-600/10 p-8">
            <RegisterForm />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <p className="text-center text-gray-400 mt-6">
            {t.auth.registerPage.hasAccount}{' '}
            <Link href="/login" className="text-gold-600 hover:text-gold-500 transition-colors">
              {t.auth.registerPage.signIn}
            </Link>
          </p>
        </ScrollReveal>
      </div>
    </div>
  );
}

