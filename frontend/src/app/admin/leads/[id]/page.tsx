'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, UserPlus, Trash2 } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import type { ContactLead } from '@/lib/api/admin';
import { useToast } from '@/components/ui/Toast';

export default function AdminLeadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const leadId = params.id as string;
  const { showToast } = useToast();

  const [lead, setLead] = useState<ContactLead | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [converting, setConverting] = useState(false);
  const [password, setPassword] = useState('');
  const [showConvertForm, setShowConvertForm] = useState(false);

  useEffect(() => {
    loadLead();
  }, [leadId]);

  const loadLead = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getLead(leadId);
      setLead(data);
      setStatus(data.status);
      setAdminNotes(data.admin_notes || '');
    } catch (error: any) {
      showToast({
        message: 'Failed to load lead: ' + error.message,
        type: 'error',
      });
      router.push('/admin/leads');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await adminApi.updateLead(leadId, { status, admin_notes: adminNotes });
      await loadLead();
      showToast({
        message: 'Lead updated successfully',
        type: 'success',
      });
    } catch (error: any) {
      showToast({
        message: 'Failed to update lead: ' + error.message,
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleConvert = async () => {
    if (!password) {
      showToast({
        message: 'Password is required',
        type: 'error',
      });
      return;
    }

    try {
      setConverting(true);
      await adminApi.convertLeadToUser(leadId, { password, role: 'customer' });
      await loadLead();
      setShowConvertForm(false);
      setPassword('');
      showToast({
        message: 'Lead converted to user successfully',
        type: 'success',
      });
    } catch (error: any) {
      showToast({
        message: 'Failed to convert lead: ' + error.message,
        type: 'error',
      });
    } finally {
      setConverting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this lead?')) {
      return;
    }

    try {
      await adminApi.deleteLead(leadId);
      showToast({
        message: 'Lead deleted successfully',
        type: 'success',
      });
      router.push('/admin/leads');
    } catch (error: any) {
      showToast({
        message: 'Failed to delete lead: ' + error.message,
        type: 'error',
      });
    }
  };

  if (loading || !lead) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
      case 'contacted':
        return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
      case 'converted':
        return 'bg-green-600/20 text-green-400 border-green-600/30';
      case 'archived':
        return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
      default:
        return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/admin/leads')}
          className="p-2 rounded-lg bg-black-50 hover:bg-black-100 border border-gold-600/10 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white mb-2">Lead Details</h1>
          <p className="text-gray-400">View and manage lead information</p>
        </div>
        {!lead.converted_to_user_id && (
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-black-100 rounded-xl border border-gold-600/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Contact Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Name</label>
                <div className="text-white font-medium mt-1">{lead.name}</div>
              </div>
              <div>
                <label className="text-sm text-gray-400">Email</label>
                <div className="text-white font-medium mt-1">{lead.email}</div>
              </div>
              {lead.phone && (
                <div>
                  <label className="text-sm text-gray-400">Phone</label>
                  <div className="text-white font-medium mt-1">{lead.phone}</div>
                </div>
              )}
              <div>
                <label className="text-sm text-gray-400">Subject</label>
                <div className="text-white font-medium mt-1">{lead.subject}</div>
              </div>
              <div>
                <label className="text-sm text-gray-400">Message</label>
                <div className="text-white mt-1 whitespace-pre-wrap bg-black-50 p-4 rounded-lg border border-gold-600/10">
                  {lead.message}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-black-100 rounded-xl border border-gold-600/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Status & Notes</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2 bg-black-50 border border-gold-600/10 rounded-lg text-white focus:outline-none focus:border-gold-600/30"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="converted">Converted</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Admin Notes</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 bg-black-50 border border-gold-600/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold-600/30 resize-none"
                  placeholder="Add notes about this lead..."
                />
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full px-4 py-2 bg-gold-600 hover:bg-gold-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-black-100 rounded-xl border border-gold-600/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Details</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Status</label>
                <div className="mt-1">
                  <span className={`px-3 py-1 rounded text-sm border ${getStatusColor(lead.status)}`}>
                    {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400">Submitted</label>
                <div className="text-white font-medium mt-1">
                  {new Date(lead.created_at).toLocaleString()}
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400">Last Updated</label>
                <div className="text-white font-medium mt-1">
                  {new Date(lead.updated_at).toLocaleString()}
                </div>
              </div>
              {lead.converted_to_user_id && (
                <div>
                  <label className="text-sm text-gray-400">Converted to User</label>
                  <div className="text-white font-medium mt-1">
                    <button
                      onClick={() => router.push(`/admin/users/${lead.converted_to_user_id}`)}
                      className="text-gold-600 hover:text-gold-500 underline"
                    >
                      View User
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {!lead.converted_to_user_id && (
            <div className="bg-black-100 rounded-xl border border-gold-600/10 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Convert to User</h2>
              {!showConvertForm ? (
                <button
                  onClick={() => setShowConvertForm(true)}
                  className="w-full px-4 py-2 bg-gold-600 hover:bg-gold-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Convert to User
                </button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2 bg-black-50 border border-gold-600/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold-600/30"
                      placeholder="Enter password for new user"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleConvert}
                      disabled={converting || !password}
                      className="flex-1 px-4 py-2 bg-gold-600 hover:bg-gold-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      {converting ? 'Converting...' : 'Convert'}
                    </button>
                    <button
                      onClick={() => {
                        setShowConvertForm(false);
                        setPassword('');
                      }}
                      className="px-4 py-2 bg-black-50 hover:bg-black-100 border border-gold-600/10 text-gray-400 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
