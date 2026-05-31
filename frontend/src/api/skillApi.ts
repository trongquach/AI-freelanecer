import api from './axiosInstance'

export interface Skill {
  id: number
  category: string
  name: string
}

export const skillApi = {
  getAll: () =>
    api.get<Skill[]>('/skills').then(r => r.data),
}
