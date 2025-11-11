'use client';

import { Button } from '@/components/ui';
import { formatDate } from '@/lib/utils/dates';
import type { History } from '@/types/history';

interface HistoryDetailModalProps {
  record: History;
  onClose: () => void;
}

export function HistoryDetailModal({ record, onClose }: HistoryDetailModalProps) {
  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      created: 'text-blue-600',
      approved: 'text-green-600',
      rejected: 'text-red-600',
      claimed: 'text-purple-600',
    };
    return colors[action] || 'text-gray-600';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold">History Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* Record ID */}
          <div className="flex items-center gap-2 pb-4 border-b">
            <span className="text-3xl">
              {record.type === 'claim' ? '🏆' : '🛒'}
            </span>
            <div>
              <div className="text-lg font-semibold capitalize">{record.type}</div>
              <div className="text-sm text-gray-500">Record #{record.id}</div>
            </div>
          </div>

          {/* Employee Info */}
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="text-sm text-gray-600 mb-1">Employee</div>
            <div className="font-medium text-lg">{record.employee_name}</div>
            <div className="text-xs text-gray-500">ID: {record.employee_id}</div>
          </div>

          {/* Action & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">Action</div>
              <div className={`font-bold text-lg capitalize ${getActionColor(record.action)}`}>
                {record.action}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Date & Time</div>
              <div className="font-medium">{formatDate(record.created_at)}</div>
            </div>
          </div>

          {/* Details */}
          <div>
            <div className="text-sm text-gray-600 mb-2">Details</div>
            <div className="bg-gray-50 p-4 rounded-md text-gray-800 leading-relaxed">
              {record.details}
            </div>
          </div>

          {/* Diamond Change */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-md">
            <div className="text-sm text-gray-600 mb-1">Diamond Balance Change</div>
            <div className="flex items-center gap-2">
              <span className="text-4xl">💎</span>
              <span className={`text-3xl font-bold ${record.diamonds > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {record.diamonds > 0 ? '+' : ''}{record.diamonds}
              </span>
            </div>
            {record.diamonds > 0 && (
              <div className="text-xs text-green-600 mt-1">Diamonds added to balance</div>
            )}
            {record.diamonds < 0 && (
              <div className="text-xs text-red-600 mt-1">Diamonds deducted from balance</div>
            )}
            {record.diamonds === 0 && (
              <div className="text-xs text-gray-600 mt-1">No diamond change</div>
            )}
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-6 pt-4 border-t">
          <Button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
