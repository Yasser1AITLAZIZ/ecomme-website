'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import type { Category } from '@/lib/api/admin';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    is_active: true,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await adminApi.listCategories();
      setCategories(data);
    } catch (error: any) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await adminApi.updateCategory(editingCategory.id, formData);
      } else {
        await adminApi.createCategory(formData);
      }
      setShowForm(false);
      setEditingCategory(null);
      setFormData({ name: '', slug: '', description: '', is_active: true });
      loadCategories();
    } catch (error: any) {
      alert('Failed to save category: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await adminApi.deleteCategory(id);
      loadCategories();
    } catch (error: any) {
      alert('Failed to delete category: ' + error.message);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      is_active: category.is_active,
    });
    setShowForm(true);
  };

  if (loading) {
    return <div className="text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Categories</h1>
          <p className="text-gray-400">Manage product categories</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingCategory(null);
            setFormData({ name: '', slug: '', description: '', is_active: true });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gold-600 hover:bg-gold-700 text-white rounded-lg"
        >
          <Plus className="w-5 h-5" />
          Add Category
        </button>
      </div>

      {showForm && (
        <div className="bg-black-100 rounded-xl border border-gold-600/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            {editingCategory ? 'Edit Category' : 'Create Category'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-black-50 border border-gold-600/10 rounded-lg text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-2 bg-black-50 border border-gold-600/10 rounded-lg text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 bg-black-50 border border-gold-600/10 rounded-lg text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 rounded border-gold-600/30 bg-black-50 text-gold-600"
              />
              <label htmlFor="is_active" className="text-sm text-gray-400">
                Active
              </label>
            </div>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingCategory(null);
                }}
                className="px-6 py-2 border border-gold-600/30 text-gray-400 rounded-lg hover:bg-black-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-gold-600 hover:bg-gold-700 text-white rounded-lg"
              >
                {editingCategory ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-black-100 rounded-xl border border-gold-600/10 overflow-hidden">
        <table className="w-full">
          <thead className="bg-black-50 border-b border-gold-600/10">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Slug</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gold-600/10">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-black-50">
                <td className="px-6 py-4 text-white">{category.name}</td>
                <td className="px-6 py-4 text-gray-400">{category.slug}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    category.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {category.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-2 rounded-lg bg-gold-600/20 hover:bg-gold-600/30 text-gold-600"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
