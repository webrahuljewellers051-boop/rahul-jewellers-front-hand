import React from 'react';
import { ShieldAlert, CheckCircle2, Sparkles, Wallet, PiggyBank } from 'lucide-react';

export default function PaymentProgress({ 
  paidMonths = 0, 
  totalMonths = 12, 
  installmentAmount = 10000, 
  onPayClick 
}) {
  const percentage = Math.min(Math.round((paidMonths / totalMonths) * 100), 100);
  const nextMonthNumber = paidMonths + 1;

  // Financial Calculations
  const totalPaidAmount = paidMonths * installmentAmount;
  const totalSchemeAmount = totalMonths * installmentAmount;
  const remainingBalance = Math.max(0, totalSchemeAmount - totalPaidAmount);

  return (
    <div className="bg-white p-6 rounded-3xl border-2 border-zinc-900 space-y-5 shadow-md text-zinc-900">
      
      {/* Header Section */}
      <div className="flex justify-between items-center border-b-2 border-zinc-900 pb-4">
        <div>
          <h3 className="text-base font-black text-zinc-900 uppercase tracking-wider">
            Scheme Installment Progress
          </h3>
          <p className="text-xs text-amber-900 font-black mt-0.5">
            ₹{installmentAmount.toLocaleString('en-IN')} / Month
          </p>
        </div>
        <span className="text-xs font-black bg-amber-100 text-amber-950 border-2 border-zinc-900 px-3.5 py-1.5 rounded-full shadow-sm">
          {paidMonths} / {totalMonths} Months
        </span>
      </div>

      {/* Financial Summary Section */}
      <div className="grid grid-cols-2 gap-3 p-4 bg-stone-50 rounded-2xl border-2 border-zinc-900">
        
        {/* Total Paid Card */}
        <div className="space-y-1 border-r border-zinc-300 pr-2">
          <div className="flex items-center gap-1.5 text-zinc-600">
            <Wallet className="w-3.5 h-3.5 text-emerald-700" />
            <span className="text-[10px] font-black uppercase tracking-wider">Total Paid</span>
          </div>
          <p className="text-lg font-black text-emerald-700 font-serif">
            ₹{totalPaidAmount.toLocaleString('en-IN')}
          </p>
        </div>

        {/* Remaining Balance Card */}
        <div className="space-y-1 pl-1">
          <div className="flex items-center gap-1.5 text-zinc-600">
            <PiggyBank className="w-3.5 h-3.5 text-amber-800" />
            <span className="text-[10px] font-black uppercase tracking-wider">Remaining</span>
          </div>
          <p className="text-lg font-black text-amber-900 font-serif">
            ₹{remainingBalance.toLocaleString('en-IN')}
          </p>
        </div>

      </div>

      {/* Progress Bar Track */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs font-black">
          <span className="text-zinc-700">Completion</span>
          <span className="text-amber-900">{percentage}% Paid</span>
        </div>
        <div className="w-full bg-stone-100 h-4 rounded-full overflow-hidden border-2 border-zinc-900 p-0.5">
          <div 
            className="bg-amber-700 h-full rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Grid Indicators (Months 1 to 12) */}
      <div className="grid grid-cols-6 gap-2 pt-1">
        {Array.from({ length: totalMonths }).map((_, index) => {
          const isPaid = index < paidMonths;
          return (
            <div
              key={index}
              className={`h-5 rounded-md border-2 border-zinc-900 transition-all flex items-center justify-center text-[9px] font-black ${
                isPaid ? 'bg-amber-600 text-white shadow-sm' : 'bg-stone-100 text-zinc-400'
              }`}
              title={`Month ${index + 1}: ${isPaid ? 'Paid' : 'Pending'}`}
            >
              M{index + 1}
            </div>
          );
        })}
      </div>

      {/* Notice Section */}
      <div className="p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-900/40 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-900 shrink-0 mt-0.5" />
        <p className="text-xs font-bold text-zinc-900 leading-tight">
          Pay 12 monthly installments on time to unlock your <span className="underline">13th Month Free Store Bonus</span>!
        </p>
      </div>

      {/* Action Button */}
      <button
        onClick={onPayClick}
        disabled={paidMonths >= totalMonths}
        className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition border-2 border-zinc-900 shadow-lg ${
          paidMonths >= totalMonths
            ? 'bg-stone-200 text-zinc-500 cursor-not-allowed border-zinc-400 shadow-none'
            : 'bg-amber-700 hover:bg-amber-800 active:scale-[0.99] text-white'
        }`}
      >
        {paidMonths >= totalMonths ? (
          <>
            <CheckCircle2 className="w-5 h-5 text-emerald-700" /> Plan Fully Completed
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 text-amber-200" /> Pay Month #{nextMonthNumber} Installment
          </>
        )}
      </button>

    </div>
  );
}