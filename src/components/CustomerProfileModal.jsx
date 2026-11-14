
import React, {
  useEffect,
  useMemo,
  useState
} from 'react';

import axios from 'axios';

import {
  X,
  UserRound,
  CalendarDays,
  Phone,
  MapPin,
  IdCard,
  LockKeyhole,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  Heart,
  ShoppingBag,
  Trash2,
  Gem,
  ArrowRight,
  LogOut
} from 'lucide-react';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'https://rahul-jewellers-backend-jlr0.onrender.com';

const inputClass =
  'w-full rounded-xl border border-[#D6B875]/25 ' +
  'bg-white/[0.045] px-4 py-3 text-sm text-white ' +
  'outline-none transition ' +
  'placeholder:text-white/30 ' +
  'focus:border-[#D6B875]/75';

const labelClass =
  'mb-2 block text-[11px] font-bold uppercase ' +
  'tracking-[0.13em] text-[#D6B875]';

const goldButtonClass =
  'flex items-center justify-center gap-2 rounded-xl ' +
  'bg-gradient-to-r from-[#A98143] via-[#E3C782] ' +
  'to-[#B58D4A] px-5 py-3.5 text-sm font-bold ' +
  'text-[#1B1209] transition hover:brightness-110 ' +
  'disabled:cursor-not-allowed disabled:opacity-50';

const formatDob = value => {
  if (!value) return '';

  const date = String(value);

  return date.slice(0, 10);
};

const formatDate = value => {
  if (!value) return '—';

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
};

const formatMoney = value =>
  Number(value || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 0
  });

const getWishlistId = item => {
  if (!item) return '';

  if (typeof item === 'string') {
    return item;
  }

  if (item.product) {
    return String(
      item.product._id ||
      item.product
    );
  }

  return String(item._id || '');
};

const getAuthConfig = () => {
  const token = localStorage.getItem(
    'customer_token'
  );

  return {
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      ...(token
        ? {
            Authorization: `Bearer ${token}`
          }
        : {})
    },
    timeout: 20000
  };
};

const getApiError = (
  error,
  fallback = 'Something went wrong. Please try again.'
) =>
  error.response?.data?.message ||
  error.response?.data?.error ||
  fallback;

