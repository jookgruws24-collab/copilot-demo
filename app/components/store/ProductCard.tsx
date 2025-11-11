'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import type { ProductWithAvailability } from '@/types/product';

interface ProductCardProps {
  product: ProductWithAvailability;
  children?: React.ReactNode;
}

export function ProductCard({ product, children }: ProductCardProps) {
  const stockBadge = () => {
    if (product.stock_status === 'out_of_stock') {
      return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">Out of Stock</span>;
    }
    if (product.stock_status === 'low_stock') {
      return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">Low Stock ({product.quantity} left)</span>;
    }
    return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">In Stock</span>;
  };

  return (
    <Card className={`hover:shadow-xl transition-shadow ${!product.is_available ? 'opacity-60' : ''}`}>
      {product.image_url && (
        <div className="w-full h-48 bg-gray-200 rounded-t-lg overflow-hidden">
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{product.name}</CardTitle>
          {stockBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-gray-600">{product.description}</p>
        
        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex items-center gap-2">
            <span className="text-3xl">💎</span>
            <span className="text-2xl font-bold text-purple-600">{product.diamond_price}</span>
          </div>
          
          <div className="text-sm text-gray-500">
            {product.quantity > 0 ? `${product.quantity} available` : 'Sold out'}
          </div>
        </div>
        
        {children}
      </CardContent>
    </Card>
  );
}
