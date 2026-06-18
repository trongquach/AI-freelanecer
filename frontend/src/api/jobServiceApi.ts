import api from './axiosInstance'
import type { JobResponse } from '@/types/job'
import type { PageResponse } from '@/types/common'

export interface JobFilterParams {
  keyword?: string
  minBudget?: number
  maxBudget?: number
  status?: string
  skillIds?: number[]
  page?: number
  size?: number
}

export const jobApi = {
  list: (params: JobFilterParams) =>
    api.get<PageResponse<JobResponse>>('/jobs', { params }).then(r => r.data),

  getById: (id: number) =>
    api.get<JobResponse>(`/jobs/${id}`).then(r => r.data),

  create: (data: unknown) =>
    api.post<JobResponse>('/jobs', data).then(r => r.data),

  update: (id: number, data: unknown) =>
    api.put<JobResponse>(`/jobs/${id}`, data).then(r => r.data),

  delete: (id: number) =>
    api.delete(`/jobs/${id}`),

  publish: (id: number) =>
    api.post<JobResponse>(`/jobs/${id}/publish`).then(r => r.data),

  myJobs: (page = 0, size = 10) =>
    api.get<PageResponse<JobResponse>>('/jobs/my', { params: { page, size } }).then(r => r.data),
}

export const serviceApi = {
  browse: (params: Record<string, unknown>) =>
    api.get('/services', { params }).then(r => r.data),

  getById: (id: number) =>
    api.get(`/services/${id}`).then(r => r.data),

  create: (data: unknown) =>
    api.post('/services', data).then(r => r.data),

  update: (id: number, data: unknown) =>
    api.put(`/services/${id}`, data).then(r => r.data),

  delete: (id: number) =>
    api.delete(`/services/${id}`),

  myServices: (page = 0, size = 10) =>
    api.get('/services/my', { params: { page, size } }).then(r => r.data),

  activate: (id: number) =>
    api.post(`/services/${id}/activate`).then(r => r.data),

  deactivate: (id: number) =>
    api.post(`/services/${id}/deactivate`).then(r => r.data),

  order: (id: number) =>
    api.post(`/services/${id}/order`).then(r => r.data),
}
