import { useAuth } from '@/hooks/useAuth'
import { User, Mail, Shield } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAuth()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="section-title">Hồ sơ của tôi</h1>

      <div className="card p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
          {user?.fullName?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? 'U'}
        </div>
        <h2 className="text-xl font-bold text-white mb-1">{user?.fullName ?? 'Chưa cập nhật tên'}</h2>
        <span className="badge badge-primary">{user?.role}</span>
      </div>

      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Mail className="w-4 h-4 text-slate-500" />
          <div>
            <p className="text-xs text-slate-500">Email</p>
            <p className="text-sm text-white">{user?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Shield className="w-4 h-4 text-slate-500" />
          <div>
            <p className="text-xs text-slate-500">Vai trò</p>
            <p className="text-sm text-white">{user?.role}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <User className="w-4 h-4 text-slate-500" />
          <div>
            <p className="text-xs text-slate-500">Họ và tên</p>
            <p className="text-sm text-white">{user?.fullName ?? '—'}</p>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-semibold text-white mb-4">Cập nhật hồ sơ</h3>
        <p className="text-slate-500 text-sm">Tính năng đang phát triển — sẽ có trong phiên bản tiếp theo.</p>
      </div>
    </div>
  )
}
