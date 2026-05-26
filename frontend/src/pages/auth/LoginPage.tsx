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
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu ít nhất 8 ký tự'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const { login, isAuthenticated, isLoading, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname

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
      toast.success('Đăng nhập thành công!')
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Email hoặc mật khẩu không đúng'
      toast.error(msg)
    }
  }

  return (
    <div className="min-h-screen bg-surface-950 flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-dark relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-gradient-primary opacity-10" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-16">
            <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">AIMarket</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Kết nối với<br />
            <span className="text-gradient">chuyên gia AI</span><br />
            hàng đầu
          </h1>
          <p className="text-slate-400 text-lg">
            Nền tảng freelance dành riêng cho các dự án trí tuệ nhân tạo.
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
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">AIMarket</span>
          </div>

          <h2 className="text-3xl font-bold text-white mb-2">Chào mừng trở lại</h2>
          <p className="text-slate-400 mb-8">Đăng nhập để tiếp tục</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
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
                <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                  Mật khẩu
                </label>
                <Link to="/forgot-password" className="text-xs text-primary-400 hover:text-primary-300">
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
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
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
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
                <><LoadingSpinner size="sm" /> Đang đăng nhập...</>
              ) : 'Đăng nhập'}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-8">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
