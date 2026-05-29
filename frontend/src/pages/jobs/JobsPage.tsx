import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams, Link } from 'react-router-dom'
import { Search, Plus, SlidersHorizontal, X } from 'lucide-react'
import { jobApi } from '@/api/jobServiceApi'
import JobCard from '@/components/cards/JobCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useAuth } from '@/hooks/useAuth'

export default function JobsPage() {
  const { isAuthenticated, isClient } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)

  const keyword    = searchParams.get('keyword') ?? ''
  const minBudget  = searchParams.get('minBudget') ? Number(searchParams.get('minBudget')) : undefined
  const maxBudget  = searchParams.get('maxBudget') ? Number(searchParams.get('maxBudget')) : undefined
  const page       = Number(searchParams.get('page') ?? '0')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['jobs', keyword, minBudget, maxBudget, page],
    queryFn: () => jobApi.list({ keyword, minBudget, maxBudget, status: 'OPEN', page, size: 12 }),
    placeholderData: (prev) => prev,
  })

  const setParam = (key: string, val: string | undefined) => {
    const next = new URLSearchParams(searchParams)
    if (val) next.set(key, val); else next.delete(key)
    next.delete('page')
    setSearchParams(next)
  }

  return (
    <div className="py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="section-title">Find Jobs AI</h1>
          <p className="section-subtitle">
            {data ? `${data.totalElements.toLocaleString()} jobs hiring` : 'Loading...'}
          </p>
        </div>
        {isAuthenticated && isClient() && (
          <Link to="/jobs/new" className="btn-gradient btn-md shrink-0">
            <Plus className="w-4 h-4" /> Post a Job
          </Link>
        )}
      </div>

      {/* Search bar */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="input pl-10 pr-4"
            placeholder="Search by name, skill, description..."
            defaultValue={keyword}
            onKeyDown={e => e.key === 'Enter' && setParam('keyword', (e.target as HTMLInputElement).value)}
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary btn-md gap-2 ${showFilters ? 'border-primary-500 text-primary-300' : ''}`}
        >
          <SlidersHorizontal className="w-4 h-4" /> Filter
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="card p-4 mb-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Minimum Budget ($)</label>
            <input type="number" className="input" placeholder="e.g. 100"
              defaultValue={minBudget}
              onChange={e => setParam('minBudget', e.target.value || undefined)} />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Maximum Budget ($)</label>
            <input type="number" className="input" placeholder="e.g. 5000"
              defaultValue={maxBudget}
              onChange={e => setParam('maxBudget', e.target.value || undefined)} />
          </div>
          <div className="sm:col-span-2 flex items-end">
            <button onClick={() => { setSearchParams(new URLSearchParams()); setShowFilters(false) }}
              className="btn-ghost btn-md gap-1.5 text-slate-400">
              <X className="w-4 h-4" /> Clear filters
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : isError ? (
        <div className="text-center py-20 text-danger-500">Failed to load jobs. Please try again later.</div>
      ) : !data?.content.length ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-slate-400 text-lg">No suitable jobs found</p>
          <p className="text-slate-600 text-sm mt-1">Try changing keywords or filters</p>
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
