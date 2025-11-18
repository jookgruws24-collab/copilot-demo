'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { ProductForm } from '@/components/products/ProductForm';
import { toast } from '@/lib/utils/toast';
import type { Product } from '@/types/product';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch(`/api/products/${params.id}`, {
          credentials: 'include',
        });
        const data = await response.json();

        if (response.ok) {
          setProduct(data.data);
        } else {
          setError(data.error || 'Failed to load product');
        }
      } catch (error) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const handleSuccess = () => {
    toast.success('Product updated successfully');
    router.push('/admin/products');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="space-y-6">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error || 'Product not found'}</p>
        </div>
        <button
          onClick={() => router.push('/admin/products')}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
        <p className="mt-2 text-gray-600">
          Update product information
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm
            product={product}
            onSuccess={handleSuccess}
            onCancel={() => router.push('/admin/products')}
          />
        </CardContent>
      </Card>
    </div>
  );
}

