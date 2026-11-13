
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ShieldCheck,
  ArrowRight,
  X,
  Smartphone,
  AlertCircle,
  Copy,
  Check,
  Crown,
  CreditCard,
  Sparkles,
  ArrowLeft,
  Loader2
} from 'lucide-react';

const API_BASE_URL =
  'https://rahul-jewellers-backend-jlr0.onrender.com';

export default function PaymentModal({
  monthNum,
  monthlyAmount,
  user,
  onClose,
  onSuccess
}) {
  const [upiId, setUpiId] = useState('9950091024@okbizaxis');
  const [merchantName, setMerchantName] = useState('Rahul Jewellers');
  const [transactionId, setTransactionId] = useState('');
  const [step, setStep] = useState(1);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStoreUpi = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/store/settings`,
          {
            headers: {
              'ngrok-skip-browser-warning': 'true'
            }
          }
        );

        if (res.data.success && res.data.settings?.upiId) {
          setUpiId(res.data.settings.upiId);

          if (res.data.settings.merchantName) {
            setMerchantName(res.data.settings.merchantName);
          }
        }
      } catch (err) {
        console.error('Failed to load store UPI settings:', err);
      }
    };

    fetchStoreUpi();
  }, []);

  const payableAmount = Number(monthlyAmount) || 10000;

  const note = encodeURIComponent(
    `Installment M${monthNum} ${user?.customerId || ''}`
  );

  const upiParams =
    `pa=${encodeURIComponent(upiId)}` +
    `&pn=${encodeURIComponent(merchantName)}` +
    `&am=${payableAmount}` +
    `&cu=INR&tn=${note}`;

  const genericUpiUri = `upi://pay?${upiParams}`;

  const upiApps = [
    {
      name: 'Google Pay',
      badge: 'GPay',
      badgeBg: 'bg-blue-600',
      url: `gpay://upi/pay?${upiParams}`
    },
    {
      name: 'PhonePe',
      badge: 'Pe',
      badgeBg: 'bg-purple-700',
      url: `phonepe://pay?${upiParams}`
    },
    {
      name: 'Paytm',
      badge: 'Paytm',
      badgeBg: 'bg-sky-600',
      url: `paytmmp://pay?${upiParams}`
    },
    {
      name: 'BHIM UPI',
      badge: 'BHIM',
      badgeBg: 'bg-emerald-700',
      url: `bhim://pay?${upiParams}`
    }
  ];

  const qrCodeUrl =
    `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(genericUpiUri)}`;

  const handleCopyUpi = async () => {
    try {
      await navigator.clipboard.writeText(upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      setError('Unable to copy UPI ID. Please copy it manually.');
    }
  };

  const handleVerifyAndSubmit = async (e) => {
    e.preventDefault();

    const cleanId = transactionId.trim();

    if (
      cleanId.length < 10 ||
      cleanId.length > 20 ||
      !/^[a-zA-Z0-9]+$/.test(cleanId)
    ) {
      setError(
        'Please enter a valid UPI Reference / UTR Number from your payment receipt.'
      );
      return;
    }

    if (!user?._id) {
      setError('Customer information is missing. Please login again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/customer/pay-installment`,
        {
          userId: user._id,
          monthNum,
          amount: payableAmount,
          transactionId: cleanId
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          }
        }
      );

      if (res.data.success) {
        onSuccess(res.data.customer);
      } else {
        setError(
          res.data.message || 'Unable to submit payment details.'
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Payment submission failed. Please check your UTR number and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5">

      <div className="relative w-full max-w-md max-h-[94vh] overflow-y-auto rounded-[28px] border border-[#BFA36A]/40 bg-[#100D0D] text-white shadow-[0_25px_100px_rgba(0,0,0,0.75)]">

        {/* Decorative Top Border */}
        <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-[#D6B875] to-transparent" />

        {/* Header */}
        <div className="relative overflow-hidden border-b border-[#BFA36A]/20 px-5 py-5 sm:px-7">

          <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-[#B68B45]/10 blur-3xl" />

          <div className="relative flex items-center justify-between gap-3">

            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#D6B875]/40 bg-[#D6B875]/10">
                <Crown className="h-6 w-6 text-[#D6B875]" />
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#D6B875]">
                  Rahul Jewellers
                </p>

                <h2 className="mt-1 font-serif text-xl tracking-wide text-[#F4E8CB]">
                  Savings Scheme
                </h2>
              </div>

            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400 transition hover:border-[#D6B875]/50 hover:bg-[#D6B875]/10 hover:text-[#D6B875]"
              aria-label="Close payment modal"
            >
              <X className="h-5 w-5" />
            </button>

          </div>

          <div className="mt-5 flex items-center justify-between rounded-2xl border border-[#D6B875]/25 bg-gradient-to-r from-[#291819] to-[#171112] p-4">

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                Monthly Installment
              </p>

              <h3 className="mt-1 font-serif text-lg text-[#F4E8CB]">
                Month #{monthNum}
              </h3>
            </div>

            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-gray-400">
                Amount Payable
              </p>

              <p className="mt-1 text-2xl font-semibold text-[#E2C27C]">
                ₹{payableAmount.toLocaleString('en-IN')}
              </p>
            </div>

          </div>

        </div>

        <div className="space-y-5 p-5 sm:p-7">

          {/* Steps */}
          <div className="flex items-center gap-3">

            <div className={`flex flex-1 items-center gap-2 ${step === 1 ? 'text-[#E2C27C]' : 'text-emerald-400'}`}>
              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${step === 1 ? 'bg-[#D6B875] text-black' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {step === 1 ? '1' : <Check className="h-4 w-4" />}
              </span>

              <span className="text-[10px] font-bold uppercase tracking-wider">
                Make Payment
              </span>
            </div>

            <div className="h-px flex-1 bg-white/15" />

            <div className={`flex flex-1 items-center justify-end gap-2 ${step === 2 ? 'text-[#E2C27C]' : 'text-gray-500'}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Submit UTR
              </span>

              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${step === 2 ? 'bg-[#D6B875] text-black' : 'bg-white/10 text-gray-400'}`}>
                2
              </span>
            </div>

          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === 1 ? (

            <div className="space-y-5">

              {/* UPI Apps */}
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-[#D6B875]" />

                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#E8D5A8]">
                    Choose Your Payment App
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">

                  {upiApps.map((app) => (
                    <a
                      key={app.name}
                      href={app.url}
                      onClick={() => {
                        setTimeout(() => setStep(2), 1500);
                      }}
                      className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 transition hover:border-[#D6B875]/60 hover:bg-[#D6B875]/10 active:scale-[0.98]"
                    >

                      <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${app.badgeBg} text-[10px] font-black text-white`}>
                        {app.badge}
                      </span>

                      <span className="text-xs font-semibold text-gray-200 transition group-hover:text-[#E2C27C]">
                        {app.name}
                      </span>

                    </a>
                  ))}

                </div>

                <a
                  href={genericUpiUri}
                  onClick={() => {
                    setTimeout(() => setStep(2), 1500);
                  }}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#D6B875]/50 bg-gradient-to-r from-[#B38A48] to-[#E1C47E] py-3 text-xs font-bold uppercase tracking-wider text-[#17110B] transition hover:brightness-110"
                >
                  <CreditCard className="h-4 w-4" />
                  Pay Using Other UPI App
                  <ArrowRight className="h-4 w-4" />
                </a>

              </div>

              {/* QR Code */}
              <div className="rounded-2xl border border-[#D6B875]/30 bg-[#1A1514] p-4">

                <div className="mb-3 flex items-center justify-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-[#D6B875]" />

                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E8D5A8]">
                    Scan & Pay Securely
                  </p>
                </div>

                <div className="mx-auto flex h-44 w-44 items-center justify-center rounded-xl bg-white p-2 shadow-[0_0_30px_rgba(214,184,117,0.12)]">
                  <img
                    src={qrCodeUrl}
                    alt="Rahul Jewellers UPI Payment QR Code"
                    className="h-full w-full object-contain"
                  />
                </div>

                <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-3">

                  <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-gray-500">
                    Store UPI ID
                  </p>

                  <div className="flex items-center justify-between gap-2">

                    <span className="truncate font-mono text-xs text-[#E8D5A8]">
                      {upiId}
                    </span>

                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#D6B875]/30 bg-[#D6B875]/10 px-3 py-2 text-[10px] font-bold text-[#E2C27C] transition hover:bg-[#D6B875]/20"
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}

                      {copied ? 'COPIED' : 'COPY'}
                    </button>

                  </div>

                </div>

              </div>

              <button
                type="button"
                onClick={() => {
                  setError('');
                  setStep(2);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#B38A48] via-[#E6CC8D] to-[#B38A48] py-3.5 text-xs font-black uppercase tracking-[0.12em] text-[#17110B] shadow-lg shadow-[#B38A48]/10 transition hover:brightness-110 active:scale-[0.99]"
              >
                I Have Paid - Submit UTR
                <ArrowRight className="h-4 w-4" />
              </button>

              <p className="text-center text-[10px] leading-relaxed text-gray-500">
                Please complete the payment using your UPI app before submitting your transaction reference.
              </p>

            </div>

          ) : (

            <form onSubmit={handleVerifyAndSubmit} className="space-y-5">

              <div className="rounded-xl border border-[#D6B875]/25 bg-[#241B17] p-4">

                <div className="mb-2 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#D6B875]" />

                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#E8D5A8]">
                    Transaction Reference
                  </p>
                </div>

                <p className="text-xs leading-relaxed text-gray-300">
                  Enter the UPI Reference Number / UTR shown in your payment app receipt. Your submitted details may require confirmation by the store.
                </p>

              </div>

              <div>

                <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-[#D6B875]">
                  UPI Transaction / UTR Number
                </label>

                <input
                  type="text"
                  required
                  maxLength={20}
                  autoComplete="off"
                  placeholder="Enter your UTR number"
                  value={transactionId}
                  onChange={(e) => {
                    setTransactionId(e.target.value);
                    setError('');
                  }}
                  className="w-full rounded-xl border border-[#D6B875]/30 bg-[#1B1615] px-4 py-4 text-center font-mono text-sm font-bold tracking-[0.12em] text-[#F4E8CB] outline-none transition placeholder:font-sans placeholder:font-normal placeholder:tracking-normal placeholder:text-gray-600 focus:border-[#D6B875] focus:ring-2 focus:ring-[#D6B875]/10"
                />

              </div>

              <div className="flex gap-3">

                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setStep(1);
                  }}
                  disabled={loading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-300 transition hover:bg-white/10 disabled:opacity-50"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex flex-[1.4] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#B38A48] to-[#E6CC8D] py-3 text-[10px] font-black uppercase tracking-wider text-[#17110B] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      Submit UTR
                    </>
                  )}
                </button>

              </div>

            </form>

          )}

          {/* Footer */}
          <div className="border-t border-white/10 pt-4 text-center">

            <div className="flex items-center justify-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-[#D6B875]" />

              <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                Rahul Jewellers • Customer Payment
              </span>
            </div>

            <p className="mt-2 text-[9px] text-gray-600">
              For payment assistance, contact our store.
            </p>

          </div>

        </div>

      </div>
    </div>
  );
}
