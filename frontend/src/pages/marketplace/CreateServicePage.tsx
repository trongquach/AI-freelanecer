import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Sparkles, Box } from 'lucide-react'

import { serviceApi } from '@/api/jobServiceApi'
import { aiApi } from '@/api/aiApi'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import SkillSelector from '@/components/ui/SkillSelector'

const schema = z.object({
  title:        z.string().min(10, 'Title must be at least 10 characters').max(255),
  description:  z.string().min(100, 'Description must be at least 100 characters'),
  price:        z.number().positive('Price must be greater than 0'),
  deliveryDays: z.number().int().min(1, 'Delivery time must be at least 1 day').max(365),
})
type FormData = z.infer<typeof schema>

export default function CreateServicePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })
  
  const [skills, setSkills] = useState<string>('')
  const [skillIds, setSkillIds] = useState<number[]>([])

  const titleValue = watch('title')
  
  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => {
      const payload = {
        title: data.title,
        description: data.description,
        price: data.price,
        deliveryDays: data.deliveryDays,
        tags: skills.split(',').map(s => s.trim()).filter(Boolean),
        skillIds,
      }
      return serviceApi.create(payload)
    },
    onSuccess: (svc: any) => {
      toast.success('Service created successfully!')
      navigate(`/marketplace/${svc.id}`)
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail || err?.response?.data?.message || 'Failed to create service, please try again'
      toast.error(msg)
    },
  })

  const [aiPrompt, setAiPrompt] = useState('')

  const generateMutation = useMutation({
    mutationFn: () => aiApi.generateServiceDescription(aiPrompt),
    onSuccess: (data) => {
      setValue('title', data.title, { shouldValidate: true, shouldDirty: true });
      setValue('description', data.description, { shouldValidate: true, shouldDirty: true });
      setValue('price', data.suggestedPrice || 50, { shouldValidate: true, shouldDirty: true });
      setValue('deliveryDays', data.suggestedDeliveryDays || 3, { shouldValidate: true, shouldDirty: true });
      if (data.suggestedTags && data.suggestedTags.length > 0) {
        setSkills(data.suggestedTags.join(', '));
      }
      toast.success('AI magic complete! Please review the generated service.');
    },
    onError: () => toast.error('AI encountered an error, please try again.'),
  })

  return (
    <div className="max-w-2xl mx-auto py-4">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="card p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
            <Box className="w-5 h-5 text-slate-900" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Create New Service</h1>
            <p className="text-sm text-slate-400">Package your skills into AI Services</p>
          </div>
        </div>

        {/* AI Auto Generate Box */}
        <div className="bg-primary-50/50 border border-primary-100 rounded-xl p-5 mb-8">
          <div className="flex items-start gap-3">
            <div className="bg-primary-500/10 p-2 rounded-lg text-primary-500 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-900 mb-1">✨ AI Magic Create</h3>
              <p className="text-xs text-slate-500 mb-3">
                Just type your idea or keywords. AI will auto-fill the Title, Description, Price, Delivery Time, and Tags for you!
              </p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  placeholder="e.g. Develop a Telegram Chatbot using Python" 
                  className="input flex-1 text-sm bg-white" 
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (aiPrompt) generateMutation.mutate(); } }}
                />
                <button 
                  type="button" 
                  onClick={() => generateMutation.mutate()}
                  disabled={generateMutation.isPending || !aiPrompt}
                  className="btn-gradient px-4 py-2 text-sm disabled:opacity-50"
                >
                  {generateMutation.isPending ? <LoadingSpinner size="sm" /> : 'Generate'}
                </button>
              </div>
            </div>
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
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Tags (Comma separated)</label>
            <input value={skills} onChange={e => setSkills(e.target.value)} className="input mb-2" placeholder="AI, Python, DevOps..." />
            
            <label className="block text-sm font-medium text-slate-600 mb-1.5 mt-4">Select Core Skills</label>
            <SkillSelector selectedIds={skillIds} onChange={setSkillIds} />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-medium text-slate-600">Detailed Description *</label>
            </div>
            <textarea {...register('description')} rows={8}
              className={`input resize-none ${errors.description ? 'input-error' : ''}`}
              placeholder="Describe in detail what you will provide in this service..." />
            {errors.description && <p className="mt-1 text-xs text-danger-500">{errors.description.message}</p>}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Package Price ($) *</label>
              <input type="number" {...register('price', { valueAsNumber: true })} className="input" placeholder="100" />
              {errors.price && <p className="mt-1 text-xs text-danger-500">{errors.price.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Delivery Time (Days) *</label>
              <input type="number" {...register('deliveryDays', { valueAsNumber: true })} className="input" placeholder="7" />
              {errors.deliveryDays && <p className="mt-1 text-xs text-danger-500">{errors.deliveryDays.message}</p>}
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
