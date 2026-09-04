import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { History, CheckCircle2, AlertTriangle, Clock, Calendar, Gift } from 'lucide-react';

const API_BASE_URL = 'https://rahul-jewellers-backend-jlr0.onrender.com';
const requestConfig = {
  headers: {
    'ngrok-skip-browser-warning': 'true'
  }
};

export default function TransactionHistory({ userId, paidMonths = 4, installmentAmount = 10000 }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const monthLabels = [
    "Month 1 (Jan)", "Month 2 (Feb)", "Month 3 (Mar)", "Month 4 (Apr)",
    "Month 5 (May)", "Month 6 (Jun)", "Month 7 (Jul)", "Month 8 (Aug)",
    "Month 9 (Sep)", "Month 10 (Oct)", "Month 11 (Nov)", "Month 12 (Dec)"
  ];

  useEffect(() => {
    const fetchHistory = async () => {
      if (!userId) {
        // Mock data displaying Successful, Overdue, and Pending receipts
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
            paymentMode: status === 'SUCCESS' ? 'Direct UPI Transfer' : '—',
            date: status === 'SUCCESS' 
              ? new Date(Date.now() - (paidMonths - index) * 30 * 24 * 60 * 60 * 1000).toISOString()
              : null,
            status
          };
        });
        setTransactions(mockData);
        return;
      }

      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/api/transactions/${userId}`, requestConfig);
        if (res.data.success) {
          setTransactions(res.data.transactions);
        }
      } catch (err) {
        console.error('History Fetch Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userId, paidMonths, installmentAmount]);

  return (
    <div className="bg-white p-6 rounded-3xl border-2 border-zinc-900 space-y-5 shadow-md text-zinc-900">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b-2 border-zinc-900 pb-3">
        <h3 className="text-base font-black text-zinc-900 uppercase tracking-wider flex items-center gap-2">
          <History className="w-4 h-4 text-amber-800" /> Payment Receipts & Ledger
        </h3>
        <span className="text-xs font-black text-zinc-900 bg-stone-100 border border-zinc-900 px-3 py-1 rounded-full">
          {paidMonths} / 12 Paid
        </span>
      </div>

      {/* Encouraging Gift Reward Announcement Banner */}
      <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-2xl border-2 border-zinc-900 flex items-start gap-3 shadow-sm">
        <div className="p-2 bg-amber-700 text-white rounded-xl border border-zinc-900 shrink-0 mt-0.5">
          <Gift className="w-5 h-5" />
        </div>
        <div className="space-y-0.5">
          <p className="text-xs font-black text-amber-950 uppercase tracking-wider">
            13th Month Special Store Gift! 🎉
          </p>
          <p className="text-xs font-bold text-zinc-800 leading-snug">
            Pay all 12 monthly installments on time, and <span className="text-amber-900 font-black">Rahul Jewellers will reward you with your 13th month's installment completely FREE as a special gift!</span>
          </p>
        </div>
      </div>

      {/* Receipts List Container */}
      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {loading ? (
          <p className="text-xs text-zinc-600 font-bold py-6 text-center">Loading ledger...</p>
        ) : (
          transactions.map((txn) => {
            const isSuccess = txn.status === 'SUCCESS';
            const isOverdue = txn.status === 'OVERDUE';

            return (
              <div
                key={txn._id}
                className={`p-4 rounded-2xl border-2 flex justify-between items-center text-xs transition ${
                  isSuccess 
                    ? 'bg-emerald-50/70 border-zinc-900' 
                    : isOverdue 
                    ? 'bg-red-50/80 border-red-900' 
                    : 'bg-stone-50 border-zinc-300 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`p-2 rounded-xl border-2 shrink-0 ${
                    isSuccess 
                      ? 'bg-emerald-100 border-zinc-900 text-emerald-800' 
                      : isOverdue 
                      ? 'bg-red-100 border-red-900 text-red-800' 
                      : 'bg-stone-100 border-zinc-400 text-zinc-500'
                  }`}>
                    {isSuccess ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : isOverdue ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <Clock className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <p className="font-black text-zinc-900 text-sm">
                      {txn.monthLabel}
                    </p>
                    <p className="text-[11px] font-bold text-zinc-700 mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      {txn.date 
                        ? new Date(txn.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                        : isOverdue ? 'Due Now' : 'Upcoming'
                      }
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-base font-black text-zinc-900 font-serif">
                    ₹{Number(txn.amount).toLocaleString('en-IN')}
                  </p>

                  {/* Status Badge */}
                  {isSuccess && (
                    <span className="text-[10px] font-black text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-800">
                      SUCCESS
                    </span>
                  )}
                  {isOverdue && (
                    <span className="text-[10px] font-black text-red-900 bg-red-100 px-2.5 py-0.5 rounded-full border border-red-800">
                      MISSED / DUE
                    </span>
                  )}
                  {!isSuccess && !isOverdue && (
                    <span className="text-[10px] font-black text-zinc-600 bg-stone-200 px-2 py-0.5 rounded-full">
                      PENDING
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}