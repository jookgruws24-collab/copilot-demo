'use client';

import { useState, useEffect } from 'react';
import { Button, Card } from '@/components/ui';
import { formatDateTime } from '@/lib/utils/dates';
import type { InvitationCodeWithUsage } from '@/types/invitation';

export function InvitationCodeList() {
  const [codes, setCodes] = useState<InvitationCodeWithUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCodes = async () => {
    try {
      const response = await fetch('/api/invitations', {
        credentials: 'include',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch invitation codes');
      }

      setCodes(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load codes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  const handleToggleActive = async (id: number, currentStatus: number) => {
    try {
      const response = await fetch(`/api/invitations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: currentStatus === 1 ? 0 : 1 }),
      });

      if (!response.ok) {
        throw new Error('Failed to update code status');
      }

      // Refresh the list
      fetchCodes();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update code');
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`Copied "${code}" to clipboard!`);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (codes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No invitation codes yet. Generate your first one above!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {codes.map((code) => (
        <Card key={code.id} padding="sm" className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => copyToClipboard(code.code)}
                  className="font-mono text-lg font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                  title="Click to copy"
                >
                  {code.code.slice(0, 4)}-{code.code.slice(4)}
                </button>
                
                {code.is_active === 1 ? (
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                    Active
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                    Inactive
                  </span>
                )}
              </div>

              <div className="mt-1 space-y-1">
                {code.label && (
                  <p className="text-sm text-gray-700 font-medium">{code.label}</p>
                )}
                <p className="text-xs text-gray-500">
                  Created by {code.created_by_name} on {formatDateTime(code.created_at)}
                </p>
                <p className="text-xs text-gray-500">
                  Used by {code.usage_count} employee{code.usage_count !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="ml-4">
              <Button
                size="sm"
                variant={code.is_active === 1 ? 'secondary' : 'primary'}
                onClick={() => handleToggleActive(code.id, code.is_active)}
              >
                {code.is_active === 1 ? 'Deactivate' : 'Activate'}
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
