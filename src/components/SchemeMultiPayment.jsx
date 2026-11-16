
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  X,
  CheckCircle2,
  Smartphone,
  ShieldCheck
} from 'lucide-react';

// Set VITE_API_URL in Vercel to the production backend domain.
const API = String(
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'https://api.rahuljewellerSHEOGANJ.com'
)
  .trim()
  .replace(/\/+$/, '')
  .replace(/\/api$/i, '');

function money(value) {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? amount.toLocaleString('en-IN')
    : '0';
}

function getErrorMessage(error) {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.code === 'ECONNABORTED') {
    return 'Server से जवाब आने में देर हो रही है। दोबारा कोशिश करें।';
  }

  if (axios.isAxiosError(error) && !error.response) {
    return 'Backend से कनेक्शन नहीं हो रहा। API URL और CORS जाँचें।';
  }

  return error?.message || 'Payment request भेजने में समस्या हुई।';
}

function getRequestMonths(request) {
  const numbers =
    Array.isArray(request?.monthNums) && request.monthNums.length
      ? request.monthNums
      : [request?.monthNum];

  return numbers
    .map(Number)
    .filter(num => Number.isInteger(num) && num >= 1 && num <= 12);
}

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
  const [locallyPending, setLocallyPending] = useState([]);

  const draftKey = user?._id
    ? `rj_scheme_payment_selection_${user._id}_${user.schemeCycle || 1}`
    : '';

  useEffect(() => {
    if (!isOpen) return;

    setUtr('');
    setError('');
    setSuccess('');
    setLocallyPending([]);

    if (!draftKey) {
      setSelected([]);
      return;
    }

    try {
      const saved = JSON.parse(sessionStorage.getItem(draftKey) || '[]');
      setSelected(
        Array.isArray(saved)
          ? [...new Set(saved.map(Number))].filter(
              num => Number.isInteger(num) && num >= 1 && num <= 12
            )
          : []
      );
    } catch {
      setSelected([]);
    }
  }, [isOpen, draftKey]);

  const rows = Array.isArray(user?.installments)
    ? user.installments
    : [];

  const schemeActive =
    user?.schemeJoined === true &&
    (user?.schemeStatus || 'Active') === 'Active' &&
    user?.isActive !== false;

  const monthly = Number(user?.customInstallment || 0);
  const validMonthly = Number.isFinite(monthly) && monthly > 0;

  const pendingMonths = useMemo(() => {
    const blocked = new Set();
    const requests = Array.isArray(paymentRequests)
      ? paymentRequests
      : [];

    requests.forEach(request => {
      if (!['Pending', 'Approved'].includes(request?.status)) {
        return;
      }

      getRequestMonths(request).forEach(num => blocked.add(num));
    });

    locallyPending.forEach(num => blocked.add(num));
    return blocked;
  }, [paymentRequests, locallyPending]);

  const payableMonths = useMemo(() => {
    const allowed = new Set();
    if (!schemeActive || !validMonthly) return allowed;

    rows.forEach(row => {
      const num = Number(row?.monthNum);
      if (
        Number.isInteger(num) &&
        num >= 1 &&
        num <= 12 &&
        row?.paid !== true &&
        row?.payableNow === true &&
        !pendingMonths.has(num)
      ) {
        allowed.add(num);
      }
    });

    return allowed;
  }, [rows, schemeActive, validMonthly, pendingMonths]);

  // Do not submit a month that became unavailable after selection.
  const selectedMonths = selected
    .filter(num => payableMonths.has(num))
    .sort((a, b) => a - b);

  const total = monthly * selectedMonths.length;

  function toggleMonth(monthNum) {
    if (submitting || !payableMonths.has(monthNum)) return;

    const next = selectedMonths.includes(monthNum)
      ? selectedMonths.filter(num => num !== monthNum)
      : [...selectedMonths, monthNum].sort((a, b) => a - b);

    setSelected(next);
    setError('');
    setSuccess('');

    // Preserve selected months when returning from a UPI app.
    if (draftKey) {
      try {
        sessionStorage.setItem(draftKey, JSON.stringify(next));
      } catch {
        // Payment selection still works if browser storage is disabled.
      }
    }
  }

  function openUpi() {
    setError('');

    if (!schemeActive || !validMonthly || !selectedMonths.length) {
      setError('पहले भुगतान के लिए उपलब्ध किस्तें चुनें।');
      return;
    }

    if (!upiId.trim()) {
      setError('Store UPI ID अभी उपलब्ध नहीं है।');
      return;
    }

    const note = (
      `${user?.customerId || 'RJ'} ` +
      `Months ${selectedMonths.join(',')}`
    ).slice(0, 70);

    const params = new URLSearchParams({
      pa: upiId.trim(),
      pn: merchantName || 'Rahul Jewellers',
      am: String(total),
      cu: 'INR',
      tn: note
    });

    window.location.href = `upi://pay?${params.toString()}`;
  }

  async function submit(event) {
    event.preventDefault();
    if (submitting) return;

    setError('');
    setSuccess('');

    if (!schemeActive) {
      setError('Scheme Active नहीं है। Store से संपर्क करें।');
      return;
    }

    if (!validMonthly || !selectedMonths.length) {
      setError('कम से कम एक उपलब्ध किस्त चुनें।');
      return;
    }

    const reference = utr.trim().toUpperCase();

    if (!/^[A-Z0-9]{10,20}$/.test(reference)) {
      setError('सही UTR डालें (10–20 अक्षर या अंक)।');
      return;
    }

    const token = localStorage.getItem('customer_token');
    if (!token) {
      setError('Session समाप्त है। कृपया दोबारा Login करें।');
      return;
    }

    setSubmitting(true);

    try {
      const response = await axios.post(
        `${API}/api/customer/pay-installment`,
        {
          monthNums: selectedMonths,
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

      if (response.data?.success !== true) {
        throw new Error(
          response.data?.message || 'Payment request स्वीकार नहीं हुआ।'
        );
      }

      // A successful submission is PENDING, not a verified payment.
      setLocallyPending(previous => [
        ...new Set([...previous, ...selectedMonths])
      ]);
      setSelected([]);
      setUtr('');
      setSuccess(
        'UTR Admin को भेज दिया गया है। Verification के बाद ही किस्त Paid होगी।'
      );

      if (draftKey) {
        try {
          sessionStorage.removeItem(draftKey);
        } catch {
          // Ignore unavailable browser storage.
        }
      }

      // Refresh failure must not be shown as payment submission failure.
      try {
        await onSubmitted(response.data);
      } catch (refreshError) {
        console.warn('Payment submitted, but refresh failed:', refreshError);
        setSuccess(
          'UTR Admin को भेज दिया गया है। Passbook अपडेट नहीं दिखे तो पेज Refresh करें।'
        );
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  }

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
          disabled={submitting}
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
          एक या कई उपलब्ध किस्तें चुनें। Paid और Pending किस्तें
          दोबारा नहीं चुन सकते।
        </p>

        {!schemeActive && (
          <p role="alert" className="mt-3 rounded-xl bg-amber-950/40 p-3 text-sm text-amber-200">
            आपकी Gold Scheme अभी Active नहीं है।
          </p>
        )}

        <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {Array.from({ length: 12 }).map((_, index) => {
            const month = index + 1;
            const row = rows.find(
              item => Number(item?.monthNum) === month
            );

            const isPaid = row?.paid === true;
            const isPending = pendingMonths.has(month);
            const canPay = payableMonths.has(month);
            const checked = selectedMonths.includes(month);

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
                  <CheckCircle2 size={15} className="mx-auto mt-1" />
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
            <strong>{selectedMonths.length}</strong>
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

        {qrCodeUrl && (
          <p className="mt-2 text-center text-xs text-[#c9b58f]">
            QR से भुगतान करते समय रकम ₹{money(total)} स्वयं जाँचें।
          </p>
        )}

        <button
          type="button"
          disabled={!upiId.trim() || !selectedMonths.length || submitting}
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
              autoComplete="off"
              onChange={event =>
                setUtr(
                  event.target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, '')
                )
              }
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
            disabled={!selectedMonths.length || !validMonthly || !schemeActive || submitting}
            className="w-full rounded-xl border border-[#c9a76b]/50 py-3 font-black disabled:opacity-40"
          >
            {submitting
              ? 'Submitting...'
              : 'Submit UTR for Admin Verification'}
          </button>
        </form>

        <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-[#c9b58f]">
          <ShieldCheck size={16} className="shrink-0" />
          केवल वास्तविक भुगतान के बाद UTR भेजें। UPI में रकम और
          चुनी हुई किस्तें जाँचें। Admin Verification के बाद ही
          Passbook में Paid दिखेगा।
        </p>
      </section>
    </div>
  );
}
