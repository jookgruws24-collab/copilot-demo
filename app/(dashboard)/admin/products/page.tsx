'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, ConfirmDialog, Button } from '@/components/ui';
import { ProductList } from '@/components/products/ProductList';
import { ProductSearchBar } from '@/components/products/ProductSearchBar';
import { toast } from '@/lib/utils/toast';
import type { ProductWithAvailability } from '@/types/product';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductWithAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: number | null }>({ show: false, id: null });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search,
        sort_by: sortBy,
        sort_order: sortOrder,
        limit: '1000',
        offset: '0',
      });

      const response = await fetch(`/api/products?${params.toString()}`, {
        credentials: 'include',
      });
      const data = await response.json();

      if (response.ok) {
        setProducts(data.data || []);
        setError(null);
      } else {
        setError(data.error || 'Failed to load products');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, sortBy, sortOrder]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleDelete = (id: number) => {
    setDeleteConfirm({ show: true, id });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;

    try {
      const response = await fetch(`/api/products/${deleteConfirm.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'Product deleted successfully');
        fetchProducts();
      } else {
        toast.error(data.error || 'Failed to delete product');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setDeleteConfirm({ show: false, id: null });
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
          <p className="mt-2 text-gray-600">
            Create and manage products for the store
          </p>
        </div>
        <Link href="/admin/products/create">
          <Button>
            + Create Product
          </Button>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Products ({products.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <ProductSearchBar value={search} onChange={setSearch} />
          </div>
          <ProductList
            products={products}
            onDelete={handleDelete}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={deleteConfirm.show}
        title="Delete Product"
        message="Are you sure you want to delete this product? Products with purchase history will be archived instead of permanently deleted."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ show: false, id: null })}
      />
    </div>
  );
}

