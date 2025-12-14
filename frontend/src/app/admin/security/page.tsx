'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api/admin';
import { DataTable } from '@/components/admin/DataTable';
import type { SecurityEvent, SecurityStats } from '@/lib/api/admin';

export default function AdminSecurityPage() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadData();
  }, [page]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [eventsData, statsData] = await Promise.all([
        adminApi.getSecurityEvents({ page, per_page: 50 }),
        adminApi.getSecurityStats(),
      ]);
      setEvents(eventsData);
      setStats(statsData);
    } catch (error: any) {
      console.error('Failed to load security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      low: 'text-yellow-400',
      medium: 'text-orange-400',
      high: 'text-red-400',
      critical: 'text-red-600',
    };
    return colors[severity] || 'text-gray-400';
  };

  const columns = [
    {
      key: 'event_type',
      header: 'Event Type',
      render: (event: SecurityEvent) => (
        <span className="font-medium text-white">{event.event_type}</span>
      ),
    },
    {
      key: 'severity',
      header: 'Severity',
      render: (event: SecurityEvent) => (
        <span className={`capitalize ${getSeverityColor(event.severity)}`}>
          {event.severity}
        </span>
      ),
    },
    {
      key: 'user_id',
      header: 'User',
      render: (event: SecurityEvent) => (
        <span className="text-gray-400">
          {event.user_id ? event.user_id.substring(0, 8) + '...' : 'Anonymous'}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Date',
      render: (event: SecurityEvent) => (
        <span className="text-gray-400">
          {new Date(event.created_at).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Security</h1>
        <p className="text-gray-400">Monitor security events and threats</p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-black-100 rounded-xl border border-gold-600/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Total Events</h3>
            <p className="text-3xl font-bold text-gold-600">{stats.total_events}</p>
          </div>
          <div className="bg-black-100 rounded-xl border border-gold-600/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-2">By Severity</h3>
            <div className="space-y-1">
              {Object.entries(stats.by_severity).map(([severity, count]) => (
                <div key={severity} className="flex justify-between">
                  <span className="text-gray-400 capitalize">{severity}</span>
                  <span className={`font-semibold ${getSeverityColor(severity)}`}>{count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-black-100 rounded-xl border border-gold-600/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-2">By Type</h3>
            <div className="space-y-1">
              {Object.entries(stats.by_type).slice(0, 5).map(([type, count]) => (
                <div key={type} className="flex justify-between">
                  <span className="text-gray-400">{type}</span>
                  <span className="text-white font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <DataTable
        data={events}
        columns={columns}
        loading={loading}
        pagination={{
          page,
          perPage: 50,
          total: events.length,
          onPageChange: setPage,
        }}
      />
    </div>
  );
}
