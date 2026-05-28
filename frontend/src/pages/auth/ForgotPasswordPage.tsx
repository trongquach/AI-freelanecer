import { Link } from 'react-router-dom'
import { ArrowLeft, Mail } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { authApi } from '@/api/authApi'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const schema = z.object({ email: z.string().email('Email không hợp lệ') })
type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting, isSubmitSuccessful } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })
  const onSubmit = async ({ email }: { email: string }) => {
    try { await authApi.forgotPassword(email) }
    catch { /* silently ignore — always show success */ }
  }
  if (isSubmitSuccessful) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-success-500/10 border border-success-500/20 flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8 text-success-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Kiểm tra email của bạn</h1>
        <p className="text-slate-400 mb-6">Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu.</p>
        <Link to="/login" className="btn-primary btn-md">← Quay lại đăng nhập</Link>
      </div>
    </div>
  )
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link to="/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 mb-8 text-sm"><ArrowLeft className="w-4 h-4" />Quay lại đăng nhập</Link>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Forgot Password?</h1>
        <p className="text-slate-400 mb-8">Nhập email của bạn để nhận link đặt lại mật khẩu.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="email" {...register('email')} className={`input pl-10 ${errors.email ? 'input-error' : ''}`} placeholder="you@example.com" />
            </div>
            {errors.email && <p className="mt-1 text-xs text-danger-500">{errors.email.message}</p>}
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary btn-lg w-full">
            {isSubmitting ? <><LoadingSpinner size="sm" /> Đang gửi...</> : 'Send link đặt lại'}
          </button>
        </form>
      </div>
    </div>
  )
}
