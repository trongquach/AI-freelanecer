import axiosInstance from './axiosInstance';
import { ExpertCVRequest, ExpertCVResponse } from '../types/contract';

export const cvApi = {
  /** Expert tạo hoặc cập nhật CV của mình */
  upsertCV: async (data: ExpertCVRequest): Promise<ExpertCVResponse> => {
    const res = await axiosInstance.put('/cv', data);
    return res.data;
  },

  /** Expert view own CV — returns null if not created yet */
  getMyCV: async (): Promise<ExpertCVResponse | null> => {
    try {
      const res = await axiosInstance.get('/cv/my');
      return res.data;
    } catch (err: any) {
      if (err?.response?.status === 404) return null;
      throw err;
    }
  },

  /** Client/Admin xem CV của một Expert theo userId */
  getCVByUserId: async (userId: number): Promise<ExpertCVResponse> => {
    const res = await axiosInstance.get(`/cv/expert/${userId}`);
    return res.data;
  },
};
