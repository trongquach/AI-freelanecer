import { useAuth } from '@/hooks/useAuth'
import { User, Mail, Shield } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAuth()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="section-title">My Profile</h1>

      <div className="card p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center text-slate-900 text-3xl font-bold mx-auto mb-4">
          {user?.fullName?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? 'U'}
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">{user?.fullName ?? 'Name not updated'}</h2>
        <span className="badge badge-primary">{user?.role}</span>
      </div>

      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Mail className="w-4 h-4 text-slate-400" />
          <div>
            <p className="text-xs text-slate-400">Email</p>
            <p className="text-sm text-slate-900">{user?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Shield className="w-4 h-4 text-slate-400" />
          <div>
            <p className="text-xs text-slate-400">Role</p>
            <p className="text-sm text-slate-900">{user?.role}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <User className="w-4 h-4 text-slate-400" />
          <div>
            <p className="text-xs text-slate-400">Full Name</p>
            <p className="text-sm text-slate-900">{user?.fullName ?? '—'}</p>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Update Profile</h3>
        <p className="text-slate-400 text-sm">Feature in development — coming in the next version.</p>
      </div>
    </div>
  )
}
