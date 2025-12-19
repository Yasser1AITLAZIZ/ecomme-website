'use client';

export function StatsCardSkeleton() {
  return (
    <div className="bg-black-100 rounded-xl border border-gold-600/10 p-6 animate-pulse">
      <div className="flex items-center justify-between mb-5">
        <div className="w-12 h-12 rounded-xl bg-gold-600/20"></div>
        <div className="w-16 h-6 rounded-full bg-gold-600/20"></div>
      </div>
      <div className="h-4 w-24 bg-gold-600/20 rounded mb-2"></div>
      <div className="h-8 w-32 bg-gold-600/20 rounded mb-2"></div>
      <div className="h-3 w-20 bg-gold-600/10 rounded"></div>
    </div>
  );
}

export function ChartCardSkeleton() {
  return (
    <div className="bg-black-100 rounded-xl border border-gold-600/10 p-6 animate-pulse">
      <div className="h-6 w-48 bg-gold-600/20 rounded mb-6"></div>
      <div className="h-64 bg-gold-600/10 rounded"></div>
    </div>
  );
}

export function InfoCardSkeleton() {
  return (
    <div className="bg-black-100 rounded-xl border border-gold-600/10 p-6 animate-pulse">
      <div className="h-6 w-32 bg-gold-600/20 rounded mb-5"></div>
      <div className="space-y-3">
        <div className="h-12 bg-gold-600/10 rounded-lg"></div>
        <div className="h-12 bg-gold-600/10 rounded-lg"></div>
        <div className="h-12 bg-gold-600/10 rounded-lg"></div>
      </div>
    </div>
  );
}
