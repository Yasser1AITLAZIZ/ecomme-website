'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api/admin';
import { ChartCard } from '@/components/admin/ChartCard';
import type { RevenueStats, OrderAnalytics, ProductAnalytics, UserAnalytics } from '@/lib/api/admin';

export default function AdminAnalyticsPage() {
  const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null);
  const [orderAnalytics, setOrderAnalytics] = useState<OrderAnalytics | null>(null);
  const [productAnalytics, setProductAnalytics] = useState<ProductAnalytics | null>(null);
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [revenue, orders, products, users] = await Promise.all([
        adminApi.getRevenueStats(period),
        adminApi.getOrderAnalytics(),
        adminApi.getProductAnalytics(),
        adminApi.getUserAnalytics(),
      ]);
      setRevenueStats(revenue);
      setOrderAnalytics(orders);
      setProductAnalytics(products);
      setUserAnalytics(users);
    } catch (error: any) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-gray-400">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
          <p className="text-gray-400">Detailed analytics and reports</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as any)}
          className="px-4 py-2 bg-black-50 border border-gold-600/10 rounded-lg text-white"
        >
          <option value="day">Day</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
          <option value="year">Year</option>
        </select>
      </div>

      {revenueStats && (
        <ChartCard title="Revenue Analytics">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Total Revenue</span>
              <span className="text-2xl font-bold text-gold-600">
                {revenueStats.total_revenue.toLocaleString()} MAD
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Growth</span>
              <span className={`text-lg ${revenueStats.growth_percentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {revenueStats.growth_percentage >= 0 ? '+' : ''}{revenueStats.growth_percentage.toFixed(2)}%
              </span>
            </div>
          </div>
        </ChartCard>
      )}

      {orderAnalytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-black-100 rounded-xl border border-gold-600/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Total Orders</h3>
            <p className="text-3xl font-bold text-gold-600">{orderAnalytics.total_orders}</p>
          </div>
          <div className="bg-black-100 rounded-xl border border-gold-600/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Total Revenue</h3>
            <p className="text-3xl font-bold text-gold-600">{orderAnalytics.total_revenue.toLocaleString()} MAD</p>
          </div>
          <div className="bg-black-100 rounded-xl border border-gold-600/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Avg Order Value</h3>
            <p className="text-3xl font-bold text-gold-600">{orderAnalytics.average_order_value.toLocaleString()} MAD</p>
          </div>
        </div>
      )}

      {productAnalytics && (
        <div className="bg-black-100 rounded-xl border border-gold-600/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Top Products</h2>
          <div className="space-y-2">
            {productAnalytics.top_products.slice(0, 5).map((product) => (
              <div key={product.product_id} className="flex items-center justify-between p-3 bg-black-50 rounded-lg">
                <span className="text-white">{product.name}</span>
                <span className="text-gold-600 font-semibold">{product.total_revenue.toLocaleString()} MAD</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
