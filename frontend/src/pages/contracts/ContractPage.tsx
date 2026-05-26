import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Clock, XCircle, Send } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import api from '@/api/axiosInstance'

export default function ContractPage() {
  const { id } = useParams<{ id: string }>()
  const { isClient } = useAuth()

  const { data: contract, isLoading, isError } = useQuery({
    queryKey: ['contract', id],
    queryFn: () => api.get(`/contracts/${id}`).then(r => r.data),
    enabled: !!id,
  })

  if (isLoading) return <div className="flex justify-center py-24"><LoadingSpinner size="lg" /></div>
  if (isError || !contract) return (
    <div className="text-center py-24">
      <p className="text-danger-500">Không tìm thấy hợp đồng.</p>
      <Link to="/dashboard/client" className="btn-ghost btn-md mt-4">← Dashboard</Link>
    </div>
  )

  const statusColor: Record<string, string> = {
    ACTIVE: 'badge-primary', COMPLETED: 'badge-success', DISPUTED: 'badge-danger', CANCELLED: 'badge-neutral'
  }

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6">
      <Link to={isClient() ? '/dashboard/client' : '/dashboard/expert'}
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm">
        <ArrowLeft className="w-4 h-4" /> Dashboard
      </Link>

      {/* Header */}
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl font-bold text-white">{contract.jobTitle}</h1>
            <p className="text-sm text-slate-500">Hợp đồng #{contract.id}</p>
          </div>
          <span className={`badge ${statusColor[contract.status] ?? 'badge-neutral'}`}>{contract.status}</span>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          <div><p className="text-slate-500">Khách hàng</p><p className="text-white font-medium">{contract.client.fullName}</p></div>
          <div><p className="text-slate-500">Chuyên gia</p><p className="text-white font-medium">{contract.expert.fullName}</p></div>
          <div><p className="text-slate-500">Tổng giá trị</p><p className="text-success-400 font-bold text-lg">${contract.totalAmount?.toLocaleString()}</p></div>
        </div>
      </div>

      {/* Milestones */}
      {contract.milestones?.length > 0 && (
        <div className="card p-6">
          <h2 className="font-bold text-white mb-4">Milestones ({contract.milestones.length})</h2>
          <div className="space-y-3">
            {contract.milestones.map((m: any) => (
              <div key={m.id} className="flex items-center justify-between p-4 bg-surface-800 rounded-xl">
                <div className="flex items-center gap-3">
                  {m.status === 'APPROVED' ? <CheckCircle className="w-5 h-5 text-success-500" />
                    : m.status === 'REJECTED' ? <XCircle className="w-5 h-5 text-danger-500" />
                    : m.status === 'SUBMITTED' ? <Send className="w-5 h-5 text-primary-400" />
                    : <Clock className="w-5 h-5 text-slate-500" />}
                  <div>
                    <p className="font-medium text-white text-sm">{m.name}</p>
                    {m.dueDate && <p className="text-xs text-slate-500">Hạn: {new Date(m.dueDate).toLocaleDateString('vi-VN')}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">${m.amount?.toLocaleString()}</p>
                  <span className={`badge text-xs ${m.status === 'APPROVED' ? 'badge-success' : m.status === 'REJECTED' ? 'badge-danger' : m.status === 'SUBMITTED' ? 'badge-primary' : 'badge-neutral'}`}>
                    {m.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat link */}
      <div className="card p-4 flex items-center justify-between">
        <p className="text-slate-400 text-sm">Liên hệ với {isClient() ? contract.expert.fullName : contract.client.fullName}</p>
        <button className="btn-primary btn-sm">Mở chat</button>
      </div>
    </div>
  )
}
