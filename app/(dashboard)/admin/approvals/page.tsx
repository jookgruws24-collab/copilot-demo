'use client';

import { useState, useEffect } from 'react';
import { PurchaseCard } from '@/components/approvals/PurchaseCard';
import { ApprovalActions } from '@/components/approvals/ApprovalActions';
import { RejectionModal } from '@/components/approvals/RejectionModal';

interface PendingPurchase {
  id: number;
  employee_id: number;
  employee_name: string;
  product_id: number;
  product_name: string;
  diamond_cost: number;
  status: string;
  created_at: string;
}

export default function ApprovalsPage() {
  const [purchases, setPurchases] = useState<PendingPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejecting, setRejecting] = useState<PendingPurchase | null>(null);

  const loadPurchases = async () => {
    try {
      const response = await fetch('/api/purchases/pending', { credentials: 'include' });
      const data = await response.json();
      setPurchases(data.data || []);
    } catch (error) {
      console.error('Failed to load purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPurchases();
  }, []);

  const handleApprove = () => {
    loadPurchases();
  };

  const handleRejectClick = (purchase: PendingPurchase) => {
    setRejecting(purchase);
  };

  const handleRejectSuccess = () => {
    setRejecting(null);
    loadPurchases();
  };

  if (loading) {
    return <div className="p-8 text-center">Loading pending purchases...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Purchase Approvals</h1>
        <p className="text-gray-600 mt-2">
          Review and approve or reject pending purchase requests
        </p>
      </div>

      {purchases.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-6xl mb-4">✓</div>
          <div className="text-xl font-medium text-gray-700">No Pending Approvals</div>
          <div className="text-gray-500 mt-2">All purchases have been processed</div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-gray-600 mb-4">
            {purchases.length} pending {purchases.length === 1 ? 'purchase' : 'purchases'}
          </div>
          
          {purchases.map((purchase) => (
            <PurchaseCard key={purchase.id} purchase={purchase}>
              <ApprovalActions
                purchaseId={purchase.id}
                onApprove={handleApprove}
                onReject={() => handleRejectClick(purchase)}
              />
            </PurchaseCard>
          ))}
        </div>
      )}

      {rejecting && (
        <RejectionModal
          purchaseId={rejecting.id}
          productName={rejecting.product_name}
          employeeName={rejecting.employee_name}
          onClose={() => setRejecting(null)}
          onSuccess={handleRejectSuccess}
        />
      )}
    </div>
  );
}
