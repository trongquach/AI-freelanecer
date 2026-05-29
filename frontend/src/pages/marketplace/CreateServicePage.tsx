import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeft, Sparkles, Box } from 'lucide-react'

import { serviceApi } from '@/api/jobServiceApi'
import { aiApi } from '@/api/aiApi'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const schema = z.object({
  title:       z.string().min(10, 'Title must be at least 10 characters').max(255),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  price:       z.number().positive('Price must be greater than 0'),
  deliveryTime:z.number().positive('Delivery time must be greater than 0'),
})
type FormData = z.infer<typeof schema>

export default function CreateServicePage() {
  const navigate = useNavigate()
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })
  
  const [skills, setSkills] = useState<string>('')

  const titleValue = watch('title')
  
  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => serviceApi.create(data),
    onSuccess: (svc: any) => {
      toast.success('Service created successfully!')
      navigate(`/marketplace/${svc.id}`)
    },
    onError: () => toast.error('Failed to create service, try again'),
  })

  const generateMutation = useMutation({
    mutationFn: () => aiApi.generateServiceDescription(titleValue, skills.split(',').map(s => s.trim()).filter(Boolean)),
    onSuccess: (generatedDesc) => {
      setValue('description', generatedDesc, { shouldValidate: true, shouldDirty: true });
      toast.success('AI generated a service description for you!');
    },
    onError: () => toast.error('AI encountered an error generating description, please try again.'),
  })

  return (
    <div className="max-w-2xl mx-auto py-4">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="card p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
            <Box className="w-5 h-5 text-slate-900" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Create New Service</h1>
            <p className="text-sm text-slate-400">Package your skills into AI Services</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(d => mutate(d))} className="space-y-5" noValidate>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Service Title *</label>
            <input {...register('title')} className={`input ${errors.title ? 'input-error' : ''}`}
              placeholder="I will develop a Machine Learning model..." />
            {errors.title && <p className="mt-1 text-xs text-danger-500">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Skills used (Comma separated)</label>
            <input value={skills} onChange={e => setSkills(e.target.value)} className="input mb-2" placeholder="Python, TensorFlow, Scikit-learn..." />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-medium text-slate-600">Detailed Description *</label>
              <button 
                type="button" 
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending || !titleValue}
                className="text-xs font-medium text-primary-400 hover:text-primary-300 flex items-center gap-1 bg-primary-500/10 px-2 py-1 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generateMutation.isPending ? <LoadingSpinner size="sm" /> : <Sparkles className="w-3 h-3" />}
                AI Generate
              </button>
            </div>
            <textarea {...register('description')} rows={8}
              className={`input resize-none ${errors.description ? 'input-error' : ''}`}
              placeholder="Detailed Description những gì bạn sẽ cung cấp trong dịch vụ này..." />
            {errors.description && <p className="mt-1 text-xs text-danger-500">{errors.description.message}</p>}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Package Price ($) *</label>
              <input type="number" {...register('price', { valueAsNumber: true })} className="input" placeholder="100" />
              {errors.price && <p className="mt-1 text-xs text-danger-500">{errors.price.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Thời gian giao hàng (Ngày) *</label>
              <input type="number" {...register('deliveryTime', { valueAsNumber: true })} className="input" placeholder="7" />
              {errors.deliveryTime && <p className="mt-1 text-xs text-danger-500">{errors.deliveryTime.message}</p>}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate(-1)} className="btn-ghost btn-lg flex-1">Cancel</button>
            <button type="submit" disabled={isPending} className="btn-gradient btn-lg flex-1">
              {isPending ? <><LoadingSpinner size="sm" /> Creating...</> : 'Publish Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
