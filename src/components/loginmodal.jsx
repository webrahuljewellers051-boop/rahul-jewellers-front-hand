
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  X,
  LogIn,
  Sparkles,
  Eye,
  EyeOff,
  User,
  Lock,
  ShieldCheck,
  Phone,
  MapPin,
  Calendar,
  UserPlus,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  CreditCard,
  Copy,
  Check
} from 'lucide-react';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'https://rahul-jewellers-backend-jlr0.onrender.com';

const requestConfig = {
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  },
  timeout: 25000
};

const emptyRegistration = {
  name: '',
  dob: '',
  phone: '',
  address: '',
  password: '',
  confirmPassword: ''
};

const inputClass =
  'w-full rounded-xl border border-[#C9A76B]/30 bg-[#100B0C] ' +
  'px-4 py-3 text-sm text-[#F4E8CB] outline-none ' +
  'placeholder:text-[#887763] focus:border-[#E6CC8D]';

const labelClass =
  'mb-2 flex items-center gap-2 text-[10px] font-bold ' +
  'uppercase tracking-[0.13em] text-[#D9BD83]';

function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label className={labelClass}>
        <Icon size={14} />
        {label}
      </label>
      {children}
    </div>
  );
}

export default function CustomerLoginModal({
  isOpen,
  onClose,
  onLoginSuccess
}) {
  const [view, setView] = useState('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [registration, setRegistration] = useState(emptyRegistration);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registeredAccount, setRegisteredAccount] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onEscape = event => {
      if (event.key === 'Escape' && !loading) {
        onClose?.();
      }
    };

    document.addEventListener('keydown', onEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onEscape);
    };
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const switchView = next => {
    setView(next);
    setError('');
    setShowLoginPassword(false);
    setShowRegisterPassword(false);
  };

  const updateRegistration = (key, value) => {
    setRegistration(previous => ({
      ...previous,
      [key]: value
    }));

    if (error) setError('');
  };

  const finishLogin = (customer, token) => {
    if (!customer || !token) {
      setError('Login response was incomplete. Please try again.');
      return;
    }

    localStorage.setItem('customer_token', token);
    localStorage.setItem('schemeUserInfo', JSON.stringify(customer));

    setIdentifier('');
    setPassword('');
    setRegistration(emptyRegistration);
    setRegisteredAccount(null);
    setError('');
    setView('login');

    onLoginSuccess?.(customer, token);
    onClose?.();
  };

  const handleLogin = async event => {
    event.preventDefault();

    if (loading) return;

    setError('');

    if (!identifier.trim() || !password) {
      setError('Please enter your Customer ID / mobile and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/customer/login`,
        {
          identifier: identifier.trim(),
          password
        },
        requestConfig
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || 'Login failed.'
        );
      }

      finishLogin(
        response.data.customer,
        response.data.token
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Unable to log in. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async event => {
    event.preventDefault();

    if (loading) return;

    setError('');

    const data = {
      name: registration.name.trim(),
      dob: registration.dob,
      phone: registration.phone.replace(/\D/g, ''),
      address: registration.address.trim(),
      password: registration.password,
      confirmPassword: registration.confirmPassword
    };

    if (!data.name || !data.dob || !data.phone || !data.address) {
      setError('Please fill in all profile details.');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(data.phone)) {
      setError('Enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (data.dob > new Date().toISOString().slice(0, 10)) {
      setError('Date of birth cannot be in the future.');
      return;
    }

    if (data.password.length < 8 || data.password.length > 128) {
      setError('Password must be between 8 and 128 characters.');
      return;
    }

    if (data.password !== data.confirmPassword) {
      setError('Password and confirm password do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/customer/register`,
        data,
        requestConfig
      );

      if (!response.data?.success || !response.data?.customer) {
        throw new Error(
          response.data?.message || 'Registration failed.'
        );
      }

      setRegisteredAccount({
        customer: response.data.customer,
        token: response.data.token || ''
      });

      setPassword('');
      setRegistration(emptyRegistration);
      setView('success');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Unable to create account. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const copyCustomerId = async () => {
    const id = registeredAccount?.customer?.customerId;

    if (!id) return;

    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
    } catch {
      setError('Please select and copy your Customer ID manually.');
    }
  };

  const isRegister = view === 'register';
  const isSuccess = view === 'success';

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/85 p-3 backdrop-blur-md sm:p-5"
      onMouseDown={event => {
        if (event.target === event.currentTarget && !loading) {
          onClose?.();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={
          isSuccess
            ? 'Account created'
            : isRegister
              ? 'Create customer account'
              : 'Customer login'
        }
        className="relative my-auto w-full max-w-md overflow-hidden rounded-3xl border border-[#C9A76B]/40 bg-[#171011] shadow-2xl"
      >
        <div className="h-1 bg-gradient-to-r from-transparent via-[#D9BD83] to-transparent" />

        <button
          type="button"
          onClick={() => !loading && onClose?.()}
          disabled={loading}
          aria-label="Close"
          className="absolute right-4 top-5 z-10 rounded-full p-2 text-[#D9BD83] hover:bg-white/10 disabled:opacity-40"
        >
          <X size={19} />
        </button>

        <div className="max-h-[88vh] overflow-y-auto px-5 pb-6 pt-7 sm:px-7">

          {/* HEADER */}
          <div className="mb-5 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#D9BD83]/40 bg-[#D9BD83]/10">
              {isSuccess ? (
                <CheckCircle2
                  size={28}
                  className="text-emerald-400"
                />
              ) : isRegister ? (
                <UserPlus
                  size={26}
                  className="text-[#D9BD83]"
                />
              ) : (
                <Sparkles
                  size={27}
                  className="text-[#D9BD83]"
                />
              )}
            </div>

            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#C9A76B]">
              Elegance · Heritage · Trust
            </p>

            <h2 className="mt-2 font-serif text-2xl font-semibold text-[#F4E8CB]">
              RAHUL JEWELLERS
            </h2>

            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.25em] text-[#C9A76B]">
              SHIVGANJ
            </p>

            <p className="mt-4 text-xs text-[#BDAE96]">
              {isSuccess
                ? 'Your customer account is ready.'
                : isRegister
                  ? 'Create your customer account securely.'
                  : 'Login to your customer account.'}
            </p>
          </div>

          {/* ERROR */}
          {error && (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-red-500/40 bg-red-950/40 p-3 text-xs leading-relaxed text-red-200"
            >
              {error}
            </div>
          )}

          {/* LOGIN */}
          {view === 'login' && (
            <form
              onSubmit={handleLogin}
              className="space-y-4"
            >
              <Field
                label="Customer ID or Mobile"
                icon={User}
              >
                <input
                  className={inputClass}
                  type="text"
                  autoComplete="username"
                  required
                  value={identifier}
                  onChange={event =>
                    setIdentifier(event.target.value)
                  }
                  placeholder="RJ Customer ID / 10-digit mobile"
                />
              </Field>

              <Field
                label="Password"
                icon={Lock}
              >
                <div className="relative">
                  <input
                    className={`${inputClass} pr-12`}
                    type={
                      showLoginPassword
                        ? 'text'
                        : 'password'
                    }
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={event =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter your password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowLoginPassword(previous => !previous)
                    }
                    aria-label={
                      showLoginPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#D9BD83]"
                  >
                    {showLoginPassword
                      ? <EyeOff size={17} />
                      : <Eye size={17} />}
                  </button>
                </div>
              </Field>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#E6CC8D] to-[#B38A48] py-3.5 text-xs font-black uppercase tracking-wider text-[#171011] hover:brightness-110 disabled:opacity-60"
              >
                {loading ? (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <LogIn size={17} />
                )}

                {loading
                  ? 'Logging in...'
                  : 'Login to My Account'}
              </button>

              <div className="border-t border-[#D9BD83]/20 pt-4 text-center">
                <p className="mb-3 text-xs text-[#BDAE96]">
                  Don't have an account?
                </p>

                <button
                  type="button"
                  onClick={() =>
                    switchView('register')
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-[#D9BD83]/50 px-5 py-2.5 text-xs font-bold text-[#F4E8CB] hover:bg-[#D9BD83]/10"
                >
                  <UserPlus size={16} />
                  Create New Profile
                </button>
              </div>
            </form>
          )}

          {/* REGISTRATION */}
          {isRegister && (
            <form
              onSubmit={handleRegister}
              className="space-y-4"
            >
              <Field
                label="Full Name"
                icon={User}
              >
                <input
                  className={inputClass}
                  type="text"
                  autoComplete="name"
                  required
                  maxLength={100}
                  value={registration.name}
                  onChange={event =>
                    updateRegistration(
                      'name',
                      event.target.value
                    )
                  }
                  placeholder="Your full name"
                />
              </Field>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  label="Date of Birth"
                  icon={Calendar}
                >
                  <input
                    className={inputClass}
                    type="date"
                    required
                    max={
                      new Date()
                        .toISOString()
                        .slice(0, 10)
                    }
                    value={registration.dob}
                    onChange={event =>
                      updateRegistration(
                        'dob',
                        event.target.value
                      )
                    }
                  />
                </Field>

                <Field
                  label="Mobile Number"
                  icon={Phone}
                >
                  <input
                    className={inputClass}
                    type="tel"
                    autoComplete="tel"
                    inputMode="numeric"
                    required
                    maxLength={10}
                    value={registration.phone}
                    onChange={event =>
                      updateRegistration(
                        'phone',
                        event.target.value
                          .replace(/\D/g, '')
                          .slice(0, 10)
                      )
                    }
                    placeholder="10-digit mobile"
                  />
                </Field>
              </div>

              <Field
                label="Residential Address"
                icon={MapPin}
              >
                <textarea
                  className={`${inputClass} resize-none`}
                  rows={2}
                  required
                  maxLength={500}
                  value={registration.address}
                  onChange={event =>
                    updateRegistration(
                      'address',
                      event.target.value
                    )
                  }
                  placeholder="House, street, city, PIN code"
                />
              </Field>

              <Field
                label="Create Password"
                icon={Lock}
              >
                <div className="relative">
                  <input
                    className={`${inputClass} pr-12`}
                    type={
                      showRegisterPassword
                        ? 'text'
                        : 'password'
                    }
                    autoComplete="new-password"
                    required
                    minLength={8}
                    maxLength={128}
                    value={registration.password}
                    onChange={event =>
                      updateRegistration(
                        'password',
                        event.target.value
                      )
                    }
                    placeholder="Minimum 8 characters"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowRegisterPassword(
                        previous => !previous
                      )
                    }
                    aria-label={
                      showRegisterPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#D9BD83]"
                  >
                    {showRegisterPassword
                      ? <EyeOff size={17} />
                      : <Eye size={17} />}
                  </button>
                </div>
              </Field>

              <Field
                label="Confirm Password"
                icon={Lock}
              >
                <input
                  className={inputClass}
                  type={
                    showRegisterPassword
                      ? 'text'
                      : 'password'
                  }
                  autoComplete="new-password"
                  required
                  minLength={8}
                  maxLength={128}
                  value={registration.confirmPassword}
                  onChange={event =>
                    updateRegistration(
                      'confirmPassword',
                      event.target.value
                    )
                  }
                  placeholder="Re-enter password"
                />
              </Field>

              <div className="flex items-start gap-2 rounded-xl border border-[#D9BD83]/20 bg-[#D9BD83]/5 p-3 text-[11px] leading-relaxed text-[#BDAE96]">
                <ShieldCheck
                  size={17}
                  className="mt-0.5 shrink-0 text-[#D9BD83]"
                />
                Creating a customer account does not automatically join the Gold Savings Scheme.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#E6CC8D] to-[#B38A48] py-3.5 text-xs font-black uppercase tracking-wider text-[#171011] hover:brightness-110 disabled:opacity-60"
              >
                {loading ? (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <UserPlus size={17} />
                )}

                {loading
                  ? 'Creating Account...'
                  : 'Create My Account'}
              </button>

              <button
                type="button"
                onClick={() =>
                  switchView('login')
                }
                className="flex w-full items-center justify-center gap-2 py-2 text-xs font-semibold text-[#D9BD83] hover:text-white"
              >
                <ArrowLeft size={15} />
                Back to Login
              </button>
            </form>
          )}

          {/* REGISTRATION SUCCESS */}
          {isSuccess && registeredAccount && (
            <div className="space-y-5 text-center">

              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-4">
                <CheckCircle2
                  size={24}
                  className="mx-auto mb-2 text-emerald-400"
                />

                <h3 className="text-sm font-bold text-[#F4E8CB]">
                  Registration Successful!
                </h3>

                <p className="mt-2 text-xs text-[#BDAE96]">
                  Save your Customer ID. You can log in using this ID or your mobile number.
                </p>
              </div>

              <div className="rounded-2xl border border-[#D9BD83]/40 bg-[#100B0C] p-4">
                <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#D9BD83]">
                  <CreditCard size={18} />
                  Customer ID
                </div>

                <p className="mt-3 select-all break-all font-mono text-xl font-black tracking-wider text-[#F4E8CB]">
                  {registeredAccount.customer.customerId}
                </p>

                <button
                  type="button"
                  onClick={copyCustomerId}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg border border-[#D9BD83]/40 px-3 py-2 text-xs font-bold text-[#D9BD83]"
                >
                  {copied
                    ? <Check size={15} />
                    : <Copy size={15} />}

                  {copied
                    ? 'Copied'
                    : 'Copy Customer ID'}
                </button>
              </div>

              <p className="text-xs leading-relaxed text-[#BDAE96]">
                Your account is ready. You can choose to join the Gold Savings Scheme separately after logging in.
              </p>

              <button
                type="button"
                onClick={() => {
                  if (registeredAccount.token) {
                    finishLogin(
                      registeredAccount.customer,
                      registeredAccount.token
                    );
                  } else {
                    setIdentifier(
                      registeredAccount.customer.customerId || ''
                    );
                    switchView('login');
                  }
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#E6CC8D] to-[#B38A48] py-3.5 text-xs font-black uppercase text-[#171011]"
              >
                <LogIn size={17} />

                {registeredAccount.token
                  ? 'Continue to My Account'
                  : 'Go to Login'}
              </button>
            </div>
          )}

          {/* FOOTER */}
          <div className="mt-6 flex items-center justify-center gap-2 border-t border-[#D9BD83]/15 pt-4 text-[10px] text-[#887763]">
            <ShieldCheck
              size={14}
              className="text-[#D9BD83]"
            />
            Secure Customer Portal · Rahul Jewellers Shivganj
          </div>

        </div>
      </div>
    </div>
  );
}
