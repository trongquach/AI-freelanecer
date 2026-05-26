import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Star, Clock, ShoppingCart, CheckCircle } from 'lucide-react'
import { serviceApi } from '@/api/jobServiceApi'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useAuth } from '@/hooks/useAuth'

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { isAuthenticated, isClient } = useAuth()

  const { data: service, isLoading, isError } = useQuery({
    queryKey: ['service', id],
    queryFn: () => serviceApi.getById(Number(id)),
    enabled: !!id,
  })

  if (isLoading) return <div className="flex justify-center py-24"><LoadingSpinner size="lg" /></div>
  if (isError || !service) return (
    <div className="text-center py-24">
      <p className="text-danger-500 text-lg">Không tìm thấy dịch vụ này.</p>
      <Link to="/marketplace" className="btn-ghost btn-md mt-4">← Quay lại Marketplace</Link>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto py-4">
      <Link to="/marketplace" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Marketplace
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h1 className="text-2xl font-bold text-white mb-4">{service.title}</h1>

            {/* Expert info */}
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-surface-800">
              <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-lg">
                {service.expert.fullName?.[0] ?? 'E'}
              </div>
              <div>
                <p className="font-semibold text-white">{service.expert.fullName}</p>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <span className="flex items-center gap-1 text-warning-500">
                    <Star className="w-3.5 h-3.5 fill-warning-500" /> {(service.expert.rating ?? 0).toFixed(1)}
                  </span>
                  <span>•</span>
                  <span>{service.expert.totalReviews} đánh giá</span>
                </div>
              </div>
            </div>

            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">Mô tả dịch vụ</h3>
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{service.description}</p>
          </div>

          {/* Tags */}
          {service.tags?.length > 0 && (
            <div className="card p-6">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">Tags</h3>
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
              <p className="text-xs text-slate-500 mb-1">Giá dịch vụ</p>
              <p className="text-3xl font-bold text-white">${service.price.toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {service.deliveryDays} ngày</span>
              <span className="flex items-center gap-1.5"><ShoppingCart className="w-4 h-4" /> {service.orderCount} đơn</span>
            </div>

            <div className="space-y-2 text-sm">
              {['Tư vấn miễn phí', 'Bảo hành 30 ngày', 'Thanh toán an toàn qua Escrow'].map(f => (
                <div key={f} className="flex items-center gap-2 text-slate-400">
                  <CheckCircle className="w-4 h-4 text-success-500 shrink-0" /> {f}
                </div>
              ))}
            </div>

            {isAuthenticated && isClient() ? (
              <button className="btn-gradient btn-lg w-full">Đặt dịch vụ ngay</button>
            ) : !isAuthenticated ? (
              <Link to="/login" className="btn-primary btn-lg w-full block text-center">Đăng nhập để đặt</Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
