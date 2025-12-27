'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Smartphone, Calendar, Download, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { tradeInApi, type TradeInRequest } from '@/lib/api/tradeIn';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { useI18n } from '@/lib/i18n/context';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';
import { apiClient } from '@/lib/api/client';

export default function TradeInsPage() {
  const router = useRouter();
  const { t, isRTL, language } = useI18n();
  const { isAuthenticated, user } = useAuthStore();
  const [tradeIns, setTradeIns] = useState<TradeInRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const loadTradeIns = async () => {
      try {
        const data = await tradeInApi.getAll();
        setTradeIns(data);
      } catch (error) {
        console.error('Failed to load trade-in requests:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTradeIns();
  }, [isAuthenticated, router, user]);

  if (!isAuthenticated) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'reviewing':
        return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'approved':
        return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-500 border-red-500/30';
      case 'completed':
        return 'bg-purple-500/20 text-purple-500 border-purple-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return Clock;
      case 'reviewing':
        return Clock;
      case 'approved':
        return CheckCircle;
      case 'rejected':
        return XCircle;
      case 'completed':
        return CheckCircle;
      default:
        return Clock;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: (t as any).tradeIn?.status?.pending || 'Pending',
      reviewing: (t as any).tradeIn?.status?.reviewing || 'Reviewing',
      approved: (t as any).tradeIn?.status?.approved || 'Approved',
      rejected: (t as any).tradeIn?.status?.rejected || 'Rejected',
      completed: (t as any).tradeIn?.status?.completed || 'Completed',
    };
    return statusMap[status] || status;
  };

  const downloadPDF = async (tradeInId: string) => {
    try {
      const response = await apiClient.get(`/trade-in/${tradeInId}/pdf`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `demande_reprise_${tradeInId}.pdf`;
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
              {(t as any).tradeIn?.account?.title || 'My Trade-In'} <span className="text-gold-600">{(t as any).tradeIn?.account?.titleHighlight || 'Requests'}</span>
            </h1>
            <p className="text-gray-400 mt-1">
              {(t as any).tradeIn?.account?.description || 'View and manage your iPhone trade-in requests'}
            </p>
          </div>
        </div>
      </ScrollReveal>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600" />
        </div>
      ) : tradeIns.length === 0 ? (
        /* Empty State */
        <ScrollReveal>
          <div className="bg-black-100 rounded-xl border border-gold-600/10 p-12 md:p-16 text-center">
            <div className="w-24 h-24 rounded-full bg-gold-600/10 flex items-center justify-center mx-auto mb-6">
              <Smartphone className="w-12 h-12 text-gold-600/50" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              {(t as any).tradeIn?.account?.noRequests || 'No Trade-In Requests'}
            </h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              {(t as any).tradeIn?.account?.noRequestsDesc || 'You haven\'t submitted any trade-in requests yet.'}
            </p>
            <Button variant="primary" size="lg" onClick={() => router.push('/trade-in')}>
              <Smartphone className="w-5 h-5 mr-2" />
              {(t as any).tradeIn?.account?.submitRequest || 'Submit Trade-In Request'}
            </Button>
          </div>
        </ScrollReveal>
      ) : (
        /* Trade-In Requests List */
        <div className="space-y-6">
          {tradeIns.map((tradeIn, index) => {
            const StatusIcon = getStatusIcon(tradeIn.status);
            return (
              <ScrollReveal key={tradeIn.id} delay={index * 0.1}>
                <div className="bg-black-100 rounded-xl border border-gold-600/10 p-6 md:p-8 shadow-lg hover:border-gold-600/30 transition-all">
                  {/* Request Header */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-6 border-b border-gold-600/10">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg md:text-xl font-semibold text-white">
                          {(t as any).tradeIn?.account?.requestNumber || 'Request'} #{tradeIn.id.slice(0, 8)}
                        </h3>
                        <span className={cn('px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1', getStatusColor(tradeIn.status))}>
                          <StatusIcon className="w-3 h-3" />
                          {getStatusText(tradeIn.status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(tradeIn.created_at).toLocaleDateString(
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
                        onClick={() => downloadPDF(tradeIn.id)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {(t as any).tradeIn?.account?.downloadPDF || 'Download PDF'}
                      </Button>
                    </div>
                  </div>

                  {/* Request Details */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 mb-3">
                        {(t as any).tradeIn?.account?.deviceInfo || 'Device Information'}
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">{(t as any).tradeIn?.form?.model || 'Model'}:</span>
                          <span className="text-white font-medium">{tradeIn.iphone_model}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">{(t as any).tradeIn?.form?.storage || 'Storage'}:</span>
                          <span className="text-white font-medium">{tradeIn.storage_capacity}</span>
                        </div>
                        {tradeIn.color && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">{(t as any).tradeIn?.form?.color || 'Color'}:</span>
                            <span className="text-white font-medium">{tradeIn.color}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-400">{(t as any).tradeIn?.form?.condition || 'Condition'}:</span>
                          <span className="text-white font-medium capitalize">{tradeIn.condition.replace('_', ' ')}</span>
                        </div>
                        {tradeIn.estimated_value && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">{(t as any).tradeIn?.account?.estimatedValue || 'Estimated Value'}:</span>
                            <span className="text-gold-600 font-bold">{tradeIn.estimated_value.toFixed(2)} MAD</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 mb-3">
                        {(t as any).tradeIn?.account?.contactInfo || 'Contact Information'}
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">{(t as any).tradeIn?.form?.name || 'Name'}:</span>
                          <span className="text-white font-medium">{tradeIn.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">{(t as any).tradeIn?.form?.email || 'Email'}:</span>
                          <span className="text-white font-medium">{tradeIn.email}</span>
                        </div>
                        {tradeIn.phone && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">{(t as any).tradeIn?.form?.phone || 'Phone'}:</span>
                            <span className="text-white font-medium">{tradeIn.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Photos */}
                  {tradeIn.photos_urls && tradeIn.photos_urls.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gold-600/10">
                      <h4 className="text-sm font-semibold text-gray-400 mb-3">
                        {(t as any).tradeIn?.form?.photos || 'Photos'} ({tradeIn.photos_urls.length})
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {tradeIn.photos_urls.map((url, idx) => (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative aspect-square rounded-lg overflow-hidden border border-gold-600/20 hover:border-gold-600/40 transition-all"
                          >
                            <img
                              src={url}
                              alt={`Photo ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {tradeIn.notes && (
                    <div className="mt-6 pt-6 border-t border-gold-600/10">
                      <h4 className="text-sm font-semibold text-gray-400 mb-2">
                        {(t as any).tradeIn?.form?.notes || 'Additional Notes'}
                      </h4>
                      <p className="text-gray-300 text-sm whitespace-pre-wrap">{tradeIn.notes}</p>
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

