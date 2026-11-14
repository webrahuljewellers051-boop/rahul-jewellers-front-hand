import React, { useState } from 'react';
import axios from 'axios';
import { X, LogIn, Sparkles, Eye, EyeOff, User, Lock, ShieldCheck, Mail, Phone, UserPlus } from 'lucide-react';

const API = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL ||
  'https://rahul-jewellers-backend-jlr0.onrender.com').replace(/\/+$/, '');
const initial = { name: '', phone: '', email: '', dob: '', address: '', password: '', confirmPassword: '' };
const inputClass = 'w-full rounded-xl border border-[#c9a76b]/30 bg-[#100b0c] px-4 py-3 text-sm text-[#ead9b6] outline-none focus:border-[#d8bd83]';
const labelClass = 'block mb-2 text-[11px] font-bold uppercase tracking-wider text-[#c9b58f]';

export default function CustomerLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [mode, setMode] = useState('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [form, setForm] = useState(initial);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  if (!isOpen) return null;

  const update = (field, value) => setForm(previous => ({ ...previous, [field]: value }));
  const switchMode = value => { setMode(value); setError(''); setShowPassword(false); };
  const submit = async event => {
    event.preventDefault();
    if (loading) return;
    setError('');
    if (mode === 'register') {
      if (!/^[6-9]\d{9}$/.test(form.phone.trim())) return setError('Enter a valid 10-digit Indian mobile.');
      if (form.password.length < 8) return setError('Password must be at least 8 characters.');
      if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    }
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/api/customer/login' : '/api/customer/register';
      const body = mode === 'login'
        ? { identifier: identifier.trim(), password }
        : { ...form, name: form.name.trim(), phone: form.phone.trim(),
            email: form.email.trim().toLowerCase(), address: form.address.trim() };
      const response = await axios.post(`${API}${endpoint}`, body, { timeout: 30000 });
      if (!response.data?.success || !response.data?.customer || !response.data?.token)
        throw new Error(response.data?.message || 'Unable to authenticate.');
      onLoginSuccess(response.data.customer, response.data.token);
      setPassword(''); setIdentifier(''); setForm(initial); setShowPassword(false);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Connection failed. Try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-md"
      onClick={onClose}>
      <section role="dialog" aria-modal="true" aria-label="Customer account"
        onClick={event => event.stopPropagation()}
        className="relative my-auto w-full max-w-md rounded-3xl border border-[#c9a76b]/40 bg-[#211718] p-6 text-[#ead9b6] shadow-2xl max-h-[92vh] overflow-y-auto">
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-4 top-4 p-2"><X size={20}/></button>
        <div className="text-center pt-4 pb-5">
          <Sparkles className="mx-auto text-[#d8bd83] mb-3" size={32}/>
          <h2 className="text-2xl font-serif font-bold">Rahul Jewellers</h2>
          <p className="text-xs tracking-widest text-[#c9a76b]">SHEOGANJ · CUSTOMER PORTAL</p>
        </div>
        <div className="flex gap-2 mb-5">
          <button type="button" onClick={() => switchMode('login')}
            className={`flex-1 rounded-xl py-3 text-xs font-bold ${mode === 'login' ? 'bg-[#c9a76b] text-stone-950' : 'border border-[#c9a76b]/30'}`}>
            <LogIn size={14} className="inline mr-1"/> Login
          </button>
          <button type="button" onClick={() => switchMode('register')}
            className={`flex-1 rounded-xl py-3 text-xs font-bold ${mode === 'register' ? 'bg-[#c9a76b] text-stone-950' : 'border border-[#c9a76b]/30'}`}>
            <UserPlus size={14} className="inline mr-1"/> Create Profile
          </button>
        </div>
        {error && <p role="alert" className="mb-4 rounded-xl bg-red-950/50 p-3 text-xs text-red-200">{error}</p>}
        <form onSubmit={submit} className="space-y-4">
          {mode === 'login' ? <>
            <label className={labelClass}><User size={14} className="inline mr-1"/> Customer ID / Mobile
              <input required autoComplete="username" className={`${inputClass} mt-2`} value={identifier}
                onChange={e => setIdentifier(e.target.value)} placeholder="RJ Customer ID or mobile"/>
            </label>
            <label className={labelClass}><Lock size={14} className="inline mr-1"/> Password
              <div className="relative mt-2">
                <input required type={showPassword ? 'text' : 'password'} autoComplete="current-password"
                  className={`${inputClass} pr-12`} value={password} onChange={e => setPassword(e.target.value)}/>
                <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-3" aria-label="Toggle password visibility">
                  {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </label>
          </> : <>
            <label className={labelClass}>Full Name
              <input required maxLength={100} autoComplete="name" className={`${inputClass} mt-2`}
                value={form.name} onChange={e => update('name', e.target.value)}/>
            </label>
            <label className={labelClass}><Phone size={14} className="inline mr-1"/> Mobile Number
              <input required type="tel" pattern="[6-9][0-9]{9}" maxLength={10} autoComplete="tel"
                className={`${inputClass} mt-2`} value={form.phone} onChange={e => update('phone', e.target.value)}/>
            </label>
            <label className={labelClass}><Mail size={14} className="inline mr-1"/> Email Address (required)
              <input required type="email" maxLength={254} autoComplete="email" className={`${inputClass} mt-2`}
                value={form.email} onChange={e => update('email', e.target.value)} placeholder="customer@example.com"/>
            </label>
            <label className={labelClass}>Date of Birth
              <input required type="date" className={`${inputClass} mt-2`} value={form.dob}
                onChange={e => update('dob', e.target.value)}/>
            </label>
            <label className={labelClass}>Residential Address (optional)
              <textarea rows={2} maxLength={500} className={`${inputClass} mt-2`} value={form.address}
                onChange={e => update('address', e.target.value)}/>
            </label>
            <label className={labelClass}>Create Password (8+ characters)
              <div className="relative mt-2">
                <input required minLength={8} maxLength={128} type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password" className={`${inputClass} pr-12`} value={form.password}
                  onChange={e => update('password', e.target.value)}/>
                <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-3" aria-label="Toggle password visibility">
                  {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </label>
            <label className={labelClass}>Confirm Password
              <input required minLength={8} type={showPassword ? 'text' : 'password'} autoComplete="new-password"
                className={`${inputClass} mt-2`} value={form.confirmPassword}
                onChange={e => update('confirmPassword', e.target.value)}/>
            </label>
            <p className="text-xs text-[#c9b58f]">Creating a customer profile does not join the Gold Scheme. You can choose to join separately after login.</p>
          </>}
          <p className="text-[11px] text-[#c9b58f] flex gap-2 items-center justify-center"><ShieldCheck size={14}/> Secure Customer Account</p>
          <button type="submit" disabled={loading} className="w-full rounded-xl bg-[#c9a76b] py-3.5 font-black text-stone-950 disabled:opacity-50">
            {loading ? 'Please wait...' : mode === 'login' ? 'Login to Passbook' : 'Create Profile & Login'}
          </button>
        </form>
      </section>
    </div>
  );
}
