import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle, XCircle, Clock, MessageSquare, Star,
  ChevronRight, Brain, Users, Trophy, AlertCircle, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

import { contractApi } from '@/api/contractApi';
import { jobApi } from '@/api/jobServiceApi';
import { Proposal, AcceptProposalRequest, ProposalStatus } from '@/types/contract';
import Button from '@/components/ui/Button';
import { useRealtimeEvents } from '@/hooks/useRealtimeEvents';

// ─── Status badge ─────────────────────────────────────────────

const STATUS_CONFIG: Record<ProposalStatus, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING:       { label: 'Pending AI',     color: 'bg-slate-100 text-slate-600 border-slate-200',    icon: <Loader2 size={12} className="animate-spin"/> },
  AI_SCREENING:  { label: 'AI Reviewing',   color: 'bg-blue-50 text-blue-600 border-blue-200',        icon: <Brain size={12} className="animate-pulse"/> },
  AI_PASSED:     { label: 'AI Approved ✓',  color: 'bg-green-50 text-green-700 border-green-200',     icon: <CheckCircle size={12}/> },
  AI_FAILED:     { label: 'AI Rejected',    color: 'bg-red-50 text-red-600 border-red-200',           icon: <XCircle size={12}/> },
  SHORTLISTED:   { label: 'Interview',      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',  icon: <MessageSquare size={12}/> },
  INTERVIEWED:   { label: 'Interviewed',    color: 'bg-purple-50 text-purple-700 border-purple-200',  icon: <Star size={12}/> },
  ACCEPTED:      { label: 'Hired',          color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <Trophy size={12}/> },
  REJECTED:      { label: 'Rejected',       color: 'bg-red-50 text-red-500 border-red-200',           icon: <XCircle size={12}/> },
  WITHDRAWN:     { label: 'Withdrawn',      color: 'bg-slate-100 text-slate-500 border-slate-200',    icon: <AlertCircle size={12}/> },
};

function StatusBadge({ status }: { status: ProposalStatus }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: 'bg-slate-100 text-slate-600 border-slate-200', icon: null };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
      {cfg.icon}{cfg.label}
    </span>
  );
}

// ─── AI Score bar ─────────────────────────────────────────────

function AIScoreBar({ score }: { score?: number }) {
  if (score == null) return null;
  const pct = Math.round(score * 100);
  const color = pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-indigo-500' : 'bg-amber-500';
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500 w-16 shrink-0">AI Score</span>
      <div className="flex-1 bg-slate-100 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-bold w-10 text-right ${pct >= 80 ? 'text-emerald-600' : pct >= 60 ? 'text-indigo-600' : 'text-amber-600'}`}>
        {pct}%
      </span>
    </div>
  );
}

// ─── Accept Modal ─────────────────────────────────────────────

