'use client';

import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
}

export function StatsCard({ title, value, icon: Icon, trend, subtitle }: StatsCardProps) {
  return (
    <div className="bg-black-100 rounded-xl border border-gold-600/10 p-6 hover:border-gold-600/30 hover:shadow-lg hover:shadow-gold-600/10 transition-all duration-300 group cursor-default">
      <div className="flex items-center justify-between mb-5">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-600/30 to-gold-600/10 flex items-center justify-center border border-gold-600/20 group-hover:scale-110 group-hover:shadow-md group-hover:shadow-gold-600/20 transition-all duration-300">
          <Icon className="w-6 h-6 text-gold-600 group-hover:scale-110 transition-transform duration-300" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
            trend.isPositive 
              ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            <span className="text-base">{trend.isPositive ? '↑' : '↓'}</span>
            <span>{Math.abs(trend.value).toFixed(1)}%</span>
          </div>
        )}
      </div>
      <h3 className="text-gray-400 text-sm font-medium mb-2 uppercase tracking-wide">{title}</h3>
      <p className="text-3xl font-bold text-white mb-2 group-hover:text-gold-600 transition-colors duration-300">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 font-medium">{subtitle}</p>}
    </div>
  );
}
