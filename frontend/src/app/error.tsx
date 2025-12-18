'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import { extractErrorMessage } from '@/lib/utils/errorHandler';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t, isRTL } = useI18n();

  useEffect(() => {
    // Log error to console for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.error('Error boundary caught:', error);
    }
  }, [error]);

  // Extract and sanitize error message
  const errorMessage = extractErrorMessage(error);
  
  // Map error message to translation key if possible
  let displayMessage = errorMessage;
  
  // Try to match error message to translation keys
  if (errorMessage.includes('network') || errorMessage.includes('Network')) {
    displayMessage = t.errors.network;
  } else if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
    displayMessage = t.errors.timeout;
  } else if (errorMessage.includes('unauthorized') || errorMessage.includes('Unauthorized')) {
    displayMessage = t.errors.unauthorized;
  } else if (errorMessage.includes('forbidden') || errorMessage.includes('Forbidden')) {
    displayMessage = t.errors.forbidden;
  } else if (errorMessage.includes('not found') || errorMessage.includes('Not Found')) {
    displayMessage = t.errors.notFound;
  } else if (errorMessage.includes('validation') || errorMessage.includes('Validation')) {
    displayMessage = t.errors.validation;
  } else {
    // Use generic error message
    displayMessage = t.errors.generic;
  }

  return (
    <div className="container mx-auto px-4 py-24 text-center">
      <h1 className="text-4xl font-bold mb-4" dir={isRTL ? 'rtl' : 'ltr'}>
        {t.errors.serverError || 'Something went wrong!'}
      </h1>
      <p className="text-gray-400 mb-8" dir={isRTL ? 'rtl' : 'ltr'}>
        {displayMessage}
      </p>
      <div className="flex gap-4 justify-center">
        <Button onClick={reset} variant="primary">
          {t.common?.tryAgain || 'Try again'}
        </Button>
        <Link href="/">
          <Button variant="outline">{t.nav?.home || 'Go home'}</Button>
        </Link>
      </div>
    </div>
  );
}

