
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  X, User, Phone, MapPin, Calendar, CreditCard,
  Lock, Eye, EyeOff, ShieldCheck, Save,
  Loader2, CheckCircle2, AlertCircle, Sparkles
} from 'lucide-react';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'https://rahul-jewellers-backend-jlr0.onrender.com';

const inputStyle =
  'w-full rounded-xl border border-[#C9A76B]/30 bg-[#100B0C] px-4 py-3 ' +
  'text-sm text-[#F4E8CB] outline-none placeholder:text-[#887763] ' +
  'focus:border-[#E6CC8D] disabled:opacity-50';

const initialProfile = {
  name: '',
  dob: '',
  phone: '',
  address: ''
};

function Field({ id, label, icon: Icon, children }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#D9BD83]"
      >
        <Icon size={15} />
        {label}
      </label>
      {children}
    </div>
  );
}

export default function CustomerProfileModal({
  isOpen,
  onClose,
  user,
  onUpdateUser
}) {
  const [tab, setTab] = useState('profile');
  const [profile, setProfile] = useState(initialProfile);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    setProfile({
      name: user?.name || '',
      dob: user?.dob
        ? String(user.dob).slice(0, 10)
        : '',
      phone: user?.phone || '',
      address: user?.address || ''
    });

    setTab('profile');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswords(false);
    setError('');
    setSuccess('');
  }, [isOpen, user?._id]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onEscape = (event) => {
      if (event.key === 'Escape' && !saving) {
        onClose?.();
      }
    };

    document.addEventListener('keydown', onEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onEscape);
    };
  }, [isOpen, saving, onClose]);

  if (!isOpen) return null;

  const setField = (key, value) => {
    setProfile((previous) => ({
      ...previous,
      [key]: value
    }));

    setError('');
    setSuccess('');
  };

  const getAuthConfig = () => {
    const token = localStorage.getItem('customer_token');

    if (!token) {
      throw new Error(
        'Your session has expired. Please log in again.'
      );
    }

    return {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true'
      },
      timeout: 25000
    };
  };

  const errorMessage = (err) => {
    if (
      err.response?.status === 401 ||
      err.response?.status === 403
    ) {
      return 'Your session has expired or access was denied. Please log in again.';
    }

    return (
      err.response?.data?.message ||
      err.message ||
      'Something went wrong. Please try again.'
    );
  };

  const syncUser = (updated) => {
    if (!updated) return;

    localStorage.setItem(
      'schemeUserInfo',
      JSON.stringify(updated)
    );

    onUpdateUser?.(updated);
  };

  const saveProfile = async (event) => {
    event.preventDefault();

    if (saving) return;

    setError('');
    setSuccess('');

    const name = profile.name.trim();
    const phone = profile.phone.replace(/\D/g, '');
    const address = profile.address.trim();

    if (!name) {
      setError('Please enter your full name.');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError(
        'Please enter a valid 10-digit Indian mobile number.'
      );
      return;
    }

    if (
      profile.dob &&
      profile.dob > new Date().toISOString().slice(0, 10)
    ) {
      setError('Date of birth cannot be in the future.');
      return;
    }

    if (!user?._id) {
      setError('Customer ID is missing. Please log in again.');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name,
        phone,
        address
      };

      if (profile.dob) {
        payload.dob = profile.dob;
      }

      const response = await axios.put(
        `${API_BASE_URL}/api/customer/update-profile/${user._id}`,
        payload,
        getAuthConfig()
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
          'Could not update profile.'
        );
      }

      const updated =
        response.data.customer ||
        response.data.user;

      if (updated) {
        syncUser(updated);
      }

      setSuccess(
        'Your profile has been updated successfully.'
      );
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();

    if (saving) return;

    setError('');
    setSuccess('');

    if (!currentPassword) {
      setError('Enter your current password.');
      return;
    }

    if (
      newPassword.length < 8 ||
      newPassword.length > 128
    ) {
      setError(
        'New password must contain 8 to 128 characters.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (newPassword === currentPassword) {
      setError('Choose a different new password.');
      return;
    }

    setSaving(true);

    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/customer/settings/update`,
        {
          currentPassword,
          password: newPassword
        },
        getAuthConfig()
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
          'Could not change password.'
        );
      }

      const updated =
        response.data.customer ||
        response.data.user;

      if (updated) {
        syncUser(updated);
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswords(false);

      setSuccess('Password changed successfully.');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const switchTab = (next) => {
    if (saving) return;

    setTab(next);
    setError('');
    setSuccess('');
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/85 p-3 backdrop-blur-md sm:p-5"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !saving
        ) {
          onClose?.();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Customer Profile"
        className="relative my-auto w-full max-w-lg overflow-hidden rounded-3xl border border-[#C9A76B]/40 bg-[#171011] shadow-2xl"
      >
        <div className="h-1 bg-gradient-to-r from-transparent via-[#D9BD83] to-transparent" />

        <button
          type="button"
          onClick={() => !saving && onClose?.()}
          disabled={saving}
          aria-label="Close profile"
          className="absolute right-4 top-4 rounded-full p-2 text-[#D9BD83] hover:bg-white/10 disabled:opacity-50"
        >
          <X size={20} />
        </button>

        <div className="max-h-[88vh] overflow-y-auto px-5 pb-6 pt-7 sm:px-7">

          {/* HEADER */}
          <div className="mb-5 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#D9BD83]/40 bg-[#D9BD83]/10">
              <Sparkles
                size={26}
                className="text-[#D9BD83]"
              />
            </div>

            <h2 className="font-serif text-2xl font-semibold text-[#F4E8CB]">
              RAHUL JEWELLERS
            </h2>

            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.25em] text-[#C9A76B]">
              SHIVGANJ
            </p>

            <p className="mt-3 text-xs text-[#BDAE96]">
              My Customer Profile
            </p>
          </div>

          {/* CUSTOMER ID */}
          <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-[#D9BD83]/25 bg-[#100B0C] p-3">
            <div className="min-w-0">
              <p className="mb-1 flex items-center gap-2 text-[10px] uppercase tracking-wider text-[#C9A76B]">
                <CreditCard size={14} />
                Customer ID
              </p>

              <p className="break-all font-mono text-sm font-bold text-[#F4E8CB]">
                {user?.customerId || 'Not available'}
              </p>
            </div>

            <span className="shrink-0 rounded-full border border-[#D9BD83]/30 px-2.5 py-1 text-[10px] text-[#D9BD83]">
              {user?.schemeJoined
                ? 'Scheme Joined'
                : 'Customer Account'}
            </span>
          </div>

          {/* TABS */}
          <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-[#100B0C] p-1">
            <button
              type="button"
              onClick={() => switchTab('profile')}
              className={`flex items-center justify-center gap-2 rounded-lg py-3 text-xs font-bold transition ${
                tab === 'profile'
                  ? 'bg-[#D9BD83] text-[#171011]'
                  : 'text-[#D9BD83] hover:bg-white/5'
              }`}
            >
              <User size={16} />
              Profile Details
            </button>

            <button
              type="button"
              onClick={() => switchTab('security')}
              className={`flex items-center justify-center gap-2 rounded-lg py-3 text-xs font-bold transition ${
                tab === 'security'
                  ? 'bg-[#D9BD83] text-[#171011]'
                  : 'text-[#D9BD83] hover:bg-white/5'
              }`}
            >
              <Lock size={16} />
              Password
            </button>
          </div>

          {/* ERROR */}
          {error && (
            <div
              role="alert"
              className="mb-4 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs leading-relaxed text-red-200"
            >
              <AlertCircle
                size={16}
                className="mt-0.5 shrink-0"
              />
              {error}
            </div>
          )}

          {/* SUCCESS */}
          {success && (
            <div
              role="status"
              className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs leading-relaxed text-emerald-200"
            >
              <CheckCircle2
                size={16}
                className="mt-0.5 shrink-0"
              />
              {success}
            </div>
          )}

          {/* PROFILE FORM */}
          {tab === 'profile' ? (
            <form
              onSubmit={saveProfile}
              className="space-y-4"
            >
              <Field
                id="rj-profile-name"
                label="Full Name"
                icon={User}
              >
                <input
                  id="rj-profile-name"
                  className={inputStyle}
                  required
                  maxLength={100}
                  autoComplete="name"
                  value={profile.name}
                  onChange={(e) =>
                    setField('name', e.target.value)
                  }
                  placeholder="Full name"
                />
              </Field>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  id="rj-profile-phone"
                  label="Mobile Number"
                  icon={Phone}
                >
                  <input
                    id="rj-profile-phone"
                    className={inputStyle}
                    type="tel"
                    inputMode="numeric"
                    required
                    maxLength={10}
                    autoComplete="tel"
                    value={profile.phone}
                    onChange={(e) =>
                      setField(
                        'phone',
                        e.target.value
                          .replace(/\D/g, '')
                          .slice(0, 10)
                      )
                    }
                    placeholder="10-digit mobile"
                  />
                </Field>

                <Field
                  id="rj-profile-dob"
                  label="Date of Birth"
                  icon={Calendar}
                >
                  <input
                    id="rj-profile-dob"
                    className={inputStyle}
                    type="date"
                    max={new Date().toISOString().slice(0, 10)}
                    value={profile.dob}
                    onChange={(e) =>
                      setField('dob', e.target.value)
                    }
                  />
                </Field>
              </div>

              <Field
                id="rj-profile-address"
                label="Address"
                icon={MapPin}
              >
                <textarea
                  id="rj-profile-address"
                  className={`${inputStyle} resize-none`}
                  rows={3}
                  maxLength={500}
                  value={profile.address}
                  onChange={(e) =>
                    setField('address', e.target.value)
                  }
                  placeholder="House, street, city and PIN code"
                />
              </Field>

              <button
                type="submit"
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#E6CC8D] to-[#B38A48] py-3.5 text-xs font-black uppercase tracking-wider text-[#171011] hover:brightness-110 disabled:opacity-60"
              >
                {saving ? (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <Save size={17} />
                )}

                {saving
                  ? 'Saving...'
                  : 'Save Profile Changes'}
              </button>
            </form>
          ) : (

            /* PASSWORD FORM */
            <form
              onSubmit={changePassword}
              className="space-y-4"
            >
              <div className="flex items-start gap-2 rounded-xl border border-[#D9BD83]/20 bg-[#D9BD83]/5 p-3 text-xs leading-relaxed text-[#BDAE96]">
                <ShieldCheck
                  size={18}
                  className="mt-0.5 shrink-0 text-[#D9BD83]"
                />
                Your current password is required before changing it.
              </div>

              <Field
                id="rj-current-password"
                label="Current Password"
                icon={Lock}
              >
                <input
                  id="rj-current-password"
                  className={inputStyle}
                  type={
                    showPasswords
                      ? 'text'
                      : 'password'
                  }
                  autoComplete="current-password"
                  required
                  value={currentPassword}
                  onChange={(e) =>
                    setCurrentPassword(e.target.value)
                  }
                  placeholder="Enter current password"
                />
              </Field>

              <Field
                id="rj-new-password"
                label="New Password"
                icon={Lock}
              >
                <input
                  id="rj-new-password"
                  className={inputStyle}
                  type={
                    showPasswords
                      ? 'text'
                      : 'password'
                  }
                  autoComplete="new-password"
                  required
                  minLength={8}
                  maxLength={128}
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(e.target.value)
                  }
                  placeholder="Minimum 8 characters"
                />
              </Field>

              <Field
                id="rj-confirm-password"
                label="Confirm New Password"
                icon={Lock}
              >
                <input
                  id="rj-confirm-password"
                  className={inputStyle}
                  type={
                    showPasswords
                      ? 'text'
                      : 'password'
                  }
                  autoComplete="new-password"
                  required
                  minLength={8}
                  maxLength={128}
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  placeholder="Re-enter new password"
                />
              </Field>

              <button
                type="button"
                onClick={() =>
                  setShowPasswords((previous) => !previous)
                }
                className="flex items-center gap-2 text-xs text-[#D9BD83]"
              >
                {showPasswords ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}

                {showPasswords
                  ? 'Hide passwords'
                  : 'Show passwords'}
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#E6CC8D] to-[#B38A48] py-3.5 text-xs font-black uppercase tracking-wider text-[#171011] hover:brightness-110 disabled:opacity-60"
              >
                {saving ? (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <Lock size={17} />
                )}

                {saving
                  ? 'Updating...'
                  : 'Change Password'}
              </button>
            </form>
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
