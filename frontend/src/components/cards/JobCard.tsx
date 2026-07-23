import { Link } from 'react-router-dom'
import { Calendar, DollarSign, Eye, Briefcase, Clock, Users } from 'lucide-react'
import { JobResponse } from '@/types/job'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/utils/cn'
import { useAuth } from '@/hooks/useAuth'

const statusColors: Record<string, string> = {
  OPEN: 'badge-success',
  DRAFT: 'badge-neutral',
  IN_PROGRESS: 'badge-primary',
  COMPLETED: 'badge-neutral',
  CANCELLED: 'badge-danger',
}
const statusLabels: Record<string, string> = {
  OPEN: 'Recruiting', DRAFT: 'Draft', IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed', CANCELLED: 'Cancelled',
}

interface JobCardProps {
  job: JobResponse
  compact?: boolean
}

export default function JobCard({ job, compact }: JobCardProps) {
  const { user } = useAuth()
  const isOwner = user?.id === job.client.id

  return (
    <article className="card-hover p-5 group relative flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <Link to={`/jobs/${job.id}`} className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-1 before:absolute before:inset-0 before:z-0">
            {job.title}
          </Link>
          <div className="flex items-center gap-2 text-xs text-slate-400 relative z-10">
            <span>{job.client.fullName ?? 'Client anonymous'}</span>
            {job.client.rating > 0 && (
              <span className="flex items-center gap-0.5 text-warning-500">
                ★ {job.client.rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
        {job.status !== 'OPEN' && job.status !== 'INTERVIEWING' && (
          <span className={cn('badge shrink-0 relative z-10', statusColors[job.status] ?? 'badge-neutral')}>
            {statusLabels[job.status] ?? job.status}
          </span>
        )}
      </div>

      {/* Description */}
      {!compact && (
        <p className="text-slate-400 text-sm line-clamp-2 mb-4 relative z-10">{job.description}</p>
      )}

      {/* Skills */}
      {job.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4 relative z-10">
          {job.skills.slice(0, 4).map(s => (
            <span key={s.id} className="badge badge-primary text-xs">{s.name}</span>
          ))}
          {job.skills.length > 4 && (
            <span className="badge badge-neutral text-xs">+{job.skills.length - 4}</span>
          )}
        </div>
      )}

      <div className="mt-auto">
        {/* Actions for Owner */}
        {isOwner && (
          <div className="mb-4 relative z-10">
            <Link 
              to={`/jobs/${job.id}/proposals`} 
              className="btn-secondary btn-sm w-full flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4" /> View Proposals
            </Link>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-200 relative z-10">
          <div className="flex items-center gap-4">
            {(job.budgetMin || job.budgetMax) && (
              <span className="flex items-center gap-1 text-success-500 font-semibold">
                <DollarSign className="w-3 h-3" />
                {job.budgetMin && job.budgetMax
                  ? `${job.budgetMin.toLocaleString()} – ${job.budgetMax.toLocaleString()}`
                  : (job.budgetMax ?? job.budgetMin)?.toLocaleString()}
              </span>
            )}
            {job.deadline && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(job.deadline).toLocaleDateString('en-US')}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" /> {job.viewCount}
            </span>
          </div>
          <span>{job.createdAt ? formatDistanceToNow(new Date(!job.createdAt.endsWith('Z') && !job.createdAt.includes('+') ? job.createdAt + 'Z' : job.createdAt), { addSuffix: true }) : ''}</span>
        </div>
      </div>
    </article>
  )
}
