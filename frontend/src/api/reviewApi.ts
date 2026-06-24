import axiosInstance from './axiosInstance'

export interface ReviewResponse {
  id: number
  contractId: number
  reviewer: {
    id: number
    fullName: string
    avatarUrl: string | null
  }
  rating: number
  comment: string | null
  createdAt: string
}

export interface CreateReviewRequest {
  contractId: number
  rating: number // 1.0 - 5.0
  comment?: string
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export const reviewApi = {
  /** POST /api/v1/reviews - Client submits review for a completed contract */
  createReview: (data: CreateReviewRequest): Promise<ReviewResponse> =>
    axiosInstance.post('/reviews', data).then(r => r.data),

  /** GET /api/v1/reviews/user/{userId} - Get reviews for an expert */
  getReviewsForUser: (userId: number, page = 0, size = 10): Promise<PageResponse<ReviewResponse>> =>
    axiosInstance.get(`/reviews/user/${userId}`, { params: { page, size } }).then(r => r.data),
}
