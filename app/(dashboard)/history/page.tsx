'use client';

import { useState, useEffect } from 'react';
import { HistoryTable } from '@/components/history/HistoryTable';
import { HistoryFilters } from '@/components/history/HistoryFilters';
import { HistoryDetailModal } from '@/components/history/HistoryDetailModal';
import { Button } from '@/components/ui';
import type { History, HistoryFilters as Filters, HistoryResponse } from '@/types/history';
import type { Employee } from '@/types/employee';

export default function HistoryPage() {
  const [history, setHistory] = useState<History[]>([]);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<History | null>(null);
  const [filters, setFilters] = useState<Filters>({ page: 1, limit: 50 });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });

  const loadHistory = async () => {
    setLoading(true);
    try {
      // Build query string
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/history?${params.toString()}`, {
        credentials: 'include',
      });
      const data: HistoryResponse = await response.json();
      
      setHistory(data.data || []);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadEmployee() {
      try {
        const response = await fetch('/api/auth/me', { credentials: 'include' });
        const data = await response.json();
        setEmployee(data.data);
      } catch (error) {
        console.error('Failed to load employee:', error);
      }
    }
    loadEmployee();
  }, []);

  useEffect(() => {
    if (employee) {
      loadHistory();
    }
  }, [filters, employee]);

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isAdminOrHR = employee?.role === 'admin' || employee?.role === 'hr';

  if (!employee) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">History</h1>
        <p className="text-gray-600 mt-2">
          {isAdminOrHR 
            ? 'View complete activity history for all employees'
            : 'View your activity history including claims and purchases'
          }
        </p>
      </div>

      {/* Filters */}
      <HistoryFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        showEmployeeFilter={isAdminOrHR}
      />

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <div className="mt-4 text-gray-600">Loading history...</div>
        </div>
      ) : (
        <>
          {/* Results Summary */}
          <div className="mb-4 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {history.length} of {pagination.total} records
              {filters.search && ` matching "${filters.search}"`}
            </div>
            <div className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </div>
          </div>

          {/* Table */}
          <HistoryTable
            history={history}
            onRowClick={(record) => setSelectedRecord(record)}
          />

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex justify-center items-center gap-2">
              <Button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </Button>
              
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 ${
                        pagination.page === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                      }`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {selectedRecord && (
        <HistoryDetailModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </div>
  );
}
