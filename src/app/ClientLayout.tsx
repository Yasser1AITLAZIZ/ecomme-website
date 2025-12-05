'use client';

import { useState } from 'react';
import { I18nProvider } from '@/lib/i18n/context';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartSidebar } from '@/components/layout/CartSidebar';
import { SplashScreen } from '@/components/animations/SplashScreen';
import { DynamicBackground } from '@/components/animations/DynamicBackground';
import { FloatingElements } from '@/components/animations/FloatingElements';
import { Particles } from '@/components/animations/Particles';
import { AlternatingBackground } from '@/components/animations/AlternatingBackground';
import { CursorTrail } from '@/components/animations/CursorTrail';
import { ScrollProgress } from '@/components/ui/ScrollProgress';
import { ToastProvider } from '@/components/ui/Toast';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { LiveVisitorCounter } from '@/components/ui/LiveVisitorCounter';
import { PriceDropAlert } from '@/components/ui/PriceDropAlert';
import { ScrollToTop } from '@/components/ui/ScrollToTop';
import { ScrollingTickerBar } from '@/components/ui/ScrollingTickerBar';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [showContent, setShowContent] = useState(false);

  return (
    <>
      <SplashScreen onComplete={() => setShowContent(true)} />
      {showContent && (
        <I18nProvider>
          <ToastProvider>
            <CursorTrail />
            <ScrollProgress />
            <LiveVisitorCounter />
            <PriceDropAlert />
            <FloatingActionButton />
            <ScrollToTop />
            <DynamicBackground />
            <Particles />
            <AlternatingBackground />
            <FloatingElements />
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

