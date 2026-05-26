import { Link } from 'react-router-dom'
import { Calendar, DollarSign, Eye, Briefcase, Clock } from 'lucide-react'
import { JobResponse } from '@/types/job'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { cn } from '@/utils/cn'

const statusColors: Record<string, string> = {
  OPEN: 'badge-success',
  DRAFT: 'badge-neutral',
  IN_PROGRESS: 'badge-primary',
  COMPLETED: 'badge-neutral',
  CANCELLED: 'badge-danger',
}
const statusLabels: Record<string, string> = {
  OPEN: 'Đang tuyển', DRAFT: 'Nháp', IN_PROGRESS: 'Đang làm',
  COMPLETED: 'Hoàn thành', CANCELLED: 'Đã hủy',
}

interface JobCardProps {
  job: JobResponse
  compact?: boolean
}

export default function JobCard({ job, compact }: JobCardProps) {
  return (
    <Link to={`/jobs/${job.id}`} className="block">
      <article className="card-hover p-5 group">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white group-hover:text-primary-300 transition-colors line-clamp-2 mb-1">
              {job.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{job.client.fullName ?? 'Khách hàng ẩn danh'}</span>
              {job.client.rating > 0 && (
                <span className="flex items-center gap-0.5 text-warning-500">
                  ★ {job.client.rating.toFixed(1)}
                </span>
              )}
            </div>
          </div>
          <span className={cn('badge shrink-0', statusColors[job.status] ?? 'badge-neutral')}>
            {statusLabels[job.status] ?? job.status}
          </span>
        </div>

        {/* Description */}
        {!compact && (
          <p className="text-slate-400 text-sm line-clamp-2 mb-4">{job.description}</p>
        )}

        {/* Skills */}
        {job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {job.skills.slice(0, 4).map(s => (
              <span key={s.id} className="badge badge-primary text-xs">{s.name}</span>
            ))}
            {job.skills.length > 4 && (
              <span className="badge badge-neutral text-xs">+{job.skills.length - 4}</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-surface-800">
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
                {new Date(job.deadline).toLocaleDateString('vi-VN')}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" /> {job.viewCount}
            </span>
          </div>
          <span>{formatDistanceToNow(new Date(job.createdAt), { addSuffix: true, locale: vi })}</span>
        </div>
      </article>
    </Link>
  )
}
