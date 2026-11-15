
import React from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  Sparkles,
  Wallet,
  PiggyBank,
  Crown,
  Gem
} from 'lucide-react';

export default function PaymentProgress({
  paidMonths = 0,
  totalMonths = 12,
  installmentAmount = 10000,
  onPayClick
}) {
  const safeTotalMonths = Math.max(1, totalMonths);
  const safePaidMonths = Math.max(
    0,
    Math.min(paidMonths, safeTotalMonths)
  );

  const percentage = Math.min(
    Math.round((safePaidMonths / safeTotalMonths) * 100),
    100
  );

  const nextMonthNumber = safePaidMonths + 1;

  // Financial Calculations
  const totalPaidAmount = safePaidMonths * installmentAmount;
  const totalSchemeAmount = safeTotalMonths * installmentAmount;
  const remainingBalance = Math.max(
    0,
    totalSchemeAmount - totalPaidAmount
  );

  const isCompleted = safePaidMonths >= safeTotalMonths;

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-[#BFA36A]/35 bg-[#100D0D] p-5 text-white shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:p-7">

      {/* Decorative Background */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#B68B45]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-[#681F2A]/20 blur-3xl" />

      <div className="relative space-y-6">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#BFA36A]/20 pb-5">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#D6B875]/40 bg-[#D6B875]/10">
              <Crown className="h-6 w-6 text-[#D6B875]" />
            </div>

            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#D6B875]">
                Rahul Jewellers
              </p>

              <h3 className="mt-1 font-serif text-lg text-[#F4E8CB] sm:text-xl">
                Scheme Progress
              </h3>

              <p className="mt-1 text-xs text-gray-400">
                ₹{installmentAmount.toLocaleString('en-IN')} / Month
              </p>
            </div>

          </div>

          <div className="rounded-full border border-[#D6B875]/40 bg-[#D6B875]/10 px-4 py-2">
            <span className="text-xs font-bold text-[#E8D5A8]">
              {safePaidMonths} / {safeTotalMonths} Months
            </span>
          </div>

        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-2 gap-3">

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4">

            <div className="mb-2 flex items-center gap-2 text-gray-400">
              <Wallet className="h-4 w-4 text-emerald-400" />

              <span className="text-[9px] font-bold uppercase tracking-[0.16em]">
                Total Paid
              </span>
            </div>

            <p className="break-words font-serif text-lg font-semibold text-emerald-300 sm:text-xl">
              ₹{totalPaidAmount.toLocaleString('en-IN')}
            </p>

          </div>

          <div className="rounded-2xl border border-[#D6B875]/20 bg-[#D6B875]/[0.06] p-4">

            <div className="mb-2 flex items-center gap-2 text-gray-400">
              <PiggyBank className="h-4 w-4 text-[#D6B875]" />

              <span className="text-[9px] font-bold uppercase tracking-[0.16em]">
                Remaining
              </span>
            </div>

            <p className="break-words font-serif text-lg font-semibold text-[#E8D5A8] sm:text-xl">
              ₹{remainingBalance.toLocaleString('en-IN')}
            </p>

          </div>

        </div>

        {/* Progress */}
        <div className="space-y-3">

          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                Your Savings Journey
              </p>

              <p className="mt-1 text-sm text-[#F4E8CB]">
                {isCompleted
                  ? 'All 12 installments paid. Benefit unlocks on your original month-13 date.'
                  : 'Keep going, your goal is getting closer.'}
              </p>
            </div>

            <span className="font-serif text-2xl font-bold text-[#E2C27C]">
              {percentage}%
            </span>
          </div>

          <div className="h-3 overflow-hidden rounded-full border border-[#D6B875]/20 bg-white/10 p-[2px]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#92703B] via-[#E6CC8D] to-[#FFF0C5] transition-all duration-700"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex justify-between text-[9px] font-medium uppercase tracking-wider text-gray-500">
            <span>Started</span>
            <span>Goal: ₹{totalSchemeAmount.toLocaleString('en-IN')}</span>
          </div>

        </div>

        {/* Monthly Indicators */}
        <div>

          <div className="mb-3 flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#E8D5A8]">
              Monthly Installments
            </p>

            <span className="text-[10px] text-gray-500">
              {safePaidMonths} Paid
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">

            {Array.from({ length: safeTotalMonths }).map((_, index) => {
              const isPaid = index < safePaidMonths;

              return (
                <div
                  key={index}
                  className={`flex h-10 items-center justify-center gap-1 rounded-xl border text-[10px] font-bold transition-all ${
                    isPaid
                      ? 'border-[#D6B875]/60 bg-gradient-to-br from-[#9B773F] to-[#6F512B] text-white shadow-[0_3px_12px_rgba(214,184,117,0.12)]'
                      : 'border-white/10 bg-white/[0.03] text-gray-500'
                  }`}
                  title={`Month ${index + 1}: ${isPaid ? 'Paid' : 'Pending'}`}
                >
                  {isPaid && <CheckCircle2 className="h-3 w-3" />}
                  M{index + 1}
                </div>
              );
            })}

          </div>

        </div>

        {/* Bonus Notice */}
        <div className="relative overflow-hidden rounded-2xl border border-[#D6B875]/30 bg-gradient-to-r from-[#2C1B19] to-[#171211] p-4">

          <div className="flex items-start gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#D6B875]/30 bg-[#D6B875]/10">
              <Gem className="h-5 w-5 text-[#E2C27C]" />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#D6B875]">
                Exclusive Customer Benefit
              </p>

              <p className="mt-1 text-xs leading-relaxed text-gray-300">
                Complete all {safeTotalMonths} verified installments. On the original 13th-month date, claim{' '}
                <span className="font-bold text-[#E8D5A8]">
                  100% Off Eligible Gold Making Charges
                </span>
                . Gold is not free; there is no 13th installment.
              </p>
            </div>

            <Sparkles className="absolute right-3 top-3 h-4 w-4 text-[#D6B875]/40" />

          </div>

        </div>

        {/* Payment Button */}
        <button
          type="button"
          onClick={onPayClick}
          disabled={isCompleted}
          className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-xs font-black uppercase tracking-[0.14em] transition-all ${
            isCompleted
              ? 'cursor-not-allowed border border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border border-[#E6CC8D]/60 bg-gradient-to-r from-[#A47B3F] via-[#E6CC8D] to-[#B68B45] text-[#17110B] shadow-lg shadow-[#B68B45]/10 hover:brightness-110 active:scale-[0.99]'
          }`}
        >

          {isCompleted ? (
            <>
              <CheckCircle2 className="h-5 w-5" />
              Plan Fully Completed
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Pay Month #{nextMonthNumber} Installment
            </>
          )}

        </button>

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 border-t border-white/10 pt-4">
          <ShieldAlert className="h-3.5 w-3.5 text-[#D6B875]" />

          <p className="text-center text-[9px] uppercase tracking-[0.12em] text-gray-500">
            Your savings journey with Rahul Jewellers
          </p>
        </div>

      </div>
    </div>
  );
}
