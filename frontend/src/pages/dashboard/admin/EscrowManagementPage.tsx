import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, CheckCircle2, AlertCircle, CheckCircle } from 'lucide-react';
import { adminApi } from '@/api/adminApi';
import { Contract } from '@/types/contract';
import { TransactionDto } from '@/api/adminApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from 'sonner';

export default function EscrowManagementPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [tab, setTab] = useState<'active' | 'completed' | 'clearing'>('active');

  const { data: contractsData, isLoading: isLoadingContracts } = useQuery({
    queryKey: ['admin-escrows-all', page],
    queryFn: () => adminApi.getAllContracts(page, 30),
  });

  const { data: clearingsData, isLoading: isLoadingClearings } = useQuery({
    queryKey: ['admin-clearings', page],
    queryFn: () => adminApi.getPendingClearings(page, 30),
  });

  const releaseMutation = useMutation({
    mutationFn: (contractId: number) => adminApi.forceReleaseEscrow(contractId),
    onSuccess: () => {
      toast.success('Funds successfully released to the expert');
      queryClient.invalidateQueries({ queryKey: ['admin-escrows-all'] });
      queryClient.invalidateQueries({ queryKey: ['admin-clearings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
    onError: () => toast.error('Failed to release funds'),
  });

  const settleMutation = useMutation({
    mutationFn: (txId: number) => adminApi.settleClearing(txId),
    onSuccess: () => {
      toast.success('Pending earnings settled successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-clearings'] });
    },
    onError: () => toast.error('Failed to settle earnings'),
  });

  const handleForceRelease = (contractId: number) => {
    if (window.confirm('Are you sure you want to force release the locked escrow for this contract? This action cannot be undone.')) {
      releaseMutation.mutate(contractId);
    }
  };

  const handleSettle = (txId: number) => {
    if (window.confirm('Are you sure you want to manually settle this clearing transaction? Funds will be instantly available to the expert.')) {
      settleMutation.mutate(txId);
    }
  };

  const allContracts: Contract[] = contractsData?.content ?? [];
  const activeContracts = allContracts.filter(c => c.status === 'ACTIVE');
  const completedContracts = allContracts.filter(c => c.status === 'COMPLETED');
  const pendingClearings: TransactionDto[] = clearingsData?.content ?? [];
  
  const displayContracts = tab === 'active' ? activeContracts : completedContracts;

  if (isLoadingContracts || isLoadingClearings) return <div className="flex justify-center py-24"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/dashboard" className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-primary-500" /> Escrow Management
          </h1>
          <p className="text-sm text-slate-500">Manage locked funds and disbursed contracts</p>
        </div>
      </div>

      {/* Summary badges */}
      <div className="flex gap-3">
        <div className="flex items-center gap-2 bg-warning-50 border border-warning-200 rounded-lg px-4 py-2">
          <AlertCircle className="w-4 h-4 text-warning-600" />
          <span className="text-sm font-medium text-warning-700">{activeContracts.length} Active</span>
        </div>
        <div className="flex items-center gap-2 bg-primary-50 border border-primary-200 rounded-lg px-4 py-2">
          <AlertCircle className="w-4 h-4 text-primary-600" />
          <span className="text-sm font-medium text-primary-700">{pendingClearings.length} Clearing</span>
        </div>
        <div className="flex items-center gap-2 bg-success-50 border border-success-200 rounded-lg px-4 py-2">
          <CheckCircle className="w-4 h-4 text-success-600" />
          <span className="text-sm font-medium text-success-700">{completedContracts.length} Completed</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab('active')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            tab === 'active' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          🔒 Active ({activeContracts.length})
        </button>
        <button
          onClick={() => setTab('clearing')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            tab === 'clearing' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          ⏳ Clearing ({pendingClearings.length})
        </button>
        <button
          onClick={() => setTab('completed')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            tab === 'completed' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          ✅ Completed ({completedContracts.length})
        </button>
      </div>

      {(tab !== 'clearing' && !displayContracts.length) || (tab === 'clearing' && !pendingClearings.length) ? (
        <div className="bg-white border border-slate-200 p-12 rounded-xl text-center">
          <CheckCircle2 className="w-12 h-12 text-success-400 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            {tab === 'active' ? 'No active contracts with locked funds!' : tab === 'clearing' ? 'No pending clearings!' : 'No completed contracts yet.'}
          </h3>
          <p className="text-slate-500">
            {tab === 'active' ? 'All escrow funds have been disbursed.' : tab === 'clearing' ? 'All expert earnings have been settled.' : 'Completed contracts will appear here after disbursement.'}
          </p>
        </div>
      ) : tab === 'clearing' ? (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5 font-semibold text-slate-600">Transaction ID</th>
                  <th className="px-6 py-3.5 font-semibold text-slate-600">Expert</th>
                  <th className="px-6 py-3.5 font-semibold text-slate-600">Amount</th>
                  <th className="px-6 py-3.5 font-semibold text-slate-600">Status</th>
                  <th className="px-6 py-3.5 font-semibold text-slate-600">Date Released</th>
                  <th className="px-6 py-3.5 font-semibold text-slate-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingClearings.map((tx: TransactionDto) => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">#{tx.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{tx.userEmail || 'N/A'}</td>
                    <td className="px-6 py-4 font-bold text-primary-600">${tx.amount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-warning-100 text-warning-700">
                        CLEARING
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{new Date(tx.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleSettle(tx.id)}
                        disabled={settleMutation.isPending}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-primary-500 hover:bg-primary-600 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Settle Now
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5 font-semibold text-slate-600">Contract ID</th>
                  <th className="px-6 py-3.5 font-semibold text-slate-600">Parties</th>
                  <th className="px-6 py-3.5 font-semibold text-slate-600">Total Amount</th>
                  <th className="px-6 py-3.5 font-semibold text-slate-600 text-warning-600">Escrow Locked</th>
                  <th className="px-6 py-3.5 font-semibold text-slate-600">Status</th>
                  <th className="px-6 py-3.5 font-semibold text-slate-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayContracts.map((contract: Contract) => (
                  <tr
                    key={contract.id}
                    className={`hover:bg-slate-50 transition-colors ${contract.status === 'COMPLETED' ? 'opacity-70' : ''}`}
                  >
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">#{contract.id}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 truncate max-w-[200px]" title={contract.jobTitle}>
                        {contract.jobTitle}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        <span className="font-medium">Client:</span> {contract.client.fullName || 'Unknown'}
                        <br/>
                        <span className="font-medium">Expert:</span> {contract.expert.fullName || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      ${contract.totalAmount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-bold">
                      {contract.status === 'COMPLETED' ? (
                        <span className="text-success-600">$0 (Disbursed)</span>
                      ) : (
                        <span className="text-warning-600">${(contract.escrowAmount ?? contract.totalAmount ?? 0).toLocaleString()}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {contract.status === 'COMPLETED' ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-success-100 text-success-700">
                          COMPLETED
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-700">
                          ACTIVE
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {contract.status === 'ACTIVE' && (contract.escrowAmount ?? contract.totalAmount ?? 0) > 0 ? (
                        <button
                          onClick={() => handleForceRelease(contract.id)}
                          disabled={releaseMutation.isPending}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-danger-500 hover:bg-danger-600 transition-colors disabled:opacity-50"
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                          Force Disburse
                        </button>
                      ) : contract.status === 'COMPLETED' ? (
                        <span className="inline-flex items-center gap-1 text-xs text-success-600 font-medium">
                          <CheckCircle className="w-3.5 h-3.5" /> Disbursed
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">No locked funds</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
