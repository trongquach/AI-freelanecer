import axiosInstance from './axiosInstance';
import { PageResponse } from '../types/common';

export interface ChatMessage {
  id: number;
  contractId: number;
  sender: {
    id: number;
    fullName: string;
    avatarUrl: string;
  };
  content: string;
  createdAt: string;
  isRead: boolean;
}

export const chatApi = {
  getMessages: async (contractId: number, page = 0, size = 50): Promise<PageResponse<ChatMessage>> => {
    const res = await axiosInstance.get(`/api/v1/messages/${contractId}`, { params: { page, size } });
    return res.data;
  },

  markAsRead: async (contractId: number): Promise<void> => {
    await axiosInstance.post(`/api/v1/messages/${contractId}/read`);
  }
};
