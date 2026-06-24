import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { DollarSign, ArrowLeft, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';
import { adminApi, TransactionDto } from '@/api/adminApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: typeof DollarSign }> = {
  DEPOSIT:      { label: 'Deposit',       color: 'text-success-600 bg-success-50',  icon: TrendingUp },
  WITHDRAW:     { label: 'Withdrawal',    color: 'text-danger-600 bg-danger-50',    icon: TrendingDown },
  ESCROW_LOCK:  { label: 'Escrow Lock',   color: 'text-warning-600 bg-warning-50',  icon: ArrowUpRight },
  RELEASE:      { label: 'Release',       color: 'text-primary-600 bg-primary-50',  icon: TrendingUp },
  FEE:          { label: 'Platform Fee',  color: 'text-slate-600 bg-slate-100',     icon: DollarSign },
  REFUND:       { label: 'Refund',        color: 'text-blue-600 bg-blue-50',        icon: TrendingDown },
};

const STATUS_COLOR: Record<string, string> = {
  SUCCESS: 'bg-success-100 text-success-700',
  PENDING: 'bg-warning-100 text-warning-700',
  FAILED:  'bg-danger-100 text-danger-700',
};

export default function TransactionsPage() {
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-transactions', page],
    queryFn: () => adminApi.getTransactions(page, 20),
  });

  // Summary from current page data
  const summary = (data?.content ?? []).reduce(
    (acc: Record<string, number>, tx: TransactionDto) => {
      acc[tx.type] = (acc[tx.type] ?? 0) + Number(tx.amount);
      return acc;
    },
    {}
  );

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
            <DollarSign className="w-6 h-6 text-success-500" /> Transaction Monitor
          </h1>
          <p className="text-sm text-slate-500">Total {data?.totalElements ?? 0} transactions recorded</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Object.entries(TYPE_CONFIG).map(([type, cfg]) => {
          const Icon = cfg.icon;
          return (
            <div key={type} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold mb-2 ${cfg.color}`}>
                <Icon className="w-3.5 h-3.5" />
                {cfg.label}
              </div>
              <p className="text-lg font-bold text-slate-900">${(summary[type] ?? 0).toLocaleString()}</p>
              <p className="text-xs text-slate-400">this page</p>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5 font-semibold text-slate-600">#ID</th>
                <th className="px-6 py-3.5 font-semibold text-slate-600">Type</th>
                <th className="px-6 py-3.5 font-semibold text-slate-600">Amount</th>
                <th className="px-6 py-3.5 font-semibold text-slate-600">Status</th>
                <th className="px-6 py-3.5 font-semibold text-slate-600">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!data?.content?.length ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">No transactions found</td>
                </tr>
              ) : data.content.map((tx: TransactionDto) => {
                const cfg = TYPE_CONFIG[tx.type] ?? { label: tx.type, color: 'text-slate-600 bg-slate-100', icon: DollarSign };
                const Icon = cfg.icon;
                return (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-400 font-mono text-xs">#{tx.id}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${cfg.color}`}>
                        <Icon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-900">${Number(tx.amount).toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${STATUS_COLOR[tx.status] ?? 'bg-slate-100 text-slate-600'}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {tx.createdAt ? new Date(tx.createdAt).toLocaleString('en-GB', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      }) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {(data?.totalPages ?? 0) > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
            <span className="text-sm text-slate-500">Page {page + 1} of {data?.totalPages}</span>
            <div className="flex gap-2">
              <button disabled={data?.first} onClick={() => setPage(p => p - 1)}
                className="p-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button disabled={data?.last} onClick={() => setPage(p => p + 1)}
                className="p-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
