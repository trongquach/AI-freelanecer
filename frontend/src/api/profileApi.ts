import api from './axiosInstance'

export interface SkillDto {
  id: number
  name: string
  category: string
}

export interface PortfolioItemDto {
  id: number
  title: string
  description: string | null
  imageUrl: string | null
  demoUrl: string | null
  technologies: string | null
  displayOrder: number
  createdAt: string
}

export interface PortfolioItemRequest {
  title: string
  description?: string
  imageUrl?: string
  demoUrl?: string
  technologies?: string
  displayOrder?: number
}

export interface UserProfileResponse {
  userId: number
  email: string
  role: string
  fullName: string | null
  bio: string | null
  avatarUrl: string | null
  portfolioUrl: string | null
  hourlyRate: number | null
  rating: number
  totalReviews: number
  completionRate: number
  timezone: string | null
  isAvailable: boolean
  createdAt: string
  updatedAt: string
  portfolioItems: PortfolioItemDto[]
  skills: SkillDto[]
}

export interface UpdateProfileRequest {
  fullName?: string
  bio?: string
  avatarUrl?: string
  portfolioUrl?: string
  hourlyRate?: number
  timezone?: string
  isAvailable?: boolean
}

export const profileApi = {
  getMyProfile: () =>
    api.get<UserProfileResponse>('/profile/me').then(r => r.data),

  updateMyProfile: (data: UpdateProfileRequest) =>
    api.put<UserProfileResponse>('/profile/me', data).then(r => r.data),

  setAvailability: (available: boolean) =>
    api.patch<UserProfileResponse>('/profile/me/availability', { available }).then(r => r.data),
    
  getPublicProfile: (userId: number) =>
    api.get<UserProfileResponse>(`/profile/${userId}`).then(r => r.data),

  addPortfolioItem: (data: PortfolioItemRequest) =>
    api.post<UserProfileResponse>('/profile/me/portfolio', data).then(r => r.data),

  updatePortfolioItem: (itemId: number, data: PortfolioItemRequest) =>
    api.put<UserProfileResponse>(`/profile/me/portfolio/${itemId}`, data).then(r => r.data),

  deletePortfolioItem: (itemId: number) =>
    api.delete<UserProfileResponse>(`/profile/me/portfolio/${itemId}`).then(r => r.data),

  reorderPortfolio: (itemIds: number[]) =>
    api.put<UserProfileResponse>('/profile/me/portfolio/reorder', { itemIds }).then(r => r.data),

  updateSkills: (skillIds: number[]) =>
    api.put<UserProfileResponse>('/profile/me/skills', { skillIds }).then(r => r.data),
}
