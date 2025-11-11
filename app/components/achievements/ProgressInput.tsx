'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';

interface ProgressInputProps {
  achievementId: number;
  currentProgress: number;
  onUpdate: (newProgress: number) => void;
  disabled?: boolean;
}

export function ProgressInput({ 
  achievementId, 
  currentProgress, 
  onUpdate, 
  disabled = false 
}: ProgressInputProps) {
  const [progress, setProgress] = useState(currentProgress);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleUpdate = async () => {
    if (progress < 0 || progress > 100) {
      setError('Progress must be between 0 and 100');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/achievements/${achievementId}/progress`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ progress_percentage: progress }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to update progress');
      }

      setSuccess(true);
      onUpdate(progress);
      
      // Clear success message after 2 seconds
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update progress');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label htmlFor={`progress-${achievementId}`} className="block text-sm font-medium text-gray-700 mb-1">
            Update Progress
          </label>
          <div className="flex items-center gap-2">
            <input
              id={`progress-${achievementId}`}
              type="range"
              min="0"
              max="100"
              step="1"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              disabled={disabled || loading}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600 disabled:opacity-50"
            />
            <input
              type="number"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              disabled={disabled || loading}
              className="w-16 px-2 py-1 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
            />
            <span className="text-sm font-medium text-gray-600">%</span>
          </div>
        </div>
        
        <Button
          onClick={handleUpdate}
          disabled={disabled || loading || progress === currentProgress}
          className="mt-6 bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Updating...' : 'Update'}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-md">
          <span>✓</span>
          <span>Progress updated successfully!</span>
        </div>
      )}
    </div>
  );
}
