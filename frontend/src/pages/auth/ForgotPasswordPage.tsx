import { Link } from 'react-router-dom'
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authApi } from '@/api/authApi'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
})
type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async ({ email }: FormData) => {
    try {
      await authApi.forgotPassword(email)
    } catch {
      // Silently ignore — always show success to prevent email enumeration
    }
  }

  if (isSubmitSuccessful) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-success-50 border border-success-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-success-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Check your inbox</h1>
          <p className="text-slate-500 mb-8">
            If this email is registered, we've sent a password reset link. Please check your inbox and spam folder.
          </p>
          <Link to="/login" className="btn-primary btn-md inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 mb-8 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </Link>

        <div className="w-14 h-14 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center mb-6">
          <Mail className="w-7 h-7 text-primary-600" />
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-2">Forgot Password?</h1>
        <p className="text-slate-500 mb-8">
          Enter the email address associated with your account and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-600 mb-1.5">
              Email address
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
            {errors.email && (
              <p className="mt-1 text-xs text-danger-500">{errors.email.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            id="forgot-password-submit"
            className="btn-primary btn-lg w-full"
          >
            {isSubmitting ? (
              <><LoadingSpinner size="sm" /> Sending reset link...</>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>

        <p className="text-center text-slate-400 text-sm mt-6">
          Remember your password?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
