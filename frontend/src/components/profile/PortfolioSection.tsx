import { useState } from 'react'
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, ExternalLink, Image as ImageIcon } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { profileApi, PortfolioItemDto, PortfolioItemRequest } from '@/api/profileApi'
import { toast } from 'sonner'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface Props {
  items: PortfolioItemDto[]
  isExpert: boolean
}

export default function PortfolioSection({ items, isExpert }: Props) {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PortfolioItemDto | null>(null)
  
  const [formData, setFormData] = useState<PortfolioItemRequest>({
    title: '',
    description: '',
    imageUrl: '',
    demoUrl: '',
    technologies: ''
  })

  const resetForm = () => {
    setFormData({ title: '', description: '', imageUrl: '', demoUrl: '', technologies: '' })
    setEditingItem(null)
    setIsModalOpen(false)
  }

  const openEditModal = (item: PortfolioItemDto) => {
    setEditingItem(item)
    setFormData({
      title: item.title,
      description: item.description || '',
      imageUrl: item.imageUrl || '',
      demoUrl: item.demoUrl || '',
      technologies: item.technologies || ''
    })
    setIsModalOpen(true)
  }

  const saveMutation = useMutation({
    mutationFn: (data: PortfolioItemRequest) => 
      editingItem 
        ? profileApi.updatePortfolioItem(editingItem.id, data)
        : profileApi.addPortfolioItem(data),
    onSuccess: () => {
      toast.success(editingItem ? 'Updated portfolio item' : 'Added portfolio item')
      queryClient.invalidateQueries({ queryKey: ['myProfile'] })
      resetForm()
    },
    onError: () => toast.error('Failed to save portfolio item')
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => profileApi.deletePortfolioItem(id),
    onSuccess: () => {
      toast.success('Deleted item')
      queryClient.invalidateQueries({ queryKey: ['myProfile'] })
    },
    onError: () => toast.error('Failed to delete item')
  })

  const reorderMutation = useMutation({
    mutationFn: (ids: number[]) => profileApi.reorderPortfolio(ids),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myProfile'] }),
    onError: () => toast.error('Failed to reorder')
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return toast.error('Title is required')
    saveMutation.mutate(formData)
  }

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === items.length - 1) return

    const newItems = [...items]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    const temp = newItems[index]
    newItems[index] = newItems[swapIndex]
    newItems[swapIndex] = temp

    reorderMutation.mutate(newItems.map(i => i.id))
  }

  if (!items?.length && !isExpert) {
    return null
  }

  return (
    <div className="card p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Portfolio</h3>
        {isExpert && (
          <button onClick={() => setIsModalOpen(true)} className="btn-secondary flex items-center gap-2 text-sm px-4 py-2">
            <Plus className="w-4 h-4" /> Add Item
          </button>
        )}
      </div>

      <div className="space-y-6">
        {items.map((item, index) => (
          <div key={item.id} className="group relative flex flex-col md:flex-row gap-4 p-4 border border-slate-100 rounded-xl hover:shadow-sm transition-shadow">
            
            {/* Reorder controls */}
            {isExpert && items.length > 1 && (
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-slate-200 rounded-md shadow-sm p-1">
                <button onClick={() => handleMove(index, 'up')} disabled={index === 0} className="p-1 hover:bg-slate-100 rounded text-slate-500 disabled:opacity-30">
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button onClick={() => handleMove(index, 'down')} disabled={index === items.length - 1} className="p-1 hover:bg-slate-100 rounded text-slate-500 disabled:opacity-30">
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Edit/Delete controls */}
            {isExpert && (
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEditModal(item)} className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-md text-slate-600 shadow-sm">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => { if(confirm('Delete this item?')) deleteMutation.mutate(item.id) }} className="p-1.5 bg-white border border-red-200 hover:bg-red-50 rounded-md text-red-600 shadow-sm">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="w-full md:w-48 h-32 bg-slate-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-8 h-8 text-slate-300" />
              )}
            </div>

            <div className="flex-1 min-w-0 py-1">
              <h4 className="font-semibold text-slate-900 mb-1 pr-16 truncate">{item.title}</h4>
              {item.technologies && (
                <div className="mb-2">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tech/Skills: </span>
                  <span className="text-sm text-slate-700">{item.technologies}</span>
                </div>
              )}
              <p className="text-sm text-slate-600 line-clamp-2 mb-3">{item.description}</p>
              
              {item.demoUrl && (
                <a href={item.demoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium">
                  View Demo/Repo <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        ))}
        {items.length === 0 && isExpert && (
          <p className="text-slate-400 italic text-sm text-center py-4">No items added. Click "Add Item" to showcase your work.</p>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">{editingItem ? 'Edit Portfolio Item' : 'Add Portfolio Item'}</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Project Title *</label>
                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="input" placeholder="e.g. AI Content Generator" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Technologies / Skills Used</label>
                <input value={formData.technologies} onChange={e => setFormData({...formData, technologies: e.target.value})} className="input" placeholder="e.g. React, OpenAI API, Python" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="input resize-none" placeholder="Describe the project and your role..." />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Image URL</label>
                <input value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="input" placeholder="https://example.com/image.png" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Demo / Repo URL</label>
                <input value={formData.demoUrl} onChange={e => setFormData({...formData, demoUrl: e.target.value})} className="input" placeholder="https://github.com/..." />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
                <button type="button" onClick={resetForm} className="btn-ghost flex-1">Cancel</button>
                <button type="submit" disabled={saveMutation.isPending} className="btn-gradient flex-1">
                  {saveMutation.isPending ? <LoadingSpinner size="sm" /> : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
