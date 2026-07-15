import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Wallet, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle } from 'lucide-react'
import axiosInstance from '@/api/axiosInstance'
import { toast } from 'sonner'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'

// Stripe publishable key (test mode)
const stripePromise = loadStripe('pk_test_51TtV8dCoN2iP2TT9pUibui0iFQopfpm8S8S1hGSYbVoAiuc9PvS7OXY7YYCvs2rXOIHSdY9OfvDcdQL6hd9YdrXK00RSGPZRHU')

interface WalletData {
  balance: number
  lockedAmount: number
  availableBalance: number
  totalDeposited: number
  totalReleased: number
  pendingEarnings: number
}

interface Transaction {
  id: number
  type: string
  amount: number
  note: string
  createdAt: string
}

// ─── Inner Stripe Checkout Form ───────────────────────────────────────────────
function CheckoutForm({ amount, onSuccess, onCancel }: { amount: number; onSuccess: () => void; onCancel: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setIsProcessing(true)
    setErrorMsg('')

    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // After payment, Stripe redirects here
          return_url: `${window.location.origin}/wallet?deposit=success`,
        },
        redirect: 'if_required',
      })

      if (result.error) {
        setErrorMsg(result.error.message || 'Payment failed.')
        setIsProcessing(false)
      } else if (result.paymentIntent?.status === 'succeeded') {
        axiosInstance.post('/wallet/confirm-deposit', { paymentIntentId: result.paymentIntent.id })
          .then(() => {
            toast.success(`$${amount.toFixed(2)} deposited successfully!`)
            onSuccess()
          })
          .catch((err) => {
            console.error('Confirm deposit error:', err)
            toast.success(`$${amount.toFixed(2)} deposited successfully! Wallet will update shortly.`)
            onSuccess()
          })
      } else {
        setErrorMsg('Payment did not complete. Please try again.')
        setIsProcessing(false)
      }
    } catch (err: any) {
      console.error('Stripe error:', err)
      setErrorMsg(err.message || 'An unexpected error occurred during payment.')
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
        <p className="text-xs text-slate-500 mb-1">Amount to deposit</p>
        <p className="text-2xl font-bold text-slate-900">${amount.toFixed(2)}</p>
      </div>

      <PaymentElement />

      {errorMsg && (
        <p className="text-sm text-red-500 bg-red-50 rounded-lg px-4 py-3">{errorMsg}</p>
      )}

      <div className="flex gap-3 pt-2">
        <button type="button" className="btn-secondary btn-md flex-1" onClick={onCancel} disabled={isProcessing}>
          Cancel
        </button>
        <button type="submit" className="btn-gradient btn-md flex-1" disabled={!stripe || isProcessing}>
          {isProcessing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
        </button>
      </div>

      <p className="text-xs text-slate-400 text-center">
        🔒 Secured by <strong>Stripe</strong>. Your card info is never stored on our servers.
      </p>
    </form>
  )
}

