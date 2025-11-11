'use client';

import { useState } from 'react';
import { Button, ConfirmDialog } from '@/components/ui';
import { toast } from '@/lib/utils/toast';

interface ApprovalActionsProps {
  purchaseId: number;
  onApprove: () => void;
  onReject: () => void;
}

export function ApprovalActions({ purchaseId, onApprove, onReject }: ApprovalActionsProps) {
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleApprove = async () => {
    setApproving(true);
    try {
      const response = await fetch(`/api/purchases/${purchaseId}/approve`, {
        method: 'PATCH',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve purchase');
      }

      toast.success('✓ Purchase approved successfully!');
      onApprove();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to approve purchase');
    } finally {
      setApproving(false);
      setShowConfirm(false);
    }
  };

  const handleReject = () => {
    setRejecting(true);
    onReject();
  };

  return (
    <>
      <div className="flex gap-3">
        <Button
          onClick={() => setShowConfirm(true)}
          disabled={approving || rejecting}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium disabled:bg-gray-400"
        >
          {approving ? 'Approving...' : '✓ Approve'}
        </Button>
        <Button
          onClick={handleReject}
          disabled={approving || rejecting}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium disabled:bg-gray-400"
        >
          ✗ Reject
        </Button>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Approve Purchase"
        message="Are you sure you want to approve this purchase? The employee will receive the product."
        confirmLabel="Approve"
        cancelLabel="Cancel"
        variant="info"
        onConfirm={handleApprove}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
