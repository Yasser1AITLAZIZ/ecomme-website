'use client';

import { useEffect, useState } from 'react';
import { DollarSign, ShoppingCart, Users, Package, TrendingUp } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { StatsCard } from '@/components/admin/StatsCard';
import { ChartCard } from '@/components/admin/ChartCard';
import type { DashboardStats, RevenueStats } from '@/lib/api/admin';

// Note: Install recharts with: npm install recharts
// For now, using a placeholder for charts
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

export default function AdminDashboard() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [stats, revenue] = await Promise.all([
        adminApi.getDashboardStats(),
        adminApi.getRevenueStats('month'),
      ]);
      setDashboardStats(stats);
      setRevenueStats(revenue);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-gold-600/30 border-t-gold-600 rounded-full animate-spin"></div>
          <div className="text-gray-400">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-red-400 shadow-lg">
        <h3 className="font-semibold mb-2">Error loading dashboard</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!dashboardStats) {
    return null;
  }

  // Prepare order status data for pie chart
  const orderStatusData = Object.entries(dashboardStats.orders.by_status).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = ['#D4AF37', '#8B6914', '#F5D76E', '#B8941D', '#E6C866'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-gray-400 text-lg">Welcome back! Here's what's happening with your store today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '0ms' }}>
          <StatsCard
            title="Total Revenue"
            value={`${dashboardStats.revenue.total.toLocaleString()} MAD`}
            icon={DollarSign}
            trend={{
              value: revenueStats?.growth_percentage || 0,
              isPositive: (revenueStats?.growth_percentage || 0) >= 0,
            }}
            subtitle="All time"
          />
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '100ms' }}>
          <StatsCard
            title="Total Orders"
            value={dashboardStats.orders.total.toLocaleString()}
            icon={ShoppingCart}
            subtitle={`${dashboardStats.orders.today} today`}
          />
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '200ms' }}>
          <StatsCard
            title="Total Users"
            value={dashboardStats.users.total.toLocaleString()}
            icon={Users}
            subtitle={`${dashboardStats.users.new_month} new this month`}
          />
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '300ms' }}>
          <StatsCard
            title="Products"
            value={dashboardStats.products.total.toLocaleString()}
            icon={Package}
            subtitle={`${dashboardStats.products.active} active`}
          />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <ChartCard title="Revenue Trend (Last 30 Days)">
          {revenueStats && revenueStats.trend.length > 0 ? (
            LineChart ? (
              <LineChart width={500} height={300} data={revenueStats.trend}>
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

        {/* Order Status Distribution */}
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
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-black-100 rounded-xl border border-gold-600/10 p-6 hover:border-gold-600/20 transition-all duration-200 shadow-lg hover:shadow-xl">
          <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <Package className="w-5 h-5 text-gold-600" />
            Stock Alerts
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
              <span className="text-gray-400 text-sm">Low Stock</span>
              <span className="text-yellow-400 font-semibold text-lg">{dashboardStats.products.low_stock}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-red-500/5 border border-red-500/10">
              <span className="text-gray-400 text-sm">Out of Stock</span>
              <span className="text-red-400 font-semibold text-lg">{dashboardStats.products.out_of_stock}</span>
            </div>
          </div>
        </div>

        <div className="bg-black-100 rounded-xl border border-gold-600/10 p-6 hover:border-gold-600/20 transition-all duration-200 shadow-lg hover:shadow-xl">
          <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gold-600" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-black-50/50 transition-colors">
              <span className="text-gray-400 text-sm">{dashboardStats.orders.today} orders today</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-black-50/50 transition-colors">
              <span className="text-gray-400 text-sm">{dashboardStats.users.new_today} new users today</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-black-50/50 transition-colors">
              <span className="text-gray-400 text-sm">{dashboardStats.revenue.today.toLocaleString()} MAD revenue today</span>
            </div>
          </div>
        </div>

        <div className="bg-black-100 rounded-xl border border-gold-600/10 p-6 hover:border-gold-600/20 transition-all duration-200 shadow-lg hover:shadow-xl">
          <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-gold-600" />
            Payment Methods
          </h3>
          <div className="space-y-2">
            {Object.entries(dashboardStats.payment_methods).map(([method, count]) => (
              <div key={method} className="flex justify-between items-center p-2 rounded-lg hover:bg-black-50/50 transition-colors">
                <span className="text-gray-400 capitalize text-sm">{method}</span>
                <span className="text-white font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
