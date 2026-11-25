import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  Receipt,
  Search,
  DollarSign,
  TrendingUp,
  FileText,
  Printer,
  X,
  ExternalLink,
} from 'lucide-react'

export default function Payments() {
  const { user, role } = useAuth()
  const isAdmin = role === 'admin'

  // Admin state
  const [allPayments, setAllPayments] = useState([])
  const [adminSearch, setAdminSearch] = useState('')

  // Student state
  const [feeSummary, setFeeSummary] = useState(null)
  const [customPayAmount, setCustomPayAmount] = useState('')
  const [processingPay, setProcessingPay] = useState(false)

  // Receipt Modal state
  const [selectedReceipt, setSelectedReceipt] = useState(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    loadPaymentData()
    loadRazorpayScript()
  }, [role])

  const loadRazorpayScript = () => {
    if (document.getElementById('razorpay-checkout-js')) return
    const script = document.createElement('script')
    script.id = 'razorpay-checkout-js'
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
  }

  const loadPaymentData = async () => {
    try {
      setLoading(true)
      setError('')
      if (isAdmin) {
        const res = await api.get('/payments')
        setAllPayments(res.data)
      } else {
        const res = await api.get('/payments/my-fees')
        setFeeSummary(res.data)
        if (res.data.balance_amount > 0) {
          setCustomPayAmount(res.data.balance_amount.toString())
        }
      }
    } catch (err) {
      setError('Failed to fetch payment details.')
    } finally {
      setLoading(false)
    }
  }

  // Student Razorpay Checkout Flow
  const handleInitiatePayment = async (e) => {
    e.preventDefault()
    const payAmount = parseFloat(customPayAmount)
    if (!payAmount || payAmount <= 0) {
      setError('Please specify a valid payment amount.')
      return
    }

    try {
      setProcessingPay(true)
      setError('')
      setSuccessMsg('')

      // 1. Create Order on Backend
      const orderRes = await api.post('/payments/create-order', {
        amount: payAmount,
        currency: 'INR',
      })

      const { order_id, amount, currency, key_id } = orderRes.data

      // 2. Open Razorpay Modal
      if (!window.Razorpay) {
        setError('Razorpay SDK failed to load. Please check your network connection.')
        setProcessingPay(false)
        return
      }

      const options = {
        key: key_id,
        amount: amount,
        currency: currency,
        name: 'Institute LMS Tuition Fee',
        description: `Tuition & Course Fee Installment`,
        order_id: order_id,
        handler: async function (response) {
          try {
            // 3. Verify Payment Signature on Backend
            const verifyRes = await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: payAmount,
              payment_method: 'razorpay',
              remarks: 'Student online fee settlement',
            })

            setSuccessMsg(`Payment of ₹${payAmount} completed and verified successfully! Transaction ID: ${verifyRes.data.transaction_id}`)
            loadPaymentData()
          } catch (verifyErr) {
            setError(verifyErr.response?.data?.detail || 'Payment verification failed.')
          } finally {
            setProcessingPay(false)
          }
        },
        prefill: {
          name: `${user?.first_name} ${user?.last_name}`,
          email: user?.email,
        },
        theme: {
          color: '#4f46e5',
        },
        modal: {
          ondismiss: function () {
            setProcessingPay(false)
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function (resp) {
        setError(`Payment failed: ${resp.error.description}`)
        setProcessingPay(false)
      })
      rzp.open()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to initialize payment gateway order.')
      setProcessingPay(false)
    }
  }

  // Admin export revenue CSV
  const handleExportRevenue = async () => {
    try {
      const res = await api.get('/reports/export/revenue', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `revenue_report_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      setError('Failed to export revenue report.')
    }
  }

  const filteredAdminPayments = allPayments.filter((p) => {
    const q = adminSearch.toLowerCase()
    return (
      p.transaction_id?.toLowerCase().includes(q) ||
      p.payment_method?.toLowerCase().includes(q) ||
      p.status?.toLowerCase().includes(q) ||
      (p.user && (p.user.first_name?.toLowerCase().includes(q) || p.user.email?.toLowerCase().includes(q)))
    )
  })

  const totalAdminRevenue = allPayments
    .filter((p) => p.status === 'completed')
    .reduce((acc, p) => acc + parseFloat(p.amount || 0), 0)

  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isAdmin ? 'Financial & Revenue Ledger' : 'Tuition & Fee Management'}
          </h1>
          <p className="text-sm text-slate-500">
            {isAdmin
              ? 'Institutional financial ledger, Razorpay gateway settlements, and revenue auditing.'
              : 'Review your semester fee breakdown, outstanding balances, and official payment receipts.'}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleExportRevenue}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Download size={14} />
            Export Revenue CSV
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* STUDENT VIEW */}
      {!isAdmin && (
        <div className="space-y-6">
          {feeSummary ? (
            <>
              {/* Financial KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Total Assessed Fee
                  </div>
                  <div className="text-2xl font-bold text-slate-900">
                    ₹{feeSummary.total_fees.toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs text-slate-400 mt-2">Course enrollment assessment</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Total Amount Paid
                  </div>
                  <div className="text-2xl font-bold text-emerald-600">
                    ₹{feeSummary.paid_amount.toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs text-emerald-600 font-medium mt-2">
                    Verified through Razorpay / Institutional Ledger
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Current Balance Due
                  </div>
                  <div
                    className={`text-2xl font-bold ${
                      feeSummary.balance_amount > 0 ? 'text-amber-600' : 'text-slate-900'
                    }`}
                  >
                    ₹{feeSummary.balance_amount.toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs text-slate-500 mt-2">
                    {feeSummary.balance_amount > 0
                      ? 'Payment due for term clearance'
                      : 'Zero balance — all dues cleared'}
                  </div>
                </div>
              </div>

              {/* Online Payment Card if balance > 0 */}
              {feeSummary.balance_amount > 0 && (
                <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 text-white rounded-2xl p-6 shadow-md">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 mb-2">
                        <CreditCard size={14} />
                        Razorpay Secure Gateway
                      </div>
                      <h3 className="text-lg font-bold">Clear Outstanding Tuition Balance</h3>
                      <p className="text-xs text-indigo-200 mt-1 max-w-xl">
                        Instant payment settlement with automatic receipt issuance. Supports UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, and Net Banking.
                      </p>
                    </div>

                    <form
                      onSubmit={handleInitiatePayment}
                      className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto"
                    >
                      <div className="relative w-full sm:w-44">
                        <span className="absolute left-3 top-2.5 text-slate-400 font-semibold text-sm">
                          ₹
                        </span>
                        <input
                          type="number"
                          min="1"
                          max={feeSummary.balance_amount}
                          value={customPayAmount}
                          onChange={(e) => setCustomPayAmount(e.target.value)}
                          className="w-full pl-8 pr-3 py-2.5 bg-white text-slate-900 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-white shadow-xs"
                          placeholder="Amount"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={processingPay}
                        className="w-full sm:w-auto px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold shadow-md disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shrink-0"
                      >
                        <CreditCard size={16} />
                        {processingPay ? 'Connecting Gateway...' : 'Pay with Razorpay'}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* Fee Receipts & Payment Ledger */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Payment History & Receipts</h3>
                    <p className="text-xs text-slate-500">
                      All verified fee transactions and download links for audit receipts.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                      <tr>
                        <th className="p-3.5">Transaction ID</th>
                        <th className="p-3.5">Amount</th>
                        <th className="p-3.5">Method</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5">Date</th>
                        <th className="p-3.5 text-center">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {feeSummary.payments?.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="p-8 text-center text-slate-400">
                            No payment transactions recorded yet.
                          </td>
                        </tr>
                      ) : (
                        feeSummary.payments.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-3.5 font-mono font-medium text-slate-900">
                              {p.transaction_id || `TXN-${p.id}`}
                            </td>
                            <td className="p-3.5 font-semibold text-slate-900">
                              ₹{parseFloat(p.amount).toLocaleString('en-IN')}
                            </td>
                            <td className="p-3.5 uppercase font-medium text-slate-600">
                              {p.payment_method}
                            </td>
                            <td className="p-3.5">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize ${
                                  p.status === 'completed'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : p.status === 'failed'
                                    ? 'bg-red-50 text-red-700 border border-red-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                {p.status}
                              </span>
                            </td>
                            <td className="p-3.5 text-slate-500">
                              {new Date(p.created_at).toLocaleDateString()}
                            </td>
                            <td className="p-3.5 text-center">
                              <button
                                onClick={() => setSelectedReceipt(p)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg font-medium transition-colors"
                              >
                                <Receipt size={13} />
                                View Receipt
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-400 text-sm">
              Loading fee schedule and ledger...
            </div>
          )}
        </div>
      )}

      {/* ADMIN VIEW */}
      {isAdmin && (
        <div className="space-y-6">
          {/* Admin KPI Header */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <TrendingUp size={24} />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Total Institutional Revenue
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  ₹{totalAdminRevenue.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Receipt size={24} />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Completed Transactions
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {allPayments.filter((p) => p.status === 'completed').length}
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Clock size={24} />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Pending / Flagged
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {allPayments.filter((p) => p.status !== 'completed').length}
                </div>
              </div>
            </div>
          </div>

          {/* Search and Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search TXN ID, student, method..."
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Showing {filteredAdminPayments.length} of {allPayments.length} transactions
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                  <tr>
                    <th className="p-3.5">TXN ID</th>
                    <th className="p-3.5">Student</th>
                    <th className="p-3.5">Amount</th>
                    <th className="p-3.5">Method</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5 text-center">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAdminPayments.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-slate-400">
                        No transactions found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredAdminPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3.5 font-mono font-medium text-slate-900">
                          {p.transaction_id || `TXN-${p.id}`}
                        </td>
                        <td className="p-3.5 text-slate-800">
                          {p.user ? (
                            <div>
                              <div className="font-semibold">
                                {p.user.first_name} {p.user.last_name}
                              </div>
                              <div className="text-[10px] text-slate-400">{p.user.email}</div>
                            </div>
                          ) : (
                            `User #${p.user_id}`
                          )}
                        </td>
                        <td className="p-3.5 font-semibold text-slate-900">
                          ₹{parseFloat(p.amount).toLocaleString('en-IN')}
                        </td>
                        <td className="p-3.5 uppercase font-medium text-slate-600">
                          {p.payment_method}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize ${
                              p.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : p.status === 'failed'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-500">
                          {new Date(p.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => setSelectedReceipt(p)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg font-medium transition-colors"
                          >
                            <Receipt size={13} />
                            Receipt
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                  LMS
                </div>
                <span className="font-bold text-slate-900 text-sm">Official Fee Receipt</span>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-6 space-y-4 text-xs" id="printable-receipt-card">
              <div className="text-center pb-3 border-b border-dashed border-slate-200">
                <h4 className="font-bold text-base text-slate-900">Institute of Technology & Science</h4>
                <p className="text-slate-500 text-[11px]">Department of Academic Financial Affairs</p>
                <div className="mt-2 inline-block px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold rounded-full text-[10px]">
                  PAYMENT SETTLED
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-semibold">Receipt No</span>
                  <div className="font-mono font-medium text-slate-800">
                    REC-{selectedReceipt.id.toString().padStart(6, '0')}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-semibold">Date & Time</span>
                  <div className="font-medium text-slate-800">
                    {new Date(selectedReceipt.created_at).toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-semibold">Transaction ID</span>
                  <div className="font-mono text-slate-800 break-all">
                    {selectedReceipt.transaction_id || 'N/A'}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-semibold">Payment Channel</span>
                  <div className="font-medium text-slate-800 uppercase">
                    {selectedReceipt.payment_method}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="font-semibold text-slate-700">Tuition Settlement Amount</span>
                <span className="font-bold text-base text-slate-900">
                  ₹{parseFloat(selectedReceipt.amount).toLocaleString('en-IN')}
                </span>
              </div>

              {selectedReceipt.remarks && (
                <div className="text-slate-500 text-[11px]">
                  <span className="font-semibold text-slate-600">Notes: </span>
                  {selectedReceipt.remarks}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
              >
                <Printer size={14} />
                Print Receipt
              </button>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
