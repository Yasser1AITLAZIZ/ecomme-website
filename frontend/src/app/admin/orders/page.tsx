'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Search } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { DataTable } from '@/components/admin/DataTable';
import type { AdminOrder } from '@/lib/api/admin';

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    loadOrders();
  }, [page, search, statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await adminApi.listOrders({
        page,
        per_page: 20,
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setOrders(data);
    } catch (error: any) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'text-yellow-400',
      confirmed: 'text-blue-400',
      processing: 'text-purple-400',
      shipped: 'text-indigo-400',
      delivered: 'text-green-400',
      cancelled: 'text-red-400',
      refunded: 'text-gray-400',
    };
    return colors[status] || 'text-gray-400';
  };

  const columns = [
    {
      key: 'order_number',
      header: 'Order Number',
      render: (order: AdminOrder) => (
        <span className="font-medium text-white">{order.order_number}</span>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (order: AdminOrder) => (
        <div>
          <div className="text-white">{order.customer_name || order.guest_email || 'Guest'}</div>
          {order.guest_email && (
            <div className="text-xs text-gray-400">{order.guest_email}</div>
          )}
        </div>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      render: (order: AdminOrder) => (
        <span className="text-gold-600 font-semibold">{order.total.toLocaleString()} MAD</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (order: AdminOrder) => (
        <span className={`capitalize ${getStatusColor(order.status)}`}>{order.status}</span>
      ),
    },
    {
      key: 'payment_status',
      header: 'Payment',
      render: (order: AdminOrder) => (
        <span className={`capitalize ${
          order.payment_status === 'paid' ? 'text-green-400' : 'text-yellow-400'
        }`}>
          {order.payment_status}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Date',
      render: (order: AdminOrder) => (
        <span className="text-gray-400">
          {new Date(order.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (order: AdminOrder) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/admin/orders/${order.id}`);
          }}
          className="p-2 rounded-lg bg-gold-600/20 hover:bg-gold-600/30 text-gold-600 transition-colors"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Orders</h1>
        <p className="text-gray-400">Manage and track all orders</p>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order number..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-black-50 border border-gold-600/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold-600/30"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 bg-black-50 border border-gold-600/10 rounded-lg text-white focus:outline-none focus:border-gold-600/30"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <DataTable
        data={orders}
        columns={columns}
        loading={loading}
        onRowClick={(order) => router.push(`/admin/orders/${order.id}`)}
        pagination={{
          page,
          perPage: 20,
          total: orders.length,
          onPageChange: setPage,
        }}
      />
    </div>
  );
}
