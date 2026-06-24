import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams, Link } from 'react-router-dom'
import { Search, Plus } from 'lucide-react'
import { serviceApi } from '@/api/jobServiceApi'
import ServiceCard from '@/components/cards/ServiceCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function MyServicesPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const page = Number(searchParams.get('page') ?? '0')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['my-services', page],
    queryFn: () => serviceApi.myServices(page, 12),
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
          <h1 className="section-title">My Services</h1>
          <p className="section-subtitle">
            {data ? `You have ${data.totalElements.toLocaleString()} services` : 'Loading...'}
          </p>
        </div>
        <Link to="/services/new" className="btn-gradient btn-md shrink-0">
          <Plus className="w-4 h-4" /> Create Service
        </Link>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : isError ? (
        <div className="text-center py-20 text-danger-500">Failed to load services. Please try again later.</div>
      ) : !data?.content.length ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-slate-400 text-lg">You haven't created any services yet</p>
          <Link to="/services/new" className="btn-gradient btn-md mt-4 inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create First Service
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {data.content.map((service: any) => <ServiceCard key={service.id} service={service} />)}
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
