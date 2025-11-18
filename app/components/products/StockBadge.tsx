'use client';

interface StockBadgeProps {
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  quantity: number;
}

export function StockBadge({ stockStatus, quantity }: StockBadgeProps) {
  const styles = {
    in_stock: 'bg-green-100 text-green-800',
    low_stock: 'bg-yellow-100 text-yellow-800',
    out_of_stock: 'bg-red-100 text-red-800',
  };

  const labels = {
    in_stock: 'In Stock',
    low_stock: 'Low Stock',
    out_of_stock: 'Out of Stock',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[stockStatus]}`}>
      {labels[stockStatus]} ({quantity})
    </span>
  );
}

