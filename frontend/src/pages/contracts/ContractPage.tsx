import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle, Clock, FileText, AlertTriangle, Send, XCircle } from 'lucide-react';
import { toast } from 'sonner';

import { contractApi } from '@/api/contractApi';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ChatWidget from '@/components/chat/ChatWidget';

export default function ContractPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { isClient, isExpert } = useAuth();
  
  const [deliverableUrl, setDeliverableUrl] = useState('');
  const [deliverableNote, setDeliverableNote] = useState('');
  const [activeMilestoneId, setActiveMilestoneId] = useState<number | null>(null);

  const { data: contract, isLoading, isError } = useQuery({
    queryKey: ['contract', id],
    queryFn: () => contractApi.getContractDetails(Number(id)),
    enabled: !!id,
  });

  const submitMilestoneMut = useMutation({
    mutationFn: ({ mId, url, note }: { mId: number, url: string, note: string }) => 
      contractApi.submitMilestone(Number(id), mId, { deliverableUrl: url, deliverableNote: note }),
    onSuccess: () => {
      toast.success('Milestone submitted successfully!');
      setActiveMilestoneId(null);
      setDeliverableUrl('');
      setDeliverableNote('');
      queryClient.invalidateQueries({ queryKey: ['contract', id] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to submit milestone')
  });

  const approveMilestoneMut = useMutation({
    mutationFn: (mId: number) => contractApi.approveMilestone(Number(id), mId),
    onSuccess: () => {
      toast.success('Milestone approved! Funds released.');
      queryClient.invalidateQueries({ queryKey: ['contract', id] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to approve milestone')
  });

  if (isLoading) return <div className="flex justify-center py-24"><LoadingSpinner size="lg" /></div>;
  if (isError || !contract) return (
    <div className="text-center py-24 text-slate-900">
      <p className="text-danger-500 mb-4">Contract not found.</p>
      <Link to="/dashboard/client" className="btn-ghost btn-md mt-4">← Back to Dashboard</Link>
    </div>
  );

  const completedMilestones = contract.milestones?.filter(m => m.status === 'APPROVED').length || 0;
  const progressPercent = contract.milestones?.length ? (completedMilestones / contract.milestones.length) * 100 : 0;

  return (
    <div className="max-w-5xl mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Milestones */}
      <div className="lg:col-span-2 space-y-6">
        <Link to={isClient() ? '/dashboard/client' : '/dashboard/expert'}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="bg-white border border-slate-200 p-6 rounded-xl border border-slate-300">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Contract: {contract.jobTitle || `Contract #${contract.id}`}</h1>
              <div className="flex items-center gap-3 text-sm">
                <span className={`px-2.5 py-1 rounded-full font-medium ${
                  contract.status === 'ACTIVE' ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20' :
                  contract.status === 'COMPLETED' ? 'bg-success-500/10 text-success-400 border border-success-500/20' :
                  contract.status === 'DISPUTED' ? 'bg-danger-500/10 text-danger-400 border border-danger-500/20' :
                  'bg-slate-200/10 text-slate-500 border border-slate-300/20'
                }`}>
                  {contract.status}
                </span>
                <span className="text-slate-500">Started: {new Date(contract.startedAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500 mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-success-400">${contract.totalAmount?.toLocaleString()}</p>
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Progress</span>
              <span>{completedMilestones} / {contract.milestones?.length || 0} Milestones</span>
            </div>
            <div className="h-2 w-full bg-white rounded-full overflow-hidden">
              <div className="h-full bg-success-500 transition-all" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-4">Milestones</h3>
        <div className="space-y-4">
          {contract.milestones?.map((m, index) => (
            <div key={m.id} className="bg-white border border-slate-200 p-6 rounded-xl border border-slate-300 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-lg font-medium text-slate-900 mb-1">
                    {index + 1}. {m.name}
                  </h4>
                  <p className="text-sm text-slate-600">{m.description}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">${m.amount?.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 mt-1">Due: {new Date(m.dueDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-300">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${
                    m.status === 'APPROVED' ? 'bg-success-500/10 text-success-400 border-success-500/20' :
                    m.status === 'SUBMITTED' ? 'bg-primary-500/10 text-primary-400 border-primary-500/20' :
                    m.status === 'REJECTED' ? 'bg-danger-500/10 text-danger-400 border-danger-500/20' :
                    'bg-white text-slate-600 border-slate-300'
                  }`}>
                    {m.status}
                  </span>
                  {m.deliverableUrl && (
                    <a href={m.deliverableUrl} target="_blank" rel="noreferrer" className="text-xs text-primary-400 hover:underline flex items-center gap-1">
                      <FileText size={14}/> View Deliverable
                    </a>
                  )}
                </div>

                <div className="flex gap-2">
                  {isExpert() && (m.status === 'PENDING' || m.status === 'IN_PROGRESS' || m.status === 'REJECTED') && (
                    <Button variant="primary" size="sm" onClick={() => setActiveMilestoneId(m.id)}>
                      Submit Work
                    </Button>
                  )}
                  
                  {isClient() && m.status === 'SUBMITTED' && (
                    <>
                      <Button variant="outline" size="sm" onClick={() => {
                        toast.info("Reject functionality requires a modal with reason input.");
                      }}>
                        Reject
                      </Button>
                      <Button variant="primary" size="sm" onClick={() => approveMilestoneMut.mutate(m.id)} isLoading={approveMilestoneMut.isPending}>
                        Approve & Pay
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Submit Form Inline */}
              {activeMilestoneId === m.id && isExpert() && (
                <div className="pt-4 mt-4 border-t border-slate-300 space-y-4">
                  <div>
                    <label className="text-xs text-slate-500">Deliverable URL (Optional)</label>
                    <input type="url" value={deliverableUrl} onChange={e => setDeliverableUrl(e.target.value)} className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-sm text-slate-900" placeholder="https://github.com/..." />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Notes to Client</label>
                    <textarea required value={deliverableNote} onChange={e => setDeliverableNote(e.target.value)} className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-sm text-slate-900" rows={3} placeholder="I have completed..." />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setActiveMilestoneId(null)}>Cancel</Button>
                    <Button variant="primary" size="sm" onClick={() => submitMilestoneMut.mutate({mId: m.id, url: deliverableUrl, note: deliverableNote})} disabled={!deliverableNote || submitMilestoneMut.isPending}>
                      Submit for Approval
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Info & Actions */}
      <div className="space-y-6">
        <div className="bg-white border border-slate-200 p-6 rounded-xl border border-slate-300 space-y-4">
          <h3 className="font-semibold text-slate-900 border-b border-slate-300 pb-2">Contract Info</h3>
          
          <div>
            <p className="text-xs text-slate-500">Client</p>
            <p className="font-medium text-slate-900">{contract.clientName || 'Client'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Expert</p>
            <p className="font-medium text-slate-900">{contract.expertName || 'Expert'}</p>
          </div>
          
          <div className="pt-4 border-t border-slate-300">
            <Button variant="outline" className="w-full justify-center gap-2 text-danger-400 hover:text-danger-300 hover:border-danger-500/50 hover:bg-danger-500/10"
              onClick={() => {
                toast.info("Dispute functionality requires modal.");
              }}>
              <AlertTriangle size={16} /> Open Dispute
            </Button>
          </div>
        </div>

        {/* Chat Widget */}
        <div className="bg-white border border-slate-200 p-0 rounded-xl border border-slate-300 h-[600px] flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-300 bg-white border border-slate-200 flex justify-between items-center">
            <h3 className="font-semibold text-slate-900">Messages</h3>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatWidget contractId={Number(id)} />
          </div>
        </div>
      </div>
    </div>
  );
}
