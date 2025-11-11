'use client';
import { useState, useEffect } from 'react';
import { ProductGrid } from '@/components/store/ProductGrid';
import { PurchaseButton } from '@/components/store/PurchaseButton';
import { DiamondBalance } from '@/components/store/DiamondBalance';
import type { ProductWithAvailability } from '@/types/product';
import type { Employee } from '@/types/employee';

export default function StorePage() {
  const [products, setProducts] = useState<ProductWithAvailability[]>([]);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const emp = await fetch('/api/auth/me', { credentials: 'include' }).then(r => r.json());
        setEmployee(emp.data);
        const prods = await fetch('/api/products', { credentials: 'include' }).then(r => r.json());
        setProducts(prods.data || []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Diamond Store</h1>
        <DiamondBalance balance={employee?.diamond_balance || 0} />
      </div>
      <ProductGrid products={products}>
        {(product) => (
          <PurchaseButton
            productId={product.id}
            productName={product.name}
            price={product.diamond_price}
            currentBalance={employee?.diamond_balance || 0}
            isAvailable={product.is_available}
            onSuccess={() => window.location.reload()}
          />
        )}
      </ProductGrid>
    </div>
  );
}