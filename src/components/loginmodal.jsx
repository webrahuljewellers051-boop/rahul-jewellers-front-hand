
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  X,
  UserRound,
  Phone,
  LockKeyhole,
  Eye,
  EyeOff,
  CalendarDays,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Gem,
  Loader2,
  CheckCircle2,
  IdCard
} from 'lucide-react';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://rahul-jewellers-backend-jlr0.onrender.com';

const inputClass =
  'w-full rounded-xl border border-[#D6BD8B]/20 ' +
  'bg-white/[0.045] px-4 py-3 text-sm text-white ' +
  'outline-none transition ' +
  'placeholder:text-white/30 ' +
  'focus:border-[#D9B977]/70 ' +
  'focus:bg-white/[0.075]';

const labelClass =
  'mb-2 block text-[11px] font-semibold ' +
  'uppercase tracking-[0.13em] text-[#D8C6A6]';

const initialRegisterForm = {
  name: '',
  dob: '',
  phone: '',
  address: '',
  password: '',
  confirmPassword: ''
};

export default function CustomerLoginModal({
  isOpen,
  onClose,
  onLoginSuccess
}) {
  const [mode, setMode] = useState('login');

  const [identifier, setIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [registerForm, setRegisterForm] = useState(
    initialRegisterForm
  );

  const [showLoginPassword, setShowLoginPassword] =
    useState(false);

  const [showRegisterPassword, setShowRegisterPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [registeredCustomer, setRegisteredCustomer] =
    useState(null);

  const [registeredToken, setRegisteredToken] =
    useState('');

  useEffect(() => {
    if (!isOpen) {
      setError('');
      setLoading(false);
      return;
    }

    const handleEscape = event => {
      if (event.key === 'Escape' && !loading) {
        onClose?.();
      }
    };

    document.addEventListener(
      'keydown',
      handleEscape
    );

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener(
        'keydown',
        handleEscape
      );

      document.body.style.overflow =
        previousOverflow;
    };
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const today = new Date()
    .toISOString()
    .slice(0, 10);

  const switchMode = nextMode => {
    if (loading) return;

    setMode(nextMode);
    setError('');
    setShowLoginPassword(false);
    setShowRegisterPassword(false);
    setShowConfirmPassword(false);
  };

  const updateRegisterField = (field, value) => {
    setRegisterForm(previous => ({
      ...previous,
      [field]: value
    }));

    if (error) {
      setError('');
    }
  };

  const saveCustomerSession = (customer, token) => {
    if (!customer?._id || !token) {
      throw new Error(
        'Login session could not be created.'
      );
    }

    // Backend customer JWT.
    localStorage.setItem(
      'customer_token',
      token
    );

    // Existing Home.jsx compatibility.
    localStorage.setItem(
      'schemeUserInfo',
      JSON.stringify(customer)
    );

    // Home.jsx will receive the customer object.
    onLoginSuccess?.(customer, token);
  };

  const getApiError = (error, fallback) => {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      (
        !error.response
          ? 'Unable to connect to the server. Please try again.'
          : fallback
      )
    );
  };

  const handleLogin = async event => {
    event.preventDefault();

    if (loading) return;

    const cleanIdentifier = identifier.trim();

    if (!cleanIdentifier || !loginPassword) {
      setError(
        'Please enter your mobile number / Customer ID and password.'
      );
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/customer/login`,
        {
          identifier: cleanIdentifier,
          password: loginPassword
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 20000
        }
      );

      const { success, customer, token } =
        response.data || {};

      if (!success || !customer || !token) {
        throw new Error(
          'Invalid login response. Please try again.'
        );
      }

      saveCustomerSession(customer, token);

      setIdentifier('');
      setLoginPassword('');
      setError('');
    } catch (err) {
      setError(
        err.response
          ? getApiError(
              err,
              'Login failed. Please check your details.'
            )
          : err.message ||
            'Unable to login. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async event => {
    event.preventDefault();

    if (loading) return;

    const name = registerForm.name.trim();

    const phone = registerForm.phone
      .replace(/\D/g, '')
      .replace(/^91(?=\d{10}$)/, '');

    const {
      dob,
      address,
      password,
      confirmPassword
    } = registerForm;

    if (name.length < 2) {
      setError(
        'Please enter your full name.'
      );
      return;
    }

    if (!dob || dob > today) {
      setError(
        'Please select a valid date of birth.'
      );
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError(
        'Please enter a valid 10-digit Indian mobile number.'
      );
      return;
    }

    if (password.length < 8) {
      setError(
        'Password must contain at least 8 characters.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        'Password and Confirm Password do not match.'
      );
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/customer/register`,
        {
          name,
          dob,
          phone,
          address: address.trim(),
          password,
          confirmPassword
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 20000
        }
      );

      const {
        success,
        customer,
        token
      } = response.data || {};

      if (!success || !customer || !token) {
        throw new Error(
          'Registration response was incomplete.'
        );
      }

      setRegisteredCustomer(customer);
      setRegisteredToken(token);
      setRegisterForm(initialRegisterForm);
      setMode('success');
    } catch (err) {
      setError(
        err.response
          ? getApiError(
              err,
              'Unable to create your profile.'
            )
          : err.message ||
            'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleContinueAfterRegistration = () => {
    try {
      saveCustomerSession(
        registeredCustomer,
        registeredToken
      );

      setRegisteredCustomer(null);
      setRegisteredToken('');
      setMode('login');
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/85 p-3 backdrop-blur-md sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Rahul Jewellers Customer Account"
      onMouseDown={event => {
        if (
          event.target === event.currentTarget &&
          !loading
        ) {
          onClose?.();
        }
      }}
    >
      <div className="relative my-auto w-full max-w-[480px] overflow-hidden rounded-[28px] border border-[#D6B875]/30 bg-[#130F10] text-white shadow-[0_30px_100px_rgba(0,0,0,0.8)]">

        {/* GOLD TOP BORDER */}
        <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-[#E4C27C] to-transparent" />

        {/* HEADER */}
        <div className="relative overflow-hidden border-b border-[#D6B875]/15 px-5 pb-6 pt-7 text-center sm:px-8">

          <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[#C69C54]/10 blur-3xl" />

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition hover:border-[#D6B875]/40 hover:text-white disabled:opacity-40"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#D6B875]/40 bg-[#D6B875]/10 shadow-[0_0_30px_rgba(214,184,117,0.08)]">
            <Gem
              size={30}
              className="text-[#E4C27C]"
            />
          </div>

          <h2 className="font-serif text-[27px] tracking-[0.05em] text-[#F2DEB4] sm:text-[30px]">
            RAHUL JEWELLERS
          </h2>

          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.4em] text-[#C9AA72]">
            SHIVGANJ
          </p>

          <div className="mx-auto mt-4 h-px w-24 bg-gradient-to-r from-transparent via-[#C9AA72]/70 to-transparent" />

          <p className="mt-4 text-sm text-white/60">
            {mode === 'login'
              ? 'Welcome back to your jewellery account'
              : mode === 'register'
                ? 'Create your personal jewellery account'
                : 'Your profile has been created'}
          </p>
        </div>

        <div className="max-h-[65vh] overflow-y-auto px-5 py-6 sm:px-8">

          {/* LOGIN / REGISTER TABS */}
          {mode !== 'success' && (
            <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-black/25 p-1">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`rounded-lg px-3 py-3 text-xs font-bold transition sm:text-sm ${
                  mode === 'login'
                    ? 'bg-[#D8B571] text-[#21170C] shadow-lg'
                    : 'text-white/55 hover:text-white'
                }`}
              >
                Login
              </button>

              <button
                type="button"
                onClick={() => switchMode('register')}
                className={`rounded-lg px-3 py-3 text-xs font-bold transition sm:text-sm ${
                  mode === 'register'
                    ? 'bg-[#D8B571] text-[#21170C] shadow-lg'
                    : 'text-white/55 hover:text-white'
                }`}
              >
                Create New Profile
              </button>
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs leading-relaxed text-red-300"
            >
              {error}
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form
              onSubmit={handleLogin}
              className="space-y-5"
            >
              <div>
                <label
                  htmlFor="rj-login-identifier"
                  className={labelClass}
                >
                  Mobile Number / Customer ID
                </label>

                <div className="relative">
                  <UserRound
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C9AA72]"
                  />

                  <input
                    id="rj-login-identifier"
                    type="text"
                    autoComplete="username"
                    value={identifier}
                    onChange={event =>
                      setIdentifier(event.target.value)
                    }
                    placeholder="Mobile number or RJ Customer ID"
                    required
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="rj-login-password"
                  className={labelClass}
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C9AA72]"
                  />

                  <input
                    id="rj-login-password"
                    type={
                      showLoginPassword
                        ? 'text'
                        : 'password'
                    }
                    autoComplete="current-password"
                    value={loginPassword}
                    onChange={event =>
                      setLoginPassword(event.target.value)
                    }
                    placeholder="Enter your password"
                    required
                    className={`${inputClass} pl-11 pr-12`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowLoginPassword(
                        previous => !previous
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/45 transition hover:text-[#D8B571]"
                    aria-label={
                      showLoginPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                  >
                    {showLoginPassword
                      ? <EyeOff size={18} />
                      : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#B99452] via-[#E2C47F] to-[#B99452] px-5 py-3.5 text-sm font-bold text-[#21170C] shadow-[0_8px_30px_rgba(214,184,117,0.18)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Logging In...
                  </>
                ) : (
                  <>
                    Login to My Account
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <p className="text-center text-xs leading-relaxed text-white/50">
                New to Rahul Jewellers?{' '}
                <button
                  type="button"
                  onClick={() =>
                    switchMode('register')
                  }
                  className="font-semibold text-[#E4C27C] hover:underline"
                >
                  Create New Profile
                </button>
              </p>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === 'register' && (
            <form
              onSubmit={handleRegister}
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="rj-register-name"
                  className={labelClass}
                >
                  Full Name *
                </label>

                <div className="relative">
                  <UserRound
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C9AA72]"
                  />

                  <input
                    id="rj-register-name"
                    type="text"
                    autoComplete="name"
                    value={registerForm.name}
                    onChange={event =>
                      updateRegisterField(
                        'name',
                        event.target.value
                      )
                    }
                    placeholder="Enter your full name"
                    maxLength={100}
                    required
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="rj-register-dob"
                  className={labelClass}
                >
                  Date of Birth *
                </label>

                <div className="relative">
                  <CalendarDays
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#C9AA72]"
                  />

                  <input
                    id="rj-register-dob"
                    type="date"
                    min="1900-01-01"
                    max={today}
                    value={registerForm.dob}
                    onChange={event =>
                      updateRegisterField(
                        'dob',
                        event.target.value
                      )
                    }
                    required
                    className={`${inputClass} pl-11 [color-scheme:dark]`}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="rj-register-phone"
                  className={labelClass}
                >
                  Mobile Number *
                </label>

                <div className="relative">
                  <Phone
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C9AA72]"
                  />

                  <input
                    id="rj-register-phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    value={registerForm.phone}
                    onChange={event =>
                      updateRegisterField(
                        'phone',
                        event.target.value
                      )
                    }
                    placeholder="10-digit mobile number"
                    maxLength={13}
                    required
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="rj-register-address"
                  className={labelClass}
                >
                  Address (Optional)
                </label>

                <div className="relative">
                  <MapPin
                    size={17}
                    className="absolute left-4 top-4 text-[#C9AA72]"
                  />

                  <textarea
                    id="rj-register-address"
                    value={registerForm.address}
                    onChange={event =>
                      updateRegisterField(
                        'address',
                        event.target.value
                      )
                    }
                    placeholder="Your address"
                    rows={2}
                    maxLength={500}
                    className={`${inputClass} resize-none pl-11`}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="rj-register-password"
                  className={labelClass}
                >
                  Create Password *
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C9AA72]"
                  />

                  <input
                    id="rj-register-password"
                    type={
                      showRegisterPassword
                        ? 'text'
                        : 'password'
                    }
                    autoComplete="new-password"
                    value={registerForm.password}
                    onChange={event =>
                      updateRegisterField(
                        'password',
                        event.target.value
                      )
                    }
                    placeholder="Minimum 8 characters"
                    minLength={8}
                    required
                    className={`${inputClass} pl-11 pr-12`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowRegisterPassword(
                        previous => !previous
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/45 hover:text-[#D8B571]"
                    aria-label="Toggle password visibility"
                  >
                    {showRegisterPassword
                      ? <EyeOff size={18} />
                      : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="rj-register-confirm"
                  className={labelClass}
                >
                  Confirm Password *
                </label>

                <div className="relative">
                  <ShieldCheck
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C9AA72]"
                  />

                  <input
                    id="rj-register-confirm"
                    type={
                      showConfirmPassword
                        ? 'text'
                        : 'password'
                    }
                    autoComplete="new-password"
                    value={
                      registerForm.confirmPassword
                    }
                    onChange={event =>
                      updateRegisterField(
                        'confirmPassword',
                        event.target.value
                      )
                    }
                    placeholder="Enter password again"
                    required
                    className={`${inputClass} pl-11 pr-12`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        previous => !previous
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/45 hover:text-[#D8B571]"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword
                      ? <EyeOff size={18} />
                      : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-[#D6B875]/20 bg-[#D6B875]/[0.055] p-4">
                <div className="flex items-start gap-3">
                  <Gem
                    size={19}
                    className="mt-0.5 shrink-0 text-[#D8B571]"
                  />

                  <div>
                    <p className="text-xs font-bold text-[#E9D5AA]">
                      Gold Savings Scheme
                    </p>

                    <p className="mt-1 text-[11px] leading-relaxed text-white/55">
                      Creating a customer profile does
                      not automatically enroll you in
                      the Gold Savings Scheme.
                      You can join separately.
                    </p>

                    <p className="mt-2 text-[11px] leading-relaxed text-[#D9BD88]">
                      Pay 12 monthly installments.
                      Eligible labour/making charge
                      benefit becomes available in
                      the following month, subject
                      to scheme terms.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#B99452] via-[#E2C47F] to-[#B99452] px-5 py-3.5 text-sm font-bold text-[#21170C] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Creating Profile...
                  </>
                ) : (
                  <>
                    Create My Profile
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <p className="text-center text-xs text-white/50">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() =>
                    switchMode('login')
                  }
                  className="font-semibold text-[#E4C27C] hover:underline"
                >
                  Login Here
                </button>
              </p>
            </form>
          )}

          {/* REGISTRATION SUCCESS */}
          {mode === 'success' &&
            registeredCustomer && (
              <div className="py-3 text-center">

                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10">
                  <CheckCircle2
                    size={40}
                    className="text-emerald-400"
                  />
                </div>

                <h3 className="mt-5 font-serif text-2xl text-[#F2DEB4]">
                  Profile Created!
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  Welcome to Rahul Jewellers,
                  Shivganj.
                </p>

                <div className="mt-6 rounded-2xl border border-[#D6B875]/30 bg-[#D6B875]/10 p-5">
                  <div className="flex items-center justify-center gap-2 text-[#D6B875]">
                    <IdCard size={18} />

                    <span className="text-[11px] font-semibold uppercase tracking-widest">
                      Your Customer ID
                    </span>
                  </div>

                  <p className="mt-3 font-serif text-3xl font-bold tracking-wider text-[#F3D79A]">
                    {registeredCustomer.customerId}
                  </p>

                  <p className="mt-2 text-xs text-white/55">
                    Please save this ID for future login.
                  </p>
                </div>

                <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.035] p-4 text-left">
                  <p className="text-xs text-white/65">
                    <span className="font-semibold text-[#E4C27C]">
                      Account:
                    </span>{' '}
                    {registeredCustomer.name}
                  </p>

                  <p className="mt-2 text-xs text-white/65">
                    <span className="font-semibold text-[#E4C27C]">
                      Mobile:
                    </span>{' '}
                    {registeredCustomer.phone}
                  </p>

                  <p className="mt-3 text-xs leading-relaxed text-white/55">
                    Your profile is active. The
                    Gold Savings Scheme is optional
                    and can be joined separately.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    handleContinueAfterRegistration
                  }
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#B99452] via-[#E2C47F] to-[#B99452] px-5 py-3.5 text-sm font-bold text-[#21170C] transition hover:brightness-110"
                >
                  Open My Account
                  <ArrowRight size={18} />
                </button>
              </div>
            )}
        </div>

        {/* FOOTER */}
        <div className="border-t border-[#D6B875]/15 bg-black/20 px-5 py-4 text-center">
          <p className="flex items-center justify-center gap-2 text-[10px] tracking-wide text-white/45">
            <ShieldCheck
              size={14}
              className="text-[#D6B875]"
            />
            Rahul Jewellers · Shivganj · Secure Customer Access
          </p>
        </div>
      </div>
    </div>
  );
}
