'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Save, ArrowLeft } from 'lucide-react';
import { productsApi } from '@/lib/api/products';
import type { Product } from '@/types';

export default function AdminProductEditPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const isNew = productId === 'new';

  const [product, setProduct] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: 'iphone',
    brand: '',
    featured: false,
  });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isNew) {
      loadProduct();
    }
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await productsApi.getById(productId);
      if (data) {
        setProduct(data);
      } else {
        alert('Product not found');
        router.push('/admin/products');
      }
    } catch (error: any) {
      alert('Failed to load product: ' + error.message);
      router.push('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (isNew) {
        await productsApi.create(product as any);
      } else {
        await productsApi.update(productId, product as any);
      }
      router.push('/admin/products');
    } catch (error: any) {
      alert('Failed to save product: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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
          <h1 className="text-3xl font-bold text-white">
            {isNew ? 'Create Product' : 'Edit Product'}
          </h1>
        </div>
      </div>

      <div className="bg-black-100 rounded-xl border border-gold-600/10 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Name</label>
          <input
            type="text"
            value={product.name || ''}
            onChange={(e) => setProduct({ ...product, name: e.target.value })}
            className="w-full px-4 py-2 bg-black-50 border border-gold-600/10 rounded-lg text-white focus:outline-none focus:border-gold-600/30"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
          <textarea
            value={product.description || ''}
            onChange={(e) => setProduct({ ...product, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 bg-black-50 border border-gold-600/10 rounded-lg text-white focus:outline-none focus:border-gold-600/30"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Price (MAD)</label>
            <input
              type="number"
              value={product.price || 0}
              onChange={(e) => setProduct({ ...product, price: parseFloat(e.target.value) })}
              className="w-full px-4 py-2 bg-black-50 border border-gold-600/10 rounded-lg text-white focus:outline-none focus:border-gold-600/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Stock</label>
            <input
              type="number"
              value={product.stock || 0}
              onChange={(e) => setProduct({ ...product, stock: parseInt(e.target.value) })}
              className="w-full px-4 py-2 bg-black-50 border border-gold-600/10 rounded-lg text-white focus:outline-none focus:border-gold-600/30"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
            <select
              value={product.category || 'iphone'}
              onChange={(e) => setProduct({ ...product, category: e.target.value as any })}
              className="w-full px-4 py-2 bg-black-50 border border-gold-600/10 rounded-lg text-white focus:outline-none focus:border-gold-600/30"
            >
              <option value="iphone">iPhone</option>
              <option value="android">Android</option>
              <option value="accessories">Accessories</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Brand</label>
            <input
              type="text"
              value={product.brand || ''}
              onChange={(e) => setProduct({ ...product, brand: e.target.value })}
              className="w-full px-4 py-2 bg-black-50 border border-gold-600/10 rounded-lg text-white focus:outline-none focus:border-gold-600/30"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="featured"
            checked={product.featured || false}
            onChange={(e) => setProduct({ ...product, featured: e.target.checked })}
            className="w-4 h-4 rounded border-gold-600/30 bg-black-50 text-gold-600 focus:ring-gold-600"
          />
          <label htmlFor="featured" className="text-sm text-gray-400">
            Featured Product
          </label>
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={() => router.back()}
            className="px-6 py-2 border border-gold-600/30 text-gray-400 rounded-lg hover:bg-black-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-gold-600 hover:bg-gold-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
