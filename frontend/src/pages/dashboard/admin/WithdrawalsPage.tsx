import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { CreditCard, CheckCircle, XCircle, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminApi, TransactionDto } from '@/api/adminApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from 'sonner';

export default function WithdrawalsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-withdrawals', page],
    queryFn: () => adminApi.getPendingWithdrawals(page, 15),
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) => adminApi.approveWithdrawal(id),
    onSuccess: () => {
      toast.success('Withdrawal approved successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['admin-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
    onError: () => toast.error('Failed to approve withdrawal'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => adminApi.rejectWithdrawal(id, reason),
    onSuccess: () => {
      toast.success('Withdrawal rejected');
      queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] });
    },
    onError: () => toast.error('Failed to reject withdrawal'),
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
            <CreditCard className="w-6 h-6 text-blue-500" /> Manage Withdrawals
          </h1>
          <p className="text-sm text-slate-500">{data?.totalElements ?? 0} pending withdrawal requests</p>
        </div>
      </div>

      {!data?.content?.length ? (
        <div className="bg-white border border-slate-200 p-12 rounded-xl text-center">
          <CheckCircle className="w-12 h-12 text-success-400 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">All caught up!</h3>
          <p className="text-slate-500">No pending withdrawal requests right now.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5 font-semibold text-slate-600">ID</th>
                  <th className="px-6 py-3.5 font-semibold text-slate-600">User</th>
                  <th className="px-6 py-3.5 font-semibold text-slate-600">Amount</th>
                  <th className="px-6 py-3.5 font-semibold text-slate-600">Status</th>
                  <th className="px-6 py-3.5 font-semibold text-slate-600">Requested At</th>
                  <th className="px-6 py-3.5 font-semibold text-slate-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.content.map((tx: TransactionDto) => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">#{tx.id}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{tx.wallet?.user?.email || 'Unknown User'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-danger-600">${Number(tx.amount).toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-warning-100 text-warning-700">
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {new Date(tx.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-danger-600 bg-danger-50 hover:bg-danger-100 transition-colors"
                          onClick={() => { setRejectingId(tx.id); setRejectReason(''); }}
                          disabled={rejectMutation.isPending}
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                        <button
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-primary-500 hover:bg-primary-600 transition-colors"
                          onClick={() => approveMutation.mutate(tx.id)}
                          disabled={approveMutation.isPending}
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Approve
                        </button>
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

      {/* Reject Modal */}
      {rejectingId !== null && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-danger-500" /> Reject Withdrawal #{rejectingId}
            </h3>
            <p className="text-sm text-slate-500 mb-4">Please provide a reason for rejecting this withdrawal request.</p>
            <textarea
              className="input w-full min-h-[100px] resize-none mb-4"
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
            />
            <div className="flex gap-3 justify-end">
              <button
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                onClick={() => setRejectingId(null)}
              >
                Cancel
              </button>
              <button
                className="btn-primary bg-danger-500 hover:bg-danger-600 border-danger-500"
                onClick={() => {
                  rejectMutation.mutate({ id: rejectingId, reason: rejectReason || 'Violation of terms' });
                  setRejectingId(null);
                }}
                disabled={rejectMutation.isPending}
              >
                {rejectMutation.isPending ? <LoadingSpinner size="sm" /> : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
