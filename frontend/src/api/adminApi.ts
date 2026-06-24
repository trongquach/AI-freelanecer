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
  totalTransactionVolume: number;
  platformFeeEarned: number;
  totalEscrowLocked: number;
  dailyRegistrations?: number[];
}

export interface UserDto {
  id: number;
  email: string;
  fullName: string;
  role: string;
  status: string;
  createdAt: string;
}

export interface TransactionDto {
  id: number;
  type: string;
  amount: number;
  status: string;
  createdAt: string;
  wallet?: { user?: { email?: string } };
}

export const adminApi = {
  getStats: async (): Promise<PlatformStats> => {
    const res = await axiosInstance.get('/admin/stats');
    return res.data;
  },

  // Users
  getUsers: async (page = 0, size = 20): Promise<PageResponse<UserDto>> => {
    const res = await axiosInstance.get('/admin/users', { params: { page, size } });
    return res.data;
  },
  banUser: async (id: number): Promise<void> => {
    await axiosInstance.post(`/admin/users/${id}/ban`);
  },
  unbanUser: async (id: number): Promise<void> => {
    await axiosInstance.post(`/admin/users/${id}/unban`);
  },

  // Services
  getPendingServices: async (page = 0, size = 20): Promise<PageResponse<any>> => {
    const res = await axiosInstance.get('/admin/services/pending', { params: { page, size } });
    return res.data;
  },
  getAllServices: async (page = 0, size = 20): Promise<PageResponse<any>> => {
    const res = await axiosInstance.get('/admin/services/all', { params: { page, size } });
    return res.data;
  },
  activateService: async (id: number): Promise<void> => {
    await axiosInstance.post(`/admin/services/${id}/activate`);
  },
  rejectService: async (id: number): Promise<void> => {
    await axiosInstance.post(`/admin/services/${id}/reject`);
  },
  deleteService: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/admin/services/${id}`);
  },

  // Jobs
  getAllJobs: async (page = 0, size = 20): Promise<PageResponse<any>> => {
    const res = await axiosInstance.get('/admin/jobs', { params: { page, size } });
    return res.data;
  },
  deleteJob: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/admin/jobs/${id}`);
  },

  // Transactions
  getTransactions: async (page = 0, size = 20): Promise<PageResponse<TransactionDto>> => {
    const res = await axiosInstance.get('/admin/transactions', { params: { page, size } });
    return res.data;
  },

  // Withdrawals
  getPendingWithdrawals: async (page = 0, size = 20): Promise<PageResponse<TransactionDto>> => {
    const res = await axiosInstance.get('/admin/withdrawals', { params: { page, size } });
    return res.data;
  },
  approveWithdrawal: async (id: number): Promise<TransactionDto> => {
    const res = await axiosInstance.post(`/admin/withdrawals/${id}/approve`);
    return res.data;
  },
  rejectWithdrawal: async (id: number, reason: string): Promise<TransactionDto> => {
    const res = await axiosInstance.post(`/admin/withdrawals/${id}/reject`, { reason });
    return res.data;
  },

  // Disputes
  getAllDisputes: async (page = 0, size = 20): Promise<PageResponse<any>> => {
    const res = await axiosInstance.get('/admin/disputes', { params: { page, size } });
    return res.data;
  },
  resolveDispute: async (id: number, resolution: string, adminNote: string): Promise<any> => {
    const res = await axiosInstance.post(`/disputes/${id}/resolve`, { resolution, adminNote });
    return res.data;
  },
};
