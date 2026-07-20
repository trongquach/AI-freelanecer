import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Scale, CheckCircle, ArrowLeft, ChevronLeft, ChevronRight, MessageSquare, AlertCircle, FileText, X } from 'lucide-react';
import { adminApi } from '@/api/adminApi';
import { contractApi } from '@/api/contractApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ChatWidget from '@/components/chat/ChatWidget';
import { toast } from 'sonner';

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-warning-100 text-warning-700',
  INVESTIGATING: 'bg-blue-100 text-blue-700',
  RESOLVED: 'bg-success-100 text-success-700',
};

const EvidenceModal = ({ contractId, onClose }: { contractId: number | null, onClose: () => void }) => {
  const { data: contract, isLoading } = useQuery({
    queryKey: ['contract', contractId],
    queryFn: () => contractApi.getContractDetails(contractId!),
    enabled: !!contractId,
  });

  if (!contractId) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-500" /> Evidence for Contract #{contractId}
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Milestones Panel */}
          <div className="w-full md:w-1/2 p-6 overflow-y-auto border-r border-slate-200 bg-slate-50/50">
            <h4 className="font-semibold text-slate-900 mb-4 border-b border-slate-200 pb-2">Milestone Submissions</h4>
            {isLoading ? (
              <div className="flex justify-center py-12"><LoadingSpinner size="md" /></div>
            ) : !contract?.milestones?.length ? (
              <p className="text-sm text-slate-500 italic">No milestones found for this contract.</p>
            ) : (
              <div className="space-y-4">
                {contract.milestones.map((m: any, idx: number) => (
                  <div key={m.id} className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium text-slate-900 text-sm">{idx + 1}. {m.name}</h5>
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-600">{m.status}</span>
                    </div>
                    {m.deliverableUrl ? (
                      <div className="mt-3">
                        <p className="text-xs text-slate-500 mb-1">Deliverable Link:</p>
                        <a href={m.deliverableUrl} target="_blank" rel="noreferrer" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
                          <FileText size={14}/> {m.deliverableUrl}
                        </a>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 mt-2">No files submitted yet.</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Chat Panel */}
          <div className="w-full md:w-1/2 flex flex-col bg-white">
            <h4 className="font-semibold text-slate-900 p-4 border-b border-slate-200">Chat History</h4>
            <div className="flex-1 relative">
              <div className="absolute inset-0">
                <ChatWidget contractId={contractId} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function DisputesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [resolvingId, setResolvingId] = useState<number | null>(null);
  const [evidenceContractId, setEvidenceContractId] = useState<number | null>(null);
  const [resolution, setResolution] = useState('REFUND_CLIENT');
  const [adminNote, setAdminNote] = useState('');
  const [reopenJob, setReopenJob] = useState(true);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-disputes', page],
    queryFn: () => adminApi.getAllDisputes(page, 15),
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, res, note, reopen }: { id: number; res: string; note: string; reopen: boolean }) => adminApi.resolveDispute(id, res, note, reopen),
    onSuccess: () => {
      toast.success('Dispute resolved successfully');
      setResolvingId(null);
      queryClient.invalidateQueries({ queryKey: ['admin-disputes'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
    onError: () => toast.error('Failed to resolve dispute'),
  });

  if (isLoading) return <div className="flex justify-center py-24"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/admin/dashboard" className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Scale className="w-6 h-6 text-danger-500" /> Manage Disputes
          </h1>
          <p className="text-sm text-slate-500">{data?.totalElements ?? 0} total disputes filed</p>
        </div>
      </div>

      {!data?.content?.length ? (
        <div className="bg-white border border-slate-200 p-12 rounded-xl text-center">
          <CheckCircle className="w-12 h-12 text-success-400 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No disputes!</h3>
          <p className="text-slate-500">Everything is running smoothly.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5 font-semibold text-slate-600">ID</th>
                  <th className="px-6 py-3.5 font-semibold text-slate-600">Contract & Reporter</th>
                  <th className="px-6 py-3.5 font-semibold text-slate-600">Reason</th>
                  <th className="px-6 py-3.5 font-semibold text-slate-600">Status</th>
                  <th className="px-6 py-3.5 font-semibold text-slate-600">Date</th>
                  <th className="px-6 py-3.5 font-semibold text-slate-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.content.map((dispute: any) => (
                  <tr key={dispute.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">#{dispute.id}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">Contract #{dispute.contractId}</div>
                      <div className="text-xs text-slate-500 mt-1">Client: <span className="font-medium">{dispute.client?.email}</span></div>
                      <div className="text-xs text-slate-500">Expert: <span className="font-medium">{dispute.expert?.email}</span></div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-slate-700 truncate" title={dispute.reason}>{dispute.reason}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[dispute.status] ?? 'bg-slate-100 text-slate-600'}`}>
                        {dispute.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {new Date(dispute.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                          onClick={() => setEvidenceContractId(dispute.contractId)}
                        >
                          <FileText className="w-3.5 h-3.5" /> Evidence
                        </button>
                        {dispute.status !== 'RESOLVED' ? (
                          <button
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-primary-600 bg-primary-50 hover:bg-primary-100 transition-colors"
                            onClick={() => {
                              setResolvingId(dispute.id);
                              setAdminNote('');
                              setResolution('REFUND_CLIENT');
                              setReopenJob(true);
                            }}
                          >
                            <AlertCircle className="w-3.5 h-3.5" /> Resolve
                          </button>
                        ) : (
                          <span className="text-xs font-medium text-slate-400 flex items-center gap-1 px-3 py-1.5">
                            <CheckCircle className="w-3.5 h-3.5" /> Resolved
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {(data?.totalPages ?? 0) > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
              <span className="text-sm text-slate-500">Page {page + 1} of {data?.totalPages}</span>
              <div className="flex gap-2">
                <button disabled={data?.first} onClick={() => setPage(p => p - 1)}
                  className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button disabled={data?.last} onClick={() => setPage(p => p + 1)}
                  className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Resolution Modal */}
      {resolvingId && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Scale className="w-5 h-5 text-primary-500" /> Resolve Dispute #{resolvingId}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Resolution Decision</label>
                <select 
                  className="input w-full"
                  value={resolution}
                  onChange={e => setResolution(e.target.value)}
                >
                  <option value="REFUND_CLIENT">Refund Client (100%)</option>
                  <option value="RELEASE_EXPERT">Release to Expert (100%)</option>
                  <option value="PARTIAL">Partial Split (50/50)</option>
                </select>
              </div>

              {resolution !== 'RELEASE_EXPERT' && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="reopenJob"
                    checked={reopenJob}
                    onChange={(e) => setReopenJob(e.target.checked)}
                    className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                  />
                  <label htmlFor="reopenJob" className="text-sm text-slate-700">
                    Reopen client's job posting
                  </label>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Admin Note (Reasoning)</label>
                <textarea 
                  className="input w-full min-h-[100px] resize-none"
                  placeholder="Explain the reason for this decision..."
                  value={adminNote}
                  onChange={e => setAdminNote(e.target.value)}
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button 
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  onClick={() => setResolvingId(null)}
                >
                  Cancel
                </button>
                <button 
                  className="btn-primary"
                  onClick={() => {
                    resolveMutation.mutate({ id: resolvingId, res: resolution, note: adminNote, reopen: resolution !== 'RELEASE_EXPERT' ? reopenJob : false });
                  }}
                  disabled={resolveMutation.isPending || !adminNote.trim()}
                >
                  {resolveMutation.isPending ? <LoadingSpinner size="sm" /> : 'Confirm Resolution'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Evidence Modal */}
      <EvidenceModal contractId={evidenceContractId} onClose={() => setEvidenceContractId(null)} />
    </div>
  );
}
