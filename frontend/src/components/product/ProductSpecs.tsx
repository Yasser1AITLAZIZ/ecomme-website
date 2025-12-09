'use client';

import type { Product } from '@/types';

interface ProductSpecsProps {
  product: Product;
}

export function ProductSpecs({ product }: ProductSpecsProps) {
  if (!product.specifications || Object.keys(product.specifications).length === 0) {
    return null;
  }

  return (
    <div className="bg-black-100 rounded-lg p-6 border border-gold-600/10">
      <h3 className="text-xl font-bold text-gold-600 mb-4">Specifications</h3>
      <dl className="space-y-3">
        {Object.entries(product.specifications).map(([key, value]) => (
          <div key={key} className="flex justify-between items-start py-2 border-b border-gold-600/10 last:border-0">
            <dt className="text-gray-400 font-medium">{key}</dt>
            <dd className="text-white text-right max-w-[60%]">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

