'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api/admin';
import { DataTable } from '@/components/admin/DataTable';
import type { AuditLog } from '@/lib/api/admin';

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadLogs();
  }, [page]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAuditLogs({ page, per_page: 50 });
      setLogs(data);
    } catch (error: any) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'action',
      header: 'Action',
      render: (log: AuditLog) => (
        <span className="font-medium text-white">{log.action}</span>
      ),
    },
    {
      key: 'resource_type',
      header: 'Resource',
      render: (log: AuditLog) => (
        <span className="text-gray-400 capitalize">{log.resource_type}</span>
      ),
    },
    {
      key: 'user_id',
      header: 'User',
      render: (log: AuditLog) => (
        <span className="text-gray-400">{log.user_id ? log.user_id.substring(0, 8) + '...' : 'System'}</span>
      ),
    },
    {
      key: 'created_at',
      header: 'Date',
      render: (log: AuditLog) => (
        <span className="text-gray-400">
          {new Date(log.created_at).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Audit Logs</h1>
        <p className="text-gray-400">View all system activity logs</p>
      </div>

      <DataTable
        data={logs}
        columns={columns}
        loading={loading}
        pagination={{
          page,
          perPage: 50,
          total: logs.length,
          onPageChange: setPage,
        }}
      />
    </div>
  );
}
