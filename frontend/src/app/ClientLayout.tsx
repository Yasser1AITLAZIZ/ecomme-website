'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { I18nProvider } from '@/lib/i18n/context';
import { QueryProvider } from '@/lib/providers/QueryProvider';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartSidebar } from '@/components/layout/CartSidebar';
import { ScrollProgress } from '@/components/ui/ScrollProgress';
import { ToastProvider } from '@/components/ui/Toast';
import { ScrollToTop } from '@/components/ui/ScrollToTop';
import { ScrollingTickerBar } from '@/components/ui/ScrollingTickerBar';
import { isMobile, prefersReducedMotion } from '@/lib/utils/device';
import { useCartStore } from '@/lib/store/cartStore';
import { useAuthStore } from '@/lib/store/authStore';

// Lazy load heavy animation components
const DynamicBackground = lazy(() => import('@/components/animations/DynamicBackground').then(m => ({ default: m.DynamicBackground })));
const Particles = lazy(() => import('@/components/animations/Particles').then(m => ({ default: m.Particles })));
const AlternatingBackground = lazy(() => import('@/components/animations/AlternatingBackground').then(m => ({ default: m.AlternatingBackground })));
const CursorTrail = lazy(() => import('@/components/animations/CursorTrail').then(m => ({ default: m.CursorTrail })));

export function ClientLayout({ children }: { children: React.ReactNode }) {
  // #region agent log
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      fetch('http://127.0.0.1:7242/ingest/5a2dc156-7002-40c6-bde1-4df847d61e58',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ClientLayout.tsx:24',message:'ClientLayout rendering',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'E'})}).catch(()=>{});
    }, 0);
  }
  // #endregion
  const pathname = usePathname();
  // #region agent log
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      fetch('http://127.0.0.1:7242/ingest/5a2dc156-7002-40c6-bde1-4df847d61e58',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ClientLayout.tsx:26',message:'usePathname called',data:{pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'E'})}).catch(()=>{});
    }, 0);
  }
  // #endregion
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const loadCartFromBackend = useCartStore((state) => state.loadCartFromBackend);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Check if current route is an admin route
  const isAdminRoute = pathname?.startsWith('/admin') ?? false;

  useEffect(() => {
    setIsMobileDevice(isMobile());
    setReducedMotion(prefersReducedMotion());
  }, []);

  // Load cart from backend on app initialization
  useEffect(() => {
    // Only load cart for non-admin routes
    if (isAdminRoute) return;
    
    // Small delay to ensure stores are hydrated
    const timer = setTimeout(() => {
      loadCartFromBackend().catch((error) => {
        console.error('Failed to load cart on app initialization:', error);
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [loadCartFromBackend, isAdminRoute]);

  const shouldLoadAnimations = !isMobileDevice && !reducedMotion;

  // For admin routes, skip splash screen, animations, and public layout structure
  if (isAdminRoute) {
    return (
      <QueryProvider>
        <I18nProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </I18nProvider>
      </QueryProvider>
    );
  }

  // Public site layout with animations, header, footer
  return (
    <QueryProvider>
      <I18nProvider>
        <ToastProvider>
          {/* Only load cursor trail on desktop */}
          {shouldLoadAnimations && (
            <Suspense fallback={null}>
              <CursorTrail />
            </Suspense>
          )}
          <ScrollProgress />
          <ScrollToTop />
          {/* Lazy load heavy background animations */}
          {shouldLoadAnimations && (
            <Suspense fallback={null}>
              <DynamicBackground />
              <Particles />
              <AlternatingBackground />
            </Suspense>
          )}
          <ScrollingTickerBar />
          <div className="min-h-screen flex flex-col bg-obsidian-950 text-obsidian-50 relative">
            <Header />
            <main className="flex-1 relative z-10">{children}</main>
            <Footer />
            <CartSidebar />
          </div>
        </ToastProvider>
      </I18nProvider>
    </QueryProvider>
  );
}
