import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Star, Clock, ShoppingCart, CheckCircle } from 'lucide-react'
import { serviceApi } from '@/api/jobServiceApi'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useAuth } from '@/hooks/useAuth'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { isAuthenticated, isClient, user } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data: service, isLoading, isError } = useQuery({
    queryKey: ['service', id],
    queryFn: () => serviceApi.getById(Number(id)),
    enabled: !!id,
  })

  const activateMutation = useMutation({
    mutationFn: () => serviceApi.activate(Number(id)),
    onSuccess: () => {
      toast.success('Service activated!');
      queryClient.invalidateQueries({ queryKey: ['service', id] });
    },
    onError: () => toast.error('Error activating service.')
  });

  const deactivateMutation = useMutation({
    mutationFn: () => serviceApi.deactivate(Number(id)),
    onSuccess: () => {
      toast.success('Service paused.');
      queryClient.invalidateQueries({ queryKey: ['service', id] });
    },
    onError: () => toast.error('Error pausing service.')
  });

  const deleteMutation = useMutation({
    mutationFn: () => serviceApi.delete(Number(id)),
    onSuccess: () => {
      toast.success('Service deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['myServices'] });
      queryClient.invalidateQueries({ queryKey: ['service', id] });
      navigate('/services/my');
    },
    onError: () => toast.error('Error deleting service.')
  });

  const orderMutation = useMutation({
    mutationFn: () => serviceApi.order(Number(id)),
    onSuccess: (data) => {
      toast.success('Service ordered successfully!');
      navigate(`/contracts/${data.id}`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error ordering service. Please check your balance.');
    }
  });

  if (isLoading) return <div className="flex justify-center py-24"><LoadingSpinner size="lg" /></div>
  if (isError || !service) return (
    <div className="text-center py-24">
      <p className="text-danger-500 text-lg">Service not found.</p>
      <Link to="/marketplace" className="btn-ghost btn-md mt-4">← Back to Marketplace</Link>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto py-4">
      <Link to="/marketplace" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Marketplace
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-2xl font-bold text-slate-900">{service.title}</h1>
              <span className={`badge ${service.status === 'ACTIVE' ? 'badge-success' : 'badge-neutral'}`}>
                {service.status}
              </span>
            </div>

            {/* Expert info */}
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-200">
              <Link to={`/profile/${service.expert.id}`} className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-slate-900 font-bold text-lg hover:ring-2 hover:ring-primary-500 transition-all">
                {service.expert.fullName?.[0] ?? 'E'}
              </Link>
              <div>
                <Link to={`/profile/${service.expert.id}`} className="font-semibold text-slate-900 hover:text-primary-600 hover:underline">{service.expert.fullName}</Link>
                <div className="flex items-center gap-2 text-sm text-slate-400 mt-0.5">
                  <span className="flex items-center gap-1 text-warning-500">
                    <Star className="w-3.5 h-3.5 fill-warning-500" /> {(service.expert.rating ?? 0).toFixed(1)}
                  </span>
                  <span>•</span>
                  <span>{service.expert.totalReviews} reviews</span>
                </div>
              </div>
            </div>

            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">Service Description</h3>
            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{service.description}</p>
          </div>

          {/* Tags */}
          {service.tags?.length > 0 && (
            <div className="card p-6">
              <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {service.tags.map((tag: string) => <span key={tag} className="badge badge-neutral">{tag}</span>)}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card p-6 sticky top-20 space-y-5">
            <div>
              <p className="text-xs text-slate-400 mb-1">Service Price</p>
              <p className="text-3xl font-bold text-slate-900">${service.price.toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {service.deliveryDays} days</span>
              <span className="flex items-center gap-1.5"><ShoppingCart className="w-4 h-4" /> {service.orderCount} orders</span>
            </div>

            <div className="space-y-2 text-sm">
              {['Free Consultation', '30 days warranty', 'Secure Escrow Payment'].map(f => (
                <div key={f} className="flex items-center gap-2 text-slate-400">
                  <CheckCircle className="w-4 h-4 text-success-500 shrink-0" /> {f}
                </div>
              ))}
            </div>

            {isAuthenticated && isClient() ? (
              <button 
                onClick={() => orderMutation.mutate()} 
                disabled={orderMutation.isPending}
                className="btn-gradient btn-lg w-full flex justify-center items-center gap-2"
              >
                {orderMutation.isPending && <LoadingSpinner size="sm" />}
                {orderMutation.isPending ? 'Processing...' : 'Order Service Now'}
              </button>
            ) : !isAuthenticated ? (
              <Link to="/login" className="btn-primary btn-lg w-full block text-center">Sign In to Order</Link>
            ) : null}

            {isAuthenticated && user?.id === service.expert.id && (
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <button 
                  onClick={() => navigate(`/services/${service.id}/edit`)}
                  className="btn-secondary btn-md w-full text-center"
                >
                  Edit Service
                </button>
                {service.status === 'ACTIVE' && (
                  <button 
                    onClick={() => deactivateMutation.mutate()}
                    disabled={deactivateMutation.isPending}
                    className="btn-outline btn-md w-full text-warning-600 border-warning-600 hover:bg-warning-50"
                  >
                    Pause Service
                  </button>
                )}
                {service.status === 'INACTIVE' && (
                  <button 
                    onClick={() => activateMutation.mutate()}
                    disabled={activateMutation.isPending}
                    className="btn-outline btn-md w-full text-success-600 border-success-600 hover:bg-success-50"
                  >
                    Activate Service
                  </button>
                )}
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this service?')) {
                      deleteMutation.mutate()
                    }
                  }}
                  disabled={deleteMutation.isPending}
                  className="btn-outline btn-md w-full text-danger-600 border-danger-600 hover:bg-danger-50"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete Service'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
