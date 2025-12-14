'use client';

import { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function ChartCard({ title, children, className = '' }: ChartCardProps) {
  return (
    <div className={`bg-black-100 rounded-xl border border-gold-600/10 p-6 hover:border-gold-600/20 hover:shadow-lg hover:shadow-gold-600/10 transition-all duration-300 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-6 pb-4 border-b border-gold-600/10">{title}</h3>
      <div className="h-64 flex items-center justify-center">{children}</div>
    </div>
  );
}
