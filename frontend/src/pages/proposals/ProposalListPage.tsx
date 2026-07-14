import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

import { contractApi } from '@/api/contractApi';
import { jobApi } from '@/api/jobServiceApi';
import { Proposal, AcceptProposalRequest } from '@/types/contract';
import Button from '@/components/ui/Button';

// A simple Modal component
const AcceptProposalModal = ({ 
  isOpen, 
  onClose, 
  proposal, 
  onAccept 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  proposal: Proposal | null, 
  onAccept: (data: AcceptProposalRequest) => void 
}) => {
  const [milestones, setMilestones] = useState([{ name: 'Final Delivery', description: 'Complete project delivery', amount: proposal?.price || 0, dueDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0] }]);

  if (!isOpen || !proposal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalAmount = milestones.reduce((sum, m) => sum + Number(m.amount), 0);
    if (totalAmount !== proposal.price) {
      toast.error(`Total milestones amount (${totalAmount}) must equal proposal price (${proposal.price})`);
      return;
    }
    onAccept({ milestones });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white border border-slate-200 border border-slate-300 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Accept Proposal: {proposal.expert?.fullName}</h2>
        <p className="text-sm text-slate-600 mb-6">Define the milestones for this contract. The total must equal the proposed price of <strong>${proposal.price}</strong>.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {milestones.map((m, index) => (
            <div key={index} className="p-4 border border-slate-300 rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-slate-900">Milestone {index + 1}</h4>
                {milestones.length > 1 && (
                  <button type="button" onClick={() => setMilestones(ms => ms.filter((_, i) => i !== index))} className="text-red-400 hover:text-red-300 text-sm">Remove</button>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500">Name</label>
                  <input type="text" required value={m.name} onChange={e => { const newM = [...milestones]; newM[index].name = e.target.value; setMilestones(newM); }} className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-sm text-slate-900" />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Amount ($)</label>
                  <input type="number" required min="1" value={m.amount} onChange={e => { const newM = [...milestones]; newM[index].amount = Number(e.target.value); setMilestones(newM); }} className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-sm text-slate-900" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-slate-500">Description</label>
                  <input type="text" value={m.description} onChange={e => { const newM = [...milestones]; newM[index].description = e.target.value; setMilestones(newM); }} className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-sm text-slate-900" />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Due Date</label>
                  <input type="date" required value={m.dueDate} onChange={e => { const newM = [...milestones]; newM[index].dueDate = e.target.value; setMilestones(newM); }} className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-sm text-slate-900" />
                </div>
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" onClick={() => setMilestones([...milestones, { name: '', description: '', amount: 0, dueDate: '' }])}>
            + Add Milestone
          </Button>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-300">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary">Create Contract</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function ProposalListPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

  const { data: job } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobApi.getById(Number(id)),
    enabled: !!id,
  });

  const { data: proposalData, isLoading } = useQuery({
    queryKey: ['proposals', id],
    queryFn: () => contractApi.getProposalsForJob(Number(id), 0, 50),
    enabled: !!id,
  });

  const acceptMutation = useMutation({
    mutationFn: (data: AcceptProposalRequest) => contractApi.acceptProposal(selectedProposal!.id, data),
    onSuccess: (contract) => {
      toast.success('Proposal accepted and contract created!');
      setSelectedProposal(null);
      queryClient.invalidateQueries({ queryKey: ['proposals', id] });
      navigate(`/contracts/${contract.id}`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to accept proposal');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (proposalId: number) => contractApi.rejectProposal(proposalId),
    onSuccess: () => {
      toast.success('Proposal rejected.');
      queryClient.invalidateQueries({ queryKey: ['proposals', id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to reject proposal');
    }
  });

  if (isLoading) return <div className="p-8 text-center text-slate-900">Loading proposals...</div>;
  if (!proposalData) return <div className="p-8 text-center text-slate-900">No proposals found.</div>;

  const proposals = proposalData.content;

  return (
    <div className="max-w-5xl mx-auto p-4 lg:p-8 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Proposals for: {job?.title}</h1>
          <p className="text-slate-500">{proposals.length} proposals received</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/dashboard/client')}>Back to Dashboard</Button>
      </div>

      {proposals.length === 0 ? (
        <div className="bg-white border border-slate-200 p-8 rounded-xl border border-slate-300 text-center">
          <p className="text-slate-600">You haven't received any proposals for this job yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map((proposal: Proposal) => (
            <div key={proposal.id} className="bg-white border border-slate-200 p-6 rounded-xl border border-slate-300 flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <Link to={`/profile/${proposal.expert?.id}`} className="shrink-0 hover:ring-2 hover:ring-primary-500 rounded-full transition-all">
                      <img src={proposal.expert?.avatarUrl || 'https://ui-avatars.com/api/?name=' + (proposal.expert?.fullName || 'Expert')} alt={proposal.expert?.fullName || 'Expert'} className="w-12 h-12 rounded-full object-cover" />
                    </Link>
                    <div>
                      <Link to={`/profile/${proposal.expert?.id}`} className="text-lg font-semibold text-slate-900 hover:text-primary-600 hover:underline">{proposal.expert?.fullName || 'Unknown Expert'}</Link>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span>⭐ {proposal.expert?.rating?.toFixed(1) || '0.0'}</span>
                        <span>•</span>
                        <span>{new Date(proposal.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  {proposal.status === 'PENDING' && (
                    <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 rounded-full text-xs font-medium border border-yellow-500/20">Pending</span>
                  )}
                  {proposal.status === 'ACCEPTED' && (
                    <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-xs font-medium border border-green-500/20">Accepted</span>
                  )}
                  {proposal.status === 'REJECTED' && (
                    <span className="px-3 py-1 bg-red-500/10 text-red-400 rounded-full text-xs font-medium border border-red-500/20">Rejected</span>
                  )}
                </div>

                <div className="flex gap-6 text-sm">
                  <div className="flex items-center gap-1.5 text-surface-200">
                    <span className="font-semibold text-primary-400">${proposal.price}</span> proposed
                  </div>
                  <div className="flex items-center gap-1.5 text-surface-200">
                    <Clock size={16} className="text-slate-500"/> {proposal.timelineDays} days delivery
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-slate-600 mb-2">Cover Letter</h4>
                  <p className="text-sm text-surface-200 whitespace-pre-wrap bg-white/50 p-4 rounded-lg border border-slate-300/50">
                    {proposal.coverLetter}
                  </p>
                </div>
              </div>

              {proposal.status === 'PENDING' && (
                <div className="flex md:flex-col gap-3 justify-start md:justify-center border-t md:border-t-0 md:border-l border-slate-300 pt-4 md:pt-0 md:pl-6 min-w-[140px]">
                  <Button variant="primary" onClick={() => setSelectedProposal(proposal)} className="w-full">
                    Accept Proposal
                  </Button>
                  <Button variant="outline" onClick={() => {
                    if(window.confirm("Are you sure you want to reject this proposal?")) {
                      rejectMutation.mutate(proposal.id);
                    }
                  }} className="w-full text-danger-500 border-danger-500 hover:bg-danger-50">
                    Decline
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <AcceptProposalModal 
        isOpen={!!selectedProposal} 
        onClose={() => setSelectedProposal(null)} 
        proposal={selectedProposal} 
        onAccept={(data) => acceptMutation.mutate(data)}
      />
    </div>
  );
}
