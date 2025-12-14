'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Search, UserPlus, Trash2, Shield, User } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { DataTable } from '@/components/admin/DataTable';
import type { AdminUser } from '@/lib/api/admin';
import { useToast } from '@/components/ui/Toast';

export default function AdminUsersPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    role: 'customer',
  });
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, [page, search]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminApi.listUsers({ page, per_page: 20, search: search || undefined });
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch (error: any) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!formData.email || !formData.password || !formData.name) {
      showToast({
        message: 'Please fill in all required fields',
        type: 'error',
      });
      return;
    }

    try {
      setCreating(true);
      await adminApi.createUser(formData);
      showToast({
        message: 'User created successfully',
        type: 'success',
      });
      setShowCreateForm(false);
      setFormData({
        email: '',
        password: '',
        name: '',
        phone: '',
        role: 'customer',
      });
      loadUsers();
    } catch (error: any) {
      showToast({
        message: 'Failed to create user: ' + (error.response?.data?.detail || error.message),
        type: 'error',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'customer' | 'admin') => {
    try {
      setUpdatingRole(userId);
      await adminApi.updateUserRole(userId, newRole);
      showToast({
        message: `User role updated to ${newRole}`,
        type: 'success',
      });
      loadUsers();
    } catch (error: any) {
      showToast({
        message: 'Failed to update role: ' + (error.response?.data?.detail || error.message),
        type: 'error',
      });
    } finally {
      setUpdatingRole(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (deleteConfirm !== userId) {
      setDeleteConfirm(userId);
      return;
    }

    try {
      setDeletingUser(userId);
      await adminApi.deleteUser(userId);
      showToast({
        message: 'User deleted successfully',
        type: 'success',
      });
      setDeleteConfirm(null);
      loadUsers();
    } catch (error: any) {
      showToast({
        message: 'Failed to delete user: ' + (error.response?.data?.detail || error.message),
        type: 'error',
      });
    } finally {
      setDeletingUser(null);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (user: AdminUser) => (
        <div>
          <div className="font-medium text-white">{user.name || 'N/A'}</div>
          <div className="text-xs text-gray-400">{user.email || 'No email'}</div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (user: AdminUser) => (
        <div className="flex items-center gap-2">
          <select
            value={user.role}
            onChange={(e) => handleRoleChange(user.id, e.target.value as 'customer' | 'admin')}
            disabled={updatingRole === user.id}
            onClick={(e) => e.stopPropagation()}
            className={`px-2 py-1 rounded text-xs border ${
              user.role === 'admin' 
                ? 'bg-gold-600/20 text-gold-600 border-gold-600/30' 
                : 'bg-gray-600/20 text-gray-400 border-gray-600/30'
            } focus:outline-none focus:ring-1 focus:ring-gold-600/50 disabled:opacity-50`}
          >
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
          </select>
          {updatingRole === user.id && (
            <span className="text-xs text-gray-500">Updating...</span>
          )}
        </div>
      ),
    },
    {
      key: 'order_count',
      header: 'Orders',
      render: (user: AdminUser) => (
        <span className="text-gray-400">{user.order_count || 0}</span>
      ),
    },
    {
      key: 'total_spent',
      header: 'Total Spent',
      render: (user: AdminUser) => (
        <span className="text-gold-600">{(user.total_spent || 0).toLocaleString()} MAD</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (user: AdminUser) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/admin/users/${user.id}`);
            }}
            className="p-2 rounded-lg bg-gold-600/20 hover:bg-gold-600/30 text-gold-600 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteUser(user.id);
            }}
            disabled={deletingUser === user.id}
            className={`p-2 rounded-lg transition-colors ${
              deleteConfirm === user.id
                ? 'bg-red-600/30 hover:bg-red-600/40 text-red-400'
                : 'bg-red-600/20 hover:bg-red-600/30 text-red-400'
            } disabled:opacity-50`}
            title={deleteConfirm === user.id ? 'Click again to confirm' : 'Delete User'}
          >
            {deletingUser === user.id ? (
              <span className="text-xs">...</span>
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Users</h1>
          <p className="text-gray-400">Manage user accounts</p>
        </div>
        <div className="flex items-center gap-4">
          {total > 0 && (
            <div className="text-sm text-gray-400">
              Total: <span className="text-white font-semibold">{total}</span> users
            </div>
          )}
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-gold-600 hover:bg-gold-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Create User
          </button>
        </div>
      </div>

      {showCreateForm && (
        <div className="bg-black-100 rounded-xl border border-gold-600/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Create New User</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 bg-black-50 border border-gold-600/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold-600/30"
                placeholder="user@example.com"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Password *</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 bg-black-50 border border-gold-600/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold-600/30"
                placeholder="Enter password"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-black-50 border border-gold-600/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold-600/30"
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 bg-black-50 border border-gold-600/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold-600/30"
                placeholder="Phone number"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2 bg-black-50 border border-gold-600/10 rounded-lg text-white focus:outline-none focus:border-gold-600/30"
              >
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleCreateUser}
              disabled={creating}
              className="px-4 py-2 bg-gold-600 hover:bg-gold-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create User'}
            </button>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setFormData({
                  email: '',
                  password: '',
                  name: '',
                  phone: '',
                  role: 'customer',
                });
              }}
              className="px-4 py-2 bg-black-50 hover:bg-black-100 border border-gold-600/10 text-gray-400 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-black-50 border border-gold-600/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold-600/30"
          />
        </div>
      </div>

      <DataTable
        data={users}
        columns={columns}
        loading={loading}
        onRowClick={(user) => router.push(`/admin/users/${user.id}`)}
        pagination={{
          page,
          perPage: 20,
          total: total,
          onPageChange: setPage,
        }}
      />
    </div>
  );
}
