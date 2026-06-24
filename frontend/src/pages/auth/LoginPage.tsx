import { useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Eye, EyeOff, Sparkles, Mail, Lock } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const { login, isAuthenticated, isLoading, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as { from?: { pathname: string } } | null
  const from = state?.from?.pathname

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (isAuthenticated && user) {
      const dest = from || (user.role === 'CLIENT' ? '/dashboard/client'
        : user.role === 'EXPERT' ? '/dashboard/expert' : '/admin/dashboard')
      navigate(dest, { replace: true })
    }
  }, [isAuthenticated, user])

  const onSubmit = async (data: FormData) => {
    try {
      await login(data)
      toast.success('Signed in successfully!')
    } catch (err: any) {
      const status = err?.response?.status
      if (status === 401) {
        toast.error('Invalid email or password. Please try again.')
      } else {
        const msg = err?.response?.data?.detail || err?.response?.data?.message || 'Login failed. Please try again.'
        toast.error(msg)
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-dark relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-gradient-primary opacity-10" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-16">
            <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-slate-900" />
            </div>
            <span className="text-xl font-bold text-slate-900">AIMarket</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 leading-tight mb-4">
            Connect with<br />
            <span className="text-gradient">top AI experts</span><br />
            worldwide
          </h1>
          <p className="text-slate-500 text-lg">
            The freelance platform dedicated to artificial intelligence projects.
          </p>
        </div>
        {/* Decorative blobs */}
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary-600/20 rounded-full blur-3xl" />
        <div className="absolute top-40 -left-10 w-60 h-60 bg-accent-600/10 rounded-full blur-3xl" />
        <div className="relative z-10 text-slate-500 text-sm">
          © 2024 AIMarket. All rights reserved.
        </div>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-slate-900" />
            </div>
            <span className="text-lg font-bold text-slate-900">AIMarket</span>
          </div>

          <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h2>
          <p className="text-slate-500 mb-8">Sign in to continue</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-600 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-danger-500">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-slate-600">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  {...register('password')}
                  className={`input pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-danger-500">{errors.password.message}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="btn-primary btn-lg w-full mt-2"
            >
              {(isSubmitting || isLoading) ? (
                <><LoadingSpinner size="sm" /> Signing in...</>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign Up now
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
