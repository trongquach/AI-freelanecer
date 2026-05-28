import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Shield, CheckCircle, XCircle, ArrowLeft, Eye } from 'lucide-react';
import { adminApi } from '@/api/adminApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import { toast } from 'sonner';

export default function ServiceModerationPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);

  const { data: servicesData, isLoading } = useQuery({
    queryKey: ['admin-services-pending', page],
    queryFn: () => adminApi.getPendingServices(page, 20),
  });

  const activateMutation = useMutation({
    mutationFn: (id: number) => adminApi.activateService(id),
    onSuccess: () => {
      toast.success('Service activated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-services-pending'] });
    },
    onError: () => toast.error('Failed to activate service')
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number) => adminApi.rejectService(id),
    onSuccess: () => {
      toast.success('Service rejected');
      queryClient.invalidateQueries({ queryKey: ['admin-services-pending'] });
    },
    onError: () => toast.error('Failed to reject service')
  });

  if (isLoading) return <div className="flex justify-center py-24"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/dashboard" className="p-2 bg-white border border-slate-200 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-surface-200" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-warning-400" /> Service Moderation
          </h1>
          <p className="text-sm text-slate-500">{servicesData?.totalElements} services pending review</p>
        </div>
      </div>

      {servicesData?.content.length === 0 ? (
        <div className="bg-white border border-slate-200 p-12 rounded-xl border border-slate-300 text-center">
          <CheckCircle className="w-12 h-12 text-success-500/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">All caught up!</h3>
          <p className="text-slate-500">There are no services pending review at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {servicesData?.content.map((svc: any) => (
            <div key={svc.id} className="bg-white border border-slate-200 p-6 rounded-xl border border-slate-300 flex flex-col md:flex-row gap-6 justify-between items-start">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-slate-900">{svc.title}</h3>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-warning-500/10 text-warning-400">
                    PENDING
                  </span>
                </div>
                <p className="text-sm text-slate-600 line-clamp-2">{svc.description}</p>
                <div className="flex items-center gap-4 text-sm text-slate-500 pt-2">
                  <span>By: <strong className="text-slate-900">{svc.expert?.fullName}</strong></span>
                  <span>Price: <strong className="text-success-400">${svc.price}</strong></span>
                  <span>Delivery: <strong>{svc.deliveryDays} days</strong></span>
                </div>
              </div>
              
              <div className="flex gap-2 w-full md:w-auto">
                <Button variant="ghost" className="flex-1 md:flex-none">
                  <Eye className="w-4 h-4 mr-2" /> View
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 md:flex-none text-danger-400 hover:text-danger-300 hover:bg-danger-500/10 hover:border-danger-500/50"
                  onClick={() => rejectMutation.mutate(svc.id)}
                  isLoading={rejectMutation.isPending}
                >
                  <XCircle className="w-4 h-4 mr-2" /> Reject
                </Button>
                <Button 
                  variant="primary"
                  className="flex-1 md:flex-none"
                  onClick={() => activateMutation.mutate(svc.id)}
                  isLoading={activateMutation.isPending}
                >
                  <CheckCircle className="w-4 h-4 mr-2" /> Approve
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
