'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Search, Filter } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { DataTable } from '@/components/admin/DataTable';
import type { ContactLead } from '@/lib/api/admin';

export default function AdminLeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<ContactLead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadLeads();
  }, [page, search, statusFilter]);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const data = await adminApi.listLeads({ 
        page, 
        per_page: 20, 
        search: search || undefined,
        status: statusFilter || undefined
      });
      setLeads(data.leads || []);
      setTotal(data.total || 0);
    } catch (error: any) {
      console.error('Failed to load leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-600/20 text-blue-400';
      case 'contacted':
        return 'bg-yellow-600/20 text-yellow-400';
      case 'converted':
        return 'bg-green-600/20 text-green-400';
      case 'archived':
        return 'bg-gray-600/20 text-gray-400';
      default:
        return 'bg-gray-600/20 text-gray-400';
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Contact',
      render: (lead: ContactLead) => (
        <div>
          <div className="font-medium text-white">{lead.name}</div>
          <div className="text-xs text-gray-400">{lead.email}</div>
          {lead.phone && <div className="text-xs text-gray-500">{lead.phone}</div>}
        </div>
      ),
    },
    {
      key: 'subject',
      header: 'Subject',
      render: (lead: ContactLead) => (
        <div className="max-w-xs truncate text-gray-300">{lead.subject}</div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (lead: ContactLead) => (
        <span className={`px-2 py-1 rounded text-xs capitalize ${getStatusColor(lead.status)}`}>
          {lead.status}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Date',
      render: (lead: ContactLead) => (
        <span className="text-gray-400 text-sm">
          {new Date(lead.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (lead: ContactLead) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/admin/leads/${lead.id}`);
          }}
          className="p-2 rounded-lg bg-gold-600/20 hover:bg-gold-600/30 text-gold-600 transition-colors"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Leads</h1>
          <p className="text-gray-400">Manage contact form submissions</p>
        </div>
        {total > 0 && (
          <div className="text-sm text-gray-400">
            Total: <span className="text-white font-semibold">{total}</span> leads
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-black-50 border border-gold-600/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold-600/30"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="pl-10 pr-8 py-2 bg-black-50 border border-gold-600/10 rounded-lg text-white focus:outline-none focus:border-gold-600/30 appearance-none"
          >
            <option value="">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="converted">Converted</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <DataTable
        data={leads}
        columns={columns}
        loading={loading}
        onRowClick={(lead) => router.push(`/admin/leads/${lead.id}`)}
        pagination={{
          page,
          perPage: 20,
          total: total,
          onPageChange: setPage,
        }}
      />
    </div>
  );
}
