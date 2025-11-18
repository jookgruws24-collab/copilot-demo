'use client';

import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { ProductForm } from '@/components/products/ProductForm';
import { toast } from '@/lib/utils/toast';

export default function CreateProductPage() {
  const router = useRouter();

  const handleSuccess = () => {
    toast.success('Product created successfully');
    router.push('/admin/products');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Product</h1>
        <p className="mt-2 text-gray-600">
          Add a new product to the store catalog
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm
            onSuccess={handleSuccess}
            onCancel={() => router.push('/admin/products')}
          />
        </CardContent>
      </Card>
    </div>
  );
}

