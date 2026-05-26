import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeft, Briefcase } from 'lucide-react'
import { jobApi } from '@/api/jobServiceApi'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const schema = z.object({
  title:       z.string().min(10, 'Tiêu đề ít nhất 10 ký tự').max(255),
  description: z.string().min(50, 'Mô tả ít nhất 50 ký tự'),
  budgetMin:   z.number().positive().optional(),
  budgetMax:   z.number().positive().optional(),
  deadline:    z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function CreateJobPage() {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => jobApi.create(data),
    onSuccess: (job: any) => {
      toast.success('Tạo việc làm thành công!')
      navigate(`/jobs/${job.id}`)
    },
    onError: () => toast.error('Tạo việc làm thất bại, thử lại sau'),
  })

  return (
    <div className="max-w-2xl mx-auto py-4">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Quay lại
      </button>

      <div className="card p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Đăng việc mới</h1>
            <p className="text-sm text-slate-400">Tìm chuyên gia AI phù hợp</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(d => mutate(d))} className="space-y-5" noValidate>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Tiêu đề dự án *</label>
            <input {...register('title')} className={`input ${errors.title ? 'input-error' : ''}`}
              placeholder="Xây dựng chatbot AI cho e-commerce..." />
            {errors.title && <p className="mt-1 text-xs text-danger-500">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Mô tả chi tiết *</label>
            <textarea {...register('description')} rows={6}
              className={`input resize-none ${errors.description ? 'input-error' : ''}`}
              placeholder="Mô tả yêu cầu kỹ thuật, mục tiêu, kết quả mong đợi..." />
            {errors.description && <p className="mt-1 text-xs text-danger-500">{errors.description.message}</p>}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Ngân sách tối thiểu ($)</label>
              <input type="number" {...register('budgetMin', { valueAsNumber: true })} className="input" placeholder="500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Ngân sách tối đa ($)</label>
              <input type="number" {...register('budgetMax', { valueAsNumber: true })} className="input" placeholder="5000" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Hạn chót</label>
            <input type="date" {...register('deadline')} className="input"
              min={new Date().toISOString().split('T')[0]} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate(-1)} className="btn-ghost btn-lg flex-1">Hủy</button>
            <button type="submit" disabled={isPending} className="btn-gradient btn-lg flex-1">
              {isPending ? <><LoadingSpinner size="sm" /> Đang tạo...</> : 'Đăng việc'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
