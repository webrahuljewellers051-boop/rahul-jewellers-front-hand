
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  History,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  Gift,
  Crown,
  Receipt,
  Loader2,
  Sparkles
} from 'lucide-react';

const API_BASE_URL =
  'https://rahul-jewellers-backend-jlr0.onrender.com';

const requestConfig = {
  headers: {
    'ngrok-skip-browser-warning': 'true'
  }
};

export default function TransactionHistory({
  userId,
  paidMonths = 4,
  installmentAmount = 10000
}) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const monthLabels = [
    'Month 1 (Jan)', 'Month 2 (Feb)', 'Month 3 (Mar)',
    'Month 4 (Apr)', 'Month 5 (May)', 'Month 6 (Jun)',
    'Month 7 (Jul)', 'Month 8 (Aug)', 'Month 9 (Sep)',
    'Month 10 (Oct)', 'Month 11 (Nov)', 'Month 12 (Dec)'
  ];

  useEffect(() => {
    const fetchHistory = async () => {
      if (!userId) {
        const mockData = Array.from({ length: 12 }, (_, index) => {
          const monthNumber = index + 1;

          let status = 'PENDING';

          if (monthNumber <= paidMonths) {
            status = 'SUCCESS';
          } else if (monthNumber === paidMonths + 1) {
            status = 'OVERDUE';
          }

          return {
            _id: `txn_${monthNumber}`,
            monthNumber,
            monthLabel: monthLabels[index],
            amount: installmentAmount,
            paymentMode:
              status === 'SUCCESS' ? 'Direct UPI Transfer' : '—',
            date:
              status === 'SUCCESS'
                ? new Date(
                    Date.now() -
                    (paidMonths - index) * 30 * 24 * 60 * 60 * 1000
                  ).toISOString()
                : null,
            status
          };
        });

        setTransactions(mockData);
        return;
      }

      try {
        setLoading(true);

        const res = await axios.get(
          `${API_BASE_URL}/api/transactions/${userId}`,
          requestConfig
        );

        if (res.data.success) {
          setTransactions(res.data.transactions || []);
        }
      } catch (err) {
        console.error('History Fetch Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userId, paidMonths, installmentAmount]);

  const formatDate = (date) => {
    if (!date) return null;

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return null;

    return parsedDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusDetails = (status) => {
    if (status === 'SUCCESS') {
      return {
        label: 'SUCCESS',
        description: 'Payment recorded',
        icon: CheckCircle2,
        badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
        iconStyle: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
        card: 'border-emerald-500/20 bg-emerald-500/[0.04]'
      };
    }

    if (status === 'OVERDUE') {
      return {
        label: 'DUE NOW',
        description: 'Installment pending',
        icon: AlertTriangle,
        badge: 'border-red-500/30 bg-red-500/10 text-red-300',
        iconStyle: 'border-red-500/30 bg-red-500/10 text-red-400',
        card: 'border-red-500/25 bg-red-500/[0.04]'
      };
    }

    return {
      label: 'PENDING',
      description: 'Upcoming installment',
      icon: Clock,
      badge: 'border-white/10 bg-white/5 text-gray-400',
      iconStyle: 'border-white/10 bg-white/5 text-gray-400',
      card: 'border-white/10 bg-white/[0.025]'
    };
  };

  const successfulCount = transactions.filter(
    (txn) => txn.status === 'SUCCESS'
  ).length;

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-[#BFA36A]/35 bg-[#100D0D] p-5 text-white shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:p-7">

      {/* Background Decoration */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-[#B68B45]/10 blur-3xl" />

      <div className="relative space-y-5">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#BFA36A]/20 pb-5">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#D6B875]/40 bg-[#D6B875]/10">
              <History className="h-5 w-5 text-[#D6B875]" />
            </div>

            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#D6B875]">
                Rahul Jewellers
              </p>

              <h3 className="mt-1 font-serif text-lg text-[#F4E8CB] sm:text-xl">
                Payment Ledger
              </h3>

              <p className="mt-1 text-[10px] text-gray-500">
                Your installment history and receipts
              </p>
            </div>

          </div>

          <div className="rounded-full border border-[#D6B875]/30 bg-[#D6B875]/10 px-3 py-2">
            <span className="text-[10px] font-bold text-[#E8D5A8]">
              {paidMonths} / 12 Paid
            </span>
          </div>

        </div>

        {/* Gift Announcement */}
        <div className="relative overflow-hidden rounded-2xl border border-[#D6B875]/30 bg-gradient-to-r from-[#301D1A] to-[#171211] p-4">

          <div className="flex items-start gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#D6B875]/40 bg-[#D6B875]/10">
              <Gift className="h-5 w-5 text-[#E2C27C]" />
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#E8D5A8]">
                  13th Month Special Gift
                </p>

                <Sparkles className="h-3.5 w-3.5 text-[#D6B875]" />
              </div>

              <p className="mt-1 text-xs leading-relaxed text-gray-300">
                Pay all 12 monthly installments on time and Rahul Jewellers will reward you with your{' '}
                <span className="font-bold text-[#E8D5A8]">
                  13th month's installment completely FREE
                </span>{' '}
                as a special gift!
              </p>
            </div>

          </div>

        </div>

        {/* Ledger Summary */}
        <div className="grid grid-cols-2 gap-3">

          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] p-3">
            <div className="flex items-center gap-2 text-gray-400">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span className="text-[9px] font-bold uppercase tracking-wider">
                Recorded Payments
              </span>
            </div>

            <p className="mt-2 font-serif text-2xl text-emerald-300">
              {successfulCount}
            </p>
          </div>

          <div className="rounded-xl border border-[#D6B875]/20 bg-[#D6B875]/[0.05] p-3">
            <div className="flex items-center gap-2 text-gray-400">
              <Receipt className="h-4 w-4 text-[#D6B875]" />
              <span className="text-[9px] font-bold uppercase tracking-wider">
                Installment Amount
              </span>
            </div>

            <p className="mt-2 font-serif text-xl text-[#E8D5A8]">
              ₹{Number(installmentAmount).toLocaleString('en-IN')}
            </p>
          </div>

        </div>

        {/* Receipt List */}
        <div>

          <div className="mb-3 flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#E8D5A8]">
              Transaction History
            </p>

            <span className="text-[10px] text-gray-500">
              {transactions.length} Entries
            </span>
          </div>

          <div className="max-h-96 space-y-3 overflow-y-auto pr-1">

            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-10 text-gray-400">
                <Loader2 className="h-6 w-6 animate-spin text-[#D6B875]" />
                <p className="text-xs">Loading payment ledger...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] py-10 text-center">
                <Receipt className="mx-auto h-8 w-8 text-gray-600" />
                <p className="mt-3 text-sm font-semibold text-gray-300">
                  No transactions found
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Your payment history will appear here.
                </p>
              </div>
            ) : (
              transactions.map((txn) => {
                const status = getStatusDetails(txn.status);
                const StatusIcon = status.icon;
                const dateLabel = formatDate(txn.date);

                return (
                  <div
                    key={txn._id}
                    className={`flex items-center justify-between gap-3 rounded-2xl border p-3 transition sm:p-4 ${status.card}`}
                  >

                    <div className="flex min-w-0 items-center gap-3">

                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${status.iconStyle}`}>
                        <StatusIcon className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-[#F4E8CB] sm:text-sm">
                          {txn.monthLabel || `Month ${txn.monthNumber}`}
                        </p>

                        <p className="mt-1 flex items-center gap-1 text-[10px] text-gray-500">
                          <Calendar className="h-3 w-3 shrink-0" />

                          {dateLabel ||
                            (txn.status === 'OVERDUE'
                              ? 'Due Now'
                              : 'Upcoming')}
                        </p>

                        {txn.paymentMode && txn.paymentMode !== '—' && (
                          <p className="mt-1 truncate text-[9px] text-gray-500">
                            {txn.paymentMode}
                          </p>
                        )}
                      </div>

                    </div>

                    <div className="shrink-0 text-right">

                      <p className="font-serif text-base font-semibold text-[#E8D5A8] sm:text-lg">
                        ₹{Number(txn.amount || 0).toLocaleString('en-IN')}
                      </p>

                      <span className={`mt-1 inline-block rounded-full border px-2 py-1 text-[8px] font-bold tracking-wider ${status.badge}`}>
                        {status.label}
                      </span>

                    </div>

                  </div>
                );
              })
            )}

          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 border-t border-white/10 pt-4">
          <Crown className="h-3.5 w-3.5 text-[#D6B875]" />

          <p className="text-center text-[9px] uppercase tracking-[0.15em] text-gray-500">
            Thank you for choosing Rahul Jewellers
          </p>
        </div>

      </div>
    </div>
  );
}
