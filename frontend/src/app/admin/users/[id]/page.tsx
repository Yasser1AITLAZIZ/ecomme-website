'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import type { AdminUserDetail } from '@/lib/api/admin';

export default function AdminUserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'customer' | 'admin'>('customer');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUser();
  }, [userId]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getUser(userId);
      setUser(data);
      setName(data.name || '');
      setPhone(data.phone || '');
      setRole(data.role as 'customer' | 'admin');
    } catch (error: any) {
      alert('Failed to load user: ' + error.message);
      router.push('/admin/users');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await adminApi.updateUser(userId, { name, phone, role });
      await loadUser();
    } catch (error: any) {
      alert('Failed to update user: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
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
          <h1 className="text-3xl font-bold text-white">User Details</h1>
        </div>
      </div>

      <div className="bg-black-100 rounded-xl border border-gold-600/10 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 bg-black-50 border border-gold-600/10 rounded-lg text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
          <input
            type="email"
            value={user.email || ''}
            disabled
            className="w-full px-4 py-2 bg-black-50 border border-gold-600/10 rounded-lg text-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Phone</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-2 bg-black-50 border border-gold-600/10 rounded-lg text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'customer' | 'admin')}
            className="w-full px-4 py-2 bg-black-50 border border-gold-600/10 rounded-lg text-white"
          >
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={() => router.back()}
            className="px-6 py-2 border border-gold-600/30 text-gray-400 rounded-lg hover:bg-black-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-gold-600 hover:bg-gold-700 text-white rounded-lg disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
