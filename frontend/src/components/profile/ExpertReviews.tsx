import { useQuery } from '@tanstack/react-query'
import { reviewApi, ReviewResponse } from '@/api/reviewApi'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 fill-slate-200'}`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export default function ExpertReviews({ userId }: { userId: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ['reviews', userId],
    queryFn: () => reviewApi.getReviewsForUser(userId),
    enabled: !!userId,
  })

  const reviews: ReviewResponse[] = data?.content ?? []

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">
        Reviews
        {data && data.totalElements > 0 && (
          <span className="ml-2 text-sm font-normal text-slate-400">({data.totalElements})</span>
        )}
      </h3>
      {isLoading ? (
        <div className="flex justify-center py-4"><LoadingSpinner size="sm" /></div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-slate-400">No reviews yet.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-bold">
                  {review.reviewer.fullName?.[0]?.toUpperCase() ?? 'U'}
                </div>
                <span className="text-sm font-medium text-slate-700">{review.reviewer.fullName}</span>
                <span className="text-xs text-slate-400 ml-auto">{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
              <StarRating rating={Number(review.rating)} />
              {review.comment && (
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )
      }
    </div>
  )
}
