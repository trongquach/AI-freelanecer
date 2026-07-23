import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams, Link } from 'react-router-dom'
import { Search, Plus, SlidersHorizontal, X, Star } from 'lucide-react'
import { serviceApi } from '@/api/jobServiceApi'
import ServiceCard from '@/components/cards/ServiceCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useAuth } from '@/hooks/useAuth'

const SORT_OPTIONS = [
  { value: 'NEWEST',     label: 'Newest' },
  { value: 'RATING',     label: 'Reviews cao' },
  { value: 'PRICE_ASC',  label: 'Price: Low to High' },
  { value: 'PRICE_DESC', label: 'Price: High to Low' },
]

export default function MarketplacePage() {
  const { isAuthenticated, isExpert } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)

  const keyword  = searchParams.get('keyword') ?? ''
  const sortBy   = searchParams.get('sortBy') ?? 'NEWEST'
  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined
  const maxDays  = searchParams.get('maxDays')  ? Number(searchParams.get('maxDays'))  : undefined
  const minRating= searchParams.get('minRating')? Number(searchParams.get('minRating')): undefined
  const page     = Number(searchParams.get('page') ?? '0')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['services', keyword, minPrice, maxPrice, maxDays, minRating, sortBy, page],
    queryFn: () => serviceApi.browse({ keyword, minPrice, maxPrice, maxDeliveryDays: maxDays, minRating, sortBy, page, size: 12 }),
    placeholderData: (prev) => prev,
  })

  const setParam = (key: string, val: string | number | undefined) => {
    const next = new URLSearchParams(searchParams)
    if (val !== undefined && val !== '') next.set(key, String(val)); else next.delete(key)
    if (key !== 'page') next.delete('page')
    setSearchParams(next)
  }

  return (
    <div className="py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="section-title">AI Marketplace</h1>
          <p className="section-subtitle">
            {data ? `${data.totalElements?.toLocaleString()} AI Services` : 'Loading...'}
          </p>
        </div>
        {isAuthenticated && isExpert() && (
          <Link to="/services/new" className="btn-gradient btn-md shrink-0">
            <Plus className="w-4 h-4" /> Create Service
          </Link>
        )}
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input className="input pl-10" placeholder="Search AI Services..."
            defaultValue={keyword}
            onKeyDown={e => e.key === 'Enter' && setParam('keyword', (e.target as HTMLInputElement).value)} />
        </div>
        <select value={sortBy} onChange={e => setParam('sortBy', e.target.value)}
          className="input w-auto min-w-[160px]">
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary btn-md ${showFilters ? 'border-primary-500 text-primary-300' : ''}`}>
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="card p-4 mb-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Minimum Price ($)</label>
            <input type="number" className="input" placeholder="0"
              defaultValue={minPrice} onChange={e => setParam('minPrice', e.target.value || undefined)} />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Maximum Price ($)</label>
            <input type="number" className="input" placeholder="10000"
              defaultValue={maxPrice} onChange={e => setParam('maxPrice', e.target.value || undefined)} />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Max delivery (days)</label>
            <input type="number" className="input" placeholder="30"
              defaultValue={maxDays} onChange={e => setParam('maxDays', e.target.value || undefined)} />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
              <Star className="w-3 h-3 text-warning-500" /> Minimum Rating
            </label>
            <select className="input" value={minRating ?? ''} onChange={e => setParam('minRating', e.target.value || undefined)}>
              <option value="">All</option>
              {[4.5, 4, 3.5, 3].map(r => <option key={r} value={r}>{r}+</option>)}
            </select>
          </div>
          <button onClick={() => { setSearchParams(new URLSearchParams()); setShowFilters(false) }}
            className="btn-ghost btn-md gap-1.5 text-slate-400 sm:col-span-2 lg:col-span-4 justify-start">
            <X className="w-4 h-4" /> Clear filters
          </button>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : isError ? (
        <div className="text-center py-20 text-danger-500">Error loading services. Please try again.</div>
      ) : !data?.content?.length ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🤖</div>
          <p className="text-slate-400 text-lg">No services found</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {data.content.map((svc: any) => <ServiceCard key={svc.id} service={svc} />)}
          </div>
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button onClick={() => setParam('page', page - 1)} disabled={data.first} className="btn-secondary btn-sm disabled:opacity-40">← Prev</button>
              <span className="text-sm text-slate-400 px-3">Trang {page + 1} / {data.totalPages}</span>
              <button onClick={() => setParam('page', page + 1)} disabled={data.last} className="btn-secondary btn-sm disabled:opacity-40">Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
