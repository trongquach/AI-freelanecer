import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Briefcase, Plus, Clock, CheckCircle, DollarSign, TrendingUp } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { jobApi } from '@/api/jobServiceApi'
import JobCard from '@/components/cards/JobCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function ClientDashboard() {
  const { user } = useAuth()

  const { data: myJobs, isLoading } = useQuery({
    queryKey: ['my-jobs'],
    queryFn: () => jobApi.myJobs(0, 6),
  })

  const stats = [
    { label: 'Total jobs posted',    value: myJobs?.totalElements ?? 0, icon: Briefcase,   color: 'text-primary-400' },
    { label: 'Recruiting',         value: myJobs?.content.filter(j => j.status === 'OPEN').length ?? 0, icon: Clock, color: 'text-warning-500' },
    { label: 'In progress',    value: myJobs?.content.filter(j => j.status === 'IN_PROGRESS').length ?? 0, icon: TrendingUp, color: 'text-blue-400' },
    { label: 'Completed',        value: myJobs?.content.filter(j => j.status === 'COMPLETED').length ?? 0, icon: CheckCircle, color: 'text-success-500' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="section-title">
            Hello, {user?.fullName ?? user?.email}! 👋
          </h1>
          <p className="section-subtitle">Manage projects and find AI experts</p>
        </div>
        <Link to="/jobs/new" className="btn-gradient btn-md shrink-0">
          <Plus className="w-4 h-4" /> Post a New Job
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Recent Jobs</h2>
            <Link to="/jobs/my" className="text-sm text-primary-600 hover:text-primary-700">
              View all →
            </Link>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-12"><LoadingSpinner size="md" /></div>
          ) : !myJobs?.content.length ? (
            <div className="card p-12 text-center">
              <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">You haven't posted any jobs yet</p>
              <Link to="/jobs/new" className="btn-gradient btn-sm">
                <Plus className="w-4 h-4" /> Post first Job
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {myJobs.content.slice(0, 3).map(job => (
                <div key={job.id} className="bg-white border border-slate-200 p-4 rounded-xl border border-slate-300 flex justify-between items-center">
                  <div>
                    <h3 className="text-slate-900 font-medium">{job.title}</h3>
                    <p className="text-xs text-slate-500">{job.status} • {job.viewCount} views</p>
                  </div>
                  <Link to={`/jobs/${job.id}/proposals`} className="btn-secondary btn-sm">Proposals</Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Contracts Placeholder */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Active Contracts</h2>
            <Link to="/contracts" className="text-sm text-primary-600 hover:text-primary-700">
              View all →
            </Link>
          </div>
          <div className="bg-white border border-slate-200 p-8 rounded-xl border border-slate-300 text-center">
             <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
             <p className="text-slate-500 text-sm">Active contracts will be displayed here.</p>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link to="/marketplace" className="card-hover p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Browse Marketplace</p>
            <p className="text-sm text-slate-400">Find available AI Services</p>
          </div>
        </Link>
        <Link to="/wallet" className="card-hover p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-success-500/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-success-400" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">My Wallet</p>
            <p className="text-sm text-slate-400">Manage payments</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
