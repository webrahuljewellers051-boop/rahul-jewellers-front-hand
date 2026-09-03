import React, { useState, useEffect } from 'react';
import { X, UserPlus, Lock, User, MapPin, Calendar, Phone, CheckCircle2, AlertCircle } from 'lucide-react';

const NGROK_BASE_URL = 'https://squire-brought-decency.ngrok-free.dev';

export default function CustomerRegisterModal({ isOpen, onClose, onRegisterSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    dob: '',
    password: ''
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const showMsg = (text, type = 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${NGROK_BASE_URL}/api/customer/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          dob: formData.dob,
          password: formData.password.trim()
        })
      });

      const data = await res.json();

      if (data.success) {
        showMsg('Profile created successfully!', 'success');
        localStorage.setItem('showroomUserInfo', JSON.stringify(data.customer));
        setTimeout(() => {
          setFormData({ name: '', phone: '', address: '', dob: '', password: '' });
          if (onRegisterSuccess) onRegisterSuccess(data.customer);
          if (onClose) onClose();
        }, 1000);
      } else {
        showMsg(data.message || 'Registration failed.');
      }
    } catch (err) {
      showMsg('Failed to connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose && onClose()}
    >
      <div className="relative bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md border-2 border-zinc-900 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200 text-zinc-900">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <h2 className="text-xl font-serif font-bold text-amber-900 tracking-wider uppercase">
            RAHUL JEWELLERS
          </h2>
          <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">
            CREATE SHOWROOM PROFILE
          </p>
        </div>

        {message.text && (
          <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 text-center justify-center border ${
            message.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
              : 'bg-red-50 text-red-800 border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-3 text-xs font-medium">
          <div>
            <label className="block mb-1 font-bold text-stone-700 uppercase">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Soni"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold outline-none focus:border-amber-800 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-bold text-stone-700 uppercase">Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="tel"
                required
                placeholder="e.g. 9829000000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold outline-none focus:border-amber-800 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-bold text-stone-700 uppercase">Delivery Address</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <textarea
                rows="2"
                required
                placeholder="Enter complete showroom delivery address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold outline-none focus:border-amber-800 focus:bg-white transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block mb-1 font-bold text-stone-700 uppercase">Date of Birth</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="date"
                  required
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full pl-9 pr-2 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold outline-none focus:border-amber-800 focus:bg-white transition text-[11px]"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 font-bold text-stone-700 uppercase">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="Set password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-9 pr-2 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold outline-none focus:border-amber-800 focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-900 hover:bg-amber-950 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-md transition flex items-center justify-center gap-2 border border-amber-950 disabled:opacity-50 mt-2"
          >
            <UserPlus className="w-4 h-4" />
            {loading ? 'Creating Profile...' : 'Register Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}