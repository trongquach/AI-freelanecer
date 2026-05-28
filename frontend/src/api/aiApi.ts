import axiosInstance from './axiosInstance';

export const aiApi = {
  enhanceJobDescription: async (title: string, description: string): Promise<string> => {
    const res = await axiosInstance.post('/api/v1/ai/jobs/enhance', { title, description });
    return res.data.enhancedDescription;
  },

  generateServiceDescription: async (title: string, skills: string[]): Promise<string> => {
    const res = await axiosInstance.post('/api/v1/ai/services/generate', { title, skills });
    return res.data.generatedDescription;
  },

  recommendExperts: async (jobId: number): Promise<any[]> => {
    const res = await axiosInstance.get(`/api/v1/ai/jobs/${jobId}/recommend-experts`);
    return res.data;
  }
};
