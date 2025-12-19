'use client';

import { useMemo, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, Store } from 'lucide-react';
import { useDashboardData } from '@/lib/hooks/useDashboardData';
import { StatsCard } from '@/components/admin/StatsCard';
import { ChartCard } from '@/components/admin/ChartCard';
import { StatsCardSkeleton, ChartCardSkeleton, InfoCardSkeleton } from '@/components/admin/SkeletonLoader';

// Lazy load chart components
let LineChart: any, PieChart: any, Pie: any, Cell: any, XAxis: any, YAxis: any, CartesianGrid: any, Tooltip: any, Legend: any, Line: any;
try {
  const recharts = require('recharts');
  LineChart = recharts.LineChart;
  PieChart = recharts.PieChart;
  Pie = recharts.Pie;
  Cell = recharts.Cell;
  XAxis = recharts.XAxis;
  YAxis = recharts.YAxis;
  CartesianGrid = recharts.CartesianGrid;
  Tooltip = recharts.Tooltip;
  Legend = recharts.Legend;
  Line = recharts.Line;
} catch {
  // Recharts not installed - will show placeholder
}

const COLORS = ['#D4AF37', '#8B6914', '#F5D76E', '#B8941D', '#E6C866'];

export default function AdminDashboard() {
  const router = useRouter();
  const { stats, revenue, isLoading, isError, error } = useDashboardData('month');

  // Memoize order status data to prevent recalculation
  const orderStatusData = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.orders.by_status).map(([name, value]) => ({
      name,
      value,
    }));
  }, [stats]);

  if (isError) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-red-400 shadow-lg">
        <h3 className="font-semibold mb-2">Error loading dashboard</h3>
        <p>{error instanceof Error ? error.message : 'Failed to load dashboard data'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-gray-400 text-lg">Welcome back! Here's what's happening with your store today.</p>
        </div>
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gold-600 hover:bg-gold-700 text-black font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl"
        >
          <Store className="w-5 h-5" />
          View Store
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : stats ? (
          <>
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '0ms' }}>
              <StatsCard
                title="Total Revenue"
                value={`${stats.revenue.total.toLocaleString()} MAD`}
                icon={DollarSign}
                trend={{
                  value: revenue?.growth_percentage || 0,
                  isPositive: (revenue?.growth_percentage || 0) >= 0,
                }}
                subtitle="All time"
              />
            </div>
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '100ms' }}>
              <StatsCard
                title="Total Orders"
                value={stats.orders.total.toLocaleString()}
                icon={ShoppingCart}
                subtitle={`${stats.orders.today} today`}
              />
            </div>
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '200ms' }}>
              <StatsCard
                title="Total Users"
                value={stats.users.total.toLocaleString()}
                icon={Users}
                subtitle={`${stats.users.new_month} new this month`}
              />
            </div>
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '300ms' }}>
              <StatsCard
                title="Products"
                value={stats.products.total.toLocaleString()}
                icon={Package}
                subtitle={`${stats.products.active} active`}
              />
            </div>
          </>
        ) : null}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        {isLoading ? (
          <ChartCardSkeleton />
        ) : (
          <ChartCard title="Revenue Trend (Last 30 Days)">
            {revenue && revenue.trend.length > 0 ? (
              LineChart ? (
                <LineChart width={500} height={300} data={revenue.trend}>
                  {CartesianGrid && <CartesianGrid strokeDasharray="3 3" stroke="#333" />}
                  {XAxis && <XAxis dataKey="date" stroke="#666" />}
                  {YAxis && <YAxis stroke="#666" />}
                  {Tooltip && <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #D4AF37' }} />}
                  {Legend && <Legend />}
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  {Line && (
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#D4AF37"
                      strokeWidth={2}
                      fill="url(#colorRevenue)"
                    />
                  )}
                </LineChart>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <p className="mb-2">Recharts not installed</p>
                    <p className="text-sm">Run: npm install recharts</p>
                  </div>
                </div>
              )
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No data available
              </div>
            )}
          </ChartCard>
        )}

        {/* Order Status Distribution */}
        {isLoading ? (
          <ChartCardSkeleton />
        ) : (
          <ChartCard title="Order Status Distribution">
            {orderStatusData.length > 0 ? (
              PieChart ? (
                <PieChart width={500} height={300}>
                  {Tooltip && <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #D4AF37' }} />}
                  {Legend && <Legend />}
                  {Pie && (
                    <Pie
                      data={orderStatusData}
                      cx={250}
                      cy={150}
                      labelLine={false}
                      label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  )}
                </PieChart>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <p className="mb-2">Recharts not installed</p>
                    <p className="text-sm">Run: npm install recharts</p>
                  </div>
                </div>
              )
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No data available
              </div>
            )}
          </ChartCard>
        )}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading ? (
          <>
            <InfoCardSkeleton />
            <InfoCardSkeleton />
            <InfoCardSkeleton />
          </>
        ) : stats ? (
          <>
            <div className="bg-black-100 rounded-xl border border-gold-600/10 p-6 hover:border-gold-600/20 transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-gold-600/5">
              <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                <Package className="w-5 h-5 text-gold-600" />
                Stock Alerts
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10 hover:bg-yellow-500/10 transition-colors">
                  <span className="text-gray-400 text-sm">Low Stock</span>
                  <span className="text-yellow-400 font-semibold text-lg">{stats.products.low_stock}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-colors">
                  <span className="text-gray-400 text-sm">Out of Stock</span>
                  <span className="text-red-400 font-semibold text-lg">{stats.products.out_of_stock}</span>
                </div>
              </div>
            </div>

            <div className="bg-black-100 rounded-xl border border-gold-600/10 p-6 hover:border-gold-600/20 transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-gold-600/5">
              <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-gold-600" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-black-50/50 transition-colors">
                  <span className="text-gray-400 text-sm">{stats.orders.today} orders today</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-black-50/50 transition-colors">
                  <span className="text-gray-400 text-sm">{stats.users.new_today} new users today</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-black-50/50 transition-colors">
                  <span className="text-gray-400 text-sm">{stats.revenue.today.toLocaleString()} MAD revenue today</span>
                </div>
              </div>
            </div>

            <div className="bg-black-100 rounded-xl border border-gold-600/10 p-6 hover:border-gold-600/20 transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-gold-600/5">
              <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-gold-600" />
                Payment Methods
              </h3>
              <div className="space-y-2">
                {Object.entries(stats.payment_methods).length > 0 ? (
                  Object.entries(stats.payment_methods).map(([method, count]) => (
                    <div key={method} className="flex justify-between items-center p-2 rounded-lg hover:bg-black-50/50 transition-colors">
                      <span className="text-gray-400 capitalize text-sm">{method}</span>
                      <span className="text-white font-semibold">{count}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-sm text-center py-4">No payment data available</div>
                )}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
