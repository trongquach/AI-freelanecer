import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Users, Ban, CheckCircle, ArrowLeft, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminApi, UserDto } from '@/api/adminApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from 'sonner';

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-700',
  EXPERT: 'bg-primary-100 text-primary-700',
  CLIENT: 'bg-blue-100 text-blue-700',
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-success-100 text-success-700',
  BANNED: 'bg-danger-100 text-danger-700',
  INACTIVE: 'bg-slate-100 text-slate-600',
};

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users', page],
    queryFn: () => adminApi.getUsers(page, 20),
  });

  const banMutation = useMutation({
    mutationFn: (id: number) => adminApi.banUser(id),
    onSuccess: () => {
      toast.success('User has been banned');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: () => toast.error('Failed to ban user'),
  });

  const unbanMutation = useMutation({
    mutationFn: (id: number) => adminApi.unbanUser(id),
    onSuccess: () => {
      toast.success('User has been unbanned');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: () => toast.error('Failed to unban user'),
  });

  // Client-side search & filter
  const filtered = (usersData?.content ?? []).filter((u: UserDto) => {
    const matchSearch = !search || u.email.toLowerCase().includes(search.toLowerCase()) || (u.fullName ?? '').toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
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
            <Users className="w-6 h-6 text-primary-500" /> Manage Users
          </h1>
          <p className="text-sm text-slate-500">Total {usersData?.totalElements ?? 0} users registered</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="input pl-10 w-full"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input w-auto min-w-[140px]"
          value={roleFilter}
          onChange={e => { setRoleFilter(e.target.value); setPage(0); }}
        >
          <option value="">All Roles</option>
          <option value="CLIENT">Client</option>
          <option value="EXPERT">Expert</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5 font-semibold text-slate-600">User</th>
                <th className="px-6 py-3.5 font-semibold text-slate-600">Role</th>
                <th className="px-6 py-3.5 font-semibold text-slate-600">Status</th>
                <th className="px-6 py-3.5 font-semibold text-slate-600">Joined</th>
                <th className="px-6 py-3.5 font-semibold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">No users found</td>
                </tr>
              ) : filtered.map((u: UserDto) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-semibold text-xs shrink-0">
                        {(u.fullName || u.email)?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{u.fullName || '(no name)'}</div>
                        <div className="text-xs text-slate-500">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${ROLE_COLORS[u.role] ?? 'bg-slate-100 text-slate-600'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[u.status] ?? 'bg-slate-100 text-slate-600'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    {new Date(u.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {u.role !== 'ADMIN' && (
                      u.status === 'ACTIVE' ? (
                        <button
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-danger-600 bg-danger-50 hover:bg-danger-100 transition-colors"
                          onClick={() => {
                            if (confirm(`Ban ${u.email}?`)) banMutation.mutate(u.id);
                          }}
                        >
                          <Ban className="w-3.5 h-3.5" /> Ban
                        </button>
                      ) : u.status === 'BANNED' ? (
                        <button
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-success-600 bg-success-50 hover:bg-success-100 transition-colors"
                          onClick={() => {
                            if (confirm(`Unban ${u.email}?`)) unbanMutation.mutate(u.id);
                          }}
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Unban
                        </button>
                      ) : null
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {(usersData?.totalPages ?? 0) > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
            <span className="text-sm text-slate-500">
              Page {page + 1} of {usersData?.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={usersData?.first}
                onClick={() => setPage(p => p - 1)}
                className="p-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={usersData?.last}
                onClick={() => setPage(p => p + 1)}
                className="p-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
