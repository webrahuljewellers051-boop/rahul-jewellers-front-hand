import React, { useState } from 'react';
import axios from 'axios';
import {
  X, LogIn, Sparkles, Eye, EyeOff,
  User, Lock, ShieldCheck, Mail, Phone, UserPlus
} from 'lucide-react';

// Set VITE_API_URL in Vercel to:
// https://api.rahuljewellerSHEOGANJ.com

function getApiBaseUrl() {
  let url = String(
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    'https://api.rahuljewellerSHEOGANJ.com'
  ).trim();

  while (url.endsWith('/')) {
    url = url.slice(0, -1);
  }

  if (url.toLowerCase().endsWith('/api')) {
    url = url.slice(0, -4);
  }

  return url;
}

const API = getApiBaseUrl();

const emptyForm = {
  name: '',
  phone: '',
  email: '',
  dob: '',
  address: '',
  password: '',
  confirmPassword: ''
};

const inputClass =
  'w-full rounded-xl border border-[#c9a76b]/30 bg-[#100b0c] px-4 py-3 text-sm text-[#ead9b6] outline-none focus:border-[#d8bd83]';

const labelClass =
  'block mb-2 text-[11px] font-bold uppercase tracking-wider text-[#c9b58f]';

function getErrorMessage(error) {
  if (!axios.isAxiosError(error)) {
    return error?.message || 'कुछ गलत हुआ। दोबारा कोशिश करें।';
  }

  if (
    error.response &&
    error.response.data &&
    error.response.data.message
  ) {
    return error.response.data.message;
  }

  if (error.code === 'ECONNABORTED') {
    return 'Server से जवाब आने में देर हो रही है। दोबारा कोशिश करें।';
  }

  if (
    error.code === 'ERR_NETWORK' ||
    !error.response
  ) {
    return 'Backend से कनेक्शन नहीं हो रहा। API URL, Server और CORS जाँचें।';
  }

  return error.message || 'कुछ गलत हुआ। दोबारा कोशिश करें।';
}

