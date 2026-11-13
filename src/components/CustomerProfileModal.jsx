
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  User,
  X,
  Lock,
  MapPin,
  Check,
  Eye,
  EyeOff,
  ShieldCheck,
  Phone,
  Sparkles
} from 'lucide-react';

const API_BASE_URL = 'https://rahul-jewellers-backend-jlr0.onrender.com';

const requestConfig = {
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  }
};

export default function CustomerProfileModal({
  isOpen,
  onClose,
  user,
  onUpdateUser
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Keep form values synchronized with the selected customer.
  useEffect(() => {
    if (isOpen && user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setPassword(user.password || '');
      setAddress(user.address || '');
      setShowPassword(false);
      setSuccess(false);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();

    if (!user?._id || saving) return;

    setSaving(true);

    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/customer/update-profile/${user._id}`,
        {
          name: name.trim(),
          phone: phone.trim(),
          password: password.trim(),
          address: address.trim()
        },
        requestConfig
      );

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

  const inputClass =
    'w-full rounded-xl border px-4 py-3 text-sm text-[#ead9b6] outline-none transition placeholder:text-[#827463] focus:border-[#c9a76b]';

  const labelClass =
    'mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[1.5px] text-[#c9b58f]';

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative my-auto w-full max-w-md overflow-hidden rounded-3xl border shadow-2xl"
        style={{
          background: 'linear-gradient(145deg, #211718, #100b0c)',
          borderColor: 'rgba(201,167,107,0.4)',
          boxShadow: '0 25px 80px rgba(0,0,0,0.55)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative top line */}
        <div
          className="h-1 w-full"
          style={{
            background: 'linear-gradient(90deg, transparent, #d8bd83, #8d6938, transparent)'
          }}
        />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#c9a76b]/20 px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#c9a76b]/40 bg-[#c9a76b]/10">
              <User className="h-5 w-5 text-[#d9bd83]" />
            </div>

            <div>
              <p className="mb-1 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[2px] text-[#c9a76b]">
                <Sparkles className="h-3 w-3" />
                Rahul Jewellers
              </p>
              <h3 className="font-serif-luxury text-lg font-semibold text-[#ead9b6]">
                My Profile
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close profile"
            className="rounded-full p-2 text-[#b9a88d] transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Security Note */}
        <div className="mx-5 mt-5 flex items-center gap-2 rounded-xl border border-[#c9a76b]/20 bg-[#c9a76b]/5 p-3 sm:mx-6">
          <ShieldCheck className="h-4 w-4 shrink-0 text-[#d9bd83]" />
          <p className="text-[10px] leading-5 text-[#b9a88d]">
            Keep your account information up to date and secure.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4 px-5 py-5 sm:px-6">

          {/* Customer ID */}
          <div>
            <label className={labelClass}>
              <ShieldCheck className="h-3.5 w-3.5" />
              Customer ID
            </label>

            <input
              type="text"
              disabled
              value={user?.customerId || ''}
              className={`${inputClass} cursor-not-allowed border-[#c9a76b]/10 bg-black/30 font-mono text-[#998b75]`}
            />
          </div>

          {/* Full Name */}
          <div>
            <label className={labelClass}>
              <User className="h-3.5 w-3.5" />
              Full Name
            </label>

            <input
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className={inputClass}
              style={{ background: '#100b0c', borderColor: 'rgba(201,167,107,0.25)' }}
            />
          </div>

          {/* Phone */}
          <div>
            <label className={labelClass}>
              <Phone className="h-3.5 w-3.5" />
              Phone Number / Login ID
            </label>

            <input
              type="tel"
              required
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
              className={inputClass}
              style={{ background: '#100b0c', borderColor: 'rgba(201,167,107,0.25)' }}
            />
          </div>

          {/* Password */}
          <div>
            <label className={labelClass}>
              <Lock className="h-3.5 w-3.5" />
              Account Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter account password"
                className={`${inputClass} pr-12`}
                style={{ background: '#100b0c', borderColor: 'rgba(201,167,107,0.25)' }}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b9a88d] transition hover:text-[#e3c78e]"
              >
                {showPassword
                  ? <EyeOff className="h-4 w-4" />
                  : <Eye className="h-4 w-4" />
                }
              </button>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className={labelClass}>
              <MapPin className="h-3.5 w-3.5" />
              Residential Address
            </label>

            <textarea
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your residential address"
              className={`${inputClass} resize-none`}
              style={{ background: '#100b0c', borderColor: 'rgba(201,167,107,0.25)' }}
            />
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving || success}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-xs font-bold uppercase tracking-[1.5px] transition-all duration-300 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              background: success
                ? 'linear-gradient(135deg, #168c58, #086b40)'
                : 'linear-gradient(135deg, #d8bd83, #a47b43)',
              color: success ? '#ffffff' : '#1b1110',
              boxShadow: '0 6px 20px rgba(201,167,107,0.13)'
            }}
          >
            {success ? (
              <>
                <Check className="h-4 w-4" />
                Updated Successfully
              </>
            ) : saving ? (
              'Saving Changes...'
            ) : (
              <>
                <Check className="h-4 w-4" />
                Save Profile Changes
              </>
            )}
          </button>

          <p className="pb-1 text-center text-[9px] tracking-wide text-[#897b68]">
            ELEGANCE · HERITAGE · TRUST
          </p>
        </form>
      </div>
    </div>
  );
}
