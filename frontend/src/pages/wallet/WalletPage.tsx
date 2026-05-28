import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Wallet, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react'

export default function WalletPage() {
  const { user } = useAuth()

  // TODO: Wire up real wallet API
  const wallet = { balance: 0, lockedAmount: 0, totalDeposited: 0, totalReleased: 0 }

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
          <p className="text-4xl font-bold text-slate-900">${(wallet.balance - wallet.lockedAmount).toFixed(2)}</p>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-warning-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning-400" />
            </div>
            <p className="text-sm text-slate-400">Locked (Escrow)</p>
          </div>
          <p className="text-4xl font-bold text-warning-400">${wallet.lockedAmount.toFixed(2)}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button className="btn-gradient btn-md flex-1"><ArrowDownLeft className="w-4 h-4" /> Deposit</button>
        <button className="btn-secondary btn-md flex-1"><ArrowUpRight className="w-4 h-4" /> Withdraw</button>
      </div>

      {/* Stats */}
      <div className="card p-6 grid sm:grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-slate-400 mb-1">Total Deposited</p>
          <p className="text-xl font-bold text-success-400">${wallet.totalDeposited.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-1">Total Disbursed</p>
          <p className="text-xl font-bold text-primary-400">${wallet.totalReleased.toFixed(2)}</p>
        </div>
      </div>

      {/* Empty transaction history */}
      <div className="card p-8 text-center">
        <p className="text-slate-400">No transactions yet</p>
      </div>
    </div>
  )
}
