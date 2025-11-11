'use client';

import { useState } from 'react';
import { formatDate } from '@/lib/utils/dates';
import type { History } from '@/types/history';

interface HistoryTableProps {
  history: History[];
  onRowClick?: (record: History) => void;
}

export function HistoryTable({ history, onRowClick }: HistoryTableProps) {
  const [sortField, setSortField] = useState<keyof History>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: keyof History) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedHistory = [...history].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    const modifier = sortDirection === 'asc' ? 1 : -1;
    
    if (aVal < bVal) return -1 * modifier;
    if (aVal > bVal) return 1 * modifier;
    return 0;
  });

  const getActionBadge = (action: string) => {
    const badges: Record<string, { bg: string; text: string }> = {
      created: { bg: 'bg-blue-100', text: 'text-blue-800' },
      approved: { bg: 'bg-green-100', text: 'text-green-800' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800' },
      claimed: { bg: 'bg-purple-100', text: 'text-purple-800' },
    };
    
    const badge = badges[action] || { bg: 'bg-gray-100', text: 'text-gray-800' };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {action}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    return type === 'claim' ? (
      <span className="text-xs font-medium text-purple-600">🏆 Claim</span>
    ) : (
      <span className="text-xs font-medium text-blue-600">🛒 Purchase</span>
    );
  };

  const getDiamondsDisplay = (diamonds: number) => {
    const isPositive = diamonds > 0;
    return (
      <span className={`font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? '+' : ''}{diamonds}💎
      </span>
    );
  };

  const SortIcon = ({ field }: { field: keyof History }) => {
    if (sortField !== field) return <span className="text-gray-400">⇅</span>;
    return sortDirection === 'asc' ? <span>↑</span> : <span>↓</span>;
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <div className="text-6xl mb-4">📋</div>
        <div className="text-xl font-medium text-gray-700">No History Records</div>
        <div className="text-gray-500 mt-2">No activities found matching your filters</div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('created_at')}
            >
              Date <SortIcon field="created_at" />
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('employee_name')}
            >
              Employee <SortIcon field="employee_name" />
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('type')}
            >
              Type <SortIcon field="type" />
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('action')}
            >
              Action <SortIcon field="action" />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Details
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('diamonds')}
            >
              Diamonds <SortIcon field="diamonds" />
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedHistory.map((record) => (
            <tr 
              key={record.id} 
              onClick={() => onRowClick?.(record)}
              className={`${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDate(record.created_at)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {record.employee_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {getTypeBadge(record.type)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {getActionBadge(record.action)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-700 max-w-md truncate">
                {record.details}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {getDiamondsDisplay(record.diamonds)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
