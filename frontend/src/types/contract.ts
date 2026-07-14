export interface Proposal {
  id: number;
  jobId: number;
  expert: {
    id: number;
    fullName: string;
    avatarUrl?: string;
    rating?: number;
    totalReviews?: number;
  };
  price: number;
  timelineDays: number;
  coverLetter: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  createdAt: string;
}

export interface SubmitProposalRequest {
  price: number;
  timelineDays: number;
  coverLetter: string;
}

export interface Milestone {
  id: number;
  contractId: number;
  name: string;
  description: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  status: 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  deliverableUrl?: string;
  deliverableNote?: string;
  orderIndex: number;
}

export interface SubmitMilestoneRequest {
  deliverableUrl?: string;
  deliverableNote: string;
}

export interface RejectMilestoneRequest {
  reason: string;
}

export interface Contract {
  id: number;
  jobId: number;
  jobTitle?: string;
  proposalId: number;
  client: {
    id: number;
    fullName: string;
    avatarUrl?: string;
  };
  expert: {
    id: number;
    fullName: string;
    avatarUrl?: string;
  };
  totalAmount: number;
  status: 'ACTIVE' | 'COMPLETED' | 'DISPUTED' | 'CANCELLED';
  startedAt: string;
  completedAt?: string;
  createdAt: string;
  milestones: Milestone[];
}

export interface AcceptProposalRequest {
  milestones: {
    name: string;
    description: string;
    amount: number;
    dueDate: string;
  }[];
}
