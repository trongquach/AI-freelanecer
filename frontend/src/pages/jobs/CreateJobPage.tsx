import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  ArrowLeft, Briefcase, Sparkles, CheckCircle2, CircleDollarSign,
  Tag, ChevronDown, ChevronUp, Bot, X, Check, RefreshCw
} from 'lucide-react'
import { jobApi } from '@/api/jobServiceApi'
import type { CreateJobRequest } from '@/api/jobServiceApi'
import { aiApi, type AIJobSuggestion } from '@/api/aiApi'
import { skillApi } from '@/api/skillApi'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import SkillSelector from '@/components/ui/SkillSelector'
import { useState } from 'react'

const schema = z.object({
  title:       z.string().min(10, 'Title must be at least 10 characters').max(255),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  budgetMin:   z.number().positive().optional(),
  budgetMax:   z.number().positive().optional(),
  startDate:   z.string().optional(),
  deadline:    z.string().optional(),
  expectedDuration: z.string().max(100).optional(),
})
type FormData = z.infer<typeof schema>

export default function CreateJobPage() {
  const navigate = useNavigate()
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  })

  const [skillIds, setSkillIds] = useState<number[]>([])
  const [aiResult, setAiResult] = useState<AIJobSuggestion | null>(null)
  const [showAiPanel, setShowAiPanel] = useState(false)
  const [appliedSections, setAppliedSections] = useState<Set<string>>(new Set())

  const titleValue = watch('title')
  const descriptionValue = watch('description')

  // Load all skills to match AI suggested skill names → IDs
  const { data: allSkills = [] } = useQuery({
    queryKey: ['skills'],
    queryFn: skillApi.getAll,
  })

  const { mutate: submitJob, isPending } = useMutation({
    mutationFn: (data: FormData) => jobApi.create({ ...data, skillIds } as CreateJobRequest),
    onSuccess: (job: any) => {
      toast.success('Job created successfully!')
      navigate(`/jobs/${job.id}`)
    },
    onError: () => toast.error('Failed to create job, try again later'),
  })

  const enhanceMutation = useMutation({
    mutationFn: () => aiApi.enhanceJobDescription(titleValue, descriptionValue),
    onSuccess: (result) => {
      setAiResult(result)
      setShowAiPanel(true)
      setAppliedSections(new Set())
      toast.success('AI analysis complete! Review the suggestions below.')
    },
    onError: () => toast.error('AI encountered an error, please try again.'),
  })

  const applyTitle = () => {
    if (!aiResult) return
    setValue('title', aiResult.improvedTitle, { shouldValidate: true, shouldDirty: true })
    setAppliedSections(prev => new Set(prev).add('title'))
    toast.success('AI title applied!')
  }

  const applyDescription = () => {
    if (!aiResult) return
    setValue('description', aiResult.improvedDescription, { shouldValidate: true, shouldDirty: true })
    setAppliedSections(prev => new Set(prev).add('description'))
    toast.success('AI description applied!')
  }

  const applyBudget = () => {
    if (!aiResult) return
    if (aiResult.suggestedBudgetMin) setValue('budgetMin', aiResult.suggestedBudgetMin, { shouldValidate: true })
    if (aiResult.suggestedBudgetMax) setValue('budgetMax', aiResult.suggestedBudgetMax, { shouldValidate: true })
    setAppliedSections(prev => new Set(prev).add('budget'))
    toast.success('AI budget suggestion applied!')
  }

  const applySkill = (skillName: string) => {
    // Find skill by name (case-insensitive) in the full skill list
    const matched = allSkills.find(s => s.name.toLowerCase() === skillName.toLowerCase())
    if (matched && !skillIds.includes(matched.id)) {
      setSkillIds(prev => [...prev, matched.id])
      toast.success(`Skill "${matched.name}" added!`)
    } else if (!matched) {
      toast.info(`Skill "${skillName}" not found in system. Add it manually.`)
    }
  }

  const applyAllSkills = () => {
    if (!aiResult) return
    const newIds: number[] = []
    aiResult.missingSkills.forEach(name => {
      const matched = allSkills.find(s => s.name.toLowerCase() === name.toLowerCase())
      if (matched && !skillIds.includes(matched.id)) newIds.push(matched.id)
    })
    if (newIds.length > 0) {
      setSkillIds(prev => [...prev, ...newIds])
      toast.success(`${newIds.length} skill(s) added!`)
    }
    setAppliedSections(prev => new Set(prev).add('skills'))
  }

  const canEnhance = titleValue?.length >= 10 && descriptionValue?.length >= 20

  return (
    <div className="max-w-3xl mx-auto py-4">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="space-y-4">
        {/* Main Form Card */}
        <div className="card p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Post a New Job</h1>
              <p className="text-sm text-slate-400">Find suitable AI Experts</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(d => submitJob(d))} className="space-y-5" noValidate>
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Project Title *</label>
              <input {...register('title')} className={`input ${errors.title ? 'input-error' : ''}`}
                placeholder="Build AI chatbot for e-commerce..." />
              {errors.title && <p className="mt-1 text-xs text-danger-500">{errors.title.message}</p>}
            </div>

            {/* Description + AI Enhance button */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-slate-600">Detailed Description *</label>
                <button
                  type="button"
                  onClick={() => enhanceMutation.mutate()}
                  disabled={enhanceMutation.isPending || !canEnhance}
                  className="text-xs font-semibold text-primary-400 hover:text-primary-300 flex items-center gap-1.5 bg-gradient-to-r from-primary-500/10 to-violet-500/10 border border-primary-500/20 hover:border-primary-400/40 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {enhanceMutation.isPending
                    ? <><LoadingSpinner size="sm" /> Analyzing...</>
                    : <><Sparkles className="w-3.5 h-3.5" /> AI Enhance</>
                  }
                </button>
              </div>
              <textarea {...register('description')} rows={8}
                className={`input resize-none ${errors.description ? 'input-error' : ''}`}
                placeholder="Describe technical requirements, goals, expected outcomes..." />
              {errors.description && <p className="mt-1 text-xs text-danger-500">{errors.description.message}</p>}
              {!canEnhance && (
                <p className="mt-1 text-xs text-slate-400">
                  Enter at least 10 chars in title and 20 chars in description to use AI Enhance.
                </p>
              )}
            </div>

            {/* Budget */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Minimum Budget ($)</label>
                <input type="number" {...register('budgetMin', { valueAsNumber: true })} className={`input ${errors.budgetMin ? 'input-error' : ''}`} placeholder="500" />
                {errors.budgetMin && <p className="mt-1 text-xs text-danger-500">{errors.budgetMin.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Maximum Budget ($)</label>
                <input type="number" {...register('budgetMax', { valueAsNumber: true })} className={`input ${errors.budgetMax ? 'input-error' : ''}`} placeholder="5000" />
                {errors.budgetMax && <p className="mt-1 text-xs text-danger-500">{errors.budgetMax.message}</p>}
              </div>
            </div>

            {/* Dates */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Start Date</label>
                <input type="date" {...register('startDate')} className="input"
                  min={new Date().toISOString().split('T')[0]} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Deadline</label>
                <input type="date" {...register('deadline')} className="input"
                  min={new Date().toISOString().split('T')[0]} />
              </div>
            </div>

            {/* Duration + Skills */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Expected Duration</label>
                <input type="text" {...register('expectedDuration')} className="input" placeholder="e.g. 2 weeks, 1 month" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Required Skills *</label>
                <SkillSelector selectedIds={skillIds} onChange={setSkillIds} />
                {skillIds.length === 0 && <p className="mt-1 text-xs text-danger-500">At least one skill is required</p>}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => navigate(-1)} className="btn-ghost btn-lg flex-1">Cancel</button>
              <button type="submit" disabled={isPending} className="btn-gradient btn-lg flex-1">
                {isPending ? <><LoadingSpinner size="sm" /> Creating...</> : 'Post a Job'}
              </button>
            </div>
          </form>
        </div>

        {/* ── AI Result Panel ─────────────────────────────────── */}
        {showAiPanel && aiResult && (
          <div className="card overflow-hidden border-2 border-primary-500/30 shadow-lg shadow-primary-500/10"
            style={{ animation: 'slideDown 0.3s ease-out' }}>

            {/* Panel Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-primary-500/10 via-violet-500/10 to-cyan-500/10 border-b border-primary-500/20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Bot className="w-4 h-4 text-slate-900" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">AI Enhancement Results</p>
                  <p className="text-xs text-slate-500">Review and apply AI suggestions to your job posting</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => enhanceMutation.mutate()}
                  disabled={enhanceMutation.isPending}
                  className="p-1.5 rounded-md text-slate-400 hover:text-primary-500 hover:bg-primary-50 transition-colors"
                  title="Re-analyze"
                >
                  <RefreshCw className={`w-4 h-4 ${enhanceMutation.isPending ? 'animate-spin' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowAiPanel(false)}
                  className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">

              {/* AI Reasoning / Explanation */}
              {aiResult.reasoning && (
                <div className="flex gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <Sparkles className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600 leading-relaxed italic">"{aiResult.reasoning}"</p>
                </div>
              )}

              {/* Suggested Title */}
              {aiResult.improvedTitle && aiResult.improvedTitle !== titleValue && (
                <AISection
                  icon={<Briefcase className="w-4 h-4" />}
                  label="Improved Title"
                  applied={appliedSections.has('title')}
                  onApply={applyTitle}
                >
                  <p className="text-sm text-slate-800 font-medium">{aiResult.improvedTitle}</p>
                </AISection>
              )}

              {/* Suggested Description */}
              {aiResult.improvedDescription && (
                <AISection
                  icon={<CheckCircle2 className="w-4 h-4" />}
                  label="Improved Job Description"
                  applied={appliedSections.has('description')}
                  onApply={applyDescription}
                  collapsible
                >
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap line-clamp-6">
                    {aiResult.improvedDescription}
                  </p>
                </AISection>
              )}

              {/* Suggested Budget */}
              {(aiResult.suggestedBudgetMin || aiResult.suggestedBudgetMax) && (
                <AISection
                  icon={<CircleDollarSign className="w-4 h-4" />}
                  label="Suggested Budget"
                  applied={appliedSections.has('budget')}
                  onApply={applyBudget}
                >
                  <div className="flex items-center gap-3">
                    {aiResult.suggestedBudgetMin && (
                      <div className="px-3 py-1.5 rounded-md bg-emerald-50 border border-emerald-200">
                        <p className="text-xs text-emerald-600 font-medium">Min</p>
                        <p className="text-sm font-bold text-emerald-700">${aiResult.suggestedBudgetMin.toLocaleString()}</p>
                      </div>
                    )}
                    {aiResult.suggestedBudgetMin && aiResult.suggestedBudgetMax && (
                      <span className="text-slate-400 text-sm">→</span>
                    )}
                    {aiResult.suggestedBudgetMax && (
                      <div className="px-3 py-1.5 rounded-md bg-blue-50 border border-blue-200">
                        <p className="text-xs text-blue-600 font-medium">Max</p>
                        <p className="text-sm font-bold text-blue-700">${aiResult.suggestedBudgetMax.toLocaleString()}</p>
                      </div>
                    )}
                    <p className="text-xs text-slate-500 ml-1">Based on project complexity</p>
                  </div>
                </AISection>
              )}

              {/* Suggested Skills */}
              {aiResult.missingSkills && aiResult.missingSkills.length > 0 && (
                <AISection
                  icon={<Tag className="w-4 h-4" />}
                  label="Suggested Skills to Add"
                  applied={appliedSections.has('skills')}
                  onApply={applyAllSkills}
                  applyLabel="Add All"
                >
                  <div className="flex flex-wrap gap-2">
                    {aiResult.missingSkills.map((skill) => {
                      const exists = allSkills.some(s => s.name.toLowerCase() === skill.toLowerCase())
                      const alreadyAdded = skillIds.some(id =>
                        allSkills.find(s => s.id === id)?.name.toLowerCase() === skill.toLowerCase()
                      )
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => !alreadyAdded && applySkill(skill)}
                          disabled={alreadyAdded}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all border
                            ${alreadyAdded
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-700 cursor-default'
                              : exists
                                ? 'bg-primary-50 border-primary-300 text-primary-700 hover:bg-primary-100 cursor-pointer'
                                : 'bg-slate-50 border-slate-300 text-slate-500 cursor-pointer hover:bg-slate-100'
                            }`}
                        >
                          {alreadyAdded
                            ? <Check className="w-3 h-3" />
                            : <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          }
                          {skill}
                          {!exists && <span className="text-slate-400 text-[10px]">(manual)</span>}
                        </button>
                      )
                    })}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Click a skill to add it individually, or use "Add All" button.
                    Grey tags need to be added manually via the skill selector above.
                  </p>
                </AISection>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

// ── Reusable AI suggestion section component ─────────────────
interface AISectionProps {
  icon: React.ReactNode
  label: string
  applied: boolean
  onApply: () => void
  applyLabel?: string
  collapsible?: boolean
  children: React.ReactNode
}

function AISection({ icon, label, applied, onApply, applyLabel = 'Apply', collapsible = false, children }: AISectionProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={`rounded-xl border transition-all ${applied ? 'border-emerald-300 bg-emerald-50/50' : 'border-slate-200 bg-white'}`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-inherit">
        <div className="flex items-center gap-2 text-slate-700">
          <span className={applied ? 'text-emerald-600' : 'text-primary-500'}>{icon}</span>
          <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
          {applied && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
              <Check className="w-2.5 h-2.5" /> Applied
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!applied && (
            <button
              type="button"
              onClick={onApply}
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-200 px-3 py-1 rounded-md transition-colors"
            >
              {applyLabel}
            </button>
          )}
          {collapsible && (
            <button type="button" onClick={() => setCollapsed(!collapsed)} className="text-slate-400 hover:text-slate-600">
              {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
      {!collapsed && <div className="px-4 py-3">{children}</div>}
    </div>
  )
}
