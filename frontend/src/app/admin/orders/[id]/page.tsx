'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import type { AdminOrderDetail } from '@/lib/api/admin';

export default function AdminOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getOrder(orderId);
      setOrder(data);
      setNewStatus(data.status);
      setAdminNotes(data.admin_notes || '');
    } catch (error: any) {
      alert('Failed to load order: ' + error.message);
      router.push('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      setSaving(true);
      await adminApi.updateOrderStatus(orderId, newStatus);
      await loadOrder();
    } catch (error: any) {
      alert('Failed to update status: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleNotesUpdate = async () => {
    try {
      setSaving(true);
      await adminApi.updateOrderNotes(orderId, adminNotes);
      await loadOrder();
    } catch (error: any) {
      alert('Failed to update notes: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !order) {
    return <div className="text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg bg-black-50 hover:bg-black-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white">Order {order.order_number}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-black-100 rounded-xl border border-gold-600/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-black-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-white">{item.product_name}</div>
                    <div className="text-sm text-gray-400">Quantity: {item.quantity}</div>
                  </div>
                  <div className="text-gold-600 font-semibold">
                    {(item.price * item.quantity).toLocaleString()} MAD
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-black-100 rounded-xl border border-gold-600/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Shipping Address</h2>
            <div className="text-gray-400 space-y-1">
              <p>{order.shipping_address.street}</p>
              <p>{order.shipping_address.city}, {order.shipping_address.state}</p>
              <p>{order.shipping_address.country}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-black-100 rounded-xl border border-gold-600/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span>{order.subtotal.toLocaleString()} MAD</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Shipping</span>
                <span>{order.shipping_cost.toLocaleString()} MAD</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Discount</span>
                <span>-{order.discount_amount.toLocaleString()} MAD</span>
              </div>
              <div className="flex justify-between text-white font-semibold text-lg pt-2 border-t border-gold-600/10">
                <span>Total</span>
                <span className="text-gold-600">{order.total.toLocaleString()} MAD</span>
              </div>
            </div>
          </div>

          <div className="bg-black-100 rounded-xl border border-gold-600/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Update Status</h2>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-4 py-2 bg-black-50 border border-gold-600/10 rounded-lg text-white mb-4"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button
              onClick={handleStatusUpdate}
              disabled={saving || newStatus === order.status}
              className="w-full px-4 py-2 bg-gold-600 hover:bg-gold-700 text-white rounded-lg disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Update Status'}
            </button>
          </div>

          <div className="bg-black-100 rounded-xl border border-gold-600/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Admin Notes</h2>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 bg-black-50 border border-gold-600/10 rounded-lg text-white mb-4"
            />
            <button
              onClick={handleNotesUpdate}
              disabled={saving}
              className="w-full px-4 py-2 bg-gold-600 hover:bg-gold-700 text-white rounded-lg disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
