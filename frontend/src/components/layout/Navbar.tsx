import { Link, useNavigate } from 'react-router-dom'
import { Sparkles, LogOut, LayoutDashboard, Briefcase, ShoppingBag, Wallet } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { cn } from '@/utils/cn'
import { useQueryClient } from '@tanstack/react-query'
import NotificationBell from '@/components/notifications/NotificationBell'

export default function Navbar() {
  const { isAuthenticated, user, logout, isClient, isExpert, isAdmin } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const handleLogout = async () => {
    await logout()
    queryClient.clear()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const dashboardLink = isAdmin() ? '/admin/dashboard' : isExpert() ? '/dashboard/expert' : '/dashboard/client'

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={isAuthenticated ? dashboardLink : "/"} className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">AIMarket</span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/jobs" icon={<Briefcase className="w-4 h-4" />}>Find Jobs</NavLink>
            <NavLink to="/marketplace" icon={<ShoppingBag className="w-4 h-4" />}>Marketplace</NavLink>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <NotificationBell />
                <Link to={dashboardLink} className="p-2 text-slate-500 hover:text-primary-600 rounded-lg hover:bg-slate-50 transition-colors">
                  <LayoutDashboard className="w-5 h-5" />
                </Link>
                <Link to="/wallet" className="p-2 text-slate-500 hover:text-primary-600 rounded-lg hover:bg-slate-50 transition-colors">
                  <Wallet className="w-5 h-5" />
                </Link>
                <Link to="/profile">
                  <div className="w-9 h-9 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold text-sm shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    {user?.fullName?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  aria-label="Sign out"
                  type="button"
                  id="logout-btn"
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-500 hover:text-danger-600 rounded-lg hover:bg-danger-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost btn-sm">Sign In</Link>
                <Link to="/register" className="btn-primary btn-sm">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

function NavLink({ to, children, icon }: { to: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <Link to={to} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 text-sm font-medium transition-colors">
      {icon}{children}
    </Link>
  )
}