const AcceptModal = ({ isOpen, onClose, proposal, onAccept }: {
  isOpen: boolean; onClose: () => void; proposal: Proposal | null;
  onAccept: (data: AcceptProposalRequest) => void;
}) => {
  const [milestones, setMilestones] = useState([{
    name: 'Final Delivery', description: 'Complete project delivery',
    amount: proposal?.price || 0,
    dueDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]
  }]);

  if (!isOpen || !proposal) return null;

  const total = milestones.reduce((s, m) => s + Number(m.amount), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <h2 className="text-xl font-bold text-slate-900 mb-1">Create Contract</h2>
        <p className="text-sm text-slate-500 mb-6">
          Hire <strong>{proposal.expert?.fullName}</strong> — Proposed price: <strong className="text-indigo-600">${proposal.price}</strong>
        </p>

        <form onSubmit={e => {
          e.preventDefault();
          if (total !== proposal.price) {
            toast.error(`Total milestones ($${total}) must equal the proposed price ($${proposal.price})`);
            return;
          }
          for (let i = 1; i < milestones.length; i++) {
            if (new Date(milestones[i].dueDate) <= new Date(milestones[i-1].dueDate)) {
              toast.error(`Milestone ${i+1} due date must be after Milestone ${i} due date`);
              return;
            }
          }
          onAccept({ milestones });
        }} className="space-y-4">
          {milestones.map((m, i) => (
            <div key={i} className="p-4 border border-slate-200 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-700">Milestone {i + 1}</span>
                {milestones.length > 1 && (
                  <button type="button" onClick={() => setMilestones(ms => ms.filter((_, j) => j !== i))}
                    className="text-red-400 hover:text-red-600 text-xs">Remove</button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Milestone name</label>
                  <input required value={m.name} onChange={e => { const n = [...milestones]; n[i].name = e.target.value; setMilestones(n); }}
                    className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-indigo-500" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Amount ($)</label>
                  <input required type="number" min="1" value={m.amount} onChange={e => { const n = [...milestones]; n[i].amount = Number(e.target.value); setMilestones(n); }}
                    className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-indigo-500" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-slate-500 mb-1 block">Description</label>
                  <input value={m.description} onChange={e => { const n = [...milestones]; n[i].description = e.target.value; setMilestones(n); }}
                    className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-indigo-500" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Due date</label>
                  <input required type="date" 
                    min={i > 0 && milestones[i-1].dueDate ? new Date(new Date(milestones[i-1].dueDate).getTime() + 86400000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                    value={m.dueDate} onChange={e => { const n = [...milestones]; n[i].dueDate = e.target.value; setMilestones(n); }}
                    className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-indigo-500" />
                </div>
              </div>
            </div>
          ))}

          <button type="button" onClick={() => setMilestones([...milestones, { name: '', description: '', amount: 0, dueDate: '' }])}
            className="w-full py-2 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-indigo-400 hover:text-indigo-600 text-sm transition-colors">
            + Add Milestone
          </button>

          <div className={`text-right text-sm font-medium ${total === proposal.price ? 'text-emerald-600' : 'text-red-500'}`}>
            Total: ${total} / ${proposal.price}
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary">🎉 Create Contract</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Interview Note Modal ─────────────────────────────────────

const InterviewModal = ({ isOpen, onClose, proposal, onSave }: {
  isOpen: boolean; onClose: () => void; proposal: Proposal | null;
  onSave: (notes: string) => void;
}) => {
  const [notes, setNotes] = useState(proposal?.interviewNotes ?? '');
  if (!isOpen || !proposal) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Interview Notes</h2>
        <p className="text-sm text-slate-500">Candidate: <strong>{proposal.expert?.fullName}</strong></p>
        <textarea
          rows={5}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Notes from the interview: attitude, skills, overall fit..."
          className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-900 text-sm focus:border-indigo-500"
        />
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={() => { onSave(notes); onClose(); }}>Save & Mark Interviewed</Button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────

type Tab = 'screened' | 'interview';

export default function ProposalListPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useRealtimeEvents(); // Listen for real-time WebSocket events

  const [tab, setTab] = useState<Tab>('screened');
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [interviewProposal, setInterviewProposal] = useState<Proposal | null>(null);

  const { data: job } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobApi.getById(Number(id)),
    enabled: !!id,
  });

  const { data: screenedData, isLoading: loadingScreened } = useQuery({
    queryKey: ['screened-proposals', id],
    queryFn: () => contractApi.getScreenedProposals(Number(id), 0, 50),
    enabled: !!id,
  });

  const { data: interviewList, isLoading: loadingInterview } = useQuery({
    queryKey: ['interview-candidates', id],
    queryFn: () => contractApi.getInterviewCandidates(Number(id)),
    enabled: !!id,
  });

  const shortlistMutation = useMutation({
    mutationFn: (proposalId: number) => contractApi.shortlistProposal(proposalId),
    onSuccess: () => {
      toast.success('Candidate invited to interview!');
      queryClient.invalidateQueries({ queryKey: ['screened-proposals', id] });
      queryClient.invalidateQueries({ queryKey: ['interview-candidates', id] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Action failed'),
  });

  const interviewedMutation = useMutation({
    mutationFn: ({ proposalId, notes }: { proposalId: number; notes: string }) =>
      contractApi.markInterviewed(proposalId, notes),
    onSuccess: () => {
      toast.success('Marked as interviewed!');
      queryClient.invalidateQueries({ queryKey: ['interview-candidates', id] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Action failed'),
  });

  const rejectMutation = useMutation({
    mutationFn: (proposalId: number) => contractApi.rejectProposal(proposalId),
    onSuccess: () => {
      toast.success('Candidate rejected.');
      queryClient.invalidateQueries({ queryKey: ['screened-proposals', id] });
      queryClient.invalidateQueries({ queryKey: ['interview-candidates', id] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Action failed'),
  });

  const acceptMutation = useMutation({
    mutationFn: (data: AcceptProposalRequest) =>
      contractApi.acceptProposal(selectedProposal!.id, data),
    onSuccess: () => {
      toast.success('🎉 Contract created successfully!');
      setSelectedProposal(null);
      navigate(`/dashboard/client`);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create contract'),
  });

  const proposals = tab === 'screened' ? (screenedData?.content ?? []) : (interviewList ?? []);
  const isLoading = tab === 'screened' ? loadingScreened : loadingInterview;
  const interviewCount = interviewList?.length ?? 0;
  const maxShortlist = job?.maxShortlist ?? 5;

  return (
    <div className="max-w-5xl mx-auto p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Applicants for: {job?.title}</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
            <span>AI Threshold: <strong className="text-indigo-600">{Math.round((job?.aiScreeningThreshold ?? 0.6) * 100)}%</strong></span>
            <span>•</span>
            <span>Interview slots: <strong className="text-indigo-600">{interviewCount}/{maxShortlist}</strong></span>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate('/dashboard/client')}>← Dashboard</Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        <TabBtn active={tab === 'screened'} onClick={() => setTab('screened')} icon={<Brain size={15}/>}>
          AI Screened ({screenedData?.totalElements ?? '…'})
        </TabBtn>
        <TabBtn active={tab === 'interview'} onClick={() => setTab('interview')} icon={<Users size={15}/>}>
          Interview Round ({interviewCount}/{maxShortlist})
        </TabBtn>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="animate-spin text-indigo-500" />
        </div>
      ) : proposals.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <Brain size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">
            {tab === 'screened'
              ? 'No CVs have passed AI screening yet. AI is processing or no applications have been submitted.'
              : 'No candidates have been invited to interview yet. Select from the "AI Screened" tab.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map((proposal: Proposal) => (
            <div key={proposal.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row gap-5">
                {/* Expert info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Link to={`/profile/${proposal.expert?.id}`} className="shrink-0">
                        <img
                          src={proposal.expert?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(proposal.expert?.fullName || 'E')}&background=6366f1&color=fff`}
                          alt={proposal.expert?.fullName}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-100"
                        />
                      </Link>
                      <div>
                        <Link to={`/profile/${proposal.expert?.id}`}
                          className="font-semibold text-slate-900 hover:text-indigo-600">
                          {proposal.expert?.fullName}
                        </Link>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span>⭐ {proposal.expert?.rating?.toFixed(1) ?? '0.0'}</span>
                          {proposal.expert?.yearsOfExperience != null && (
                            <><span>•</span><span>{proposal.expert.yearsOfExperience} yrs exp</span></>
                          )}
                          {proposal.expert?.skills?.length ? (
                            <><span>•</span><span>{proposal.expert.skills.slice(0, 3).join(', ')}</span></>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={proposal.status} />
                  </div>

                  {/* AI Score */}
                  <AIScoreBar score={proposal.aiScore} />

                  {/* AI Feedback */}
                  {proposal.aiFeedback && (
                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3">
                      <p className="text-xs text-indigo-700 font-medium mb-1">AI Feedback:</p>
                      <p className="text-xs text-indigo-600">{proposal.aiFeedback}</p>
                    </div>
                  )}

                  {/* Pricing */}
                  <div className="flex gap-4 text-sm text-slate-600">
                    <span className="font-semibold text-indigo-600 text-base">${proposal.price}</span>
                    <span className="flex items-center gap-1"><Clock size={14}/> {proposal.timelineDays} days</span>
                  </div>

                  {/* Cover Letter */}
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Cover Letter</p>
                    <p className="text-sm text-slate-700 line-clamp-3 bg-slate-50 rounded-lg p-3">
                      {proposal.coverLetter}
                    </p>
                  </div>

                  {/* Interview notes */}
                  {proposal.interviewNotes && (
                    <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
                      <p className="text-xs text-purple-700 font-medium mb-1">📝 Interview Notes:</p>
                      <p className="text-xs text-purple-600">{proposal.interviewNotes}</p>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex md:flex-col gap-2 justify-start md:justify-center md:border-l md:border-slate-100 md:pl-5 md:min-w-[160px]">

                  {/* View CV */}
                  <Link to={`/cv/expert/${proposal.expert?.id}`}
                    className="flex items-center justify-center gap-1 px-4 py-2 text-sm text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors">
                    View CV <ChevronRight size={14}/>
                  </Link>

                  {/* Shortlist */}
                  {proposal.status === 'AI_PASSED' && interviewCount < maxShortlist && (
                    <Button variant="primary"
                      onClick={() => shortlistMutation.mutate(proposal.id)}
                      isLoading={shortlistMutation.isPending}>
                      <MessageSquare size={14} className="mr-1"/> Invite to Interview
                    </Button>
                  )}

                  {/* Chat for interview */}
                  {proposal.status === 'SHORTLISTED' && proposal.contractId && (
                    <Link to={`/contracts/${proposal.contractId}`}
                      className="flex items-center justify-center gap-1 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                      <MessageSquare size={14}/> Chat Interview
                    </Link>
                  )}

                  {/* Mark interviewed */}
                  {proposal.status === 'SHORTLISTED' && (
                    <Button variant="outline"
                      onClick={() => setInterviewProposal(proposal)}>
                      ✓ Mark Interviewed
                    </Button>
                  )}

                  {/* Accept (create contract) */}
                  {proposal.status === 'INTERVIEWED' && (
                    <Button variant="primary"
                      onClick={() => setSelectedProposal(proposal)}>
                      <Trophy size={14} className="mr-1"/> Hire Candidate
                    </Button>
                  )}

                  {/* Reject */}
                  {['AI_PASSED', 'SHORTLISTED', 'INTERVIEWED'].includes(proposal.status) && (
                    <Button variant="ghost"
                      onClick={() => window.confirm('Reject this candidate?') && rejectMutation.mutate(proposal.id)}
                      className="text-red-500 hover:bg-red-50">
                      Reject
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AcceptModal
        isOpen={!!selectedProposal}
        onClose={() => setSelectedProposal(null)}
        proposal={selectedProposal}
        onAccept={(data) => acceptMutation.mutate(data)}
      />

      <InterviewModal
        isOpen={!!interviewProposal}
        onClose={() => setInterviewProposal(null)}
        proposal={interviewProposal}
        onSave={(notes) => interviewedMutation.mutate({ proposalId: interviewProposal!.id, notes })}
      />
    </div>
  );
}

function TabBtn({ active, onClick, children, icon }: {
  active: boolean; onClick: () => void; children: React.ReactNode; icon?: React.ReactNode;
}) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        active ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
      }`}>
      {icon}{children}
    </button>
  );
}
