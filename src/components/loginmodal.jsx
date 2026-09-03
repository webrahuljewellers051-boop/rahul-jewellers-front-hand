import React, { useState } from 'react';
import axios from 'axios';
import { X, LogIn, Sparkles } from 'lucide-react';

const getApiBaseUrl = () => {
  const currentHost = window.location.hostname;
  if (currentHost.includes('ngrok')) return 'https://squire-brought-decency.ngrok-free.dev';
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') return 'http://localhost:5000';
  return `http://${currentHost || '192.168.1.11'}:5000`;
};

const API_BASE_URL = getApiBaseUrl();

const requestConfig = {
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  }
};

export default function CustomerLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/customer/login`,
        { identifier: identifier.trim(), password: password.trim() },
        requestConfig
      );

      if (res.data.success) {
        onLoginSuccess(res.data.customer);
        setIdentifier('');
        setPassword('');
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full p-6 sm:p-8 rounded-3xl border-2 border-zinc-900 shadow-2xl space-y-5 relative">
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 hover:bg-stone-100 rounded-full text-stone-500 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 mx-auto shadow-sm">
            <Sparkles className="w-6 h-6 text-amber-600" />
          </div>
          <h2 className="text-base font-black text-stone-900 uppercase tracking-wider">RAHUL JEWELLERS</h2>
          <p className="text-xs font-bold text-amber-900 uppercase tracking-widest">CUSTOMER PASSBOOK PORTAL</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-stone-700 uppercase block mb-1">Customer ID or Phone Number</label>
            <input
              type="text"
              required
              placeholder="e.g. RJ1001 or 9950091024"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full p-2.5 bg-stone-50 border-2 border-zinc-900 rounded-xl font-bold outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-stone-700 uppercase block mb-1">Account Password</label>
            <input
              type="password"
              required
              placeholder="Enter account password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2.5 bg-stone-50 border-2 border-zinc-900 rounded-xl font-bold outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-amber-900 hover:bg-amber-950 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-md transition border-2 border-zinc-900 flex items-center justify-center gap-1.5"
          >
            <LogIn className="w-4 h-4" /> {loading ? 'Authenticating...' : 'Log In to Passbook'}
          </button>
        </form>
      </div>
    </div>
  );
}