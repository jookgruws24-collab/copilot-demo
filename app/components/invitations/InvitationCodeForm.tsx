'use client';

import { useState } from 'react';
import { Button, Input } from '@/components/ui';

interface InvitationCodeFormProps {
  onSuccess?: () => void;
}

export function InvitationCodeForm({ onSuccess }: InvitationCodeFormProps) {
  const [label, setLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ label: label.trim() || undefined }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate invitation code');
      }

      setLabel('');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          label="Label (Optional)"
          placeholder="e.g., Q1 2025 Hires"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          helperText="Add a description to help identify this invitation code"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
          {error}
        </div>
      )}

      <Button type="submit" loading={loading} className="w-full">
        Generate Invitation Code
      </Button>
    </form>
  );
}
