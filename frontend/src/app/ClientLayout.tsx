'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import { I18nProvider } from '@/lib/i18n/context';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartSidebar } from '@/components/layout/CartSidebar';
import { SplashScreen } from '@/components/animations/SplashScreen';
import { ScrollProgress } from '@/components/ui/ScrollProgress';
import { ToastProvider } from '@/components/ui/Toast';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { LiveVisitorCounter } from '@/components/ui/LiveVisitorCounter';
import { PriceDropAlert } from '@/components/ui/PriceDropAlert';
import { ScrollToTop } from '@/components/ui/ScrollToTop';
import { ScrollingTickerBar } from '@/components/ui/ScrollingTickerBar';
import { isMobile, prefersReducedMotion } from '@/lib/utils/device';

// Lazy load heavy animation components
const DynamicBackground = lazy(() => import('@/components/animations/DynamicBackground').then(m => ({ default: m.DynamicBackground })));
const FloatingElements = lazy(() => import('@/components/animations/FloatingElements').then(m => ({ default: m.FloatingElements })));
const Particles = lazy(() => import('@/components/animations/Particles').then(m => ({ default: m.Particles })));
const AlternatingBackground = lazy(() => import('@/components/animations/AlternatingBackground').then(m => ({ default: m.AlternatingBackground })));
const CursorTrail = lazy(() => import('@/components/animations/CursorTrail').then(m => ({ default: m.CursorTrail })));

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [showContent, setShowContent] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setIsMobileDevice(isMobile());
    setReducedMotion(prefersReducedMotion());
  }, []);

  const shouldLoadAnimations = !isMobileDevice && !reducedMotion;

  return (
    <>
      <SplashScreen onComplete={() => setShowContent(true)} />
      {showContent && (
        <I18nProvider>
          <ToastProvider>
            {/* Only load cursor trail on desktop */}
            {shouldLoadAnimations && (
              <Suspense fallback={null}>
                <CursorTrail />
              </Suspense>
            )}
            <ScrollProgress />
            <LiveVisitorCounter />
            <PriceDropAlert />
            <FloatingActionButton />
            <ScrollToTop />
            {/* Lazy load heavy background animations */}
            {shouldLoadAnimations && (
              <Suspense fallback={null}>
                <DynamicBackground />
                <Particles />
                <AlternatingBackground />
                <FloatingElements />
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
      )}
    </>
  );
}

