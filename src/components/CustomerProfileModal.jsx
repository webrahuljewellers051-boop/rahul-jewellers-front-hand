import React, { useState } from 'react';
import axios from 'axios';
import { User, X, Lock, MapPin, Check } from 'lucide-react';

const API_BASE_URL = 'https://rahul-jewellers-backend-jlr0.onrender.com';

const requestConfig = {
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  }
};

export default function CustomerProfileModal({ isOpen, onClose, user, onUpdateUser }) {
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [password, setPassword] = useState(user?.password || '');
  const [address, setAddress] = useState(user?.address || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.put(`${API_BASE_URL}/api/customer/update-profile/${user._id}`, {
        name: name.trim(),
        phone: phone.trim(),
        password: password.trim(),
        address: address.trim()
      }, requestConfig);

      if (res.data.success) {
        setSuccess(true);
        onUpdateUser(res.data.customer);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 1500);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full p-6 rounded-3xl border-2 border-stone-900 shadow-2xl space-y-4 text-stone-800 relative">
        <div className="flex justify-between items-center border-b border-stone-200 pb-3">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-amber-700" />
            <h3 className="font-serif font-bold text-base uppercase text-stone-900">Customer Profile & Security</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-stone-100 rounded-xl text-stone-500 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-stone-700 block mb-1">Customer ID</label>
            <input type="text" disabled value={user?.customerId || ''} className="w-full p-2.5 bg-stone-100 border border-stone-300 rounded-xl font-mono font-bold text-stone-500" />
          </div>

          <div>
            <label className="font-bold text-stone-700 block mb-1">Full Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2.5 bg-stone-50 border-2 border-stone-900 rounded-xl font-medium outline-none" />
          </div>

          <div>
            <label className="font-bold text-stone-700 block mb-1">Phone Number (Login ID)</label>
            <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-2.5 bg-stone-50 border-2 border-stone-900 rounded-xl font-medium outline-none" />
          </div>

          <div>
            <label className="font-bold text-stone-700 block mb-1 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-amber-700" /> Account Password
            </label>
            <input type="text" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2.5 bg-stone-50 border-2 border-stone-900 rounded-xl font-mono font-bold outline-none" />
          </div>

          <div>
            <label className="font-bold text-stone-700 block mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-700" /> Residential / Shipping Address
            </label>
            <textarea rows="2" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g. Main Market, Sheoganj" className="w-full p-2.5 bg-stone-50 border-2 border-stone-900 rounded-xl font-medium outline-none resize-none" />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-[#E65C00] hover:bg-[#CC5200] text-white font-extrabold uppercase rounded-xl border-2 border-stone-900 shadow-sm transition cursor-pointer flex items-center justify-center gap-2"
          >
            {success ? <><Check className="w-4 h-4" /> Updated Successfully!</> : saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}