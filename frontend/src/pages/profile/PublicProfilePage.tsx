import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { profileApi } from '@/api/profileApi'
import { User, MapPin, Briefcase, Star, Clock, FileText, ExternalLink } from 'lucide-react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ExpertReviews, { StarRating } from '@/components/profile/ExpertReviews'

export default function PublicProfilePage() {
  const { id } = useParams<{ id: string }>()
  const userId = Number(id)

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['publicProfile', userId],
    queryFn: () => profileApi.getPublicProfile(userId),
    enabled: !!userId && !isNaN(userId)
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Profile Not Found</h2>
        <p className="text-slate-600 mb-6">The user you are looking for does not exist or their profile is private.</p>
        <Link to="/" className="btn-primary">Return Home</Link>
      </div>
    )
  }

  const isExpert = profile.role === 'EXPERT'

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      
      {/* Header Card */}
      <div className="card p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="w-24 h-24 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden border-4 border-white shadow-sm">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.fullName || 'User'} className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-slate-400" />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-slate-900">{profile.fullName || 'Anonymous User'}</h1>
              <span className="px-3 py-1 bg-primary-50 text-primary-700 text-xs font-semibold rounded-full uppercase tracking-wider">
                {profile.role}
              </span>
              {isExpert && (
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${profile.isAvailable ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                  {profile.isAvailable ? 'Available for work' : 'Not available'}
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600 mb-4">
              {profile.timezone && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {profile.timezone}
                </div>
              )}
              {isExpert && profile.hourlyRate && (
                <div className="flex items-center gap-1.5 font-medium text-slate-900">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  ${profile.hourlyRate}/hr
                </div>
              )}
              {isExpert && (
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-medium text-slate-900">{profile.rating?.toFixed(1) || '0.0'}</span>
                  <span className="text-slate-400">({profile.totalReviews} reviews)</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                Member since {new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
              </div>
            </div>
            
            {profile.portfolioUrl && (
              <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer" 
                 className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium">
                <ExternalLink className="w-4 h-4" />
                View Personal Website
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Bio Section */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">About</h2>
            {profile.bio ? (
              <div className="prose prose-sm max-w-none text-slate-600">
                {profile.bio.split('\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 italic">No bio provided.</p>
            )}
          </div>

          {/* Portfolio Section for Experts */}
          {isExpert && (
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-6">
                <FileText className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-slate-900">Portfolio</h2>
              </div>
              
              {!profile.portfolioItems || profile.portfolioItems.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No portfolio items added yet.</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {profile.portfolioItems.map((item) => (
                    <div key={item.id} className="border border-slate-200 rounded-xl overflow-hidden hover:border-primary-300 transition-colors bg-slate-50 flex flex-col">
                      {item.imageUrl && (
                        <img src={item.imageUrl} alt={item.title} className="w-full h-32 object-cover border-b border-slate-200" />
                      )}
                      <div className="p-4 flex-1 flex flex-col">
                        <h4 className="font-semibold text-slate-900 mb-1">{item.title}</h4>
                        {item.description && (
                          <p className="text-xs text-slate-600 mb-3 line-clamp-2">{item.description}</p>
                        )}
                        <div className="mt-auto">
                          {item.skills && item.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {item.skills.map(skill => (
                                <span key={skill.id} className="px-2 py-0.5 bg-white border border-slate-200 text-slate-600 text-[10px] rounded uppercase font-medium">
                                  {skill.name}
                                </span>
                              ))}
                            </div>
                          )}
                          {item.demoUrl && (
                            <a href={item.demoUrl} target="_blank" rel="noopener noreferrer" 
                               className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700">
                              View Project <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reviews Section */}
          <ExpertReviews userId={userId} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Skills Section for Experts */}
          {isExpert && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Skills</h2>
              {!profile.skills || profile.skills.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No skills listed.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map(skill => (
                    <span key={skill.id} className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-md border border-slate-200">
                      {skill.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Stats Section */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Statistics</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Jobs Completed</span>
                <span className="text-sm font-semibold text-slate-900">-</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Completion Rate</span>
                <span className="text-sm font-semibold text-slate-900">
                  {profile.completionRate ? `${profile.completionRate}%` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  )
}
