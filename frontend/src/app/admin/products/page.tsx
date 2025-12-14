'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { productsApi } from '@/lib/api/products';
import { DataTable } from '@/components/admin/DataTable';
import type { Product } from '@/types';

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 20;

  useEffect(() => {
    loadProducts();
  }, [page, search]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      // Note: This uses the regular products API - you may want to create an admin-specific endpoint
      const data = await productsApi.getAll({ page, per_page: perPage, search });
      setProducts(data);
    } catch (error: any) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await productsApi.delete(productId);
      loadProducts();
    } catch (error: any) {
      alert('Failed to delete product: ' + error.message);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (product: Product) => (
        <div>
          <div className="font-medium text-white">{product.name}</div>
          <div className="text-xs text-gray-400">SKU: {product.id}</div>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      render: (product: Product) => (
        <span className="text-gold-600 font-semibold">{product.price} MAD</span>
      ),
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (product: Product) => (
        <span className={product.stock > 0 ? 'text-white' : 'text-red-400'}>
          {product.stock}
        </span>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (product: Product) => (
        <span className="text-gray-400 capitalize">{product.category}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (product: Product) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/admin/products/${product.id}`);
            }}
            className="p-2 rounded-lg bg-gold-600/20 hover:bg-gold-600/30 text-gold-600 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(product.id);
            }}
            className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Products</h1>
          <p className="text-gray-400">Manage your product catalog</p>
        </div>
        <button
          onClick={() => router.push('/admin/products/new')}
          className="flex items-center gap-2 px-4 py-2 bg-gold-600 hover:bg-gold-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
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
        data={products}
        columns={columns}
        loading={loading}
        onRowClick={(product) => router.push(`/admin/products/${product.id}`)}
        pagination={{
          page,
          perPage,
          total: products.length, // This should come from API
          onPageChange: setPage,
        }}
      />
    </div>
  );
}
