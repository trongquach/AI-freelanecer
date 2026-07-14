import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Users, Briefcase, DollarSign, ShoppingBag, TrendingUp, Shield,
  CheckCircle, AlertTriangle, BarChart3, Clock, Activity, Megaphone, Send
} from 'lucide-react'
import { adminApi, PlatformStats } from '@/api/adminApi'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { toast } from 'sonner'

function StatCard({ label, value, icon: Icon, color, bg, suffix = '' }: {
  label: string; value: string | number; icon: any; color: string; bg: string; suffix?: string
}) {
  return (
    <div className="card p-5 hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}{suffix}</p>
      <p className="text-xs text-slate-400 mt-1">{label}</p>
    </div>
  )
}

function NavCard({ to, icon: Icon, title, subtitle, color, bg }: {
  to: string; icon: any; title: string; subtitle: string; color: string; bg: string
}) {
  return (
    <Link to={to} className="card p-6 hover:shadow-lg transition-all hover:-translate-y-0.5 group block">
      <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-400">{subtitle}</p>
    </Link>
  )
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<PlatformStats>({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats(),
  })

  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastContent, setBroadcastContent] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const handleBroadcast = async () => {
    if (!broadcastTitle || !broadcastContent) {
      toast.error('Title and content are required');
      return;
    }
    try {
      setIsBroadcasting(true);
      await adminApi.broadcastNotification(broadcastTitle, broadcastContent);
      toast.success('Broadcast sent successfully to all users!');
      setIsBroadcastOpen(false);
      setBroadcastTitle('');
      setBroadcastContent('');
    } catch (e) {
      toast.error('Failed to send broadcast');
    } finally {
      setIsBroadcasting(false);
    }
  };

  if (isLoading) return <div className="flex justify-center py-24"><LoadingSpinner size="lg" /></div>

  const successRate = stats
    ? Math.round(((stats.completedContracts) / Math.max(stats.activeContracts + stats.completedContracts, 1)) * 100)
    : 0

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-sm text-slate-400">Platform overview & management tools</p>
          </div>
        </div>
        <button 
          onClick={() => setIsBroadcastOpen(true)}
          className="btn-primary btn-md shrink-0 flex items-center gap-2"
        >
          <Megaphone className="w-4 h-4" />
          Broadcast Message
        </button>
      </div>

      {/* Stats Grid */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Platform Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <StatCard label="Total Users"       value={stats?.totalUsers ?? 0}          icon={Users}       color="text-primary-500"  bg="bg-primary-50" />
          <StatCard label="Clients"           value={stats?.totalClients ?? 0}        icon={Users}       color="text-blue-500"     bg="bg-blue-50" />
          <StatCard label="Experts"           value={stats?.totalExperts ?? 0}        icon={Shield}      color="text-accent-500"   bg="bg-accent-50" />
          <StatCard label="Total Jobs"        value={stats?.totalJobs ?? 0}           icon={Briefcase}   color="text-warning-500"  bg="bg-warning-50" />
          <StatCard label="Open Jobs"         value={stats?.openJobs ?? 0}            icon={Activity}    color="text-success-500"  bg="bg-success-50" />
          <StatCard label="Active Contracts"  value={stats?.activeContracts ?? 0}     icon={Clock}       color="text-primary-500"  bg="bg-primary-50" />
          <StatCard label="Completed"         value={stats?.completedContracts ?? 0}  icon={CheckCircle} color="text-success-500"  bg="bg-success-50" />
          <StatCard label="Total Services"    value={stats?.totalServices ?? 0}       icon={ShoppingBag} color="text-accent-500"   bg="bg-accent-50" />
        </div>
      </div>

      {/* Finance Cards */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Financial Summary</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-5 col-span-1">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-success-500" />
              <p className="text-xs text-slate-400">Transaction Volume</p>
            </div>
            <p className="text-2xl font-bold text-slate-900">${(Number(stats?.totalTransactionVolume) || 0).toLocaleString()}</p>
          </div>
          <div className="card p-5 col-span-1">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-primary-500" />
              <p className="text-xs text-slate-400">Platform Fee (10%)</p>
            </div>
            <p className="text-2xl font-bold text-slate-900">${(Number(stats?.platformFeeEarned) || 0).toLocaleString()}</p>
          </div>
          <div className="card p-5 col-span-1">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-warning-500" />
              <p className="text-xs text-slate-400">Escrow Locked</p>
            </div>
            <p className="text-2xl font-bold text-slate-900">${(Number(stats?.totalEscrowLocked) || 0).toLocaleString()}</p>
          </div>
          <div className="card p-5 col-span-1">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-accent-500" />
              <p className="text-xs text-slate-400">Project Success Rate</p>
            </div>
            <p className="text-2xl font-bold text-slate-900">{successRate}%</p>
            <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-400 to-success-400 rounded-full transition-all"
                style={{ width: `${successRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Management Navigation */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Management Tools</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <NavCard
            to="/admin/users"
            icon={Users}
            title="Manage Users"
            subtitle={`${stats?.totalUsers ?? 0} registered users · Ban or unban accounts`}
            color="text-primary-500"
            bg="bg-primary-50"
          />
          <NavCard
            to="/admin/services"
            icon={ShoppingBag}
            title="Service Moderation"
            subtitle="Approve, reject or delete services"
            color="text-warning-500"
            bg="bg-warning-50"
          />
          <NavCard
            to="/admin/jobs"
            icon={Briefcase}
            title="Manage Jobs"
            subtitle={`${stats?.totalJobs ?? 0} total jobs · Remove violating posts`}
            color="text-accent-500"
            bg="bg-accent-50"
          />
          <NavCard
            to="/admin/transactions"
            icon={DollarSign}
            title="Transactions"
            subtitle="Monitor all financial flows on the platform"
            color="text-success-500"
            bg="bg-success-50"
          />
          <NavCard
            to="/admin/withdrawals"
            icon={DollarSign}
            title="Withdrawals"
            subtitle="Approve or reject expert withdrawal requests"
            color="text-blue-500"
            bg="bg-blue-50"
          />
          <NavCard
            to="/admin/disputes"
            icon={Shield}
            title="Disputes"
            subtitle="Resolve conflicts between clients and experts"
            color="text-danger-500"
            bg="bg-danger-50"
          />
        </div>
      </div>

      {isBroadcastOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-fuchsia-500" />
              Send System Broadcast
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              This message will be sent in real-time to all users in the system.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={e => setBroadcastTitle(e.target.value)}
                  className="input-field"
                  placeholder="e.g., System Maintenance"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
                <textarea
                  value={broadcastContent}
                  onChange={e => setBroadcastContent(e.target.value)}
                  className="input-field min-h-[100px]"
                  placeholder="Type your message here..."
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setIsBroadcastOpen(false)}
                  className="btn-secondary btn-md"
                  disabled={isBroadcasting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleBroadcast}
                  className="btn-primary btn-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isBroadcasting || !broadcastTitle.trim() || !broadcastContent.trim()}
                >
                  {isBroadcasting ? <LoadingSpinner size="sm" /> : <Send className="w-4 h-4" />}
                  Send Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
