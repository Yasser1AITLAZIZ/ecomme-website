import type { Metadata } from 'next';
import { Inter, Playfair_Display, Outfit } from 'next/font/google';
import './globals.css';
import { ClientLayout } from './ClientLayout';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ 
  subsets: ['latin'], 
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700', '800'],
});
const outfit = Outfit({ 
  subsets: ['latin'], 
  variable: '--font-outfit',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Primo Store - Premium Smartphones & Accessories',
  description: 'Discover the latest iPhones, Android phones, and premium accessories',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // #region agent log
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      fetch('http://127.0.0.1:7242/ingest/5a2dc156-7002-40c6-bde1-4df847d61e58',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'layout.tsx:30',message:'RootLayout rendering',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'F'})}).catch(()=>{});
    }, 0);
  }
  // #endregion
  return (
    <html lang="en" dir="ltr">
      <body className={`${outfit.variable} ${playfair.variable} ${inter.className} font-sans`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function log(data) {
                  if (typeof window !== 'undefined') {
                    fetch('http://127.0.0.1:7242/ingest/5a2dc156-7002-40c6-bde1-4df847d61e58', {
                      method: 'POST',
                      headers: {'Content-Type': 'application/json'},
                      body: JSON.stringify({
                        location: 'layout.tsx:35',
                        message: data.message || 'RootLayout body script executed',
                        data: Object.assign({pathname: window.location.pathname, readyState: document.readyState}, data.data || {}),
                        timestamp: Date.now(),
                        sessionId: 'debug-session',
                        runId: 'run2',
                        hypothesisId: 'F'
                      })
                    }).catch(function(){});
                  }
                }
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', function() { log({}); });
                } else {
                  setTimeout(function() { log({}); }, 0);
                }
                window.addEventListener('error', function(e) {
                  log({message: 'JavaScript error', data: {error: e.message, filename: e.filename, lineno: e.lineno, colno: e.colno}});
                });
                window.addEventListener('unhandledrejection', function(e) {
                  log({message: 'Unhandled promise rejection', data: {error: e.reason ? (e.reason.message || String(e.reason)) : 'Unknown'}});
                });
              })();
            `,
          }}
        />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}