export default function CustomerLoginModal({
  isOpen,
  onClose,
  onLoginSuccess
}) {
  const [mode, setMode] = useState('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  function updateForm(field, value) {
    setForm(previous => ({
      ...previous,
      [field]: value
    }));
  }

  function switchMode(nextMode) {
    if (loading) return;

    setMode(nextMode);
    setError('');
    setShowPassword(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    setError('');

    if (mode === 'login') {
      if (!identifier.trim() || !password) {
        setError('Customer ID / Mobile और Password डालें।');
        return;
      }
    } else {
      if (!form.name.trim()) {
        setError('अपना पूरा नाम डालें।');
        return;
      }

      if (!/^[6-9][0-9]{9}$/.test(form.phone.trim())) {
        setError('सही 10 अंकों का मोबाइल नंबर डालें।');
        return;
      }

      if (!form.dob) {
        setError('Date of Birth जरूरी है।');
        return;
      }

      if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) {
        setError('सही Email डालें या Email खाली छोड़ दें।');
        return;
      }

      if (
        form.password.length < 8 ||
        form.password.length > 128
      ) {
        setError('Password 8 से 128 अक्षरों का होना चाहिए।');
        return;
      }

      if (form.password !== form.confirmPassword) {
        setError('दोनों Password एक जैसे होने चाहिए।');
        return;
      }
    }

    setLoading(true);

    try {
      const endpoint = mode === 'login'
        ? '/api/customer/login'
        : '/api/customer/register';

      const requestBody = mode === 'login'
        ? {
            identifier: identifier.trim(),
            password: password
          }
        : {
            name: form.name.trim(),
            phone: form.phone.trim(),
            email: form.email.trim().toLowerCase(),
            dob: form.dob,
            address: form.address.trim(),
            password: form.password,
            confirmPassword: form.confirmPassword
          };

      const response = await axios.post(
        API + endpoint,
        requestBody,
        {
          timeout: 30000
        }
      );

      const result = response.data;

      if (
        !result ||
        !result.success ||
        !result.customer ||
        !result.token
      ) {
        throw new Error(
          (result && result.message) ||
          'Login नहीं हो पाया।'
        );
      }

      if (typeof onLoginSuccess !== 'function') {
        throw new Error(
          'Login callback नहीं मिला। Home.jsx चेक करें।'
        );
      }

      // Home.jsx stores the customer token
      // and starts the customer session.
      onLoginSuccess(
        result.customer,
        result.token
      );

      setMode('login');
      setIdentifier('');
      setPassword('');
      setForm(emptyForm);
      setShowPassword(false);

      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-md"
      onClick={loading ? undefined : onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Customer account"
        onClick={event => event.stopPropagation()}
        className="relative my-auto w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl border border-[#c9a76b]/40 bg-[#211718] p-6 text-[#ead9b6] shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          aria-label="Close"
          className="absolute right-4 top-4 p-2"
        >
          <X size={20} />
        </button>

        <div className="pt-4 pb-5 text-center">
          <Sparkles
            className="mx-auto mb-3 text-[#d8bd83]"
            size={32}
          />

          <h2 className="text-2xl font-serif font-bold">
            Rahul Jewellers
          </h2>

          <p className="text-xs tracking-widest text-[#c9a76b]">
            SHEOGANJ · CUSTOMER PORTAL
          </p>
        </div>

        <div className="mb-5 flex gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => switchMode('login')}
            className={
              'flex-1 rounded-xl py-3 text-xs font-bold ' +
              (
                mode === 'login'
                  ? 'bg-[#c9a76b] text-stone-950'
                  : 'border border-[#c9a76b]/30'
              )
            }
          >
            <LogIn
              size={14}
              className="mr-1 inline"
            />
            Login
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => switchMode('register')}
            className={
              'flex-1 rounded-xl py-3 text-xs font-bold ' +
              (
                mode === 'register'
                  ? 'bg-[#c9a76b] text-stone-950'
                  : 'border border-[#c9a76b]/30'
              )
            }
          >
            <UserPlus
              size={14}
              className="mr-1 inline"
            />
            Create Profile
          </button>
        </div>

        {error && (
          <p
            role="alert"
            className="mb-4 rounded-xl bg-red-950/50 p-3 text-xs text-red-200"
          >
            {error}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {mode === 'login' ? (
            <>
              <label className={labelClass}>
                <User
                  size={14}
                  className="mr-1 inline"
                />
                Customer ID / Mobile

                <input
                  required
                  autoComplete="username"
                  className={inputClass + ' mt-2'}
                  value={identifier}
                  onChange={event =>
                    setIdentifier(event.target.value)
                  }
                  placeholder="RJ Customer ID or mobile"
                />
              </label>

              <label className={labelClass}>
                <Lock
                  size={14}
                  className="mr-1 inline"
                />
                Password

                <div className="relative mt-2">
                  <input
                    required
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    autoComplete="current-password"
                    className={inputClass + ' pr-12'}
                    value={password}
                    onChange={event =>
                      setPassword(event.target.value)
                    }
                  />

                  <button
                    type="button"
                    aria-label="Show or hide password"
                    onClick={() =>
                      setShowPassword(value => !value)
                    }
                    className="absolute right-3 top-3"
                  >
                    {showPassword
                      ? <EyeOff size={18} />
                      : <Eye size={18} />
                    }
                  </button>
                </div>
              </label>
            </>
          ) : (
            <>
              <label className={labelClass}>
                Full Name

                <input
                  required
                  maxLength={100}
                  autoComplete="name"
                  className={inputClass + ' mt-2'}
                  value={form.name}
                  onChange={event =>
                    updateForm('name', event.target.value)
                  }
                />
              </label>

              <label className={labelClass}>
                <Phone
                  size={14}
                  className="mr-1 inline"
                />
                Mobile Number

                <input
                  required
                  type="tel"
                  pattern="[6-9][0-9]{9}"
                  maxLength={10}
                  autoComplete="tel"
                  className={inputClass + ' mt-2'}
                  value={form.phone}
                  onChange={event =>
                    updateForm('phone', event.target.value)
                  }
                />
              </label>

              <label className={labelClass}>
                <Mail
                  size={14}
                  className="mr-1 inline"
                />
                Email Address (Optional)

                <input
                  type="email"
                  maxLength={254}
                  autoComplete="email"
                  className={inputClass + ' mt-2'}
                  value={form.email}
                  onChange={event =>
                    updateForm('email', event.target.value)
                  }
                  placeholder="customer@example.com"
                />
              </label>

              <label className={labelClass}>
                Date of Birth

                <input
                  required
                  type="date"
                  className={inputClass + ' mt-2'}
                  value={form.dob}
                  onChange={event =>
                    updateForm('dob', event.target.value)
                  }
                />
              </label>

              <label className={labelClass}>
                Residential Address (optional)

                <textarea
                  rows={2}
                  maxLength={500}
                  className={inputClass + ' mt-2'}
                  value={form.address}
                  onChange={event =>
                    updateForm('address', event.target.value)
                  }
                />
              </label>

              <label className={labelClass}>
                Create Password (8+ characters)

                <div className="relative mt-2">
                  <input
                    required
                    minLength={8}
                    maxLength={128}
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    autoComplete="new-password"
                    className={inputClass + ' pr-12'}
                    value={form.password}
                    onChange={event =>
                      updateForm(
                        'password',
                        event.target.value
                      )
                    }
                  />

                  <button
                    type="button"
                    aria-label="Show or hide password"
                    onClick={() =>
                      setShowPassword(value => !value)
                    }
                    className="absolute right-3 top-3"
                  >
                    {showPassword
                      ? <EyeOff size={18} />
                      : <Eye size={18} />
                    }
                  </button>
                </div>
              </label>

              <label className={labelClass}>
                Confirm Password

                <input
                  required
                  minLength={8}
                  maxLength={128}
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  autoComplete="new-password"
                  className={inputClass + ' mt-2'}
                  value={form.confirmPassword}
                  onChange={event =>
                    updateForm(
                      'confirmPassword',
                      event.target.value
                    )
                  }
                />
              </label>

              <p className="text-xs text-[#c9b58f]">
                Profile बनाने से Jewellery Scheme शुरू नहीं होती।
                Login के बाद Scheme अलग से Join कर सकते हैं।
              </p>
            </>
          )}

          <p className="flex items-center justify-center gap-2 text-[11px] text-[#c9b58f]">
            <ShieldCheck size={14} />
            Secure Customer Account
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#c9a76b] py-3.5 font-black text-stone-950 disabled:opacity-50"
          >
            {loading
              ? 'Please wait...'
              : mode === 'login'
                ? 'Login to Passbook'
                : 'Create Profile & Login'
            }
          </button>
        </form>
      </section>
    </div>
  );
}