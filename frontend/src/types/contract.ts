export type ProposalStatus =
  | 'PENDING'
  | 'AI_SCREENING'
  | 'AI_PASSED'
  | 'AI_FAILED'
  | 'SHORTLISTED'
  | 'INTERVIEWED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'WITHDRAWN'

export interface Proposal {
  id: number;
  contractId?: number;
  jobId: number;
  jobTitle: string;
  expert: {
    id: number;
    fullName: string;
    avatarUrl?: string;
    rating?: number;
    totalReviews?: number;
    skills?: string[];
    yearsOfExperience?: number;
  };
  price: number;
  timelineDays: number;
  coverLetter: string;
  status: ProposalStatus;
  aiScore?: number;
  aiFeedback?: string;
  interviewNotes?: string;
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
  escrowAmount?: number;
  status: 'ACTIVE' | 'COMPLETED' | 'DISPUTED' | 'CANCELLED' | 'INTERVIEWING';
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
export interface ExpertCVRequest {
  summary?: string;
  workExperiences?: WorkExperienceItem[];
  educations?: EducationItem[];
  certifications?: CertificationItem[];
  languages?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  yearsOfExperience?: number;
}

export interface ExpertCVResponse {
  id: number;
  userId: number;
  fullName?: string;
  summary?: string;
  workExperiences?: WorkExperienceItem[];
  educations?: EducationItem[];
  certifications?: CertificationItem[];
  languages?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  yearsOfExperience?: number;
  updatedAt: string;
}

export interface WorkExperienceItem {
  company: string;
  position: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  current: boolean;
}

export interface EducationItem {
  school: string;
  degree?: string;
  major?: string;
  graduationYear?: number;
}

export interface CertificationItem {
  name: string;
  issuer?: string;
  year?: number;
}
