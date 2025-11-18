'use client';

import { useState, useEffect } from 'react';
import { Button, Input } from '@/components/ui';
import type { Product, ProductCreate, ProductUpdate } from '@/types/product';

interface ProductFormProps {
  product?: Product;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductCreate | ProductUpdate>({
    name: product?.name || '',
    description: product?.description || '',
    diamond_price: product?.diamond_price || 1,
    quantity: product?.quantity || 0,
    image_url: product?.image_url || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Update form data when product prop changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        diamond_price: product.diamond_price || 1,
        quantity: product.quantity || 0,
        image_url: product.image_url || '',
      });
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'diamond_price' || name === 'quantity' 
        ? parseInt(value) || 0 
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = product
        ? `/api/products/${product.id}`
        : '/api/products';
      const method = product ? 'PUT' : 'POST';

      // Prepare data - for updates, send all fields; for creates, send all required fields
      let requestData: any;
      if (product) {
        // For updates, send all fields (API will only update what's provided)
        const imageUrl = formData.image_url ? String(formData.image_url).trim() : '';
        requestData = {
          name: String(formData.name || '').trim(),
          description: String(formData.description || '').trim(),
          diamond_price: Number(formData.diamond_price) || 1,
          quantity: Number(formData.quantity) || 0,
          image_url: imageUrl || null,
        };
      } else {
        // For creates, send all required fields
        const imageUrl = formData.image_url ? String(formData.image_url).trim() : '';
        requestData = {
          name: String(formData.name || '').trim(),
          description: String(formData.description || '').trim(),
          diamond_price: Number(formData.diamond_price) || 1,
          quantity: Number(formData.quantity) || 0,
          image_url: imageUrl || undefined,
        };
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || data.message || `Failed to save product (${response.status})`;
        console.error('Product save error:', { status: response.status, data });
        throw new Error(errorMessage);
      }

      if (onSuccess) onSuccess();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save product';
      console.error('Product save exception:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Product Name"
        name="name"
        value={formData.name as string}
        onChange={handleChange}
        required
        maxLength={200}
      />

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description as string}
          onChange={handleChange}
          required
          rows={4}
          maxLength={1000}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Diamond Price"
          name="diamond_price"
          type="number"
          min="1"
          value={formData.diamond_price as number}
          onChange={handleChange}
          required
        />

        <Input
          label="Quantity"
          name="quantity"
          type="number"
          min="0"
          value={formData.quantity as number}
          onChange={handleChange}
          required
        />
      </div>

      <Input
        label="Image URL (Optional)"
        name="image_url"
        type="url"
        value={formData.image_url as string || ''}
        onChange={handleChange}
        placeholder="https://example.com/image.jpg"
      />

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button type="submit" loading={loading} className="flex-1">
          {product ? 'Update Product' : 'Create Product'}
        </Button>
        {onCancel && (
          <Button type="button" onClick={onCancel} variant="secondary">
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