// ─── Main WalletPage ──────────────────────────────────────────────────────────
export default function WalletPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const [showDepositModal, setShowDepositModal] = useState(false)
  const [depositAmount, setDepositAmount] = useState('')
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isCreatingIntent, setIsCreatingIntent] = useState(false)

  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')

  const { data: wallet, isLoading } = useQuery<WalletData>({
    queryKey: ['wallet'],
    queryFn: () => axiosInstance.get('/wallet/summary').then(r => r.data),
  })

  const { data: txPage } = useQuery<{ content: Transaction[] }>({
    queryKey: ['wallet-transactions'],
    queryFn: () => axiosInstance.get('/wallet/transactions?page=0&size=20').then(r => r.data),
  })

  // Check for redirect-back from Stripe (3DS cards, etc.)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('deposit') === 'success') {
      const paymentIntentId = params.get('payment_intent')
      if (paymentIntentId) {
        axiosInstance.post('/wallet/confirm-deposit', { paymentIntentId })
          .then(() => {
            toast.success('Deposit successful! Wallet updated.')
          })
          .catch(err => {
            console.error('Confirm deposit error:', err)
            toast.success('Deposit successful! Wallet will update shortly.')
          })
          .finally(() => {
            queryClient.invalidateQueries({ queryKey: ['wallet'] })
            queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] })
            window.history.replaceState({}, '', '/wallet')
          })
      } else {
        toast.success('Deposit successful! Wallet will update shortly.')
        queryClient.invalidateQueries({ queryKey: ['wallet'] })
        queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] })
        window.history.replaceState({}, '', '/wallet')
      }
    }
  }, [queryClient])

  const handleOpenDeposit = async () => {
    const amt = parseFloat(depositAmount)
    if (!amt || amt < 1) {
      toast.error('Minimum deposit is $1.')
      return
    }
    setIsCreatingIntent(true)
    try {
      const res = await axiosInstance.post('/wallet/create-payment-intent', { amount: amt })
      setClientSecret(res.data.clientSecret)
      setShowDepositModal(true)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to initialize payment. Please try again.')
    } finally {
      setIsCreatingIntent(false)
    }
  }

  const handleDepositSuccess = () => {
    setShowDepositModal(false)
    setClientSecret(null)
    setDepositAmount('')
    // Polling: refresh wallet after 3s (webhook processing time)
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] })
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] })
    }, 3000)
  }

  const handleWithdraw = async () => {
    const amt = parseFloat(withdrawAmount)
    const available = walletData.availableBalance ?? (walletData.balance - walletData.lockedAmount)
    if (!amt || amt <= 0 || amt > available) {
      toast.error('Please enter a valid amount within your available balance.')
      return
    }
    try {
      await axiosInstance.post('/wallet/withdraw', { amount: amt.toString() })
      toast.success(`Withdrawal request for $${amt.toFixed(2)} submitted!`)
      queryClient.invalidateQueries({ queryKey: ['wallet'] })
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] })
      setShowWithdrawModal(false)
      setWithdrawAmount('')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Withdrawal failed. Please try again.')
    }
  }

  const walletData = wallet ?? { balance: 0, lockedAmount: 0, availableBalance: 0, totalDeposited: 0, totalReleased: 0, pendingEarnings: 0 }
  const available = walletData.availableBalance ?? (walletData.balance - walletData.lockedAmount)
  const isExpert = user?.role === 'EXPERT'
  const lockedDisplay = isExpert ? (walletData.pendingEarnings ?? 0) : (walletData.lockedAmount ?? 0)

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
          <p className="text-4xl font-bold text-slate-900">${available.toFixed(2)}</p>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-warning-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning-400" />
            </div>
            <p className="text-sm text-slate-400">
              {isExpert ? 'Pending Earnings' : 'Locked (Escrow)'}
            </p>
          </div>
          <p className="text-4xl font-bold text-warning-400">${lockedDisplay.toFixed(2)}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          id="wallet-deposit-btn"
          className="btn-gradient btn-md flex-1"
          onClick={() => setDepositAmount('')}
          // Show the amount input section below
        >
          <ArrowDownLeft className="w-4 h-4" /> Deposit
        </button>
        <button
          className="btn-secondary btn-md flex-1"
          onClick={() => setShowWithdrawModal(true)}
        >
          <ArrowUpRight className="w-4 h-4" /> Withdraw
        </button>
      </div>

      {/* Deposit amount input (always visible below actions) */}
      <div className="card p-6">
        <h2 className="font-semibold text-slate-800 mb-3">Deposit Funds</h2>
        <p className="text-sm text-slate-500 mb-4">
          Enter the amount and click <strong>Proceed to Pay</strong> to be taken to our secure Stripe checkout.
        </p>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">$</span>
            <input
              id="deposit-amount-input"
              type="number"
              min="1"
              step="1"
              value={depositAmount}
              onChange={e => setDepositAmount(e.target.value)}
              placeholder="Enter amount (min $1)"
              className="input-field pl-8 text-lg w-full text-slate-900"
            />
          </div>
          <button
            id="deposit-confirm-btn"
            className="btn-gradient btn-md"
            onClick={handleOpenDeposit}
            disabled={isCreatingIntent || !depositAmount}
          >
            {isCreatingIntent ? 'Loading...' : 'Proceed to Pay'}
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-3">🔒 All payments are secured by Stripe. Test card: 4242 4242 4242 4242</p>
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
          <div className="space-y-3">
            {txPage.content.map(tx => {
              const getTxSign = (tx: Transaction) => {
                if (tx.type === 'DEPOSIT' || tx.type === 'REFUND') return 1
                if (tx.type === 'WITHDRAW' || tx.type === 'ESCROW_LOCK' || tx.type === 'FEE') return -1
                if (tx.type === 'RELEASE') {
                  return tx.note?.toLowerCase().includes('received') ? 1 : -1
                }
                return 1
              }
              const sign = getTxSign(tx)
              return (
                <div key={tx.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${sign > 0 ? 'bg-success-50 text-success-500' : 'bg-danger-50 text-danger-500'}`}>
                      {sign > 0
                        ? <CheckCircle className="w-5 h-5 text-success-400" />
                        : <XCircle className="w-5 h-5 text-danger-400" />}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{tx.note}</p>
                      <p className="text-sm text-slate-500">{new Date(tx.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`font-bold ${sign > 0 ? 'text-success-500' : 'text-danger-500'}`}>
                    {sign > 0 ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                  </span>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-slate-400 text-center py-4">No transactions yet</p>
        )}
      </div>

      {/* Stripe Payment Modal */}
      {showDepositModal && clientSecret && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Complete Payment</h2>
            <p className="text-sm text-slate-500 mb-6">
              Enter your card details below to deposit funds into your AIMarket wallet.
            </p>
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: { colorPrimary: '#6366f1' },
                },
              }}
            >
              <CheckoutForm
                amount={parseFloat(depositAmount)}
                onSuccess={handleDepositSuccess}
                onCancel={() => { setShowDepositModal(false); setClientSecret(null) }}
              />
            </Elements>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Withdraw funds</h2>
            <p className="text-sm text-slate-500 mb-6">
              Available balance: <span className="font-bold text-slate-900">${available.toFixed(2)}</span>
            </p>
            <div className="relative mb-6">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">$</span>
              <input
                id="withdraw-amount-input"
                type="number"
                min="10"
                max={available}
                step="1"
                value={withdrawAmount}
                onChange={e => setWithdrawAmount(e.target.value)}
                placeholder="100"
                className="input-field pl-8 text-lg w-full text-slate-900"
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button
                className="btn-secondary btn-md flex-1"
                onClick={() => { setShowWithdrawModal(false); setWithdrawAmount('') }}
              >Cancel</button>
              <button
                id="withdraw-confirm-btn"
                className="btn-gradient btn-md flex-1"
                onClick={handleWithdraw}
              >Confirm Withdraw</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
