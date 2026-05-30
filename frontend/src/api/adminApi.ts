import axiosInstance from './axiosInstance';
import { PageResponse } from '../types/common';

export interface PlatformStats {
  totalUsers: number;
  totalClients: number;
  totalExperts: number;
  totalJobs: number;
  openJobs: number;
  activeContracts: number;
  completedContracts: number;
  totalServices: number;
  totalVolume: number;
  platformFeesEarned: number;
  dailyRegistrations: number[];
}

export interface UserDto {
  id: number;
  email: string;
  fullName: string;
  role: string;
  status: string;
  createdAt: string;
}

export const adminApi = {
  getStats: async (): Promise<PlatformStats> => {
    const res = await axiosInstance.get('/admin/stats');
    return res.data;
  },

  getUsers: async (page = 0, size = 10): Promise<PageResponse<UserDto>> => {
    const res = await axiosInstance.get('/admin/users', { params: { page, size } });
    return res.data;
  },

  banUser: async (id: number): Promise<void> => {
    await axiosInstance.post(`/admin/users/${id}/ban`);
  },

  getPendingServices: async (page = 0, size = 10): Promise<PageResponse<any>> => {
    const res = await axiosInstance.get('/admin/services/pending', { params: { page, size } });
    return res.data;
  },

  activateService: async (id: number): Promise<void> => {
    await axiosInstance.post(`/admin/services/${id}/activate`);
  },

  rejectService: async (id: number): Promise<void> => {
    await axiosInstance.post(`/admin/services/${id}/reject`);
  }
};
