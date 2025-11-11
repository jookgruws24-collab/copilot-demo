'use client';

import { Input, Button } from '@/components/ui';
import type { HistoryFilters as Filters } from '@/types/history';

interface HistoryFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  showEmployeeFilter?: boolean;
}

export function HistoryFilters({ filters, onFilterChange, showEmployeeFilter }: HistoryFiltersProps) {
  const handleChange = (key: keyof Filters, value: any) => {
    onFilterChange({ ...filters, [key]: value, page: 1 });
  };

  const handleClear = () => {
    onFilterChange({ page: 1, limit: 50 });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <Input
            type="text"
            placeholder="Search employee or details..."
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
          />
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <Input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => handleChange('startDate', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date
          </label>
          <Input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => handleChange('endDate', e.target.value)}
          />
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type
          </label>
          <select
            value={filters.type || ''}
            onChange={(e) => handleChange('type', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="claim">Claim</option>
            <option value="purchase">Purchase</option>
          </select>
        </div>

        {/* Action Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Action
          </label>
          <select
            value={filters.action || ''}
            onChange={(e) => handleChange('action', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Actions</option>
            <option value="created">Created</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="claimed">Claimed</option>
          </select>
        </div>

        {/* Employee Filter (Admin/HR only) */}
        {showEmployeeFilter && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employee ID
            </label>
            <Input
              type="number"
              placeholder="Filter by employee ID..."
              value={filters.employeeId || ''}
              onChange={(e) => handleChange('employeeId', e.target.value ? parseInt(e.target.value) : undefined)}
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-4 border-t">
        <div className="text-sm text-gray-600">
          {Object.keys(filters).filter(k => k !== 'page' && k !== 'limit' && filters[k as keyof Filters]).length > 0 && (
            <span>Active filters applied</span>
          )}
        </div>
        <Button
          onClick={handleClear}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800"
        >
          Clear Filters
        </Button>
      </div>
    </div>
  );
}
