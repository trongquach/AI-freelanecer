import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Users, Briefcase, DollarSign, ShoppingBag, TrendingUp, Shield, Ban, CheckCircle, XCircle } from 'lucide-react'
import api from '@/api/axiosInstance'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { toast } from 'sonner'

interface PlatformStats {
  totalUsers: number
  totalClients: number
  totalExperts: number
  totalJobs: number
  openJobs: number
  activeContracts: number
  completedContracts: number
  totalServices: number
  totalTransactionVolume: number
  platformFeeEarned: number
}

export default function AdminDashboard() {
  const queryClient = useQueryClient()

  const { data: stats, isLoading } = useQuery<PlatformStats>({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/stats').then(r => r.data),
  })

  const { data: users } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/admin/users?page=0&size=20').then(r => r.data),
  })

  const banMutation = useMutation({
    mutationFn: (id: number) => api.post(`/admin/users/${id}/ban`),
    onSuccess: () => { toast.success('Đã cấm người dùng'); queryClient.invalidateQueries({ queryKey: ['admin-users'] }) },
  })

  const activateSvcMutation = useMutation({
    mutationFn: (id: number) => api.post(`/admin/services/${id}/activate`),
    onSuccess: () => { toast.success('Services đã được duyệt'); queryClient.invalidateQueries({ queryKey: ['admin-stats'] }) },
  })

  const rejectSvcMutation = useMutation({
    mutationFn: (id: number) => api.post(`/admin/services/${id}/reject`),
    onSuccess: () => { toast.success('Services đã bị từ chối'); queryClient.invalidateQueries({ queryKey: ['admin-stats'] }) },
  })

  if (isLoading) return <div className="flex justify-center py-24"><LoadingSpinner size="lg" /></div>

  const statCards = [
    { label: 'Total Users',  value: stats?.totalUsers ?? 0,              icon: Users,       color: 'text-primary-400',  bg: 'bg-primary-500/10' },
    { label: 'Client',       value: stats?.totalClients ?? 0,            icon: Users,       color: 'text-blue-400',     bg: 'bg-blue-500/10' },
    { label: 'Expert',       value: stats?.totalExperts ?? 0,            icon: Shield,      color: 'text-accent-400',   bg: 'bg-accent-500/10' },
    { label: 'Tổng việc làm',    value: stats?.totalJobs ?? 0,              icon: Briefcase,   color: 'text-warning-400',  bg: 'bg-warning-500/10' },
    { label: 'Việc đang tuyển',  value: stats?.openJobs ?? 0,               icon: TrendingUp,  color: 'text-success-400',  bg: 'bg-success-500/10' },
    { label: 'Contracts active',  value: stats?.activeContracts ?? 0,        icon: ShoppingBag, color: 'text-primary-400',  bg: 'bg-primary-500/10' },
    { label: 'Completed',       value: stats?.completedContracts ?? 0,     icon: CheckCircle, color: 'text-success-400',  bg: 'bg-success-500/10' },
    { label: 'Tổng dịch vụ',     value: stats?.totalServices ?? 0,          icon: ShoppingBag, color: 'text-accent-400',   bg: 'bg-accent-500/10' },
  ]

  const financeCards = [
    { label: 'Tổng giao dịch',     value: `$${(stats?.totalTransactionVolume ?? 0).toLocaleString()}`, icon: DollarSign, color: 'text-success-400' },
    { label: 'Phí nền tảng (10%)', value: `$${(stats?.platformFeeEarned ?? 0).toLocaleString()}`,     icon: TrendingUp, color: 'text-primary-400' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="section-title flex items-center gap-3">
          <Shield className="w-7 h-7 text-primary-400" /> Admin Dashboard
        </h1>
        <p className="section-subtitle">Manage toàn bộ nền tảng AIMarket</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-5 animate-fade-in">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{value.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Finance */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">💰 Tài chính</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {financeCards.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-6">
              <div className="flex items-center gap-3 mb-2">
                <Icon className={`w-5 h-5 ${color}`} />
                <p className="text-sm text-slate-400">{label}</p>
              </div>
              <p className="text-3xl font-bold text-slate-900">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">⚡ Hành động nhanh</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="card p-5">
            <h3 className="font-semibold text-slate-900 mb-2">Duyệt dịch vụ</h3>
            <p className="text-xs text-slate-400 mb-3">Phê duyệt hoặc từ chối dịch vụ chờ duyệt</p>
            <Link to="/admin/services" className="btn-primary btn-sm w-full block text-center">
              <CheckCircle className="w-3.5 h-3.5 inline mr-1" /> Manage dịch vụ
            </Link>
          </div>
          <div className="card p-5">
            <h3 className="font-semibold text-slate-900 mb-2">Manage người dùng</h3>
            <p className="text-xs text-slate-400 mb-3">Xem, cấm hoặc khôi phục tài khoản</p>
            <Link to="/admin/users" className="btn-secondary btn-sm w-full block text-center">
              <Users className="w-3.5 h-3.5 inline mr-1" /> Danh sách ({stats?.totalUsers ?? 0})
            </Link>
          </div>
          <div className="card p-5">
            <h3 className="font-semibold text-slate-900 mb-2">Báo cáo</h3>
            <p className="text-xs text-slate-400 mb-3">Xuất báo cáo tài chính và hoạt động</p>
            <button className="btn-secondary btn-sm w-full">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> Xuất CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
