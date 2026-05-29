import axiosInstance from './axiosInstance';
import { PageResponse } from '../types/common';

export interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  content: string;
  referenceId: number;
  isRead: boolean;
  createdAt: string;
}

export const notificationApi = {
  getNotifications: async (page = 0, size = 10): Promise<PageResponse<Notification>> => {
    const res = await axiosInstance.get('/notifications', { params: { page, size } });
    return res.data;
  },

  markAsRead: async (id: number): Promise<void> => {
    await axiosInstance.post(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await axiosInstance.post('/notifications/read-all');
  }
};
