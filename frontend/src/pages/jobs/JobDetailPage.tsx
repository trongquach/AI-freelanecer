import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { Calendar, DollarSign, Eye, ArrowLeft, Clock } from 'lucide-react'
import { jobApi } from '@/api/jobServiceApi'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useAuth } from '@/hooks/useAuth'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { isAuthenticated, isExpert } = useAuth()

  const { data: job, isLoading, isError } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobApi.getById(Number(id)),
    enabled: !!id,
  })

  if (isLoading) return <div className="flex justify-center py-24"><LoadingSpinner size="lg" /></div>
  if (isError || !job) return (
    <div className="text-center py-24">
      <p className="text-danger-500 text-lg">Không tìm thấy việc làm này.</p>
      <Link to="/jobs" className="btn-ghost btn-md mt-4">← Quay lại</Link>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto py-4">
      <Link to="/jobs" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Tất cả việc làm
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex flex-wrap items-start gap-3 mb-4">
              <h1 className="text-2xl font-bold text-white flex-1">{job.title}</h1>
              <span className="badge badge-success">{job.status}</span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-6">
              <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" /> {job.viewCount} lượt xem</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />
                {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true, locale: vi })}
              </span>
            </div>
            <div className="prose-dark">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">Mô tả</h3>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{job.description}</p>
            </div>
          </div>

          {/* Skills */}
          {job.skills.length > 0 && (
            <div className="card p-6">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">Kỹ năng yêu cầu</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map(s => <span key={s.id} className="badge badge-primary">{s.name}</span>)}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card p-6 space-y-4">
            {(job.budgetMin || job.budgetMax) && (
              <div>
                <p className="text-xs text-slate-500 mb-1">Ngân sách</p>
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
                <p className="text-xs text-slate-500 mb-1">Hạn chót</p>
                <p className="font-medium text-white flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  {new Date(job.deadline).toLocaleDateString('vi-VN')}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-slate-500 mb-1">Đăng bởi</p>
              <p className="font-medium text-white">{job.client.fullName ?? 'Khách hàng ẩn danh'}</p>
              {job.client.rating > 0 && <p className="text-xs text-warning-500">★ {job.client.rating.toFixed(1)}</p>}
            </div>
          </div>

          {isAuthenticated && isExpert() && job.status === 'OPEN' && (
            <Link to={`/jobs/${job.id}/apply`} className="btn-gradient btn-lg w-full">
              Gửi đề xuất
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
