import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Shield, CheckCircle, XCircle, ArrowLeft, Eye, Trash2, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { adminApi } from '@/api/adminApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from 'sonner';

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-success-100 text-success-700',
  INACTIVE: 'bg-slate-100 text-slate-600',
  PENDING_REVIEW: 'bg-warning-100 text-warning-700',
  REJECTED: 'bg-danger-100 text-danger-700',
};

export default function ServiceModerationPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [tab, setTab] = useState<'pending' | 'all'>('pending');

  const { data: pendingData, isLoading: pendingLoading } = useQuery({
    queryKey: ['admin-services-pending', page],
    queryFn: () => adminApi.getPendingServices(page, 15),
    enabled: tab === 'pending',
  });

  const { data: allData, isLoading: allLoading } = useQuery({
    queryKey: ['admin-all-services', page],
    queryFn: () => adminApi.getAllServices(page, 15),
    enabled: tab === 'all',
  });

  const data = tab === 'pending' ? pendingData : allData;
  const isLoading = tab === 'pending' ? pendingLoading : allLoading;

  const activateMutation = useMutation({
    mutationFn: (id: number) => adminApi.activateService(id),
    onSuccess: () => {
      toast.success('Service approved');
      queryClient.invalidateQueries({ queryKey: ['admin-services-pending'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-services'] });
    },
    onError: () => toast.error('Failed to approve service'),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number) => adminApi.rejectService(id),
    onSuccess: () => {
      toast.success('Service rejected');
      queryClient.invalidateQueries({ queryKey: ['admin-services-pending'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-services'] });
    },
    onError: () => toast.error('Failed to reject service'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteService(id),
    onSuccess: () => {
      toast.success('Service deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-services-pending'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-services'] });
    },
    onError: () => toast.error('Failed to delete service'),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/admin/dashboard" className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-warning-500" /> Service Moderation
          </h1>
          <p className="text-sm text-slate-500">{data?.totalElements ?? 0} services</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {[
          { key: 'pending', label: '⏳ Pending Review' },
          { key: 'all', label: '📋 All Services' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key as any); setPage(0); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24"><LoadingSpinner size="lg" /></div>
      ) : !data?.content?.length ? (
        <div className="bg-white border border-slate-200 p-12 rounded-xl text-center">
          <CheckCircle className="w-12 h-12 text-success-400 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">All clear!</h3>
          <p className="text-slate-500">No services to display.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.content.map((svc: any) => (
            <div key={svc.id} className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row gap-4 justify-between items-start shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-semibold text-slate-900">{svc.title}</h3>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${STATUS_COLORS[svc.status] ?? 'bg-slate-100 text-slate-600'}`}>
                    {svc.status}
                  </span>
                </div>
                <p className="text-sm text-slate-500 line-clamp-2">{svc.description}</p>
                <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                  <span>By: <strong className="text-slate-700">{svc.expert?.fullName}</strong></span>
                  <span>Price: <strong className="text-success-600">${svc.price}</strong></span>
                  <span>Delivery: <strong className="text-slate-700">{svc.deliveryDays}d</strong></span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 w-full md:w-auto shrink-0">
                <Link
                  to={`/marketplace/${svc.id}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View
                </Link>
                {svc.status === 'PENDING_REVIEW' && (
                  <>
                    <button
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-danger-600 bg-danger-50 hover:bg-danger-100 transition-colors"
                      onClick={() => rejectMutation.mutate(svc.id)}
                      disabled={rejectMutation.isPending}
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                    <button
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-primary-500 hover:bg-primary-600 transition-colors"
                      onClick={() => activateMutation.mutate(svc.id)}
                      disabled={activateMutation.isPending}
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </button>
                  </>
                )}
                <button
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-danger-600 bg-danger-50 hover:bg-danger-100 transition-colors"
                  onClick={() => {
                    if (confirm(`Delete service "${svc.title}"?`)) deleteMutation.mutate(svc.id);
                  }}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {(data?.totalPages ?? 0) > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Page {page + 1} of {data?.totalPages}</span>
          <div className="flex gap-2">
            <button disabled={data?.first} onClick={() => setPage(p => p - 1)}
              className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button disabled={data?.last} onClick={() => setPage(p => p + 1)}
              className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
