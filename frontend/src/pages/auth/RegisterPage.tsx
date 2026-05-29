import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Eye, EyeOff, Sparkles, Mail, Lock, User as UserIcon } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const schema = z.object({
  fullName: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(8, 'Password ít nhất 8 ký tự'),
  confirmPassword: z.string(),
  role: z.enum(['CLIENT', 'EXPERT']),
  agreeTerms: z.literal(true, {
    errorMap: () => ({ message: 'Bạn phải đồng ý với điều khoản' }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu không khớp',
  path: ['confirmPassword'],
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const { register: authRegister, isAuthenticated, isLoading, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      role: 'CLIENT',
    }
  })

  const selectedRole = watch('role')

  useEffect(() => {
    if (isAuthenticated && user) {
      const dest = from || (user.role === 'CLIENT' ? '/dashboard/client'
        : user.role === 'EXPERT' ? '/dashboard/expert' : '/admin/dashboard')
      navigate(dest, { replace: true })
    }
  }, [isAuthenticated, user])

  const onSubmit = async (data: FormData) => {
    try {
      await authRegister({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        role: data.role,
      })
      toast.success('Sign Up thành công!')
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.response?.data?.message || 'Email đã tồn tại hoặc có lỗi xảy ra'
      toast.error(msg)
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
            Khởi đầu hành trình<br />
            <span className="text-gradient">freelance AI</span> của bạn
          </h1>
          <p className="text-slate-400 text-lg">
            Tham gia cộng đồng các chuyên gia AI và những khách hàng đang tìm kiếm giải pháp đột phá.
          </p>
        </div>
        {/* Decorative blobs */}
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary-600/20 rounded-full blur-3xl" />
        <div className="absolute top-40 -left-10 w-60 h-60 bg-accent-600/10 rounded-full blur-3xl" />
        <div className="relative z-10 text-slate-400 text-sm">
          © 2024 AIMarket. All rights reserved.
        </div>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md py-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-slate-900" />
            </div>
            <span className="text-lg font-bold text-slate-900">AIMarket</span>
          </div>

          <h2 className="text-3xl font-bold text-slate-900 mb-2">Tạo tài khoản</h2>
          <p className="text-slate-400 mb-8">Điền thông tin bên dưới để bắt đầu</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            
            {/* Role Toggle */}
            <div className="flex p-1 bg-slate-100 rounded-lg">
              <label className="flex-1 cursor-pointer">
                <input type="radio" value="CLIENT" {...register('role')} className="sr-only" />
                <div className={`text-center py-2 text-sm font-medium rounded-md transition-all ${
                  selectedRole === 'CLIENT' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}>
                  Tôi muốn thuê chuyên gia
                </div>
              </label>
              <label className="flex-1 cursor-pointer">
                <input type="radio" value="EXPERT" {...register('role')} className="sr-only" />
                <div className={`text-center py-2 text-sm font-medium rounded-md transition-all ${
                  selectedRole === 'EXPERT' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}>
                  Tôi là chuyên gia AI
                </div>
              </label>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-600 mb-1.5">
                Họ và Tên
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="fullName"
                  type="text"
                  {...register('fullName')}
                  className={`input pl-10 ${errors.fullName ? 'input-error' : ''}`}
                  placeholder="John Doe"
                />
              </div>
              {errors.fullName && <p className="mt-1 text-xs text-danger-500">{errors.fullName.message}</p>}
            </div>

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
              <label htmlFor="password" className="block text-sm font-medium text-slate-600 mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
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

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-600 mb-1.5">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                  className={`input pl-10 pr-10 ${errors.confirmPassword ? 'input-error' : ''}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs text-danger-500">{errors.confirmPassword.message}</p>}
            </div>

            {/* Terms */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="agreeTerms"
                  type="checkbox"
                  {...register('agreeTerms')}
                  className="w-4 h-4 border border-slate-300 rounded bg-slate-50 focus:ring-3 focus:ring-primary-300 accent-primary-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="agreeTerms" className="text-slate-600">
                  Tôi đồng ý với{' '}
                  <a href="#" className="text-primary-500 hover:underline">Điều khoản dịch vụ</a>
                  {' '}và{' '}
                  <a href="#" className="text-primary-500 hover:underline">Chính sách bảo mật</a>
                </label>
                {errors.agreeTerms && <p className="mt-1 text-xs text-danger-500">{errors.agreeTerms.message}</p>}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="btn-primary btn-lg w-full mt-4"
            >
              {(isSubmitting || isLoading) ? (
                <><LoadingSpinner size="sm" /> Đang xử lý...</>
              ) : 'Sign Up'}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-8">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">
              Sign In ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
