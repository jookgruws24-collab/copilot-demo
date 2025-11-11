'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import { toast } from '@/lib/utils/toast';

interface ClaimButtonProps {
  achievementId: number;
  canClaim: boolean;
  onSuccess?: (newBalance: number) => void;
  disabled?: boolean;
}

export function ClaimButton({ achievementId, canClaim, onSuccess, disabled }: ClaimButtonProps) {
  const [loading, setLoading] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [animating, setAnimating] = useState(false);

  const handleClaim = async () => {
    if (!canClaim || loading || claimed) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/achievements/${achievementId}/claim`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setClaimed(true);
        setAnimating(true);
        
        // Trigger animation
        setTimeout(() => setAnimating(false), 1000);
        
        toast.success(`🎉 Reward claimed! +${data.data?.diamondsAwarded || 0}💎`);
        
        // Call success callback with new balance
        if (onSuccess && data.data?.newBalance) {
          onSuccess(data.data.newBalance);
        }
      } else {
        toast.error(data.error || 'Failed to claim reward');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (claimed) {
    return (
      <div className="flex items-center gap-2 text-green-600 font-medium">
        <span className="text-2xl">✓</span>
        <span>Claimed!</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <Button
        onClick={handleClaim}
        disabled={!canClaim || loading || disabled}
        className={`relative ${
          canClaim
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
            : 'bg-gray-300'
        } text-white font-bold transition-all duration-300`}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin">⏳</span>
            Claiming...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <span className="text-xl">💎</span>
            Claim Reward
          </span>
        )}
      </Button>
      
      {animating && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-4xl animate-bounce">💎</span>
        </div>
      )}
    </div>
  );
}
