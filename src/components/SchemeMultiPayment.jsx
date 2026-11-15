
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  X, CheckCircle2, Smartphone, ShieldCheck
} from 'lucide-react';

const API = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'https://rahul-jewellers-backend-jlr0.onrender.com'
).replace(/\/+$/, '');

const money = value =>
  Number(value || 0).toLocaleString('en-IN');

export default function SchemeMultiPayment({
  isOpen = false,
  onClose = () => {},
  user = null,
  paymentRequests = [],
  upiId = '',
  merchantName = 'Rahul Jewellers',
  qrCodeUrl = '',
  onSubmitted = () => {}
}) {
  const [selected, setSelected] = useState([]);
  const [utr, setUtr] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setSelected([]);
    setUtr('');
    setError('');
    setSuccess('');
  }, [isOpen]);

  const rows = Array.isArray(user?.installments)
    ? user.installments
    : [];

  const pendingMonths = useMemo(() => {
    const blocked = new Set();

    paymentRequests.forEach(request => {
      if (!['Pending', 'Approved'].includes(request.status)) {
        return;
      }

      const nums = Array.isArray(request.monthNums) &&
        request.monthNums.length
        ? request.monthNums
        : [request.monthNum];

      nums.forEach(num => blocked.add(Number(num)));
    });

    return blocked;
  }, [paymentRequests]);

  const monthly = Number(user?.customInstallment || 0);
  const total = monthly * selected.length;

  const payable = rows.filter(row =>
    !row.paid &&
    row.payableNow === true &&
    !pendingMonths.has(Number(row.monthNum))
  );

  const toggleMonth = monthNum => {
    setError('');
    setSelected(current =>
      current.includes(monthNum)
        ? current.filter(num => num !== monthNum)
        : [...current, monthNum].sort((a, b) => a - b)
    );
  };

  const openUpi = () => {
    if (!upiId || !selected.length || total <= 0) {
      setError('Select installments and check the store UPI ID.');
      return;
    }

    const note = (
      `${user?.customerId || 'RJ'} ` +
      `Months ${selected.join(',')}`
    ).slice(0, 70);

    const uri = new URLSearchParams({
      pa: upiId,
      pn: merchantName,
      am: String(total),
      cu: 'INR',
      tn: note
    });

    window.location.href = `upi://pay?${uri.toString()}`;
  };

  const submit = async event => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const reference = utr.trim().toUpperCase();

    if (!selected.length) {
      setError('Select at least one installment.');
      return;
    }

    if (!/^[A-Z0-9]{10,20}$/.test(reference)) {
      setError('Enter a valid UTR with 10–20 letters or digits.');
      return;
    }

    const token = localStorage.getItem('customer_token');

    if (!token) {
      setError('Please log in again.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await axios.post(
        `${API}/api/customer/pay-installment`,
        {
          monthNums: selected,
          amount: total,
          transactionId: reference
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || 'Submission failed.'
        );
      }

      setSuccess(
        'Payment request submitted. Your installments will ' +
        'be marked Paid only after admin verification.'
      );

      setUtr('');
      setSelected([]);
      await onSubmitted(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Unable to submit payment.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/80 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Pay scheme installments"
        className="relative mx-auto my-4 max-w-xl rounded-3xl border border-[#c9a76b]/40 bg-[#211718] p-6 text-[#ead9b6]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close payment"
          className="absolute right-4 top-4 p-2"
        >
          <X size={20} />
        </button>

        <p className="text-xs font-bold uppercase tracking-widest text-[#c9a76b]">
          Rahul Jewellers · Gold Scheme
        </p>

        <h2 className="mt-2 font-serif text-2xl font-bold">
          Pay Multiple Installments
        </h2>

        <p className="mt-3 text-sm text-[#c9b58f]">
          अपनी एक या कई उपलब्ध किस्तें चुनें।
          पहले जमा या Pending किस्तें दोबारा नहीं चुन सकते।
        </p>

        <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {Array.from({ length: 12 }).map((_, index) => {
            const month = index + 1;
            const row = rows.find(item =>
              Number(item.monthNum) === month
            );

            const isPaid = Boolean(row?.paid);
            const isPending = pendingMonths.has(month);
            const canPay = payable.some(item =>
              Number(item.monthNum) === month
            );

            const checked = selected.includes(month);

            return (
              <button
                key={month}
                type="button"
                disabled={!canPay || submitting}
                onClick={() => toggleMonth(month)}
                aria-pressed={checked}
                className={`rounded-xl border p-3 text-xs font-bold ${
                  isPaid
                    ? 'border-emerald-600/40 bg-emerald-950/40 text-emerald-300'
                    : isPending
                    ? 'border-amber-600/40 bg-amber-950/30 text-amber-200'
                    : checked
                    ? 'border-[#d8bd83] bg-[#c9a76b] text-stone-950'
                    : canPay
                    ? 'border-[#c9a76b]/40 bg-[#100b0c]'
                    : 'border-white/10 bg-white/5 text-gray-500'
                }`}
              >
                <span className="block">Month {month}</span>
                <span className="mt-1 block text-[10px]">
                  {isPaid
                    ? 'Paid'
                    : isPending
                    ? 'Pending'
                    : checked
                    ? 'Selected'
                    : canPay
                    ? 'Available'
                    : 'Unavailable'}
                </span>

                {(isPaid || checked) && (
                  <CheckCircle2
                    size={15}
                    className="mx-auto mt-1"
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-5 rounded-2xl border border-[#c9a76b]/30 bg-[#100b0c] p-4">
          <div className="flex justify-between gap-3 text-sm">
            <span>Monthly Installment</span>
            <strong>₹{money(monthly)}</strong>
          </div>

          <div className="mt-2 flex justify-between gap-3 text-sm">
            <span>Selected Months</span>
            <strong>{selected.length}</strong>
          </div>

          <div className="mt-3 flex justify-between gap-3 border-t border-[#c9a76b]/20 pt-3 text-lg">
            <strong>Total Payment</strong>
            <strong className="text-[#e8d5a8]">
              ₹{money(total)}
            </strong>
          </div>
        </div>

        {qrCodeUrl && (
          <img
            src={qrCodeUrl}
            alt="Rahul Jewellers UPI QR"
            className="mx-auto mt-5 h-44 w-44 rounded-xl bg-white object-contain p-2"
          />
        )}

        <p className="mt-4 text-center text-sm">
          Payee: <strong>{merchantName}</strong>
        </p>

        <p className="mt-1 break-all text-center text-xs text-[#c9b58f]">
          {upiId || 'UPI ID is not configured'}
        </p>

        <button
          type="button"
          disabled={!upiId || !selected.length || submitting}
          onClick={openUpi}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#c9a76b] py-3 font-black text-stone-950 disabled:opacity-40"
        >
          <Smartphone size={18} />
          Open UPI App · ₹{money(total)}
        </button>

        <form onSubmit={submit} className="mt-5 space-y-3">
          <label className="block text-xs font-bold">
            UTR / Transaction Reference
            <input
              required
              value={utr}
              maxLength={20}
              onChange={event => setUtr(
                event.target.value
                  .toUpperCase()
                  .replace(/[^A-Z0-9]/g, '')
              )}
              placeholder="Enter UTR after payment"
              className="mt-2 w-full rounded-xl border border-[#c9a76b]/40 bg-[#100b0c] p-3 text-sm outline-none"
            />
          </label>

          {error && (
            <p role="alert" className="text-sm text-red-300">
              {error}
            </p>
          )}

          {success && (
            <p role="status" className="text-sm text-emerald-300">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={!selected.length || submitting}
            className="w-full rounded-xl border border-[#c9a76b]/50 py-3 font-black disabled:opacity-40"
          >
            {submitting
              ? 'Submitting...'
              : 'Submit UTR for Admin Verification'}
          </button>
        </form>

        <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-[#c9b58f]">
          <ShieldCheck size={16} className="shrink-0" />
          केवल वास्तविक भुगतान के बाद UTR भेजें।
          UPI में रकम और चुनी गई किस्तों की संख्या
          सही जाँच लें। Payment Admin Verification
          के बाद ही Passbook में Paid होगा।
        </p>
      </section>
    </div>
  );
}
