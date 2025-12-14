'use client';

import { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  onRowClick?: (item: T) => void;
  pagination?: {
    page: number;
    perPage: number;
    total: number;
    onPageChange: (page: number) => void;
  };
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  loading = false,
  onRowClick,
  pagination,
}: DataTableProps<T>) {
  const totalPages = pagination ? Math.ceil(pagination.total / pagination.perPage) : 1;

  if (loading) {
    return (
      <div className="bg-black-100 rounded-xl border border-gold-600/10 p-8">
        <div className="text-center text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-black-100 rounded-xl border border-gold-600/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-black-50 border-b border-gold-600/10">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-400 uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gold-600/10">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-400">
                  No data available
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onRowClick?.(item)}
                  className={`hover:bg-black-50 transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {column.render ? column.render(item) : (item as any)[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gold-600/10 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Showing {(pagination.page - 1) * pagination.perPage + 1} to{' '}
            {Math.min(pagination.page * pagination.perPage, pagination.total)} of {pagination.total} results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-2 rounded-lg border border-gold-600/10 hover:border-gold-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 text-gray-400" />
            </button>
            <span className="text-sm text-gray-400">
              Page {pagination.page} of {totalPages}
            </span>
            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= totalPages}
              className="p-2 rounded-lg border border-gold-600/10 hover:border-gold-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
