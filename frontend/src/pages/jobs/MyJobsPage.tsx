import { useQuery } from '@tanstack/react-query'
import { useSearchParams, Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { jobApi } from '@/api/jobServiceApi'
import JobCard from '@/components/cards/JobCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function MyJobsPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const page = Number(searchParams.get('page') ?? '0')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['my-jobs', page],
    queryFn: () => jobApi.myJobs(page, 12),
    placeholderData: (prev) => prev,
  })

  const setParam = (key: string, val: string | undefined) => {
    const next = new URLSearchParams(searchParams)
    if (val) next.set(key, val); else next.delete(key)
    if (key !== 'page') next.delete('page')
    setSearchParams(next)
  }

  return (
    <div className="py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="section-title">My Posted Jobs</h1>
          <p className="section-subtitle">
            {data ? `You have ${data.totalElements.toLocaleString()} jobs` : 'Loading...'}
          </p>
        </div>
        <Link to="/jobs/new" className="btn-gradient btn-md shrink-0">
          <Plus className="w-4 h-4" /> Post a Job
        </Link>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : isError ? (
        <div className="text-center py-20 text-danger-500">Failed to load jobs. Please try again later.</div>
      ) : !data?.content.length ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-slate-400 text-lg">You haven't posted any jobs yet</p>
          <Link to="/jobs/new" className="btn-gradient btn-md mt-4 inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create First Job
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {data.content.map(job => <JobCard key={job.id} job={job} />)}
          </div>
          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button onClick={() => setParam('page', String(page - 1))}
                disabled={data.first} className="btn-secondary btn-sm disabled:opacity-40">
                ← Prev
              </button>
              <span className="text-sm text-slate-400 px-3">
                Page {page + 1} / {data.totalPages}
              </span>
              <button onClick={() => setParam('page', String(page + 1))}
                disabled={data.last} className="btn-secondary btn-sm disabled:opacity-40">
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
