'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { useI18n } from '@/lib/i18n/context';

interface SafeImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export function SafeImage({
  src,
  alt,
  fill,
  width,
  height,
  className,
  priority,
}: SafeImageProps) {
  const { t } = useI18n();
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={cn(
          'bg-black-50 flex items-center justify-center text-gray-600 text-sm',
          fill ? 'absolute inset-0' : `w-${width} h-${height}`,
          className
        )} 
      >
        {t.products.noImage}
      </div>
    );
  }

  try {
    return (
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={width}
        height={height}
        className={className}
        priority={priority}
        onError={() => setHasError(true)}
      />
    );
  } catch (error) {
    return (
      <div
        className={cn(
          'bg-black-50 flex items-center justify-center text-gray-600 text-sm',
          fill ? 'absolute inset-0' : `w-${width} h-${height}`,
          className
        )}
      >
        {t.products.noImage}
      </div>
    );
  }
}

