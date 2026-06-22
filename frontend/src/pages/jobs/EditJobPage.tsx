import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Briefcase, Sparkles } from 'lucide-react'
import { jobApi } from '@/api/jobServiceApi'
import { aiApi } from '@/api/aiApi'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import SkillSelector from '@/components/ui/SkillSelector'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'

const schema = z.object({
  title:       z.string().min(10, 'Title must be at least 10 characters').max(255),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  budgetMin:   z.number().positive().optional().nullable(),
  budgetMax:   z.number().positive().optional().nullable(),
  startDate:   z.string().optional().nullable(),
  deadline:    z.string().optional().nullable(),
  expectedDuration: z.string().optional().nullable(),
})
type FormData = z.infer<typeof schema>

export default function EditJobPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const [skillIds, setSkillIds] = useState<number[]>([])

  const { data: job, isLoading: isLoadingJob } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobApi.getById(Number(id)),
    enabled: !!id,
  })

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormData>({ 
    resolver: zodResolver(schema)
  })

  useEffect(() => {
    if (job) {
      if (user && job.client.id !== user.id) {
        toast.error("You do not have permission to edit this job.")
        navigate(`/jobs/${id}`)
      }
      reset({
        title: job.title,
        description: job.description,
        budgetMin: job.budgetMin,
        budgetMax: job.budgetMax,
        startDate: job.startDate ? job.startDate.split('T')[0] : undefined,
        deadline: job.deadline ? job.deadline.split('T')[0] : undefined,
        expectedDuration: job.expectedDuration || undefined,
      })
      if (job.skills) {
        setSkillIds(job.skills.map(s => s.id))
      }
    }
  }, [job, reset, user, navigate, id])

  const titleValue = watch('title')
  const descriptionValue = watch('description')

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => jobApi.update(Number(id), { ...data, skillIds }),
    onSuccess: () => {
      toast.success('Job updated successfully!')
      queryClient.invalidateQueries({ queryKey: ['job', id] })
      navigate(`/jobs/${id}`)
    },
    onError: () => toast.error('Failed to update job, try again later'),
  })

  const enhanceMutation = useMutation({
    mutationFn: () => aiApi.enhanceJobDescription(titleValue, descriptionValue),
    onSuccess: (enhancedDesc) => {
      setValue('description', enhancedDesc, { shouldValidate: true, shouldDirty: true })
      toast.success('AI optimized your job description!')
    },
    onError: () => toast.error('AI encountered an error, please try again.'),
  })

  if (isLoadingJob) {
    return <div className="flex justify-center py-24"><LoadingSpinner size="lg" /></div>
  }

  return (
    <div className="max-w-2xl mx-auto py-4">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="card p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-slate-900" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Edit Job</h1>
            <p className="text-sm text-slate-400">Update project details</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(d => mutate(d))} className="space-y-5" noValidate>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Project Title *</label>
            <input {...register('title')} className={`input ${errors.title ? 'input-error' : ''}`}
              placeholder="Build AI chatbot for e-commerce..." />
            {errors.title && <p className="mt-1 text-xs text-danger-500">{errors.title.message}</p>}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-medium text-slate-600">Detailed Description *</label>
              <button 
                type="button" 
                onClick={() => enhanceMutation.mutate()}
                disabled={enhanceMutation.isPending || !titleValue || !descriptionValue || descriptionValue.length < 20}
                className="text-xs font-medium text-primary-400 hover:text-primary-300 flex items-center gap-1 bg-primary-500/10 px-2 py-1 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {enhanceMutation.isPending ? <LoadingSpinner size="sm" /> : <Sparkles className="w-3 h-3" />}
                AI Enhance
              </button>
            </div>
            <textarea {...register('description')} rows={8}
              className={`input resize-none ${errors.description ? 'input-error' : ''}`}
              placeholder="Describe technical requirements, goals, expected outcomes..." />
            {errors.description && <p className="mt-1 text-xs text-danger-500">{errors.description.message}</p>}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Minimum Budget ($)</label>
              <input type="number" {...register('budgetMin', { valueAsNumber: true })} className="input" placeholder="500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Maximum Budget ($)</label>
              <input type="number" {...register('budgetMax', { valueAsNumber: true })} className="input" placeholder="5000" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Start Date</label>
              <input type="date" {...register('startDate')} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Deadline</label>
              <input type="date" {...register('deadline')} className="input" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Expected Duration</label>
              <input {...register('expectedDuration')} className="input" placeholder="e.g. 2 weeks, 1 month" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Required Skills *</label>
              <SkillSelector selectedIds={skillIds} onChange={setSkillIds} />
              {skillIds.length === 0 && <p className="mt-1 text-xs text-danger-500">At least one skill is required</p>}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate(-1)} className="btn-ghost btn-lg flex-1">Cancel</button>
            <button type="submit" disabled={isPending} className="btn-gradient btn-lg flex-1">
              {isPending ? <><LoadingSpinner size="sm" /> Saving...</> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
