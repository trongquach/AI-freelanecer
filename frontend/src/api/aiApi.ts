import axiosInstance from './axiosInstance';

export interface AIJobSuggestion {
  improvedTitle: string;
  improvedDescription: string;
  suggestedBudgetMin: number | null;
  suggestedBudgetMax: number | null;
  missingSkills: string[];
  reasoning: string;
}

export const aiApi = {
  enhanceJobDescription: async (title: string, description: string): Promise<AIJobSuggestion> => {
    const res = await axiosInstance.post('/ai/jobs/enhance', { title, description });
    return res.data as AIJobSuggestion;
  },

  generateServiceDescription: async (prompt: string): Promise<any> => {
    const res = await axiosInstance.post('/ai/services/generate', { prompt });
    return res.data;
  },

  recommendExperts: async (jobId: number): Promise<any[]> => {
    const res = await axiosInstance.get(`/ai/jobs/${jobId}/recommend-experts`);
    return res.data;
  }
};
