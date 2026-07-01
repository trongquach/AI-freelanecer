import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle, Clock, FileText, AlertTriangle, Send, XCircle } from 'lucide-react';
import { toast } from 'sonner';

import { contractApi } from '@/api/contractApi';
import { reviewApi } from '@/api/reviewApi';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ChatWidget from '@/components/chat/ChatWidget';

// Reject Milestone Modal
const RejectMilestoneModal = ({ isOpen, onClose, onReject }: { isOpen: boolean, onClose: () => void, onReject: (reason: string) => void }) => {
  const [reason, setReason] = useState('');
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Request Revision</h2>
        <p className="text-sm text-slate-600 mb-4">Please specify what needs to be changed or fixed.</p>
        <textarea required value={reason} onChange={e => setReason(e.target.value)} className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm text-slate-900 mb-4" rows={4} placeholder="The deliverable is missing..." />
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" disabled={!reason} onClick={() => onReject(reason)}>Submit Request</Button>
        </div>
      </div>
    </div>
  );
};

// Open Dispute Modal
const OpenDisputeModal = ({ isOpen, onClose, onSubmit }: { isOpen: boolean, onClose: () => void, onSubmit: (reason: string, desc: string) => void }) => {
  const [reason, setReason] = useState('NON_DELIVERY');
  const [desc, setDesc] = useState('');
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Open Dispute</h2>
        <p className="text-sm text-slate-600 mb-4">Are you sure you want to dispute this contract? Admins will step in to investigate.</p>
        <div className="space-y-4 mb-4">
          <div>
            <label className="text-xs text-slate-500">Reason</label>
            <select value={reason} onChange={e => setReason(e.target.value)} className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm text-slate-900">
              <option value="NON_DELIVERY">Non Delivery</option>
              <option value="POOR_QUALITY">Poor Quality</option>
              <option value="UNRESPONSIVE">Unresponsive</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500">Description</label>
            <textarea required value={desc} onChange={e => setDesc(e.target.value)} className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm text-slate-900" rows={4} placeholder="Please explain the issue..." />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" className="bg-danger-500 hover:bg-danger-600 border-danger-500" disabled={!desc} onClick={() => onSubmit(reason, desc)}>Open Dispute</Button>
        </div>
      </div>
    </div>
  );
};

