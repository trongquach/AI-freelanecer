export interface User {
  id: number
  email: string
  fullName: string | null
  role: 'CLIENT' | 'EXPERT' | 'ADMIN'
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED'
  createdAt: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  user: User
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  role: 'CLIENT' | 'EXPERT'
  fullName: string
}
