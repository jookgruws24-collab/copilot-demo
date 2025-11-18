'use client';

import Link from 'next/link';
import { StockBadge } from './StockBadge';
import { Button } from '@/components/ui';
import type { ProductWithAvailability } from '@/types/product';

interface ProductRowProps {
  product: ProductWithAvailability;
  onDelete: (id: number) => void;
}

export function ProductRow({ product, onDelete }: ProductRowProps) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{product.name}</div>
        <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {product.diamond_price} 💎
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StockBadge stockStatus={product.stock_status} quantity={product.quantity} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(product.created_at).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex gap-2 justify-end">
          <Link href={`/admin/products/${product.id}/edit`}>
            <Button variant="secondary" size="sm">
              Edit
            </Button>
          </Link>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(product.id)}
          >
            Delete
          </Button>
        </div>
      </td>
    </tr>
  );
}

