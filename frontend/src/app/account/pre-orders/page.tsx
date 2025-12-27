'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Smartphone, Calendar, Download, CheckCircle, Clock, XCircle, Bell } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { preOrderApi, type PreOrderRequest } from '@/lib/api/preOrder';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { useI18n } from '@/lib/i18n/context';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';
import { apiClient } from '@/lib/api/client';

export default function PreOrdersPage() {
  const router = useRouter();
  const { t, isRTL, language } = useI18n();
  const { isAuthenticated, user } = useAuthStore();
  const [preOrders, setPreOrders] = useState<PreOrderRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const loadPreOrders = async () => {
      try {
        const data = await preOrderApi.getAll();
        setPreOrders(data);
      } catch (error) {
        console.error('Failed to load pre-orders:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPreOrders();
  }, [isAuthenticated, router, user]);

  if (!isAuthenticated) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'notified':
        return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'completed':
        return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-500 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return Clock;
      case 'notified':
        return Bell;
      case 'completed':
        return CheckCircle;
      case 'cancelled':
        return XCircle;
      default:
        return Clock;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: 'Pending',
      notified: 'Notified',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };
    return statusMap[status] || status;
  };

  const downloadPDF = async (preOrderId: string) => {
    try {
      const response = await apiClient.get(`/pre-order/${preOrderId}/pdf`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pre_order_${preOrderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download PDF:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <ScrollReveal>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-gold-600/20 flex items-center justify-center border border-gold-600/30">
            <Smartphone className="w-6 h-6 text-gold-600" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              My Pre-Orders <span className="text-gold-600">Requests</span>
            </h1>
            <p className="text-gray-400 mt-1">
              View and manage your device pre-order requests
            </p>
          </div>
        </div>
      </ScrollReveal>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600" />
        </div>
      ) : preOrders.length === 0 ? (
        /* Empty State */
        <ScrollReveal>
          <div className="bg-black-100 rounded-xl border border-gold-600/10 p-12 md:p-16 text-center">
            <div className="w-24 h-24 rounded-full bg-gold-600/10 flex items-center justify-center mx-auto mb-6">
              <Smartphone className="w-12 h-12 text-gold-600/50" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              No Pre-Order Requests
            </h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              You haven't submitted any pre-order requests yet.
            </p>
            <Button variant="primary" size="lg" onClick={() => router.push('/pre-order')}>
              <Smartphone className="w-5 h-5 mr-2" />
              Submit Pre-Order Request
            </Button>
          </div>
        </ScrollReveal>
      ) : (
        /* Pre-Orders List */
        <div className="space-y-6">
          {preOrders.map((preOrder, index) => {
            const StatusIcon = getStatusIcon(preOrder.status);
            return (
              <ScrollReveal key={preOrder.id} delay={index * 0.1}>
                <div className="bg-black-100 rounded-xl border border-gold-600/10 p-6 md:p-8 shadow-lg hover:border-gold-600/30 transition-all">
                  {/* Request Header */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-6 border-b border-gold-600/10">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg md:text-xl font-semibold text-white">
                          Request #{preOrder.id.slice(0, 8)}
                        </h3>
                        <span className={cn('px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1', getStatusColor(preOrder.status))}>
                          <StatusIcon className="w-3 h-3" />
                          {getStatusText(preOrder.status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(preOrder.created_at).toLocaleDateString(
                              language === 'fr' ? 'fr-FR' : 'en-US',
                              {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadPDF(preOrder.id)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </Button>
                    </div>
                  </div>

                  {/* Request Details */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 mb-3">
                        Device Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Type:</span>
                          <span className="text-white font-medium capitalize">{preOrder.device_type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Model:</span>
                          <span className="text-white font-medium">{preOrder.device_model}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Storage:</span>
                          <span className="text-white font-medium">{preOrder.storage_capacity}</span>
                        </div>
                        {preOrder.color && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Color:</span>
                            <span className="text-white font-medium">{preOrder.color}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 mb-3">
                        Contact Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Name:</span>
                          <span className="text-white font-medium">{preOrder.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Email:</span>
                          <span className="text-white font-medium">{preOrder.email}</span>
                        </div>
                        {preOrder.phone && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Phone:</span>
                            <span className="text-white font-medium">{preOrder.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {preOrder.notes && (
                    <div className="mt-6 pt-6 border-t border-gold-600/10">
                      <h4 className="text-sm font-semibold text-gray-400 mb-2">
                        Additional Notes
                      </h4>
                      <p className="text-gray-300 text-sm whitespace-pre-wrap">{preOrder.notes}</p>
                    </div>
                  )}
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      )}
    </div>
  );
}

