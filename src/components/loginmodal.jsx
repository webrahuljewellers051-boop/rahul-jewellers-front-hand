import React, { useState } from 'react';
import axios from 'axios';
import {
  X,
  LogIn,
  Sparkles,
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
  const [identifier, setIdentifier] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [error, setError] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

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
        const customer =
          response.data.customer;

        onLoginSuccess(customer);

        setIdentifier('');
        setPassword('');

        onClose();
      } else {
        setError(
          response.data?.message ||
            'Login failed.'
        );
      }
    } catch (err) {
      console.error(
        'Customer login error:',
        err
      );

      setError(
        err.response?.data?.message ||
          'Failed to connect to backend server.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">

      <div className="bg-white max-w-md w-full p-6 sm:p-8 rounded-3xl border-2 border-zinc-900 shadow-2xl space-y-5 relative">

        {/* CLOSE BUTTON */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 hover:bg-stone-100 rounded-full text-stone-500 transition"
          aria-label="Close login"
        >
          <X className="w-5 h-5" />
        </button>

        {/* HEADER */}
        <div className="text-center space-y-2">

          <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 mx-auto shadow-sm">
            <Sparkles className="w-6 h-6 text-amber-600" />
          </div>

          <h2 className="text-base font-black text-stone-900 uppercase tracking-wider">
            RAHUL JEWELLERS
          </h2>

          <p className="text-xs font-bold text-amber-900 uppercase tracking-widest">
            CUSTOMER PASSBOOK PORTAL
          </p>

        </div>

        {/* ERROR */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl text-center">
            {error}
          </div>
        )}

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="space-y-3 text-xs"
        >

          {/* CUSTOMER ID / PHONE */}
          <div>

            <label className="font-bold text-stone-700 uppercase block mb-1">
              Customer ID or Phone Number
            </label>

            <input
              type="text"
              required
              autoComplete="username"
              placeholder="e.g. RJ1001 or 9950091024"
              value={identifier}
              onChange={(e) =>
                setIdentifier(
                  e.target.value
                )
              }
              className="w-full p-2.5 bg-stone-50 border-2 border-zinc-900 rounded-xl font-bold outline-none focus:border-amber-600 transition"
            />

          </div>

          {/* PASSWORD */}
          <div>

            <label className="font-bold text-stone-700 uppercase block mb-1">
              Account Password
            </label>

            <input
              type="password"
              required
              autoComplete="current-password"
              placeholder="Enter account password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              className="w-full p-2.5 bg-stone-50 border-2 border-zinc-900 rounded-xl font-bold outline-none focus:border-amber-600 transition"
            />

          </div>

          {/* LOGIN */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-amber-900 hover:bg-amber-950 disabled:opacity-60 disabled:cursor-not-allowed text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-md transition border-2 border-zinc-900 flex items-center justify-center gap-1.5"
          >

            <LogIn className="w-4 h-4" />

            {loading
              ? 'Authenticating...'
              : 'Log In to Passbook'}

          </button>

        </form>

      </div>

    </div>
  );
}