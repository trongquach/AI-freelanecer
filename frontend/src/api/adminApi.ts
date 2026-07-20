import axiosInstance from './axiosInstance';
import { PageResponse } from '../types/common';
import { Contract } from '../types/contract';

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
  userEmail?: string;
}

export const adminApi = {
  getStats: async (): Promise<PlatformStats> => {
    const res = await axiosInstance.get('/admin/stats');
    return res.data;
  },

  broadcastNotification: async (title: string, content: string): Promise<void> => {
    await axiosInstance.post('/admin/notifications/broadcast', { title, content });
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
  resolveDispute: async (id: number, resolution: string, adminNote: string, reopenJob?: boolean): Promise<any> => {
    const res = await axiosInstance.post(`/disputes/${id}/resolve`, { resolution, adminNote, reopenJob });
    return res.data;
  },

  // Contracts / Escrow
  getActiveContracts: async (page = 0, size = 15): Promise<PageResponse<Contract>> => {
    const res = await axiosInstance.get('/admin/contracts/active', { params: { page, size } });
    return res.data;
  },

  getAllContracts: async (page = 0, size = 30): Promise<PageResponse<Contract>> => {
    const res = await axiosInstance.get('/admin/contracts/all', { params: { page, size } });
    return res.data;
  },

  // Escrow
  getPendingClearings: async (page = 0, size = 30): Promise<PageResponse<TransactionDto>> => {
    const res = await axiosInstance.get('/admin/escrow/pending-clearings', { params: { page, size } });
    return res.data;
  },
  settleClearing: async (id: number): Promise<void> => {
    await axiosInstance.post(`/admin/escrow/clearings/${id}/settle`);
  },
  forceReleaseEscrow: async (contractId: number): Promise<void> => {
    await axiosInstance.post(`/admin/contracts/${contractId}/release-escrow`);
  },
};
