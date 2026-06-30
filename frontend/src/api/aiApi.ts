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

  generateServiceDescription: async (title: string, skills: string[]): Promise<string> => {
    const res = await axiosInstance.post('/ai/services/generate', {
      title,
      keywords: skills,    // backend field is 'keywords', not 'skills'
      deliveryDays: 3,     // required by backend DTO
      price: 50,           // required by backend DTO
    });
    // Backend returns: { description, highlights, whatYouGet }
    const { description, highlights, whatYouGet } = res.data;
    let fullText = description || '';
    if (highlights?.length > 0) {
      fullText += '\n\nHighlights:\n' + highlights.map((h: string) => `- ${h}`).join('\n');
    }
    if (whatYouGet?.length > 0) {
      fullText += '\n\nWhat You Get:\n' + whatYouGet.map((w: string) => `- ${w}`).join('\n');
    }
    return fullText;
  },

  recommendExperts: async (jobId: number): Promise<any[]> => {
    const res = await axiosInstance.get(`/ai/jobs/${jobId}/recommend-experts`);
    return res.data;
  }
};
