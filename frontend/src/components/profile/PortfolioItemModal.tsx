import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { PortfolioItemDto, PortfolioItemRequest } from '@/api/profileApi'
import SkillSelector from '@/components/ui/SkillSelector'

const schema = z.object({
  title: z.string().min(2, 'Title is too short').max(255),
  description: z.string().max(2000).optional().nullable(),
  imageUrl: z.string().url('Invalid URL').optional().nullable().or(z.literal('')),
  demoUrl: z.string().url('Invalid URL').optional().nullable().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

interface Props {
  isOpen: boolean
  onClose: () => void
  onSave: (data: PortfolioItemRequest) => void
  item?: PortfolioItemDto
}

export default function PortfolioItemModal({ isOpen, onClose, onSave, item }: Props) {
  const [skillIds, setSkillIds] = useState<number[]>([])

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      imageUrl: '',
      demoUrl: '',
    }
  })

  useEffect(() => {
    if (isOpen) {
      if (item) {
        reset({
          title: item.title,
          description: item.description || '',
          imageUrl: item.imageUrl || '',
          demoUrl: item.demoUrl || '',
        })
        setSkillIds(item.skills?.map(s => s.id) || [])
      } else {
        reset({ title: '', description: '', imageUrl: '', demoUrl: '' })
        setSkillIds([])
      }
    }
  }, [isOpen, item, reset])

  const onSubmit = (data: FormData) => {
    onSave({
      ...data,
      description: data.description || undefined,
      imageUrl: data.imageUrl || undefined,
      demoUrl: data.demoUrl || undefined,
      skillIds: skillIds
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-800">
            {item ? 'Edit Portfolio Project' : 'Add Portfolio Project'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="portfolio-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Project Title *</label>
              <input {...register('title')} className={`input ${errors.title ? 'input-error' : ''}`} placeholder="E.g., AI Chatbot for E-commerce" />
              {errors.title && <p className="mt-1 text-xs text-danger-500">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Description</label>
              <textarea {...register('description')} rows={3} className={`input resize-none ${errors.description ? 'input-error' : ''}`} placeholder="Describe what you built..." />
              {errors.description && <p className="mt-1 text-xs text-danger-500">{errors.description.message}</p>}
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Image URL</label>
                <input {...register('imageUrl')} className={`input ${errors.imageUrl ? 'input-error' : ''}`} placeholder="https://..." />
                {errors.imageUrl && <p className="mt-1 text-xs text-danger-500">{errors.imageUrl.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Demo / GitHub URL</label>
                <input {...register('demoUrl')} className={`input ${errors.demoUrl ? 'input-error' : ''}`} placeholder="https://..." />
                {errors.demoUrl && <p className="mt-1 text-xs text-danger-500">{errors.demoUrl.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5 mt-2">Skills & Technologies Used</label>
              <SkillSelector selectedIds={skillIds} onChange={setSkillIds} />
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button type="submit" form="portfolio-form" className="btn-primary">
            Save Project
          </button>
        </div>
      </div>
    </div>
  )
}
