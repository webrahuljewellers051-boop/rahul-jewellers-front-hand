
import React, { useEffect, useState } from 'react';
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
  Sparkles,
  Mail
} from 'lucide-react';

// Customer website API. Set VITE_API_URL in Vercel.
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
  address: ''
};

const inputClass =
  'w-full rounded-xl border border-[#c9a76b]/30 bg-[#100b0c] px-4 py-3 text-sm text-[#ead9b6] outline-none focus:border-[#c9a76b]';

const labelClass =
  'block text-[11px] font-bold uppercase tracking-wider text-[#c9b58f]';

function getErrorMessage(error) {
  if (!axios.isAxiosError(error)) {
    return error?.message || 'Profile अपडेट नहीं हो पाया।';
  }

  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.code === 'ECONNABORTED') {
    return 'Server से जवाब आने में देर हो रही है। दोबारा कोशिश करें।';
  }

  if (error?.code === 'ERR_NETWORK' || !error?.response) {
    return 'Backend से कनेक्शन नहीं हो रहा। API URL, Server और CORS जाँचें।';
  }

  return error?.message || 'Profile अपडेट नहीं हो पाया।';
}

export default function CustomerProfileModal({
  isOpen,
  onClose,
  user,
  onUpdateUser
}) {
  const [form, setForm] = useState(emptyForm);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    setForm({
      name: user?.name || '',
      phone: user?.phone || '',
      email: user?.email || '',
      dob: user?.dob ? String(user.dob).slice(0, 10) : '',
      address: user?.address || ''
    });

    setCurrentPassword('');
    setNewPassword('');
    setShowPassword(false);
    setSuccess(false);
    setError('');
  }, [isOpen, user?._id]);

  if (!isOpen) return null;

  function updateForm(field, value) {
    setForm(previous => ({
      ...previous,
      [field]: value
    }));

    setSuccess(false);
  }

  async function handleSave(event) {
    event.preventDefault();

    if (saving) return;

    setError('');
    setSuccess(false);

    if (!user?._id) {
      setError(
        'Customer Profile नहीं मिला। कृपया दोबारा Login करें।'
      );
      return;
    }

    const token = localStorage.getItem('customer_token');

    if (!token) {
      setError(
        'Login Session समाप्त हो गया है। कृपया दोबारा Login करें।'
      );
      return;
    }

    if (!form.name.trim()) {
      setError('अपना पूरा नाम डालें।');
      return;
    }

    if (!/^[6-9][0-9]{9}$/.test(form.phone.trim())) {
      setError('सही 10 अंकों का मोबाइल नंबर डालें।');
      return;
    }

    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) {
      setError('सही Email डालें या Email खाली छोड़ दें।');
      return;
    }

    if (currentPassword && !newPassword) {
      setError(
        'Password बदलने के लिए नया Password भी डालें।'
      );
      return;
    }

    if (newPassword) {
      if (!currentPassword) {
        setError(
          'Password बदलने के लिए Current Password डालें।'
        );
        return;
      }

      if (
        newPassword.length < 8 ||
        newPassword.length > 128
      ) {
        setError(
          'नया Password 8 से 128 अक्षरों का होना चाहिए।'
        );
        return;
      }
    }

    setSaving(true);

    try {
      const requestBody = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim().toLowerCase(),
        dob: form.dob,
        address: form.address.trim()
      };

      if (newPassword) {
        requestBody.currentPassword = currentPassword;
        requestBody.password = newPassword;
      }

      const response = await axios.put(
        API +
          '/api/customer/update-profile/' +
          encodeURIComponent(user._id),
        requestBody,
        {
          headers: {
            Authorization: 'Bearer ' + token
          },
          timeout: 30000
        }
      );

      if (
        !response.data?.success ||
        !response.data?.customer
      ) {
        throw new Error(
          response.data?.message ||
          'Profile अपडेट नहीं हो पाया।'
        );
      }

      // Backend returns a fresh token after update.
      // Home.jsx stores token and customer details.
      if (typeof onUpdateUser === 'function') {
        onUpdateUser(
          response.data.customer,
          response.data.token
        );
      }

      setForm({
        name: response.data.customer.name || '',
        phone: response.data.customer.phone || '',
        email: response.data.customer.email || '',
        dob: response.data.customer.dob
          ? String(response.data.customer.dob).slice(0, 10)
          : '',
        address: response.data.customer.address || ''
      });

      setCurrentPassword('');
      setNewPassword('');
      setShowPassword(false);
      setSuccess(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-md"
      onClick={saving ? undefined : onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label="My Profile"
        onClick={event => event.stopPropagation()}
        className="relative my-auto w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl border border-[#c9a76b]/40 bg-[#211718] p-6 text-[#ead9b6] shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          aria-label="Close"
          className="absolute right-4 top-4 p-2"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 border-b border-[#c9a76b]/20 pb-5">
          <Sparkles
            size={27}
            className="text-[#d8bd83]"
          />

          <div>
            <p className="text-xs text-[#c9a76b]">
              RAHUL JEWELLERS · SHEOGANJ
            </p>

            <h2 className="text-xl font-bold">
              My Profile
            </h2>
          </div>
        </div>

        <p className="my-4 flex gap-2 text-xs text-[#c9b58f]">
          <ShieldCheck size={15} />
          Update contact details. Password is never displayed.
        </p>

        {error && (
          <p
            role="alert"
            className="mb-4 rounded-xl bg-red-950/50 p-3 text-xs text-red-200"
          >
            {error}
          </p>
        )}

        {success && (
          <p
            role="status"
            className="mb-4 rounded-xl bg-emerald-900/40 p-3 text-xs text-emerald-200"
          >
            Profile updated successfully.
          </p>
        )}

        <form
          onSubmit={handleSave}
          className="space-y-4"
        >
          <label className={labelClass}>
            Customer ID

            <input
              disabled
              value={user?.customerId || ''}
              className={inputClass + ' mt-2 opacity-70'}
            />
          </label>

          <label className={labelClass}>
            <User
              size={14}
              className="mr-1 inline"
            />
            Full Name

            <input
              required
              maxLength={100}
              autoComplete="name"
              value={form.name}
              onChange={event =>
                updateForm('name', event.target.value)
              }
              className={inputClass + ' mt-2'}
            />
          </label>

          <label className={labelClass}>
            <Phone
              size={14}
              className="mr-1 inline"
            />
            Mobile

            <input
              required
              type="tel"
              pattern="[6-9][0-9]{9}"
              maxLength={10}
              autoComplete="tel"
              value={form.phone}
              onChange={event =>
                updateForm('phone', event.target.value)
              }
              className={inputClass + ' mt-2'}
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
              value={form.email}
              onChange={event =>
                updateForm('email', event.target.value)
              }
              className={inputClass + ' mt-2'}
            />
          </label>

          <label className={labelClass}>
            Date of Birth

            <input
              type="date"
              value={form.dob}
              onChange={event =>
                updateForm('dob', event.target.value)
              }
              className={inputClass + ' mt-2'}
            />
          </label>

          <label className={labelClass}>
            <MapPin
              size={14}
              className="mr-1 inline"
            />
            Address

            <textarea
              rows={3}
              maxLength={500}
              value={form.address}
              onChange={event =>
                updateForm('address', event.target.value)
              }
              className={inputClass + ' mt-2'}
            />
          </label>

          <div className="space-y-3 border-t border-[#c9a76b]/20 pt-4">
            <p className="flex items-center gap-2 text-xs text-[#c9b58f]">
              <Lock size={14} />
              Change Password (optional)
            </p>

            <label className={labelClass}>
              Current Password

              <input
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                autoComplete="current-password"
                value={currentPassword}
                onChange={event =>
                  setCurrentPassword(event.target.value)
                }
                className={inputClass + ' mt-2'}
              />
            </label>

            <label className={labelClass}>
              New Password (8+ characters)

              <div className="relative mt-2">
                <input
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  minLength={8}
                  maxLength={128}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={event =>
                    setNewPassword(event.target.value)
                  }
                  className={inputClass + ' pr-12'}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(value => !value)
                  }
                  aria-label="Show or hide password"
                  className="absolute right-3 top-3"
                >
                  {showPassword
                    ? <EyeOff size={18} />
                    : <Eye size={18} />
                  }
                </button>
              </div>
            </label>
          </div>

          <button
            type="submit"
            disabled={saving || !user?._id}
            className="w-full rounded-xl bg-[#c9a76b] py-3.5 font-black text-stone-950 disabled:opacity-50"
          >
            <Check
              size={16}
              className="mr-1 inline"
            />

            {saving
              ? 'Saving...'
              : 'Save Profile Changes'
            }
          </button>
        </form>
      </section>
    </div>
  );
}
