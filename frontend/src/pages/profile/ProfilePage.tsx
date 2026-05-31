import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { User, Mail, Shield, Camera, Edit2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { profileApi } from '@/api/profileApi'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import SkillSelector from '@/components/ui/SkillSelector'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const schema = z.object({
  fullName: z.string().min(2, 'Name is too short').max(100),
  bio: z.string().max(1000).optional().nullable(),
  hourlyRate: z.number().positive().optional().nullable(),
  portfolioUrl: z.string().url('Invalid URL').optional().nullable().or(z.literal('')),
  isAvailable: z.boolean().optional(),
})

type FormData = z.infer<typeof schema>

export default function ProfilePage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [skillIds, setSkillIds] = useState<number[]>([])
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

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
        isAvailable: profile.isAvailable,
      })
      setAvatarPreview(profile.avatarUrl)
      // Note: Backend doesn't currently return skillIds for profiles in UserProfileResponse,
      // but in a fully built system it would. For this demo we'll assume it starts empty if not provided.
    }
  }, [profile, reset])

  const mutation = useMutation({
    mutationFn: (data: FormData) => profileApi.updateMyProfile({ 
      ...data, 
      avatarUrl: avatarPreview || undefined,
      bio: data.bio || undefined,
      portfolioUrl: data.portfolioUrl || undefined,
      hourlyRate: data.hourlyRate || undefined
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

  if (isLoading) return <div className="p-8 flex justify-center"><LoadingSpinner /></div>

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      <div className="flex justify-between items-center">
        <h1 className="section-title mb-0">My Profile</h1>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="btn-outline flex items-center gap-2">
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
        <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="card p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Full Name *</label>
              <input {...register('fullName')} className={`input ${errors.fullName ? 'input-error' : ''}`} placeholder="John Doe" />
              {errors.fullName && <p className="mt-1 text-xs text-danger-500">{errors.fullName.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Portfolio URL</label>
              <input {...register('portfolioUrl')} className="input" placeholder="https://github.com/..." />
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
              <label className="block text-sm font-medium text-slate-600 mb-1.5 mt-4">Skills</label>
              <SkillSelector selectedIds={skillIds} onChange={setSkillIds} />
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setIsEditing(false)} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="btn-gradient flex-1">
              {mutation.isPending ? <><LoadingSpinner size="sm" /> Saving...</> : 'Save Changes'}
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
                {skillIds.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    <span className="badge bg-slate-100 text-slate-700">Skills updated in edit mode</span>
                  </div>
                ) : (
                  <p className="text-slate-400 italic text-sm">No skills added yet.</p>
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
              {profile?.portfolioUrl && (
                <div className="pt-2 border-t border-slate-100">
                  <a href={profile.portfolioUrl} target="_blank" rel="noreferrer" className="text-primary-600 text-sm hover:underline font-medium">View Portfolio &rarr;</a>
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
    </div>
  )
}
