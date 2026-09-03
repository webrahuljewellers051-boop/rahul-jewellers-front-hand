import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ShieldCheck, 
  ArrowRight, 
  X, 
  Smartphone, 
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';

const getApiBaseUrl = () => {
  const currentHost = window.location.hostname;
  if (currentHost.includes('ngrok')) return 'https://squire-brought-decency.ngrok-free.dev';
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') return 'http://localhost:5000';
  return `http://${currentHost || '192.168.1.11'}:5000`;
};

const API_BASE_URL = getApiBaseUrl();

export default function PaymentModal({ monthNum, monthlyAmount, user, onClose, onSuccess }) {
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
        const res = await axios.get(`${API_BASE_URL}/api/store/settings`, {
          headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        if (res.data.success && res.data.settings?.upiId) {
          setUpiId(res.data.settings.upiId);
          if (res.data.settings.merchantName) setMerchantName(res.data.settings.merchantName);
        }
      } catch (err) {
        console.error("Failed to load store UPI settings");
      }
    };
    fetchStoreUpi();
  }, []);

  const payableAmount = monthlyAmount || 10000;
  const note = encodeURIComponent(`Installment M${monthNum} ${user?.customerId || ''}`);
  const upiParams = `pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(merchantName)}&am=${payableAmount}&cu=INR&tn=${note}`;
  const genericUpiUri = `upi://pay?${upiParams}`;

  const upiApps = [
    { name: 'Google Pay', badge: 'GPay', badgeBg: 'bg-blue-600 text-white', url: `gpay://upi/pay?${upiParams}` },
    { name: 'PhonePe', badge: 'Pe', badgeBg: 'bg-purple-700 text-white', url: `phonepe://pay?${upiParams}` },
    { name: 'Paytm', badge: 'Paytm', badgeBg: 'bg-sky-500 text-white', url: `paytmmp://pay?${upiParams}` },
    { name: 'BHIM UPI', badge: 'BHIM', badgeBg: 'bg-emerald-600 text-white', url: `bhim://pay?${upiParams}` }
  ];

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(genericUpiUri)}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleVerifyAndSubmit = async (e) => {
    e.preventDefault();
    const cleanId = transactionId.trim();

    if (cleanId.length < 10 || cleanId.length > 20 || !/^[a-zA-Z0-9]+$/.test(cleanId)) {
      setError('Please enter a valid 12-digit UPI Reference / UTR Number from your payment app receipt. Random typing is blocked.');
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
        { headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' } }
      );

      if (res.data.success) {
        alert(`✅ Payment Verified! Month #${monthNum} installment has been recorded.`);
        onSuccess(res.data.customer);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment submission failed. Check transaction ID.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-sm w-full p-6 rounded-3xl border-2 border-stone-900 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-stone-200 pb-3">
          <div>
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-wide">
              Month #{monthNum} Installment
            </h3>
            <p className="text-[11px] text-[#E65C00] font-extrabold uppercase">
              Amount to Pay: ₹{payableAmount.toLocaleString('en-IN')}
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-stone-100 rounded-lg text-stone-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === 1 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-[11px] font-black uppercase text-stone-700 tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-[#E65C00]" /> Select UPI App to Pay
              </p>

              <div className="grid grid-cols-2 gap-2">
                {upiApps.map((app) => (
                  <a
                    key={app.name}
                    href={app.url}
                    onClick={() => setTimeout(() => setStep(2), 1500)}
                    className="p-2.5 rounded-xl border-2 border-zinc-900 flex items-center gap-2 font-bold text-xs bg-stone-50 hover:bg-amber-50 active:scale-95 transition shadow-sm"
                  >
                    <span className={`w-6 h-6 rounded-lg text-[9px] font-black flex items-center justify-center shrink-0 ${app.badgeBg}`}>
                      {app.badge}
                    </span>
                    <span className="truncate">{app.name}</span>
                  </a>
                ))}
              </div>

              <a
                href={genericUpiUri}
                onClick={() => setTimeout(() => setStep(2), 1500)}
                className="w-full py-2.5 bg-zinc-900 hover:bg-black text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4 text-amber-400" /> Pay via Any Other UPI App
              </a>
            </div>

            <div className="p-3 bg-stone-50 rounded-2xl border-2 border-zinc-900 space-y-2.5 text-center">
              <p className="text-[10px] font-black uppercase text-stone-600 tracking-wider">
                Or Scan Store QR Code
              </p>

              <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl border border-stone-300 shadow-inner flex items-center justify-center">
                <img src={qrCodeUrl} alt="Store Payment QR" className="w-full h-full object-contain" />
              </div>

              <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-xl border border-stone-300 text-[11px]">
                <span className="font-mono font-bold text-stone-700 truncate mr-2">{upiId}</span>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0 border border-stone-300"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3 bg-[#E65C00] hover:bg-[#CC5200] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl border-2 border-zinc-900 shadow-sm transition flex items-center justify-center gap-2"
            >
              I Have Paid • Submit UTR / Ref No. <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleVerifyAndSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-stone-800 space-y-1">
              <p className="font-black text-amber-900 uppercase text-[10px]">Strict Payment Verification</p>
              <p className="text-[11px] leading-relaxed">
                Random typing is blocked. You must enter the exact <strong>12-digit UPI Reference / UTR Number</strong> found in your payment app receipt.
              </p>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1 uppercase tracking-wider">
                12-Digit UPI Transaction / UTR Number
              </label>
              <input
                type="text"
                required
                maxLength={20}
                placeholder="e.g. 423589123456"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full p-3 bg-stone-50 border-2 border-zinc-900 rounded-xl font-mono text-center text-sm font-black tracking-widest outline-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl border border-stone-300 transition"
              >
                Back to UPI Apps
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-[#E65C00] hover:bg-[#CC5200] text-white font-extrabold uppercase rounded-xl border-2 border-zinc-900 shadow-sm transition flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" /> {loading ? 'Verifying...' : 'Submit Payment'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}