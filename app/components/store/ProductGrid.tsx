'use client';

import { ProductCard } from './ProductCard';
import type { ProductWithAvailability } from '@/types/product';

interface ProductGridProps {
  products: ProductWithAvailability[];
  children?: (product: ProductWithAvailability) => React.ReactNode;
}

export function ProductGrid({ products, children }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🏪</div>
        <p className="text-xl text-gray-600">No products available</p>
        <p className="text-sm text-gray-500 mt-2">Check back later for new items!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product}>
          {children && children(product)}
        </ProductCard>
      ))}
    </div>
  );
}
