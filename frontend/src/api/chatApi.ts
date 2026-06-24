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
    const res = await axiosInstance.get(`/contracts/${contractId}/messages`, { params: { page, size } });
    return res.data;
  },

  sendMessage: async (contractId: number, content: string): Promise<ChatMessage> => {
    const res = await axiosInstance.post(`/contracts/${contractId}/messages`, { content });
    return res.data;
  },

  markAsRead: async (contractId: number): Promise<void> => {
    // History endpoint implicitly marks as read, but we can do a dummy or just ignore
    // Or we could implement an explicit markAsRead if backend supported it. For now, do nothing.
    return Promise.resolve();
  }
};
