export type JobStatus = 'DRAFT' | 'OPEN' | 'INTERVIEWING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export interface JobResponse {
  id: number
  title: string
  description: string
  budgetMin: number | null
  budgetMax: number | null
  startDate: string | null
  expectedDuration: string | null
  deadline: string | null
  status: JobStatus
  aiEnhanced: boolean
  viewCount: number
  maxShortlist: number
  aiScreeningThreshold: number
  client: {
    id: number
    fullName: string | null
    avatarUrl: string | null
    rating: number
  }
  skills: Array<{ id: number; name: string; category: string }>
  createdAt: string
}


export type ServiceStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING_REVIEW'

export interface ServiceResponse {
  id: number
  title: string
  description: string
  price: number
  deliveryDays: number
  status: ServiceStatus
  tags: string[]
  rating: number
  orderCount: number
  expert: {
    id: number
    fullName: string | null
    avatarUrl: string | null
    rating: number
    totalReviews: number
  }
  skills: Array<{ id: number; name: string; category: string }>
  createdAt: string
}
