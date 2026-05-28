import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ShoppingBag, Plus, Star, DollarSign, TrendingUp, Clock } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { serviceApi } from '@/api/jobServiceApi'
import ServiceCard from '@/components/cards/ServiceCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function ExpertDashboard() {
  const { user } = useAuth()

  const { data: myServices, isLoading } = useQuery({
    queryKey: ['my-services'],
    queryFn: () => serviceApi.myServices(0, 6),
  })

  const stats = [
    { label: 'Services', value: myServices?.totalElements ?? 0, icon: ShoppingBag, color: 'text-primary-400' },
    { label: 'Đang hoạt động', value: myServices?.content?.filter((s: any) => s.status === 'ACTIVE').length ?? 0, icon: TrendingUp, color: 'text-success-500' },
    { label: 'Chờ duyệt', value: myServices?.content?.filter((s: any) => s.status === 'PENDING_REVIEW').length ?? 0, icon: Clock, color: 'text-warning-500' },
    { label: 'Rating TB', value: '4.9', icon: Star, color: 'text-warning-400' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="section-title">
            Chào mừng, {user?.fullName ?? user?.email}! 🚀
          </h1>
          <p className="section-subtitle">Manage dịch vụ và đề xuất dự án</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link to="/jobs" className="btn-secondary btn-md">Find Jobs</Link>
          <Link to="/services/new" className="btn-gradient btn-md">
            <Plus className="w-4 h-4" /> Create Service
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <Icon className={`w-5 h-5 ${color} mb-3`} />
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* My Services */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Services của tôi</h2>
          <Link to="/services/my" className="text-sm text-primary-400 hover:text-primary-300">Xem tất cả →</Link>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
        ) : !myServices?.content?.length ? (
          <div className="card p-12 text-center">
            <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">Bạn chưa có dịch vụ nào</p>
            <Link to="/services/new" className="btn-gradient btn-md">
              <Plus className="w-4 h-4" /> Create Service đầu tiên
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {myServices.content.map((svc: any) => <ServiceCard key={svc.id} service={svc} />)}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link to="/wallet" className="card-hover p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-success-500/10 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-success-400" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">My Wallet</p>
            <p className="text-sm text-slate-400">Xem số dư và giao dịch</p>
          </div>
        </Link>
        <Link to="/profile" className="card-hover p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
            <Star className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Profile chuyên gia</p>
            <p className="text-sm text-slate-400">Cập nhật kỹ năng</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
