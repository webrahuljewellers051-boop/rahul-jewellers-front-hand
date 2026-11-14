
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { User, X, Lock, MapPin, Check, Eye, EyeOff, ShieldCheck, Phone, Sparkles, Mail } from 'lucide-react';

const API = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL ||
  'https://rahul-jewellers-backend-jlr0.onrender.com').replace(/\/+$/, '');
const inputClass = 'w-full rounded-xl border border-[#c9a76b]/30 bg-[#100b0c] px-4 py-3 text-sm text-[#ead9b6] outline-none focus:border-[#c9a76b]';
const labelClass = 'block text-[11px] font-bold uppercase tracking-wider text-[#c9b58f]';

export default function CustomerProfileModal({ isOpen, onClose, user, onUpdateUser }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', dob: '', address: '' });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (isOpen && user) {
      setForm({ name: user.name || '', phone: user.phone || '', email: user.email || '',
        dob: user.dob || '', address: user.address || '' });
      setCurrentPassword(''); setNewPassword(''); setShowPassword(false);
      setSuccess(false); setError('');
    }
  }, [isOpen, user?._id]);
  if (!isOpen) return null;
  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const save = async event => {
    event.preventDefault();
    if (!user?._id || saving) return;
    if (newPassword && (newPassword.length < 8 || !currentPassword)) {
      setError('To change password, enter the current password and a new one with 8+ characters.'); return;
    }
    setSaving(true); setError('');
    try {
      const response = await axios.put(`${API}/api/customer/update-profile/${user._id}`, {
        ...form, name: form.name.trim(), phone: form.phone.trim(),
        email: form.email.trim().toLowerCase(), address: form.address.trim(),
        ...(newPassword ? { currentPassword, password: newPassword } : {})
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('customer_token') || ''}` },
        timeout: 30000
      });
      if (!response.data?.success || !response.data?.customer) throw new Error('Unable to update profile.');
      onUpdateUser(response.data.customer, response.data.token);
      setSuccess(true); setCurrentPassword(''); setNewPassword('');
    } catch (err) { setError(err.response?.data?.message || err.message || 'Update failed.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-md" onClick={onClose}>
      <section role="dialog" aria-modal="true" aria-label="My Profile" onClick={e => e.stopPropagation()}
        className="relative my-auto w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl border border-[#c9a76b]/40 bg-[#211718] p-6 text-[#ead9b6] shadow-2xl">
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-4 top-4 p-2"><X size={20}/></button>
        <div className="flex gap-3 items-center pb-5 border-b border-[#c9a76b]/20">
          <Sparkles size={27} className="text-[#d8bd83]"/>
          <div><p className="text-xs text-[#c9a76b]">RAHUL JEWELLERS · SHEOGANJ</p><h2 className="text-xl font-bold">My Profile</h2></div>
        </div>
        <p className="my-4 text-xs text-[#c9b58f] flex gap-2"><ShieldCheck size={15}/> Update contact details. Password is never displayed.</p>
        {error && <p role="alert" className="rounded-xl bg-red-950/50 p-3 text-xs text-red-200 mb-4">{error}</p>}
        {success && <p role="status" className="rounded-xl bg-emerald-900/40 p-3 text-xs text-emerald-200 mb-4">Profile updated successfully.</p>}
        <form onSubmit={save} className="space-y-4">
          <label className={labelClass}>Customer ID
            <input disabled value={user?.customerId || ''} className={`${inputClass} mt-2 opacity-70`}/>
          </label>
          <label className={labelClass}><User size={14} className="inline mr-1"/> Full Name
            <input required maxLength={100} autoComplete="name" value={form.name}
              onChange={e => update('name', e.target.value)} className={`${inputClass} mt-2`}/>
          </label>
          <label className={labelClass}><Phone size={14} className="inline mr-1"/> Mobile
            <input required type="tel" pattern="[6-9][0-9]{9}" maxLength={10} autoComplete="tel"
              value={form.phone} onChange={e => update('phone', e.target.value)} className={`${inputClass} mt-2`}/>
          </label>
          <label className={labelClass}><Mail size={14} className="inline mr-1"/> Email Address (required)
            <input required type="email" maxLength={254} autoComplete="email" value={form.email}
              onChange={e => update('email', e.target.value)} className={`${inputClass} mt-2`}/>
          </label>
          <label className={labelClass}>Date of Birth
            <input type="date" value={form.dob} onChange={e => update('dob', e.target.value)} className={`${inputClass} mt-2`}/>
          </label>
          <label className={labelClass}><MapPin size={14} className="inline mr-1"/> Address
            <textarea rows={3} maxLength={500} value={form.address}
              onChange={e => update('address', e.target.value)} className={`${inputClass} mt-2`}/>
          </label>
          <div className="border-t border-[#c9a76b]/20 pt-4 space-y-3">
            <p className="text-xs text-[#c9b58f] flex gap-2 items-center"><Lock size={14}/> Change Password (optional)</p>
            <label className={labelClass}>Current Password
              <input type={showPassword ? 'text' : 'password'} autoComplete="current-password"
                value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className={`${inputClass} mt-2`}/>
            </label>
            <label className={labelClass}>New Password (8+ characters)
              <div className="relative mt-2">
                <input type={showPassword ? 'text' : 'password'} minLength={8} autoComplete="new-password"
                  value={newPassword} onChange={e => setNewPassword(e.target.value)} className={`${inputClass} pr-12`}/>
                <button type="button" onClick={() => setShowPassword(v => !v)} aria-label="Toggle password visibility" className="absolute right-3 top-3">
                  {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </label>
          </div>
          <button type="submit" disabled={saving} className="w-full rounded-xl bg-[#c9a76b] py-3.5 font-black text-stone-950 disabled:opacity-50">
            <Check size={16} className="inline mr-1"/>{saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </section>
    </div>
  );
}
