
import React, { useState } from 'react';
import axios from 'axios';
import {
  X,
  LogIn,
  Sparkles,
  Eye,
  EyeOff,
  User,
  Lock,
  ShieldCheck
} from 'lucide-react';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'https://rahul-jewellers-backend-jlr0.onrender.com';

const requestConfig = {
  headers: {
    'Content-Type': 'application/json',
  },
};

export default function CustomerLoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
}) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/customer/login`,
        {
          identifier: identifier.trim(),
          password: password.trim(),
        },
        requestConfig
      );

      if (response.data?.success) {
        const customer = response.data.customer;

        onLoginSuccess(customer);

        setIdentifier('');
        setPassword('');
        setShowPassword(false);

        onClose();
      } else {
        setError(
          response.data?.message || 'Login failed. Please check your details.'
        );
      }
    } catch (err) {
      console.error('Customer login error:', err);

      setError(
        err.response?.data?.message ||
        'Unable to connect. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: '#100b0c',
    borderColor: 'rgba(201,167,107,0.28)',
    color: '#ead9b6',
  };

  const labelStyle =
    'mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[1.5px] text-[#c9b58f]';

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative my-auto w-full max-w-md overflow-hidden rounded-3xl border shadow-2xl"
        style={{
          background: 'linear-gradient(145deg, #241819, #100b0c)',
          borderColor: 'rgba(201,167,107,0.42)',
          boxShadow: '0 25px 80px rgba(0,0,0,0.55)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gold Accent */}
        <div
          className="h-1 w-full"
          style={{
            background: 'linear-gradient(90deg, transparent, #d8bd83, #8d6938, transparent)',
          }}
        />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close login"
          className="absolute right-4 top-5 rounded-full p-2 text-[#b9a88d] transition hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="px-6 pb-5 pt-9 text-center">
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border shadow-lg"
            style={{
              background: 'rgba(201,167,107,0.10)',
              borderColor: 'rgba(201,167,107,0.45)',
            }}
          >
            <Sparkles className="h-8 w-8 text-[#d9bd83]" />
          </div>

          <p className="mb-2 text-[9px] font-semibold uppercase tracking-[3px] text-[#c9a76b]">
            Elegance · Heritage · Trust
          </p>

          <h2 className="font-serif-luxury text-3xl font-semibold tracking-wide text-[#ead9b6]">
            Rahul Jewellers
          </h2>

          <div className="mx-auto my-4 flex items-center justify-center gap-3">
            <div className="h-px w-10 bg-[#9b7845]" />
            <Sparkles className="h-3 w-3 text-[#c9a76b]" />
            <div className="h-px w-10 bg-[#9b7845]" />
          </div>

          <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[#b9a88d]">
            Customer Passbook Portal
          </p>

          <p className="mt-2 text-xs text-[#887b6b]">
            Welcome back. Access your account securely.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 px-6 pb-7">

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-500/30 bg-red-950/30 p-3 text-center text-xs leading-5 text-red-300"
            >
              {error}
            </div>
          )}

          {/* Customer ID */}
          <div>
            <label className={labelStyle}>
              <User className="h-3.5 w-3.5" />
              Customer ID or Phone Number
            </label>

            <input
              type="text"
              required
              autoComplete="username"
              placeholder="e.g. RJ1001 or 9950091024"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full rounded-xl border px-4 py-3.5 text-sm font-medium outline-none transition placeholder:text-[#827463] focus:border-[#d8bd83]"
              style={inputStyle}
            />
          </div>

          {/* Password */}
          <div>
            <label className={labelStyle}>
              <Lock className="h-3.5 w-3.5" />
              Account Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border px-4 py-3.5 pr-12 text-sm font-medium outline-none transition placeholder:text-[#827463] focus:border-[#d8bd83]"
                style={inputStyle}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b9a88d] transition hover:text-[#ead9b6]"
              >
                {showPassword
                  ? <EyeOff className="h-4 w-4" />
                  : <Eye className="h-4 w-4" />
                }
              </button>
            </div>
          </div>

          {/* Security Note */}
          <div className="flex items-center justify-center gap-2 text-[10px] text-[#a99a86]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#c9a76b]" />
            Secure Customer Account Access
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-4 text-xs font-bold uppercase tracking-[1.5px] transition-all duration-300 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #d8bd83, #a47b43)',
              color: '#1b1110',
              boxShadow: '0 7px 24px rgba(201,167,107,0.15)',
            }}
          >
            <LogIn className="h-4 w-4" />
            {loading ? 'Authenticating...' : 'Log In to Passbook'}
          </button>

          <p className="text-center text-[9px] tracking-wide text-[#827463]">
            RAHUL JEWELLERS · SHEOGANJ
          </p>
        </form>
      </div>
    </div>
  );
}
