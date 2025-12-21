'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/authStore';
import { LoginForm } from '@/components/auth/LoginForm';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { useI18n } from '@/lib/i18n/context';

function LoginContent() {
  // #region agent log
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      fetch('http://127.0.0.1:7242/ingest/5a2dc156-7002-40c6-bde1-4df847d61e58',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'login/page.tsx:11',message:'LoginContent component rendering',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'D'})}).catch(()=>{});
    }, 0);
  }
  // #endregion
  const router = useRouter();
  // #region agent log
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      fetch('http://127.0.0.1:7242/ingest/5a2dc156-7002-40c6-bde1-4df847d61e58',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'login/page.tsx:13',message:'useRouter called',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'D'})}).catch(()=>{});
    }, 0);
  }
  // #endregion
  const searchParams = useSearchParams();
  // #region agent log
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      fetch('http://127.0.0.1:7242/ingest/5a2dc156-7002-40c6-bde1-4df847d61e58',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'login/page.tsx:14',message:'useSearchParams called',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'D'})}).catch(()=>{});
    }, 0);
  }
  // #endregion
  let t;
  try {
    const i18n = useI18n();
    t = i18n.t;
    // #region agent log
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        fetch('http://127.0.0.1:7242/ingest/5a2dc156-7002-40c6-bde1-4df847d61e58',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'login/page.tsx:15',message:'useI18n called successfully',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'D'})}).catch(()=>{});
      }, 0);
    }
    // #endregion
  } catch (err) {
    // #region agent log
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        fetch('http://127.0.0.1:7242/ingest/5a2dc156-7002-40c6-bde1-4df847d61e58',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'login/page.tsx:15',message:'useI18n error',data:{error:err instanceof Error?err.message:String(err)},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'D'})}).catch(()=>{});
      }, 0);
    }
    // #endregion
    throw err;
  }
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  // #region agent log
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      fetch('http://127.0.0.1:7242/ingest/5a2dc156-7002-40c6-bde1-4df847d61e58',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'login/page.tsx:16',message:'useAuthStore called',data:{isAuthenticated},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'D'})}).catch(()=>{});
    }, 0);
  }
  // #endregion
  const redirect = searchParams.get('redirect');

  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirect || '/account');
    }
  }, [isAuthenticated, router, redirect]);

  // #region agent log
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      fetch('http://127.0.0.1:7242/ingest/5a2dc156-7002-40c6-bde1-4df847d61e58',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'login/page.tsx:24',message:'About to return JSX',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'D'})}).catch(()=>{});
    }, 0);
  }
  // #endregion
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

export default function LoginPage() {
  // #region agent log
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      fetch('http://127.0.0.1:7242/ingest/5a2dc156-7002-40c6-bde1-4df847d61e58',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'login/page.tsx:110',message:'LoginPage component rendering',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'D'})}).catch(()=>{});
    }, 0);
  }
  // #endregion
  const SuspenseFallback = () => {
    // #region agent log
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        fetch('http://127.0.0.1:7242/ingest/5a2dc156-7002-40c6-bde1-4df847d61e58',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'login/page.tsx:SuspenseFallback',message:'Suspense fallback rendering',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'D'})}).catch(()=>{});
      }, 0);
    }
    // #endregion
    return (
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-md mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  };
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <LoginContent />
    </Suspense>
  );
}

