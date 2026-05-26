import { Link } from 'react-router-dom'
import { Star, Clock, ShoppingCart } from 'lucide-react'
import { ServiceResponse } from '@/types/job'
import { cn } from '@/utils/cn'

interface ServiceCardProps {
  service: ServiceResponse
}

export default function ServiceCard({ service }: ServiceCardProps) {
  return (
    <Link to={`/marketplace/${service.id}`} className="block">
      <article className="card-hover p-5 group flex flex-col gap-4 h-full">
        {/* Expert */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold text-sm shrink-0">
            {service.expert.fullName?.[0]?.toUpperCase() ?? 'E'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{service.expert.fullName ?? 'Expert'}</p>
            <div className="flex items-center gap-1 text-xs text-warning-500">
              <Star className="w-3 h-3 fill-warning-500" />
              <span>{(service.expert.rating ?? 0).toFixed(1)}</span>
              <span className="text-slate-600">({service.expert.totalReviews})</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="flex-1">
          <h3 className="font-semibold text-white group-hover:text-primary-300 transition-colors line-clamp-2 mb-2">
            {service.title}
          </h3>
          <p className="text-slate-400 text-sm line-clamp-2">{service.description}</p>
        </div>

        {/* Tags */}
        {service.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {service.tags.slice(0, 3).map(tag => (
              <span key={tag} className="badge badge-neutral text-xs">{tag}</span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-surface-800">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {service.deliveryDays} ngày
            </span>
            <span className="flex items-center gap-1">
              <ShoppingCart className="w-3 h-3" /> {service.orderCount} đơn
            </span>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Từ</p>
            <p className="font-bold text-white">${service.price.toLocaleString()}</p>
          </div>
        </div>
      </article>
    </Link>
  )
}
