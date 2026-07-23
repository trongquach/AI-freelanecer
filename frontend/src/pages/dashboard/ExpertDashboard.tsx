import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ShoppingBag, Plus, Star, DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { serviceApi } from '@/api/jobServiceApi'
import { contractApi } from '@/api/contractApi'
import { profileApi } from '@/api/profileApi'
import ServiceCard from '@/components/cards/ServiceCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function ExpertDashboard() {
  const { user } = useAuth()

  const { data: myServices, isLoading } = useQuery({
    queryKey: ['my-services'],
    queryFn: () => serviceApi.myServices(0, 6),
  })

  const { data: myContracts, isLoading: isLoadingContracts } = useQuery({
    queryKey: ['my-contracts'],
    queryFn: () => contractApi.getMyContracts(0, 5),
  })

  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: profileApi.getMyProfile,
  })

  const stats = [
    { label: 'Services', value: myServices?.totalElements ?? 0, icon: ShoppingBag, color: 'text-primary-400', link: '/dashboard/expert' },
    { label: 'Active', value: myServices?.content?.filter((s: any) => s.status === 'ACTIVE').length ?? 0, icon: TrendingUp, color: 'text-success-500', link: '/dashboard/expert' },
    { label: 'Completed Jobs', value: profile?.jobsDone ?? 0, icon: CheckCircle, color: 'text-success-500', link: '/dashboard/expert' },
    { label: 'Rating', value: profile?.rating && profile.totalReviews > 0 ? Number(profile.rating).toFixed(1) : '0', icon: Star, color: 'text-warning-400', link: '/profile' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="section-title">
            Welcome, {user?.fullName ?? user?.email}!
          </h1>
          <p className="section-subtitle">Manage services and project proposals</p>
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
        {stats.map(({ label, value, icon: Icon, color, link }) => (
          <Link to={link} key={label} className="card-hover p-5 block">
            <Icon className={`w-5 h-5 ${color} mb-3`} />
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-400 mt-1">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My Services */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">My Services</h2>
            <Link to="/services/my" className="text-sm text-primary-600 hover:text-primary-700">View all →</Link>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-12"><LoadingSpinner size="md" /></div>
          ) : !myServices?.content?.length ? (
            <div className="card p-8 text-center h-full flex flex-col items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">You have no services yet</p>
              <Link to="/services/new" className="btn-gradient btn-sm">
                <Plus className="w-4 h-4" /> Create Service
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {myServices.content.slice(0, 3).map((svc: any) => (
                <div key={svc.id} className="bg-white border border-slate-200 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <h3 className="text-slate-900 font-medium">{svc.title}</h3>
                    <p className="text-xs text-slate-500">{svc.status} • ${svc.price} USD</p>
                  </div>
                  <Link to={`/services/${svc.id}/edit`} className="btn-secondary btn-sm">Edit</Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Contracts */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Active Contracts</h2>
          </div>
          {isLoadingContracts ? (
            <div className="flex justify-center py-12"><LoadingSpinner size="md" /></div>
          ) : !myContracts?.content?.filter((c: any) => c.status !== 'CANCELLED').length ? (
            <div className="bg-white border border-slate-200 p-8 rounded-xl text-center h-full flex flex-col items-center justify-center">
              <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500 text-sm">No active contracts yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myContracts?.content?.filter((c: any) => c.status !== 'CANCELLED').map((contract: any) => (
                <div key={contract.id} className="bg-white border border-slate-200 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <h3 className="text-slate-900 font-medium">{contract?.jobTitle || 'Contract #' + contract.id}</h3>
                    <p className="text-xs text-slate-500">{contract.status} • Client: {contract?.client?.fullName}</p>
                  </div>
                  <Link to={`/contracts/${contract.id}`} className="btn-secondary btn-sm">View & Chat</Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link to="/wallet" className="card-hover p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-success-500/10 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-success-400" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">My Wallet</p>
            <p className="text-sm text-slate-400">View balance and transactions</p>
          </div>
        </Link>
        <Link to="/profile" className="card-hover p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
            <Star className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Expert Profile</p>
            <p className="text-sm text-slate-400">Update skills</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
