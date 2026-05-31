import api from './axiosInstance'

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
  isAvailable: boolean
  createdAt: string
  updatedAt: string
}

export interface UpdateProfileRequest {
  fullName?: string
  bio?: string
  avatarUrl?: string
  portfolioUrl?: string
  hourlyRate?: number
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
}
