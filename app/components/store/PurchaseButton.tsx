'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import { toast } from '@/lib/utils/toast';

interface PurchaseButtonProps {
  productId: number;
  productName: string;
  price: number;
  currentBalance: number;
  isAvailable: boolean;
  onSuccess: (newBalance: number) => void;
}

export function PurchaseButton({ 
  productId, 
  productName, 
  price, 
  currentBalance, 
  isAvailable,
  onSuccess 
}: PurchaseButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const totalCost = price * quantity;
  const canPurchase = isAvailable && currentBalance >= totalCost && quantity > 0;

  const handlePurchase = async () => {
    if (!canPurchase) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          product_id: productId,
          quantity: quantity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to make purchase');
      }

      onSuccess(data.data.new_balance);
      setQuantity(1);
      
      toast.success(`🛒 Purchase successful! ${quantity}x ${productName} for ${totalCost}💎 (Pending approval)`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to make purchase');
      toast.error(err instanceof Error ? err.message : 'Failed to make purchase');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">Quantity:</label>
        <input
          type="number"
          min="1"
          max="10"
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
          disabled={loading || !isAvailable}
          className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
        />
        <span className="text-sm text-gray-600">
          Total: <span className="font-bold text-purple-600">{totalCost}💎</span>
        </span>
      </div>

      {!isAvailable && (
        <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
          ⚠️ Product is out of stock
        </div>
      )}

      {isAvailable && currentBalance < totalCost && (
        <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
          ⚠️ Insufficient balance (Need: {totalCost}💎, Have: {currentBalance}💎)
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
          ⚠️ {error}
        </div>
      )}

      <Button
        onClick={handlePurchase}
        disabled={!canPurchase || loading}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : isAvailable ? '🛒 Purchase' : 'Out of Stock'}
      </Button>
    </div>
  );
}