export default function CustomerProfileModal({
  isOpen,
  onClose,
  user,
  onUpdateUser
}) {
  const [activeTab, setActiveTab] =
    useState('profile');

  const [profileForm, setProfileForm] =
    useState({
      name: '',
      dob: '',
      address: ''
    });

  const [passwordForm, setPasswordForm] =
    useState({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });

  const [showPasswords, setShowPasswords] =
    useState({
      current: false,
      next: false,
      confirm: false
    });

  const [savingProfile, setSavingProfile] =
    useState(false);

  const [savingPassword, setSavingPassword] =
    useState(false);

  const [removingWishlist, setRemovingWishlist] =
    useState(null);

  const [products, setProducts] =
    useState([]);

  const [loadingProducts, setLoadingProducts] =
    useState(false);

  const [success, setSuccess] =
    useState('');

  const [error, setError] =
    useState('');

  const today = new Date()
    .toISOString()
    .slice(0, 10);

  const schemeJoined =
    user?.schemeJoined !== false;

  const paidMonths = Math.min(
    12,
    Math.max(
      0,
      Number(user?.paidMonths || 0)
    )
  );

  const monthlyInstallment =
    Number(user?.customInstallment || 10000);

  const wishlist = Array.isArray(user?.wishlist)
    ? user.wishlist
    : [];

  const purchaseHistory =
    Array.isArray(user?.purchaseHistory)
      ? user.purchaseHistory
      : [];

  useEffect(() => {
    if (!isOpen) return;

    setProfileForm({
      name: user?.name || '',
      dob: formatDob(user?.dob),
      address: user?.address || ''
    });

    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });

    setSuccess('');
    setError('');
  }, [
    isOpen,
    user?._id,
    user?.name,
    user?.dob,
    user?.address
  ]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    const handleEscape = event => {
      if (
        event.key === 'Escape' &&
        !savingProfile &&
        !savingPassword
      ) {
        onClose?.();
      }
    };

    document.addEventListener(
      'keydown',
      handleEscape
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      document.removeEventListener(
        'keydown',
        handleEscape
      );
    };
  }, [
    isOpen,
    onClose,
    savingProfile,
    savingPassword
  ]);

  useEffect(() => {
    if (
      !isOpen ||
      activeTab !== 'wishlist'
    ) {
      return;
    }

    let cancelled = false;

    const loadProducts = async () => {
      setLoadingProducts(true);

      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/products`,
          {
            timeout: 20000
          }
        );

        if (
          !cancelled &&
          response.data?.success
        ) {
          setProducts(
            Array.isArray(
              response.data.products
            )
              ? response.data.products
              : []
          );
        }
      } catch {
        if (!cancelled) {
          setProducts([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingProducts(false);
        }
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [isOpen, activeTab]);

  const wishlistProducts = useMemo(() => {
    const ids = new Set(
      wishlist.map(getWishlistId)
    );

    return products.filter(product =>
      ids.has(String(product._id))
    );
  }, [wishlist, products]);

  if (!isOpen) return null;

  const switchTab = tab => {
    setActiveTab(tab);
    setSuccess('');
    setError('');
  };

  const updateProfileField = (
    field,
    value
  ) => {
    setProfileForm(previous => ({
      ...previous,
      [field]: value
    }));

    setError('');
    setSuccess('');
  };

  const updatePasswordField = (
    field,
    value
  ) => {
    setPasswordForm(previous => ({
      ...previous,
      [field]: value
    }));

    setError('');
    setSuccess('');
  };

  const togglePasswordVisibility = field => {
    setShowPasswords(previous => ({
      ...previous,
      [field]: !previous[field]
    }));
  };

  const updateCustomerLocally = updated => {
    if (!updated || !user) return;

    const {
      password,
      passwordHash,
      ...safeUpdated
    } = updated;

    const mergedCustomer = {
      ...user,
      ...safeUpdated
    };

    localStorage.setItem(
      'schemeUserInfo',
      JSON.stringify(mergedCustomer)
    );

    onUpdateUser?.(mergedCustomer);
  };

  const handleSaveProfile = async event => {
    event.preventDefault();

    if (savingProfile) return;

    if (!user?._id) {
      setError(
        'Customer session is missing. Please login again.'
      );
      return;
    }

    const name = profileForm.name.trim();
    const dob = profileForm.dob;
    const address = profileForm.address.trim();

    if (name.length < 2) {
      setError(
        'Please enter your full name.'
      );
      return;
    }

    if (dob && (
      dob < '1900-01-01' ||
      dob > today
    )) {
      setError(
        'Please enter a valid date of birth.'
      );
      return;
    }

    if (address.length > 500) {
      setError(
        'Address cannot exceed 500 characters.'
      );
      return;
    }

    if (!localStorage.getItem('customer_token')) {
      setError(
        'Your login session has expired. Please login again.'
      );
      return;
    }

    setSavingProfile(true);
    setSuccess('');
    setError('');

    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/customer/settings/update`,
        {
          userId: user._id,
          name,
          dob: dob || null,
          address
        },
        getAuthConfig()
      );

      if (!response.data?.success) {
        throw new Error(
          'Profile update failed.'
        );
      }

      const updatedCustomer =
        response.data.customer ||
        response.data.user;

      if (updatedCustomer) {
        updateCustomerLocally(
          updatedCustomer
        );
      } else {
        const profileResponse =
          await axios.get(
            `${API_BASE_URL}/api/customer/profile/${user._id}`,
            getAuthConfig()
          );

        if (
          profileResponse.data?.success &&
          profileResponse.data.customer
        ) {
          updateCustomerLocally(
            profileResponse.data.customer
          );
        }
      }

      setSuccess(
        'Your profile details have been updated successfully.'
      );
    } catch (err) {
      setError(
        getApiError(
          err,
          'Unable to save your profile details.'
        )
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async event => {
    event.preventDefault();

    if (savingPassword) return;

    const {
      currentPassword,
      newPassword,
      confirmPassword
    } = passwordForm;

    if (!currentPassword) {
      setError(
        'Please enter your current password.'
      );
      return;
    }

    if (newPassword.length < 8) {
      setError(
        'New password must contain at least 8 characters.'
      );
      return;
    }

    if (
      currentPassword === newPassword
    ) {
      setError(
        'New password must be different from your current password.'
      );
      return;
    }

    if (
      newPassword !== confirmPassword
    ) {
      setError(
        'New password and Confirm Password do not match.'
      );
      return;
    }

    if (!localStorage.getItem('customer_token')) {
      setError(
        'Your login session has expired. Please login again.'
      );
      return;
    }

    setSavingPassword(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/customer/change-password`,
        {
          currentPassword,
          newPassword,
          confirmPassword
        },
        getAuthConfig()
      );

      if (!response.data?.success) {
        throw new Error(
          'Password update failed.'
        );
      }

      if (response.data.token) {
        localStorage.setItem(
          'customer_token',
          response.data.token
        );
      }

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      setShowPasswords({
        current: false,
        next: false,
        confirm: false
      });

      setSuccess(
        'Your password has been changed successfully.'
      );
    } catch (err) {
      setError(
        getApiError(
          err,
          'Unable to change password. Please check your current password.'
        )
      );
    } finally {
      setSavingPassword(false);
    }
  };

  const handleRemoveWishlist = async productId => {
    if (
      !productId ||
      removingWishlist
    ) {
      return;
    }

    setRemovingWishlist(productId);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/customer/wishlist/toggle`,
        {
          userId: user._id,
          productId
        },
        getAuthConfig()
      );

      if (!response.data?.success) {
        throw new Error(
          'Unable to update wishlist.'
        );
      }

      const updatedCustomer =
        response.data.customer ||
        response.data.user;

      if (updatedCustomer) {
        updateCustomerLocally(
          updatedCustomer
        );
      }

      setSuccess(
        'Jewellery removed from your wishlist.'
      );
    } catch (err) {
      setError(
        getApiError(
          err,
          'Unable to remove jewellery from wishlist.'
        )
      );
    } finally {
      setRemovingWishlist(null);
    }
  };

  const tabs = [
    {
      id: 'profile',
      label: 'My Profile',
      icon: UserRound
    },
    {
      id: 'security',
      label: 'Security',
      icon: LockKeyhole
    },
    {
      id: 'wishlist',
      label: 'Wishlist',
      icon: Heart
    },
    {
      id: 'orders',
      label: 'Purchases',
      icon: ShoppingBag
    }
  ];

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/85 p-3 backdrop-blur-md sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Customer Profile"
      onMouseDown={event => {
        if (
          event.target === event.currentTarget &&
          !savingProfile &&
          !savingPassword
        ) {
          onClose?.();
        }
      }}
    >
      <div className="relative my-auto flex w-full max-w-[760px] flex-col overflow-hidden rounded-[26px] border border-[#D6B875]/30 bg-[#100D0E] text-white shadow-[0_30px_100px_rgba(0,0,0,0.8)]">

        {/* HEADER */}
        <div className="relative border-b border-[#D6B875]/20 bg-gradient-to-br from-[#35201E] via-[#201515] to-[#100D0E] px-5 pb-6 pt-7 sm:px-8">

          <button
            type="button"
            onClick={onClose}
            disabled={
              savingProfile ||
              savingPassword
            }
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 hover:text-white disabled:opacity-40"
            aria-label="Close profile"
          >
            <X size={18} />
          </button>

          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D6B875]">
            RAHUL JEWELLERS
          </p>

          <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-[#BDA16E]">
            SHIVGANJ
          </p>

          <div className="mt-6 flex items-center gap-4">

            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[#D6B875]/40 bg-[#D6B875]/10 font-serif text-3xl font-bold text-[#F0D69C]">
              {user?.name
                ?.charAt(0)
                ?.toUpperCase() || 'R'}
            </div>

            <div className="min-w-0">
              <h2 className="truncate font-serif text-2xl text-[#F4E5C8] sm:text-3xl">
                {user?.name ||
                  'Valued Customer'}
              </h2>

              <p className="mt-1 flex items-center gap-2 text-xs text-white/55">
                <IdCard size={14} />
                Customer ID:
                <span className="font-semibold text-[#E3C782]">
                  {user?.customerId || '—'}
                </span>
              </p>

              <p className="mt-1 flex items-center gap-2 text-xs text-white/55">
                <Phone size={14} />
                {user?.phone || '—'}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-semibold text-emerald-300">
              <CheckCircle2 size={13} />
              Customer Account
            </span>

            <span className="inline-flex items-center gap-2 rounded-full border border-[#D6B875]/25 bg-[#D6B875]/10 px-3 py-1.5 text-[10px] font-semibold text-[#E3C782]">
              <Gem size={13} />
              {schemeJoined
                ? 'Gold Scheme Member'
                : 'Gold Scheme Not Joined'}
            </span>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-2 overflow-x-auto border-b border-white/10 bg-[#151112] px-4 py-3 sm:px-7">
          {tabs.map(tab => {
            const TabIcon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() =>
                  switchTab(tab.id)
                }
                className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                  activeTab === tab.id
                    ? 'bg-[#D6B875] text-[#21170D]'
                    : 'border border-white/10 bg-white/[0.035] text-white/55 hover:text-white'
                }`}
              >
                <TabIcon size={15} />
                {tab.label}

                {tab.id === 'wishlist' && (
                  <span className="rounded-full bg-black/15 px-1.5 py-0.5 text-[10px]">
                    {wishlist.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* CONTENT */}
        <div className="max-h-[56vh] min-h-[280px] overflow-y-auto px-5 py-6 sm:px-8">

          {/* SUCCESS */}
          {success && (
            <div
              role="status"
              className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-xs leading-relaxed text-emerald-300"
            >
              <CheckCircle2
                size={18}
                className="shrink-0"
              />

              {success}
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/25 bg-red-500/10 p-4 text-xs leading-relaxed text-red-300"
            >
              <AlertCircle
                size={18}
                className="shrink-0"
              />

              {error}
            </div>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-serif text-xl text-[#F0DEB8]">
                  Personal Information
                </h3>

                <p className="mt-1 text-xs text-white/45">
                  Manage your Rahul Jewellers
                  customer profile.
                </p>
              </div>

              <form
                onSubmit={handleSaveProfile}
                className="space-y-5"
              >
                {/* CUSTOMER ID */}
                <div>
                  <label className={labelClass}>
                    Customer ID
                  </label>

                  <div className="relative">
                    <IdCard
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D6B875]"
                    />

                    <input
                      value={
                        user?.customerId || ''
                      }
                      readOnly
                      className={`${inputClass} cursor-not-allowed pl-11 opacity-60`}
                    />
                  </div>

                  <p className="mt-1.5 text-[10px] text-white/35">
                    Your unique Customer ID
                    cannot be changed.
                  </p>
                </div>

                {/* FULL NAME */}
                <div>
                  <label
                    htmlFor="rj-profile-name"
                    className={labelClass}
                  >
                    Full Name *
                  </label>

                  <div className="relative">
                    <UserRound
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D6B875]"
                    />

                    <input
                      id="rj-profile-name"
                      type="text"
                      autoComplete="name"
                      required
                      minLength={2}
                      maxLength={100}
                      value={profileForm.name}
                      onChange={event =>
                        updateProfileField(
                          'name',
                          event.target.value
                        )
                      }
                      placeholder="Enter full name"
                      className={`${inputClass} pl-11`}
                    />
                  </div>
                </div>

                {/* DATE OF BIRTH */}
                <div>
                  <label
                    htmlFor="rj-profile-dob"
                    className={labelClass}
                  >
                    Date of Birth
                  </label>

                  <div className="relative">
                    <CalendarDays
                      size={17}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#D6B875]"
                    />

                    <input
                      id="rj-profile-dob"
                      type="date"
                      min="1900-01-01"
                      max={today}
                      value={profileForm.dob}
                      onChange={event =>
                        updateProfileField(
                          'dob',
                          event.target.value
                        )
                      }
                      className={`${inputClass} pl-11 [color-scheme:dark]`}
                    />
                  </div>
                </div>

                {/* PHONE */}
                <div>
                  <label className={labelClass}>
                    Registered Mobile Number
                  </label>

                  <div className="relative">
                    <Phone
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D6B875]"
                    />

                    <input
                      value={user?.phone || ''}
                      readOnly
                      className={`${inputClass} cursor-not-allowed pl-11 opacity-60`}
                    />
                  </div>

                  <p className="mt-1.5 text-[10px] text-white/35">
                    Contact Rahul Jewellers
                    to request a verified
                    mobile number change.
                  </p>
                </div>

                {/* ADDRESS */}
                <div>
                  <label
                    htmlFor="rj-profile-address"
                    className={labelClass}
                  >
                    Address
                  </label>

                  <div className="relative">
                    <MapPin
                      size={17}
                      className="absolute left-4 top-4 text-[#D6B875]"
                    />

                    <textarea
                      id="rj-profile-address"
                      rows={3}
                      maxLength={500}
                      value={profileForm.address}
                      onChange={event =>
                        updateProfileField(
                          'address',
                          event.target.value
                        )
                      }
                      placeholder="Enter your address"
                      className={`${inputClass} resize-none pl-11`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className={`${goldButtonClass} w-full`}
                >
                  {savingProfile ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Saving Profile...
                    </>
                  ) : (
                    <>
                      <Save size={17} />
                      Save Profile Changes
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-serif text-xl text-[#F0DEB8]">
                  Account Security
                </h3>

                <p className="mt-1 text-xs text-white/45">
                  Change your login password
                  securely.
                </p>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-[#D6B875]/20 bg-[#D6B875]/[0.06] p-4">
                <ShieldCheck
                  size={20}
                  className="shrink-0 text-[#D6B875]"
                />

                <p className="text-xs leading-relaxed text-white/65">
                  Your current password
                  is required before
                  setting a new password.
                  Never share your password
                  or login details with
                  anyone.
                </p>
              </div>

              <form
                onSubmit={
                  handleChangePassword
                }
                className="space-y-5"
              >
                {/* CURRENT PASSWORD */}
                <div>
                  <label
                    htmlFor="rj-current-password"
                    className={labelClass}
                  >
                    Current Password *
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D6B875]"
                    />

                    <input
                      id="rj-current-password"
                      type={
                        showPasswords.current
                          ? 'text'
                          : 'password'
                      }
                      autoComplete="current-password"
                      value={
                        passwordForm.currentPassword
                      }
                      onChange={event =>
                        updatePasswordField(
                          'currentPassword',
                          event.target.value
                        )
                      }
                      required
                      placeholder="Enter current password"
                      className={`${inputClass} pl-11 pr-12`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        togglePasswordVisibility(
                          'current'
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/45 hover:text-[#D6B875]"
                      aria-label="Toggle current password visibility"
                    >
                      {showPasswords.current
                        ? <EyeOff size={17} />
                        : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                {/* NEW PASSWORD */}
                <div>
                  <label
                    htmlFor="rj-new-password"
                    className={labelClass}
                  >
                    New Password *
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D6B875]"
                    />

                    <input
                      id="rj-new-password"
                      type={
                        showPasswords.next
                          ? 'text'
                          : 'password'
                      }
                      autoComplete="new-password"
                      minLength={8}
                      value={
                        passwordForm.newPassword
                      }
                      onChange={event =>
                        updatePasswordField(
                          'newPassword',
                          event.target.value
                        )
                      }
                      required
                      placeholder="Minimum 8 characters"
                      className={`${inputClass} pl-11 pr-12`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        togglePasswordVisibility(
                          'next'
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/45 hover:text-[#D6B875]"
                      aria-label="Toggle new password visibility"
                    >
                      {showPasswords.next
                        ? <EyeOff size={17} />
                        : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                {/* CONFIRM PASSWORD */}
                <div>
                  <label
                    htmlFor="rj-confirm-password"
                    className={labelClass}
                  >
                    Confirm New Password *
                  </label>

                  <div className="relative">
                    <ShieldCheck
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D6B875]"
                    />

                    <input
                      id="rj-confirm-password"
                      type={
                        showPasswords.confirm
                          ? 'text'
                          : 'password'
                      }
                      autoComplete="new-password"
                      value={
                        passwordForm.confirmPassword
                      }
                      onChange={event =>
                        updatePasswordField(
                          'confirmPassword',
                          event.target.value
                        )
                      }
                      required
                      placeholder="Re-enter new password"
                      className={`${inputClass} pl-11 pr-12`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        togglePasswordVisibility(
                          'confirm'
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/45 hover:text-[#D6B875]"
                      aria-label="Toggle confirmation password visibility"
                    >
                      {showPasswords.confirm
                        ? <EyeOff size={17} />
                        : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingPassword}
                  className={`${goldButtonClass} w-full`}
                >
                  {savingPassword ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Updating Password...
                    </>
                  ) : (
                    <>
                      <LockKeyhole size={17} />
                      Change Password
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* WISHLIST TAB */}
          {activeTab === 'wishlist' && (
            <div className="space-y-5">
              <div>
                <h3 className="font-serif text-xl text-[#F0DEB8]">
                  My Wishlist
                </h3>

                <p className="mt-1 text-xs text-white/45">
                  Jewellery you have
                  saved for later.
                </p>
              </div>

              {loadingProducts ? (
                <div className="flex items-center justify-center gap-3 py-12 text-sm text-white/55">
                  <Loader2
                    size={20}
                    className="animate-spin text-[#D6B875]"
                  />
                  Loading Wishlist...
                </div>
              ) : wishlist.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.025] px-5 py-12 text-center">
                  <Heart
                    size={34}
                    className="mx-auto text-[#D6B875]"
                  />

                  <h4 className="mt-4 font-serif text-lg text-[#F0DEB8]">
                    Your Wishlist Is Empty
                  </h4>

                  <p className="mt-2 text-xs text-white/50">
                    Save your favourite
                    jewellery to see it here.
                  </p>
                </div>
              ) : wishlistProducts.length === 0 ? (
                <div className="rounded-xl border border-white/10 p-5 text-center text-xs text-white/60">
                  You have {wishlist.length}
                  {' '}
                  saved item(s), but their
                  product details are not
                  currently available.
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {wishlistProducts.map(product => (
                    <div
                      key={product._id}
                      className="overflow-hidden rounded-2xl border border-[#D6B875]/20 bg-white/[0.035]"
                    >
                      <div className="aspect-[4/3] overflow-hidden bg-black/20">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.title}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Gem
                              size={35}
                              className="text-[#D6B875]"
                            />
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <h4 className="text-sm font-semibold text-[#F0DEB8]">
                          {product.title}
                        </h4>

                        <p className="mt-1 text-xs text-white/50">
                          {product.category}
                        </p>

                        {Number(product.price) > 0 && (
                          <p className="mt-2 text-sm font-bold text-[#D6B875]">
                            ₹{formatMoney(product.price)}
                          </p>
                        )}

                        <div className="mt-4 flex gap-2">
                          <a
                            href={
                              'https://wa.me/919950091024?text=' +
                              encodeURIComponent(
                                `Namaste Rahul Jewellers, I am interested in ${product.title}. Please share details.`
                              )
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-[#D6B875] px-3 py-2.5 text-xs font-semibold text-[#21170D]"
                          >
                            Enquire
                            <ArrowRight size={13} />
                          </a>

                          <button
                            type="button"
                            disabled={
                              removingWishlist ===
                              product._id
                            }
                            onClick={() =>
                              handleRemoveWishlist(
                                product._id
                              )
                            }
                            className="flex items-center justify-center rounded-lg border border-red-400/20 bg-red-400/10 px-3 text-red-300 disabled:opacity-50"
                            aria-label="Remove from wishlist"
                          >
                            {removingWishlist ===
                            product._id ? (
                              <Loader2
                                size={16}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PURCHASE HISTORY TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-5">
              <div>
                <h3 className="font-serif text-xl text-[#F0DEB8]">
                  Purchase History
                </h3>

                <p className="mt-1 text-xs text-white/45">
                  Your recorded jewellery
                  purchases.
                </p>
              </div>

              {purchaseHistory.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.025] px-5 py-12 text-center">
                  <ShoppingBag
                    size={34}
                    className="mx-auto text-[#D6B875]"
                  />

                  <h4 className="mt-4 font-serif text-lg text-[#F0DEB8]">
                    No Purchase History Available
                  </h4>

                  <p className="mt-2 text-xs leading-relaxed text-white/50">
                    Purchases will appear
                    here when the showroom
                    records them against
                    your customer account.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {purchaseHistory.map(
                    (purchase, index) => (
                      <div
                        key={
                          purchase._id ||
                          index
                        }
                        className="rounded-xl border border-[#D6B875]/20 bg-white/[0.035] p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-[#F0DEB8]">
                              {purchase.title ||
                                purchase.productName ||
                                `Purchase #${index + 1}`}
                            </p>

                            <p className="mt-1 text-xs text-white/50">
                              {formatDate(
                                purchase.createdAt ||
                                purchase.date
                              )}
                            </p>
                          </div>

                          <span className="text-sm font-semibold text-[#D6B875]">
                            ₹{formatMoney(
                              purchase.totalAmount ||
                              purchase.amount
                            )}
                          </span>
                        </div>

                        {purchase.status && (
                          <p className="mt-3 text-xs text-white/50">
                            Status:{' '}
                            {purchase.status}
                          </p>
                        )}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between gap-3 border-t border-[#D6B875]/15 bg-black/20 px-5 py-4 sm:px-8">
          <p className="flex items-center gap-2 text-[10px] text-white/45">
            <ShieldCheck
              size={14}
              className="text-[#D6B875]"
            />
            Rahul Jewellers · Shivganj
          </p>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 text-xs font-semibold text-[#D6B875] hover:text-[#F0DEB8]"
          >
            Close Profile
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