// Write Review Modal
const WriteReviewModal = ({ onClose, onSubmit, isLoading }: {
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  isLoading: boolean;
}) => {
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-xl font-bold text-slate-900 mb-1">Write a Review</h2>
        <p className="text-sm text-slate-500 mb-5">Share your experience working with this expert.</p>
        <div className="mb-4">
          <label className="text-xs font-medium text-slate-600 mb-2 block">Your Rating</label>
          <div className="flex gap-1">
            {[1,2,3,4,5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                className="transition-transform hover:scale-110"
              >
                <svg className={`w-8 h-8 ${(hovered || rating) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 fill-slate-200'}`} viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              </button>
            ))}
            <span className="ml-2 text-sm text-slate-500 self-center">{rating}/5</span>
          </div>
        </div>
        <div className="mb-5">
          <label className="text-xs font-medium text-slate-600 mb-2 block">Comment (optional)</label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={4}
            maxLength={2000}
            placeholder="Describe your experience working with this expert..."
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <p className="text-xs text-slate-400 mt-1 text-right">{comment.length}/2000</p>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button variant="primary" onClick={() => onSubmit(rating, comment)} disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Submit Review'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function ContractPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { isClient, isExpert } = useAuth();
  
  const [deliverableUrl, setDeliverableUrl] = useState('');
  const [deliverableNote, setDeliverableNote] = useState('');
  const [activeMilestoneId, setActiveMilestoneId] = useState<number | null>(null);

  const [rejectModalMilestoneId, setRejectModalMilestoneId] = useState<number | null>(null);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

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

  const rejectMilestoneMut = useMutation({
    mutationFn: ({ mId, reason }: { mId: number, reason: string }) => contractApi.rejectMilestone(Number(id), mId, { reason }),
    onSuccess: () => {
      toast.success('Revision requested successfully.');
      setRejectModalMilestoneId(null);
      queryClient.invalidateQueries({ queryKey: ['contract', id] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to request revision')
  });

  const disputeMut = useMutation({
    mutationFn: ({ reason, desc }: { reason: string, desc: string }) => contractApi.openDispute(Number(id), reason, desc),
    onSuccess: () => {
      toast.success('Dispute opened. Admin will review shortly.');
      setIsDisputeModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['contract', id] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to open dispute')
  });

  const reviewMut = useMutation({
    mutationFn: ({ rating, comment }: { rating: number, comment: string }) =>
      reviewApi.createReview({ contractId: Number(id), rating, comment }),
    onSuccess: () => {
      toast.success('Review submitted! Thank you for your feedback.');
      setIsReviewModalOpen(false);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to submit review')
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

        <div className="bg-white border border-slate-200 p-6 rounded-xl">
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
            <div key={m.id} className="bg-white border border-slate-200 p-6 rounded-xl space-y-4">
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
                      <Button variant="outline" size="sm" onClick={() => setRejectModalMilestoneId(m.id)}>
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
        <div className="bg-white border border-slate-200 p-6 rounded-xl space-y-4">
          <h3 className="font-semibold text-slate-900 border-b border-slate-300 pb-2">Contract Info</h3>
          
          <div>
            <p className="text-xs text-slate-500">Client</p>
            <Link to={`/profile/${contract.clientId}`} className="font-medium text-slate-900 hover:text-primary-600 hover:underline">{contract.clientName || 'Client'}</Link>
          </div>
          <div>
            <p className="text-xs text-slate-500">Expert</p>
            <Link to={`/profile/${contract.expertId}`} className="font-medium text-slate-900 hover:text-primary-600 hover:underline">{contract.expertName || 'Expert'}</Link>
          </div>
          
          <div className="pt-4 border-t border-slate-300 space-y-2">
            {/* Write Review - only Client when contract COMPLETED */}
            {isClient() && contract.status === 'COMPLETED' && (
              <Button variant="primary" className="w-full justify-center gap-2"
                onClick={() => setIsReviewModalOpen(true)}>
                ⭐ Write a Review
              </Button>
            )}
            <Button variant="outline" className="w-full justify-center gap-2 text-danger-400 hover:text-danger-300 hover:border-danger-500/50 hover:bg-danger-500/10"
              onClick={() => setIsDisputeModalOpen(true)}>
              <AlertTriangle size={16} /> Open Dispute
            </Button>
          </div>
        </div>

        {/* Chat Widget */}
        <div className="bg-white border border-slate-200 p-0 rounded-xl h-[600px] flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center">
            <h3 className="font-semibold text-slate-900">Messages</h3>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatWidget contractId={Number(id)} />
          </div>
        </div>
      </div>

      <RejectMilestoneModal 
        isOpen={rejectModalMilestoneId !== null} 
        onClose={() => setRejectModalMilestoneId(null)} 
        onReject={(reason) => rejectModalMilestoneId && rejectMilestoneMut.mutate({ mId: rejectModalMilestoneId, reason })} 
      />

      <OpenDisputeModal 
        isOpen={isDisputeModalOpen} 
        onClose={() => setIsDisputeModalOpen(false)} 
        onSubmit={(reason, desc) => disputeMut.mutate({ reason, desc })} 
      />

      {/* Write Review Modal */}
      {isReviewModalOpen && (
        <WriteReviewModal
          onClose={() => setIsReviewModalOpen(false)}
          onSubmit={(rating, comment) => reviewMut.mutate({ rating, comment })}
          isLoading={reviewMut.isPending}
        />
      )}
    </div>
  );
}
