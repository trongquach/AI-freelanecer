import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Calendar, DollarSign, Eye, ArrowLeft, Clock, Sparkles } from 'lucide-react'
import { jobApi } from '@/api/jobServiceApi'
import { aiApi } from '@/api/aiApi'
import { toast } from 'sonner'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useAuth } from '@/hooks/useAuth'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { isAuthenticated, isExpert, user } = useAuth()
  const navigate = useNavigate()

  const queryClient = useQueryClient()
  const publishMutation = useMutation({
    mutationFn: (jobId: number) => jobApi.publish(jobId),
    onSuccess: () => {
      toast.success('Project published successfully!')
      queryClient.invalidateQueries({ queryKey: ['job', id] })
    },
    onError: () => toast.error('Error posting project. Please try again.')
  })

  const deleteMutation = useMutation({
    mutationFn: (jobId: number) => jobApi.delete(jobId),
    onSuccess: () => {
      toast.success('Project deleted successfully!')
      navigate('/jobs')
    },
    onError: () => toast.error('Error deleting project.')
  })

  const { data: job, isLoading, isError } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobApi.getById(Number(id)),
    enabled: !!id,
  })

  if (isLoading) return <div className="flex justify-center py-24"><LoadingSpinner size="lg" /></div>
  if (isError || !job) return (
    <div className="text-center py-24">
      <p className="text-danger-500 text-lg">Job not found.</p>
      <Link to="/jobs" className="btn-ghost btn-md mt-4">← Back</Link>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto py-4">
      <Link to="/jobs" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> All jobs
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex flex-wrap items-start gap-3 mb-4">
              <h1 className="text-2xl font-bold text-slate-900 flex-1">{job.title}</h1>
              <span className="badge badge-success">{job.status}</span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-6">
              <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" /> {job.viewCount} views</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />
                {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true, locale: vi })}
              </span>
            </div>
            <div className="prose-dark">
              <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">Description</h3>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{job.description}</p>
            </div>
          </div>

          {/* Skills */}
          {job.skills.length > 0 && (
            <div className="card p-6">
              <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map(s => <span key={s.id} className="badge badge-primary">{s.name}</span>)}
              </div>
            </div>
          )}

          {/* AI Recommendations (Client Only) */}
          {isAuthenticated && !isExpert() && (
            <ExpertRecommendations jobId={Number(id)} />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card p-6 space-y-4">
            {(job.budgetMin || job.budgetMax) && (
              <div>
                <p className="text-xs text-slate-400 mb-1">Budget</p>
                <p className="text-xl font-bold text-success-400 flex items-center gap-1">
                  <DollarSign className="w-5 h-5" />
                  {job.budgetMin && job.budgetMax
                    ? `${job.budgetMin.toLocaleString()} – ${job.budgetMax.toLocaleString()}`
                    : (job.budgetMax ?? job.budgetMin)?.toLocaleString()}
                </p>
              </div>
            )}
            {job.deadline && (
              <div>
                <p className="text-xs text-slate-400 mb-1">Deadline</p>
                <p className="font-medium text-slate-900 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {new Date(job.deadline).toLocaleDateString('vi-VN')}
                </p>
              </div>
            )}
            {job.startDate && (
              <div>
                <p className="text-xs text-slate-400 mb-1">Start Date</p>
                <p className="font-medium text-slate-900 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {new Date(job.startDate).toLocaleDateString('vi-VN')}
                </p>
              </div>
            )}
            {job.expectedDuration && (
              <div>
                <p className="text-xs text-slate-400 mb-1">Duration</p>
                <p className="font-medium text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  {job.expectedDuration}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-slate-400 mb-1">Posted by</p>
              <p className="font-medium text-slate-900">{job.client.fullName ?? 'Client anonymous'}</p>
              {job.client.rating > 0 && <p className="text-xs text-warning-500">★ {job.client.rating.toFixed(1)}</p>}
            </div>
          </div>

          {isAuthenticated && isExpert() && job.status === 'OPEN' && (
            <Link to={`/jobs/${job.id}/apply`} className="btn-gradient btn-lg w-full">
              Send Proposal
            </Link>
          )}

          {isAuthenticated && user?.id === job.client.id && job.status === 'DRAFT' && (
            <button 
              onClick={() => publishMutation.mutate(job.id)} 
              disabled={publishMutation.isPending} 
              className="btn-gradient btn-lg w-full flex justify-center items-center"
            >
              {publishMutation.isPending ? <LoadingSpinner size="sm" /> : '🚀 Publish Project'}
            </button>
          )}

          {isAuthenticated && user?.id === job.client.id && (job.status === 'DRAFT' || job.status === 'OPEN') && (
            <div className="flex gap-2">
              <Link to={`/jobs/${job.id}/edit`} className="btn-secondary btn-md flex-1 text-center">
                Edit
              </Link>
              <button 
                onClick={() => {
                  if (window.confirm("Are you sure you want to delete this job?")) {
                    deleteMutation.mutate(job.id);
                  }
                }}
                disabled={deleteMutation.isPending}
                className="btn-danger btn-md flex-1 text-center"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
function ExpertRecommendations({ jobId }: { jobId: number }) {
  const { data: experts, isLoading, isError } = useQuery({
    queryKey: ['job', jobId, 'expert-recommendations'],
    queryFn: () => aiApi.recommendExperts(jobId),
  })

  if (isLoading) return <div className="card p-6 flex justify-center"><LoadingSpinner size="md" /></div>
  if (isError || !experts || experts.length === 0) return null

  return (
    <div className="card p-6 mt-6 border-primary-800">
      <div className="flex items-center gap-2 mb-4 text-primary-400">
        <Sparkles className="w-5 h-5" />
        <h3 className="font-bold text-slate-900">AI Expert Proposals</h3>
      </div>
      <div className="space-y-4">
        {experts.map(expert => (
          <div key={expert.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-300">
            <div className="flex items-center gap-3">
              <img src={expert.avatarUrl || `https://ui-avatars.com/api/?name=${expert.fullName}`} alt={expert.fullName} className="w-10 h-10 rounded-full" />
              <div>
                <p className="font-medium text-slate-900 text-sm">{expert.fullName}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>⭐ {expert.rating?.toFixed(1) || 'N/A'}</span>
                  <span>•</span>
                  <span>{expert.completedJobs} completed jobs</span>
                </div>
              </div>
            </div>
            <Link to={`/experts/${expert.id}`} className="btn-secondary btn-sm">View Profile</Link>
          </div>
        ))}
      </div>
    </div>
  )
}
