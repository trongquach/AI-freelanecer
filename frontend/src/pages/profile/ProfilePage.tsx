import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { User, Mail, Shield, Camera, Edit2, Plus, ExternalLink, Trash2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { profileApi, PortfolioItemDto, PortfolioItemRequest } from '@/api/profileApi'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import SkillSelector from '@/components/ui/SkillSelector'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import PortfolioItemModal from '@/components/profile/PortfolioItemModal'

const schema = z.object({
  fullName: z.string().min(2, 'Name is too short').max(100),
  bio: z.string().max(1000).optional().nullable(),
  hourlyRate: z.number().positive().optional().nullable(),
  portfolioUrl: z.string().url('Invalid URL').optional().nullable().or(z.literal('')),
  timezone: z.string().max(100).optional().nullable(),
  isAvailable: z.boolean().optional(),
})

type FormData = z.infer<typeof schema>

export default function ProfilePage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [skillIds, setSkillIds] = useState<number[]>([])
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  
  // Portfolio modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPortfolioItem, setEditingPortfolioItem] = useState<PortfolioItemDto | undefined>(undefined)

  const { data: profile, isLoading } = useQuery({
    queryKey: ['myProfile'],
    queryFn: profileApi.getMyProfile
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      bio: '',
      hourlyRate: null,
      portfolioUrl: '',
      timezone: '',
      isAvailable: true,
    }
  })

  useEffect(() => {
    if (profile) {
      reset({
        fullName: profile.fullName || '',
        bio: profile.bio || '',
        hourlyRate: profile.hourlyRate || null,
        portfolioUrl: profile.portfolioUrl || '',
        timezone: profile.timezone || '',
        isAvailable: profile.isAvailable,
      })
      setAvatarPreview(profile.avatarUrl)
      if (profile.skills) {
        setSkillIds(profile.skills.map(s => s.id))
      }
    }
  }, [profile, reset])

  const updateProfileMutation = useMutation({
    mutationFn: (data: FormData) => profileApi.updateMyProfile({ 
      ...data, 
      avatarUrl: avatarPreview || undefined,
      bio: data.bio || undefined,
      portfolioUrl: data.portfolioUrl || undefined,
      timezone: data.timezone || undefined,
      hourlyRate: data.hourlyRate || undefined,
      skillIds: skillIds
    }),
    onSuccess: () => {
      toast.success('Profile updated successfully!')
      setIsEditing(false)
      queryClient.invalidateQueries({ queryKey: ['myProfile'] })
    },
    onError: () => {
      toast.error('Failed to update profile.')
    }
  })

  const addPortfolioMutation = useMutation({
    mutationFn: (data: PortfolioItemRequest) => profileApi.addPortfolioItem(data),
    onSuccess: () => {
      toast.success('Project added to portfolio!')
      setIsModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['myProfile'] })
    },
    onError: () => toast.error('Failed to add project.')
  })

  const updatePortfolioMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: PortfolioItemRequest }) => profileApi.updatePortfolioItem(id, data),
    onSuccess: () => {
      toast.success('Portfolio project updated!')
      setIsModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['myProfile'] })
    },
    onError: () => toast.error('Failed to update project.')
  })

  const deletePortfolioMutation = useMutation({
    mutationFn: (id: number) => profileApi.deletePortfolioItem(id),
    onSuccess: () => {
      toast.success('Project deleted.')
      queryClient.invalidateQueries({ queryKey: ['myProfile'] })
    },
    onError: () => toast.error('Failed to delete project.')
  })

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSavePortfolio = (data: PortfolioItemRequest) => {
    if (editingPortfolioItem) {
      updatePortfolioMutation.mutate({ id: editingPortfolioItem.id, data })
    } else {
      addPortfolioMutation.mutate(data)
    }
  }

  if (isLoading) return <div className="p-8 flex justify-center"><LoadingSpinner /></div>

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="flex justify-between items-center">
        <h1 className="section-title mb-0">My Profile</h1>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="px-4 py-2 border border-slate-300 rounded-lg text-black hover:bg-slate-100 flex items-center gap-2 text-sm font-medium transition-colors">
            <Edit2 className="w-4 h-4" /> Edit Profile
          </button>
        )}
      </div>

      <div className="card p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-transparent h-32" />
        <div className="relative z-10">
          <div className="w-24 h-24 mx-auto mb-4 relative group">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center text-slate-900 text-3xl font-bold border-4 border-white shadow-md">
                {profile?.fullName?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? 'U'}
              </div>
            )}
            
            {isEditing && (
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <Camera className="w-6 h-6" />
                <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleAvatarChange} />
              </label>
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{profile?.fullName ?? 'Name not updated'}</h2>
          <div className="flex items-center justify-center gap-2">
            <span className="badge badge-primary">{user?.role}</span>
            {user?.role === 'EXPERT' && profile?.isAvailable && <span className="badge bg-green-100 text-green-700">Available</span>}
          </div>
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit(d => updateProfileMutation.mutate(d))} className="card p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Full Name *</label>
              <input {...register('fullName')} className={`input ${errors.fullName ? 'input-error' : ''}`} placeholder="John Doe" />
              {errors.fullName && <p className="mt-1 text-xs text-danger-500">{errors.fullName.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Personal Website / GitHub</label>
              <input {...register('portfolioUrl')} className="input" placeholder="https://github.com/..." />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Timezone</label>
              <input {...register('timezone')} className="input" placeholder="e.g., Asia/Ho_Chi_Minh or UTC+7" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Bio</label>
            <textarea {...register('bio')} rows={4} className="input resize-none" placeholder="Tell clients about yourself..." />
          </div>

          {user?.role === 'EXPERT' && (
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Hourly Rate ($)</label>
                <input type="number" {...register('hourlyRate', { valueAsNumber: true })} className="input" placeholder="50" />
              </div>
              <div className="flex items-center gap-3 mt-6">
                <input type="checkbox" id="isAvailable" {...register('isAvailable')} className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                <label htmlFor="isAvailable" className="text-sm font-medium text-slate-700">Available for hire</label>
              </div>
            </div>
          )}

          {user?.role === 'EXPERT' && (
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5 mt-4">My AI Skills</label>
              <SkillSelector selectedIds={skillIds} onChange={setSkillIds} />
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setIsEditing(false)} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={updateProfileMutation.isPending} className="btn-gradient flex-1">
              {updateProfileMutation.isPending ? <><LoadingSpinner size="sm" /> Saving...</> : 'Save Changes'}
            </button>
          </div>
        </form>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">About Me</h3>
              <p className="text-slate-600 whitespace-pre-wrap">{profile?.bio || 'No bio provided yet.'}</p>
            </div>
            
            {user?.role === 'EXPERT' && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Skills</h3>
                {profile?.skills && profile.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map(s => (
                      <span key={s.id} className="badge bg-primary-50 text-primary-700 border border-primary-100">
                        {s.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic text-sm">No skills added yet.</p>
                )}
              </div>
            )}

            {user?.role === 'EXPERT' && (
              <div className="card p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-slate-900">Portfolio Projects</h3>
                  <button 
                    onClick={() => {
                      setEditingPortfolioItem(undefined)
                      setIsModalOpen(true)
                    }} 
                    className="btn-primary py-1.5 px-3 text-sm flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Add Project
                  </button>
                </div>
                
                {profile?.portfolioItems && profile.portfolioItems.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {profile.portfolioItems.map(item => (
                      <div key={item.id} className="border border-slate-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.title} className="w-full h-32 object-cover bg-slate-50" />
                        ) : (
                          <div className="w-full h-32 bg-slate-100 flex items-center justify-center text-slate-400 text-sm">No Image</div>
                        )}
                        <div className="p-4 flex-1 flex flex-col">
                          <h4 className="font-semibold text-slate-900 line-clamp-1">{item.title}</h4>
                          <p className="text-sm text-slate-500 mt-1 line-clamp-2 flex-1">{item.description}</p>
                          
                          {item.skills && item.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {item.skills.slice(0, 3).map(s => (
                                <span key={s.id} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{s.name}</span>
                              ))}
                              {item.skills.length > 3 && <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">+{item.skills.length - 3}</span>}
                            </div>
                          )}

                          <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                            {item.demoUrl ? (
                              <a href={item.demoUrl} target="_blank" rel="noreferrer" className="text-xs font-medium text-primary-600 flex items-center gap-1 hover:underline">
                                <ExternalLink className="w-3 h-3" /> Demo
                              </a>
                            ) : <span />}
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => {
                                  setEditingPortfolioItem(item)
                                  setIsModalOpen(true)
                                }} 
                                className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this project?')) {
                                    deletePortfolioMutation.mutate(item.id)
                                  }
                                }} 
                                className="p-1.5 text-slate-400 hover:text-danger-600 hover:bg-danger-50 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p className="text-slate-500">Showcase your best work to attract more clients.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="card p-6 space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Info</h3>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Email</p>
                  <p className="text-sm text-slate-900">{profile?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Member Since</p>
                  <p className="text-sm text-slate-900">{new Date(profile?.createdAt || '').toLocaleDateString()}</p>
                </div>
              </div>
              {profile?.timezone && (
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 text-slate-400 flex justify-center text-xs font-bold">TZ</div>
                  <div>
                    <p className="text-xs text-slate-400">Timezone</p>
                    <p className="text-sm text-slate-900">{profile.timezone}</p>
                  </div>
                </div>
              )}
              {profile?.portfolioUrl && (
                <div className="pt-2 border-t border-slate-100">
                  <a href={profile.portfolioUrl} target="_blank" rel="noreferrer" className="text-primary-600 text-sm hover:underline font-medium">Personal Link &rarr;</a>
                </div>
              )}
            </div>

            {user?.role === 'EXPERT' && (
              <div className="card p-6 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Hourly Rate</p>
                  <p className="text-xl font-bold text-slate-900">${profile?.hourlyRate ?? 0}/hr</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Rating</p>
                  <p className="text-xl font-bold text-slate-900">{profile?.rating ?? '0.0'} ⭐</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Jobs Done</p>
                  <p className="text-xl font-bold text-slate-900">{profile?.totalReviews ?? 0}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Success</p>
                  <p className="text-xl font-bold text-green-600">{profile?.completionRate ?? 0}%</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <PortfolioItemModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePortfolio}
        item={editingPortfolioItem}
      />
    </div>
  )
}
