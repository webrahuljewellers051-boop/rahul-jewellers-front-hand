
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  X, LogIn, UserPlus, Eye, EyeOff, Lock,
  User, Phone, Calendar, MapPin, Loader2,
  ShieldCheck, CreditCard, CheckCircle2
} from 'lucide-react';

const API = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'https://rahul-jewellers-backend-jlr0.onrender.com'
).replace(/\/$/, '');

const initial = {
  name: '',
  dob: '',
  phone: '',
  address: '',
  password: '',
  confirmPassword: ''
};

const input =
  'w-full rounded-xl border border-[#c9a76b]/40 ' +
  'bg-[#100b0c] px-4 py-3 text-sm text-[#f4e8cb] ' +
  'outline-none focus:border-[#e6cc8d]';

function message(error) {
  return (
    error.response?.data?.message ||
    (
      error.code === 'ERR_NETWORK'
        ? 'Network Error: Backend is unavailable or CORS_ORIGINS does not include this website.'
        : error.message || 'Please try again.'
    )
  );
}

export default function CustomerLoginModal({
  isOpen,
  onClose,
  onLoginSuccess
}) {
  const [mode, setMode] = useState('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [form, setForm] = useState(initial);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const update = (key, value) => {
    setForm(previous => ({
      ...previous,
      [key]: value
    }));
  };

  const openMode = next => {
    setMode(next);
    setError('');
    setVisible(false);
  };

  const enter = (customer, token) => {
    if (!customer || !token) {
      setError(
        'Missing customer session. Please log in again.'
      );
      return;
    }

    localStorage.setItem('customer_token', token);
    localStorage.setItem(
      'schemeUserInfo',
      JSON.stringify(customer)
    );

    onLoginSuccess?.(customer, token);
    onClose?.();
  };

  async function login(event) {
    event.preventDefault();

    setError('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${API}/api/customer/login`,
        {
          identifier: identifier.trim(),
          password
        },
        {
          timeout: 30000
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || 'Login failed.'
        );
      }

      enter(
        response.data.customer,
        response.data.token
      );
    } catch (err) {
      setError(message(err));
    } finally {
      setLoading(false);
    }
  }

  async function register(event) {
    event.preventDefault();

    setError('');

    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      setError('Enter a valid Indian mobile number.');
      return;
    }

    if (form.password.length < 8) {
      setError(
        'Password must be at least 8 characters.'
      );
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API}/api/customer/register`,
        form,
        {
          timeout: 30000
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
          'Registration failed.'
        );
      }

      setCreated({
        customer: response.data.customer,
        token: response.data.token
      });

      setMode('created');
      setForm(initial);
    } catch (err) {
      setError(message(err));
    } finally {
      setLoading(false);
    }
  }

  const field = (
    label,
    Icon,
    key,
    type = 'text',
    extra = {}
  ) => (
    <label className="block text-xs font-bold text-[#d9bd83]">
      <span className="mb-2 flex items-center gap-2">
        <Icon size={15} />
        {label}
      </span>

      <input
        className={input}
        type={type}
        required
        value={form[key]}
        onChange={event => {
          const value = key === 'phone'
            ? event.target.value
                .replace(/\D/g, '')
                .slice(0, 10)
            : event.target.value;

          update(key, value);
        }}
        {...extra}
      />
    </label>
  );

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/85 p-3"
      onMouseDown={event => {
        if (
          event.target === event.currentTarget &&
          !loading
        ) {
          onClose?.();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="relative my-auto max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-[#d9bd83]/40 bg-[#171011] p-6 text-[#f4e8cb] shadow-2xl"
      >
        <button
          type="button"
          aria-label="Close"
          className="absolute right-4 top-4 text-[#d9bd83]"
          onClick={onClose}
        >
          <X />
        </button>

        <div className="mb-6 text-center">
          <ShieldCheck
            size={31}
            className="mx-auto mb-2 text-[#d9bd83]"
          />

          <h2 className="font-serif text-2xl font-bold">
            RAHUL JEWELLERS
          </h2>

          <p className="text-xs font-bold tracking-[.3em] text-[#d9bd83]">
            SHEOGANJ
          </p>

          <p className="mt-3 text-xs text-[#c8b69b]">
            {mode === 'login'
              ? 'Customer Login'
              : mode === 'register'
                ? 'Create Your Customer Profile'
                : 'Registration Successful'}
          </p>
        </div>

        {error && (
          <p
            role="alert"
            className="mb-4 rounded-xl border border-red-500/40 bg-red-950/40 p-3 text-xs text-red-200"
          >
            {error}
          </p>
        )}

        {mode === 'login' && (
          <form
            onSubmit={login}
            className="space-y-4"
          >
            <label className="block text-xs text-[#d9bd83]">
              Customer ID / Mobile

              <input
                className={`${input} mt-2`}
                required
                autoComplete="username"
                value={identifier}
                onChange={event =>
                  setIdentifier(event.target.value)
                }
                placeholder="RJ Customer ID or Mobile"
              />
            </label>

            <label className="block text-xs text-[#d9bd83]">
              Password

              <div className="relative mt-2">
                <input
                  className={`${input} pr-12`}
                  required
                  type={visible ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={event =>
                    setPassword(event.target.value)
                  }
                />

                <button
                  type="button"
                  aria-label="Show password"
                  className="absolute right-3 top-3 text-[#d9bd83]"
                  onClick={() =>
                    setVisible(!visible)
                  }
                >
                  {visible
                    ? <EyeOff size={19} />
                    : <Eye size={19} />}
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center gap-2 rounded-xl bg-[#d9bd83] p-3 font-bold text-[#171011] disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <LogIn />
              )}

              Login
            </button>

            <button
              type="button"
              className="w-full text-xs text-[#d9bd83] underline"
              onClick={() =>
                openMode('register')
              }
            >
              Create New Profile
            </button>
          </form>
        )}

        {mode === 'register' && (
          <form
            onSubmit={register}
            className="space-y-4"
          >
            {field(
              'Full Name',
              User,
              'name',
              'text',
              {
                maxLength: 100,
                autoComplete: 'name'
              }
            )}

            {field(
              'Date of Birth',
              Calendar,
              'dob',
              'date',
              {
                max: new Date()
                  .toISOString()
                  .slice(0, 10)
              }
            )}

            {field(
              'Mobile Number',
              Phone,
              'phone',
              'tel',
              {
                maxLength: 10,
                inputMode: 'numeric'
              }
            )}

            <label className="block text-xs font-bold text-[#d9bd83]">
              <span className="mb-2 flex items-center gap-2">
                <MapPin size={15} />
                Address
              </span>

              <textarea
                className={input}
                required
                rows={2}
                maxLength={500}
                value={form.address}
                onChange={event =>
                  update(
                    'address',
                    event.target.value
                  )
                }
              />
            </label>

            {field(
              'Password (8+ characters)',
              Lock,
              'password',
              visible ? 'text' : 'password',
              {
                minLength: 8,
                maxLength: 128,
                autoComplete: 'new-password'
              }
            )}

            {field(
              'Confirm Password',
              Lock,
              'confirmPassword',
              visible ? 'text' : 'password',
              {
                minLength: 8,
                maxLength: 128,
                autoComplete: 'new-password'
              }
            )}

            <button
              type="button"
              className="text-xs text-[#d9bd83]"
              onClick={() =>
                setVisible(!visible)
              }
            >
              {visible
                ? 'Hide passwords'
                : 'Show passwords'}
            </button>

            <p className="text-xs text-[#c8b69b]">
              Creating a profile does not automatically
              join the Gold Scheme. You choose your
              fixed monthly amount separately.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center gap-2 rounded-xl bg-[#d9bd83] p-3 font-bold text-[#171011] disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <UserPlus />
              )}

              Create Profile
            </button>

            <button
              type="button"
              className="w-full text-xs text-[#d9bd83] underline"
              onClick={() =>
                openMode('login')
              }
            >
              Back to Login
            </button>
          </form>
        )}

        {mode === 'created' && created && (
          <div className="space-y-4 text-center">
            <CheckCircle2
              className="mx-auto text-emerald-400"
              size={35}
            />

            <p className="text-sm">
              Save your Customer ID:
            </p>

            <p className="select-all break-all rounded-xl border border-[#d9bd83]/40 p-4 font-mono text-xl font-bold">
              {created.customer.customerId}
            </p>

            <p className="text-xs text-[#c8b69b]">
              Your account is created.
              You can join a Gold Scheme later.
            </p>

            <button
              type="button"
              className="flex w-full justify-center gap-2 rounded-xl bg-[#d9bd83] p-3 font-bold text-[#171011]"
              onClick={() =>
                enter(
                  created.customer,
                  created.token
                )
              }
            >
              <CreditCard />
              Continue to My Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
