import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Wallet, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle } from 'lucide-react'
import axiosInstance from '@/api/axiosInstance'
import { toast } from 'sonner'

interface WalletData {
  balance: number
  lockedAmount: number
  totalDeposited: number
  totalReleased: number
}

interface Transaction {
  id: number
  type: string
  amount: number
  description: string
  createdAt: string
}

export default function WalletPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [depositAmount, setDepositAmount] = useState('')

  const { data: wallet, isLoading } = useQuery<WalletData>({
    queryKey: ['wallet'],
    queryFn: () => axiosInstance.get('/wallet').then(r => r.data),
  })

  const { data: txPage } = useQuery<{ content: Transaction[] }>({
    queryKey: ['wallet-transactions'],
    queryFn: () => axiosInstance.get('/wallet/transactions?page=0&size=10').then(r => r.data),
  })

  const depositMutation = useMutation({
    mutationFn: (amount: number) =>
      axiosInstance.post(`/stripe/mock-deposit?userId=${user?.id}&amount=${amount}`),
    onSuccess: () => {
      toast.success(`$${depositAmount} đã được nạp vào ví thành công!`)
      queryClient.invalidateQueries({ queryKey: ['wallet'] })
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] })
      setShowDepositModal(false)
      setDepositAmount('')
    },
    onError: () => {
      toast.error('Nạp tiền thất bại. Vui lòng thử lại.')
    }
  })

  const handleDeposit = () => {
    const amt = parseFloat(depositAmount)
    if (!amt || amt <= 0) {
      toast.error('Vui lòng nhập số tiền hợp lệ.')
      return
    }
    depositMutation.mutate(amt)
  }

  const walletData = wallet ?? { balance: 0, lockedAmount: 0, totalDeposited: 0, totalReleased: 0 }
  const available = (walletData.balance ?? 0) - (walletData.lockedAmount ?? 0)

  if (isLoading) return <div className="flex justify-center p-20"><LoadingSpinner /></div>

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="section-title">My Wallet</h1>

      {/* Balance cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="card p-6 border-primary-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Wallet className="w-5 h-5 text-slate-900" />
            </div>
            <p className="text-sm text-slate-400">Available Balance</p>
          </div>
          <p className="text-4xl font-bold">${available.toFixed(2)}</p>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-warning-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning-400" />
            </div>
            <p className="text-sm text-slate-400">Locked (Escrow)</p>
          </div>
          <p className="text-4xl font-bold text-warning-400">${(walletData.lockedAmount ?? 0).toFixed(2)}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          id="wallet-deposit-btn"
          className="btn-gradient btn-md flex-1"
          onClick={() => setShowDepositModal(true)}
        >
          <ArrowDownLeft className="w-4 h-4" /> Deposit
        </button>
        <button className="btn-secondary btn-md flex-1 opacity-50 cursor-not-allowed" disabled>
          <ArrowUpRight className="w-4 h-4" /> Withdraw
        </button>
      </div>

      {/* Stats */}
      <div className="card p-6 grid sm:grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-slate-400 mb-1">Total Deposited</p>
          <p className="text-xl font-bold text-success-400">${(walletData.totalDeposited ?? 0).toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-1">Total Disbursed</p>
          <p className="text-xl font-bold text-primary-400">${(walletData.totalReleased ?? 0).toFixed(2)}</p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="card p-6">
        <h2 className="font-semibold text-slate-800 mb-4">Transaction History</h2>
        {txPage?.content && txPage.content.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {txPage.content.map(tx => (
              <div key={tx.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {tx.type === 'DEPOSIT' || tx.type === 'RELEASE'
                    ? <CheckCircle className="w-5 h-5 text-success-400" />
                    : <XCircle className="w-5 h-5 text-error-400" />}
                  <div>
                    <p className="text-sm font-medium text-slate-800">{tx.description}</p>
                    <p className="text-xs text-slate-400">{new Date(tx.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`font-bold ${tx.amount > 0 ? 'text-success-500' : 'text-error-500'}`}>
                  {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-center py-4">No transactions yet</p>
        )}
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Nạp tiền vào ví</h2>
            <p className="text-sm text-slate-500 mb-6">
              Nhập số tiền bạn muốn nạp. Hệ thống đang chạy ở chế độ <span className="font-semibold text-primary-600">Sandbox (giả lập)</span>, tiền sẽ được cộng ngay lập tức.
            </p>
            <div className="relative mb-6">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">$</span>
              <input
                id="deposit-amount-input"
                type="number"
                min="1"
                step="1"
                value={depositAmount}
                onChange={e => setDepositAmount(e.target.value)}
                placeholder="100"
                className="input-field pl-8 text-lg w-full"
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button
                className="btn-secondary btn-md flex-1"
                onClick={() => { setShowDepositModal(false); setDepositAmount('') }}
              >
                Hủy
              </button>
              <button
                id="deposit-confirm-btn"
                className="btn-gradient btn-md flex-1"
                onClick={handleDeposit}
                disabled={depositMutation.isPending}
              >
                {depositMutation.isPending ? 'Đang xử lý...' : 'Xác nhận nạp'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
