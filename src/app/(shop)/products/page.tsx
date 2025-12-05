'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/product/ProductCard';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { useI18n } from '@/lib/i18n/context';
import { productsApi } from '@/lib/api/products';
import type { Product } from '@/types';
import { Input } from '@/components/ui/Input';
import { Search, Filter } from 'lucide-react';

function ProductsContent() {
  const { t, isRTL } = useI18n();
  const searchParams = useSearchParams();
  const category = searchParams.get('category') as Product['category'] | null;
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const data = category
          ? await productsApi.getByCategory(category)
          : await productsApi.getAll();
        setProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [category]);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  const categories: Array<{ value: Product['category'] | 'all'; label: string }> = [
    { value: 'all', label: t.products.allProducts },
    { value: 'iphone', label: t.nav.iphone },
    { value: 'android', label: t.nav.android },
    { value: 'accessories', label: t.nav.accessories },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <ScrollReveal>
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t.products.title} <span className="text-gold-600">{t.products.titleHighlight}</span>
          </h1>
          <p className="text-gray-400 text-lg">
            {t.products.subtitle}
          </p>
        </div>
      </ScrollReveal>

      {/* Filters and Search */}
      <ScrollReveal delay={0.1}>
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className={`flex-1 relative ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`} />
              <Input
                type="text"
                placeholder={t.products.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={isRTL ? 'pr-12' : 'pl-12'}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <a
                key={cat.value}
                href={cat.value === 'all' ? '/products' : `/products?category=${cat.value}`}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  (category === cat.value) || (!category && cat.value === 'all')
                    ? 'bg-gold-600 text-black border-gold-600'
                    : 'bg-black-100 text-gray-300 border-gold-600/20 hover:border-gold-600/50'
                }`}
              >
                {cat.label}
              </a>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-24">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-gray-400 text-xl">{t.products.noProducts}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <ScrollReveal key={product.id} delay={index * 0.05}>
              <ProductCard product={product} />
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600" />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}

