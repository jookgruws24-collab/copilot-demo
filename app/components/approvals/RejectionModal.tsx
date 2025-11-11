'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import { toast } from '@/lib/utils/toast';

interface RejectionModalProps {
  purchaseId: number;
  productName: string;
  employeeName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function RejectionModal({ 
  purchaseId, 
  productName, 
  employeeName, 
  onClose, 
  onSuccess 
}: RejectionModalProps) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/purchases/${purchaseId}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          rejection_reason: reason.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reject purchase');
      }

      toast.success(`✓ Purchase rejected. ${data.data.refundedAmount}💎 refunded to ${employeeName}`);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject purchase');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <h2 className="text-2xl font-bold mb-4">Reject Purchase</h2>
        
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <div className="text-sm text-gray-600">Product</div>
          <div className="font-medium">{productName}</div>
          <div className="text-sm text-gray-600 mt-2">Employee</div>
          <div className="font-medium">{employeeName}</div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rejection Reason *
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why this purchase is being rejected..."
            disabled={submitting}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 min-h-[100px]"
            maxLength={500}
          />
          <div className="text-xs text-gray-500 mt-1">
            {reason.length}/500 characters
          </div>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
            ⚠️ {error}
          </div>
        )}
        
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 disabled:bg-gray-200"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !reason.trim()}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-400"
          >
            {submitting ? 'Rejecting...' : 'Confirm Rejection'}
          </Button>
        </div>
      </div>
    </div>
  );
}
