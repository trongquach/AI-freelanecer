import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Users, Ban, CheckCircle, ArrowLeft, MoreVertical } from 'lucide-react';
import { adminApi, UserDto } from '@/api/adminApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import { toast } from 'sonner';

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);

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
    onError: () => toast.error('Failed to ban user')
  });

  if (isLoading) return <div className="flex justify-center py-24"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/dashboard" className="p-2 bg-white border border-slate-200 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-surface-200" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-primary-400" /> Manage Users
          </h1>
          <p className="text-sm text-slate-500">Total {usersData?.totalElements} users registered</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 border border-slate-300 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Joined Date</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {usersData?.content.map((u: UserDto) => (
                <tr key={u.id} className="hover:bg-slate-100 border border-slate-200/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{u.fullName || 'No name'}</div>
                    <div className="text-xs text-slate-500">{u.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      u.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400' :
                      u.role === 'EXPERT' ? 'bg-primary-500/10 text-primary-400' :
                      'bg-blue-500/10 text-blue-400'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      u.status === 'ACTIVE' ? 'bg-success-500/10 text-success-400' :
                      'bg-danger-500/10 text-danger-400'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {u.status === 'ACTIVE' && u.role !== 'ADMIN' && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-danger-400 hover:text-danger-300 hover:bg-danger-500/10"
                        onClick={() => {
                          if(confirm(`Are you sure you want to ban ${u.email}?`)) {
                            banMutation.mutate(u.id);
                          }
                        }}
                      >
                        <Ban className="w-4 h-4 mr-1.5" /> Ban
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
