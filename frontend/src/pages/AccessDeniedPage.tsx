import { Link, useNavigate } from 'react-router-dom'
import { ShieldX, ArrowLeft, Home } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function AccessDeniedPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const dashboardLink = user?.role === 'ADMIN'
    ? '/admin/dashboard'
    : user?.role === 'EXPERT'
    ? '/dashboard/expert'
    : '/dashboard/client'

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="w-24 h-24 rounded-2xl bg-danger-50 border border-danger-100 flex items-center justify-center mx-auto mb-8">
          <ShieldX className="w-12 h-12 text-danger-500" />
        </div>

        {/* Code */}
        <p className="text-6xl font-black text-slate-200 mb-2">403</p>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-slate-900 mb-3">Access Denied</h1>
        <p className="text-slate-500 mb-8">
          You don't have permission to access this page.
          Please check your account role or contact an administrator.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="btn-ghost btn-md inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          {user ? (
            <Link to={dashboardLink} className="btn-primary btn-md inline-flex items-center gap-2">
              <Home className="w-4 h-4" />
              My Dashboard
            </Link>
          ) : (
            <Link to="/login" className="btn-primary btn-md">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
