import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Briefcase, Trash2, ArrowLeft, Eye, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { adminApi } from '@/api/adminApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from 'sonner';

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-success-100 text-success-700',
  DRAFT: 'bg-slate-100 text-slate-600',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-primary-100 text-primary-700',
  CLOSED: 'bg-slate-100 text-slate-500',
};

export default function JobsModerationPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-all-jobs', page],
    queryFn: () => adminApi.getAllJobs(page, 15),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteJob(id),
    onSuccess: () => {
      toast.success('Job removed successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-all-jobs'] });
    },
    onError: () => toast.error('Failed to remove job'),
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
            <Briefcase className="w-6 h-6 text-warning-500" /> Manage Jobs
          </h1>
          <p className="text-sm text-slate-500">Total {data?.totalElements ?? 0} job postings on the platform</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5 font-semibold text-slate-600">Job Title</th>
                <th className="px-6 py-3.5 font-semibold text-slate-600">Client</th>
                <th className="px-6 py-3.5 font-semibold text-slate-600">Budget</th>
                <th className="px-6 py-3.5 font-semibold text-slate-600">Status</th>
                <th className="px-6 py-3.5 font-semibold text-slate-600">Posted</th>
                <th className="px-6 py-3.5 font-semibold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!data?.content?.length ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">No jobs found</td>
                </tr>
              ) : data.content.map((job: any) => (
                <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 max-w-xs">
                    <div className="font-medium text-slate-900 truncate">{job.title}</div>
                    <div className="text-xs text-slate-400 truncate mt-0.5">{job.description?.slice(0, 60)}...</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-700">{job.client?.fullName ?? 'Unknown'}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    ${job.budgetMin?.toLocaleString()} – ${job.budgetMax?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[job.status] ?? 'bg-slate-100 text-slate-600'}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {job.createdAt ? new Date(job.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/jobs/${job.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View
                      </Link>
                      <button
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg text-danger-600 bg-danger-50 hover:bg-danger-100 transition-colors"
                        onClick={() => {
                          if (confirm(`Delete job "${job.title}"?`)) deleteMutation.mutate(job.id);
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
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
