import axiosInstance from './axiosInstance';
import { Proposal, SubmitProposalRequest, Contract, AcceptProposalRequest, SubmitMilestoneRequest, RejectMilestoneRequest } from '../types/contract';
import { PageResponse } from '../types/common';

export const contractApi = {
  // ── Proposals ─────────────────────────────────────────────

  submitProposal: async (jobId: number, data: SubmitProposalRequest): Promise<Proposal> => {
    const res = await axiosInstance.post('/proposals', { ...data, jobId });
    return res.data;
  },

  /** All proposals for a job (Admin/debug view) */
  getProposalsForJob: async (jobId: number, page = 0, size = 10): Promise<PageResponse<Proposal>> => {
    const res = await axiosInstance.get(`/proposals/job/${jobId}`, { params: { page, size } });
    return res.data;
  },

  /** CV đã qua AI — Client xem, sort theo điểm AI */
  getScreenedProposals: async (jobId: number, page = 0, size = 20): Promise<PageResponse<Proposal>> => {
    const res = await axiosInstance.get(`/proposals/job/${jobId}/screened`, { params: { page, size } });
    return res.data;
  },

  /** Danh sách đang trong vòng phỏng vấn */
  getInterviewCandidates: async (jobId: number): Promise<Proposal[]> => {
    const res = await axiosInstance.get(`/proposals/job/${jobId}/interview`);
    return res.data;
  },

  /** Client mời ứng viên vào vòng phỏng vấn */
  shortlistProposal: async (proposalId: number): Promise<Proposal> => {
    const res = await axiosInstance.post(`/proposals/${proposalId}/shortlist`);
    return res.data;
  },

  /** Client đánh dấu đã phỏng vấn + ghi chú */
  markInterviewed: async (proposalId: number, notes: string): Promise<Proposal> => {
    const res = await axiosInstance.post(`/proposals/${proposalId}/interviewed`, { notes });
    return res.data;
  },

  acceptProposal: async (proposalId: number, data: AcceptProposalRequest): Promise<Contract> => {
    const res = await axiosInstance.post(`/proposals/${proposalId}/accept`, data);
    return res.data;
  },

  rejectProposal: async (proposalId: number): Promise<void> => {
    await axiosInstance.post(`/proposals/${proposalId}/reject`);
  },

  withdrawProposal: async (proposalId: number): Promise<void> => {
    await axiosInstance.post(`/proposals/${proposalId}/withdraw`);
  },

  myProposals: async (page = 0, size = 10): Promise<PageResponse<Proposal>> => {
    const res = await axiosInstance.get('/proposals/my', { params: { page, size } });
    return res.data;
  },

  // ── Contracts ─────────────────────────────────────────────

  getMyContracts: async (page = 0, size = 10): Promise<PageResponse<Contract>> => {
    const res = await axiosInstance.get('/contracts/my', { params: { page, size } });
    return res.data;
  },

  getContractDetails: async (contractId: number): Promise<Contract> => {
    const res = await axiosInstance.get(`/contracts/${contractId}`);
    return res.data;
  },

  // ── Milestones ────────────────────────────────────────────

  submitMilestone: async (contractId: number, milestoneId: number, data: SubmitMilestoneRequest): Promise<void> => {
    await axiosInstance.post(`/contracts/${contractId}/milestones/${milestoneId}/submit`, data);
  },

  approveMilestone: async (contractId: number, milestoneId: number): Promise<void> => {
    await axiosInstance.post(`/contracts/${contractId}/milestones/${milestoneId}/approve`);
  },

  rejectMilestone: async (contractId: number, milestoneId: number, data: RejectMilestoneRequest): Promise<void> => {
    await axiosInstance.post(`/contracts/${contractId}/milestones/${milestoneId}/reject`, data);
  },

  openDispute: async (contractId: number, reason: string, description: string): Promise<void> => {
    await axiosInstance.post(`/contracts/${contractId}/dispute`, { reason, description });
  }
};

