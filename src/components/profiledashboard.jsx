
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  User,
  Heart,
  ShoppingBag,
  Settings,
  Trash2,
  Lock,
  MapPin,
  ShieldCheck,
  Gem,
  Calendar,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Calculator,
  Gift,
  Crown,
  Sparkles,
  Loader2,
  Eye,
  EyeOff,
  Clock
} from 'lucide-react';

const API_BASE_URL =
  'https://rahul-jewellers-backend-jlr0.onrender.com';

const requestConfig = {
  headers: {
    'ngrok-skip-browser-warning': 'true'
  }
};

export default function ProfileDashboard({ user, onUpdateUser }) {
  const [activeTab, setActiveTab] = useState('scheme');

  const [settingsForm, setSettingsForm] = useState({
    name: user?.name || '',
    address: user?.address || '',
    password: ''
  });

  const [savingSettings, setSavingSettings] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [removingWishlist, setRemovingWishlist] = useState(null);

  useEffect(() => {
    setSettingsForm({
      name: user?.name || '',
      address: user?.address || '',
      password: ''
    });
  }, [user]);

  // WISHLIST
  const handleToggleWishlist = async (productId) => {
    try {
      setRemovingWishlist(productId);

      const res = await axios.post(
        `${API_BASE_URL}/api/customer/wishlist/toggle`,
        {
          userId: user._id,
          productId
        },
        requestConfig
      );

      if (res.data.success) {
        onUpdateUser(res.data.user);
      }
    } catch (err) {
      console.error('Wishlist Update Error:', err);
      alert('Failed to update wishlist. Please try again.');
    } finally {
      setRemovingWishlist(null);
    }
  };

  // ACCOUNT SETTINGS
  const handleSaveSettings = async (e) => {
    e.preventDefault();

    if (!user?._id) {
      alert('Customer information is missing. Please login again.');
      return;
    }

    setSavingSettings(true);

    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/customer/settings/update`,
        {
          userId: user._id,
          name: settingsForm.name,
          address: settingsForm.address,
          ...(settingsForm.password
            ? { password: settingsForm.password }
            : {})
        },
        requestConfig
      );

      if (res.data.success) {
        alert('Account settings updated successfully!');

        onUpdateUser(res.data.user);

        setSettingsForm((prev) => ({
          ...prev,
          password: ''
        }));
      } else {
        alert(res.data.message || 'Unable to update account settings.');
      }
    } catch (err) {
      console.error('Settings Update Error:', err);

      alert(
        err.response?.data?.message ||
        'Failed to update settings. Please try again.'
      );
    } finally {
      setSavingSettings(false);
    }
  };

  // INSTALLMENT CALCULATIONS
  const paidMonths = Math.max(0, Number(user?.paidMonths) || 0);
  const nextMonthNum = paidMonths + 1;
  const customInstallment = Number(user?.customInstallment) || 10000;

  const totalPaid = 12 * customInstallment;
  const freeBonus = customInstallment;
  const totalValue = totalPaid + freeBonus;

  const getNextDueDate = () => {
    if (!user?.startDate) return new Date();

    const start = new Date(user.startDate);

    if (Number.isNaN(start.getTime())) return new Date();

    start.setMonth(start.getMonth() + paidMonths);

    return start;
  };

  const dueDate = getNextDueDate();
  const today = new Date();

  const diffTime = today - dueDate;
  const diffDays = Math.floor(
    diffTime / (1000 * 60 * 60 * 24)
  );

  const formattedDueDate = dueDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  let statusBanner = null;

  if (paidMonths >= 12) {
    statusBanner = (
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-200">
        <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-400" />

        <div>
          <p className="text-sm font-bold">
            Scheme Completed!
          </p>

          <p className="mt-1 text-xs leading-relaxed text-emerald-300/80">
            All 12 installments are completed. Your free bonus month benefit is now unlocked according to the scheme terms.
          </p>
        </div>
      </div>
    );
  } else if (diffDays > 5) {
    statusBanner = (
      <div className="flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
        <AlertTriangle className="h-6 w-6 shrink-0 text-red-400" />

        <div>
          <p className="text-sm font-bold">
            Important: Installment Overdue
          </p>

          <p className="mt-1 text-xs leading-relaxed text-red-300/80">
            Month #{nextMonthNum} is more than 5 days overdue.
            Due date: {formattedDueDate}. Please contact the store regarding your installment.
          </p>
        </div>
      </div>
    );
  } else if (diffDays > 0) {
    statusBanner = (
      <div className="flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-200">
        <AlertCircle className="h-5 w-5 shrink-0 text-[#E2C27C]" />

        <div>
          <p className="text-sm font-bold">
            Payment Reminder
          </p>

          <p className="mt-1 text-xs leading-relaxed text-amber-200/80">
            Month #{nextMonthNum} was due on {formattedDueDate}.
            Please contact Rahul Jewellers regarding your payment.
          </p>
        </div>
      </div>
    );
  } else {
    statusBanner = (
      <div className="flex items-center gap-3 rounded-2xl border border-[#D6B875]/25 bg-[#D6B875]/[0.07] p-4 text-[#E8D5A8]">
        <Calendar className="h-5 w-5 shrink-0 text-[#D6B875]" />

        <div>
          <p className="text-sm font-bold">
            Next Installment Due
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Month #{nextMonthNum} due by:{' '}
            <span className="font-bold text-[#E8D5A8]">
              {formattedDueDate}
            </span>
          </p>
        </div>
      </div>
    );
  }

  const wishlistItems = user?.wishlist || [];
  const purchaseHistory = user?.purchaseHistory || [];

  const tabs = [
    {
      id: 'scheme',
      label: 'Scheme Plan',
      icon: Calculator
    },
    {
      id: 'wishlist',
      label: 'Wishlist',
      icon: Heart
    },
    {
      id: 'orders',
      label: 'Purchase History',
      icon: ShoppingBag
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings
    }
  ];

  return (
    <div className="mx-auto my-6 w-full max-w-5xl overflow-hidden rounded-[28px] border border-[#BFA36A]/30 bg-[#100D0D] text-white shadow-[0_25px_80px_rgba(0,0,0,0.4)]">

      {/* PROFILE HEADER */}
      <div className="relative overflow-hidden border-b border-[#BFA36A]/25 bg-gradient-to-br from-[#301B1B] via-[#191112] to-[#100D0D] p-5 sm:p-7">

        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#B68B45]/10 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

          <div className="flex items-center gap-4">

            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[#D6B875]/50 bg-[#D6B875]/10 font-serif text-2xl font-bold text-[#E8D5A8] shadow-lg">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>

            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#D6B875]">
                Rahul Jewellers
              </p>

              <h2 className="mt-1 truncate font-serif text-2xl text-[#F4E8CB]">
                {user?.name || 'Valued Customer'}
              </h2>

              <p className="mt-1 text-xs text-gray-400">
                {user?.phone || 'Phone not available'}
              </p>

              <p className="mt-1 text-[10px] text-gray-500">
                Customer ID:{' '}
                <span className="font-mono font-bold text-[#D6B875]">
                  {user?.customerId || 'N/A'}
                </span>
              </p>
            </div>

          </div>

          <div className="flex items-center gap-2 self-start rounded-full border border-[#D6B875]/30 bg-[#D6B875]/10 px-3 py-2 sm:self-center">
            <Crown className="h-4 w-4 text-[#D6B875]" />

            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#E8D5A8]">
              Member Account
            </span>
          </div>

        </div>

      </div>

      {/* NAVIGATION */}
      <div className="border-b border-white/10 bg-[#151111] px-3 py-3 sm:px-5">

        <div className="flex gap-2 overflow-x-auto pb-1">

          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2.5 text-[10px] font-bold transition-all sm:px-4 ${
                  isActive
                    ? 'border-[#D6B875]/60 bg-gradient-to-r from-[#9B773F] to-[#D6B875] text-[#17110B] shadow-lg'
                    : 'border-white/10 bg-white/[0.03] text-gray-400 hover:border-[#D6B875]/30 hover:text-[#E8D5A8]'
                }`}
              >
                <TabIcon className="h-3.5 w-3.5" />
                {tab.label}

                {tab.id === 'wishlist' && (
                  <span className="rounded-full bg-black/20 px-1.5 py-0.5 text-[9px]">
                    {wishlistItems.length}
                  </span>
                )}
              </button>
            );
          })}

        </div>

      </div>

      {/* CONTENT */}
      <div className="space-y-6 p-4 sm:p-7">

        {/* INSTALLMENT STATUS */}
        {statusBanner}

        {/* TAB 1: SCHEME */}
        {activeTab === 'scheme' && (
          <div className="mx-auto max-w-2xl space-y-5">

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#D6B875]/30 bg-[#D6B875]/10">
                <Calculator className="h-5 w-5 text-[#D6B875]" />
              </div>

              <div>
                <h3 className="font-serif text-lg text-[#F4E8CB]">
                  Your 12+1 Gold Scheme
                </h3>

                <p className="text-[10px] text-gray-500">
                  Your savings plan overview
                </p>
              </div>
            </div>

            {/* Scheme Card */}
            <div className="relative overflow-hidden rounded-3xl border border-[#D6B875]/35 bg-gradient-to-br from-[#2C1B19] to-[#120F0F] p-5 sm:p-7">

              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#D6B875]/10 blur-3xl" />

              <div className="relative">

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#D6B875]">
                      Monthly Contribution
                    </p>

                    <p className="mt-2 font-serif text-3xl text-[#F4E8CB]">
                      ₹{customInstallment.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#D6B875]/30 bg-[#D6B875]/10">
                    <Gem className="h-6 w-6 text-[#E2C27C]" />
                  </div>
                </div>

                <div className="my-5 h-px bg-[#D6B875]/20" />

                <div className="space-y-4 text-xs">

                  <div className="flex items-center justify-between gap-3 text-gray-400">
                    <span>Customer Pays (12 Months)</span>

                    <span className="font-mono font-bold text-[#F4E8CB]">
                      ₹{totalPaid.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-emerald-300">
                    <span className="flex items-center gap-2">
                      <Gift className="h-4 w-4" />
                      1 Month Free Store Bonus
                    </span>

                    <span className="font-mono font-bold">
                      + ₹{freeBonus.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t border-[#D6B875]/20 pt-4">
                    <span className="font-bold text-[#E8D5A8]">
                      Total Jewellery Value
                    </span>

                    <span className="font-serif text-xl font-bold text-[#E2C27C]">
                      ₹{totalValue.toLocaleString('en-IN')}
                    </span>
                  </div>

                </div>

              </div>
            </div>

            {/* Scheme Progress */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">

              <div className="mb-3 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">
                  Installment Progress
                </span>

                <span className="text-sm font-bold text-[#E2C27C]">
                  {Math.min(paidMonths, 12)} / 12
                </span>
              </div>

              <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#9B773F] to-[#F1D99B] transition-all duration-700"
                  style={{
                    width: `${Math.min((paidMonths / 12) * 100, 100)}%`
                  }}
                />
              </div>

              <div className="mt-3 grid grid-cols-6 gap-2">

                {Array.from({ length: 12 }).map((_, index) => {
                  const isPaid = index < paidMonths;

                  return (
                    <div
                      key={index}
                      className={`flex h-8 items-center justify-center rounded-lg border text-[9px] font-bold ${
                        isPaid
                          ? 'border-[#D6B875]/50 bg-[#A47B3F] text-white'
                          : 'border-white/10 bg-white/[0.03] text-gray-500'
                      }`}
                    >
                      {isPaid ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        `M${index + 1}`
                      )}
                    </div>
                  );
                })}

              </div>

            </div>

            <div className="rounded-2xl border border-[#D6B875]/25 bg-[#D6B875]/[0.06] p-4">
              <div className="flex items-start gap-3">
                <Gift className="h-5 w-5 shrink-0 text-[#D6B875]" />

                <div>
                  <p className="text-xs font-bold text-[#E8D5A8]">
                    Your 13th Month Benefit
                  </p>

                  <p className="mt-1 text-[11px] leading-relaxed text-gray-400">
                    Complete all 12 installments on time to qualify for the special store bonus, subject to the scheme terms.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: WISHLIST */}
        {activeTab === 'wishlist' && (
          <div className="space-y-5">

            <div className="flex items-center gap-3">
              <Heart className="h-5 w-5 text-[#D6B875]" />

              <div>
                <h3 className="font-serif text-lg text-[#F4E8CB]">
                  Your Wishlist
                </h3>

                <p className="text-[10px] text-gray-500">
                  Jewellery pieces you have saved
                </p>
              </div>
            </div>

            {wishlistItems.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#D6B875]/25 bg-white/[0.02] py-14 text-center">

                <Heart className="mx-auto h-9 w-9 text-[#D6B875]/50" />

                <p className="mt-3 text-sm font-semibold text-[#E8D5A8]">
                  Your wishlist is waiting
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Save your favourite jewellery pieces to find them here.
                </p>

              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                {wishlistItems.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 transition hover:border-[#D6B875]/30"
                  >

                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-16 w-16 shrink-0 rounded-xl border border-[#D6B875]/20 object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-xs font-bold text-[#F4E8CB]">
                        {item.title}
                      </p>

                      <p className="mt-1 font-serif text-sm font-bold text-[#E2C27C]">
                        ₹{Number(item.price || 0).toLocaleString('en-IN')}
                      </p>

                      <p className="mt-1 text-[9px] text-gray-500">
                        Saved jewellery
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleWishlist(item._id)}
                      disabled={removingWishlist === item._id}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
                      aria-label={`Remove ${item.title} from wishlist`}
                    >
                      {removingWishlist === item._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>

                  </div>
                ))}

              </div>
            )}

          </div>
        )}

        {/* TAB 3: PURCHASE HISTORY */}
        {activeTab === 'orders' && (
          <div className="space-y-5">

            <div className="flex items-center gap-3">
              <ShoppingBag className="h-5 w-5 text-[#D6B875]" />

              <div>
                <h3 className="font-serif text-lg text-[#F4E8CB]">
                  Purchase History
                </h3>

                <p className="text-[10px] text-gray-500">
                  Your previous store purchases
                </p>
              </div>
            </div>

            {purchaseHistory.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#D6B875]/25 bg-white/[0.02] py-14 text-center">

                <ShoppingBag className="mx-auto h-9 w-9 text-[#D6B875]/50" />

                <p className="mt-3 text-sm font-semibold text-[#E8D5A8]">
                  No purchase history yet
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Your previous store purchases will appear here.
                </p>

              </div>
            ) : (
              <div className="space-y-3">

                {purchaseHistory.map((order, idx) => (
                  <div
                    key={order.orderId || idx}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                  >

                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">

                      <div>
                        <p className="text-xs font-bold text-[#F4E8CB]">
                          Order #{order.orderId || idx + 1}
                        </p>

                        <p className="mt-1 flex items-center gap-1 text-[10px] text-gray-500">
                          <Calendar className="h-3 w-3" />

                          {order.date &&
                          !Number.isNaN(new Date(order.date).getTime())
                            ? new Date(order.date).toLocaleDateString('en-IN')
                            : 'Date unavailable'}
                        </p>
                      </div>

                      <p className="font-serif text-lg font-bold text-[#E2C27C]">
                        ₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}
                      </p>

                    </div>

                    <div className="mt-3 space-y-2">

                      {order.items?.map((product, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between gap-3 text-[11px]"
                        >
                          <span className="text-gray-300">
                            {product.title}
                            {product.weight ? ` (${product.weight})` : ''}
                            {' '}× {product.quantity}
                          </span>

                        </div>
                      ))}

                    </div>

                  </div>
                ))}

              </div>
            )}

          </div>
        )}

        {/* TAB 4: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="mx-auto max-w-xl space-y-5">

            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-[#D6B875]" />

              <div>
                <h3 className="font-serif text-lg text-[#F4E8CB]">
                  Account Settings
                </h3>

                <p className="text-[10px] text-gray-500">
                  Manage your customer profile information
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">

              {/* Name */}
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-[#D6B875]">
                  Full Name
                </label>

                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-4 w-4 text-[#D6B875]" />

                  <input
                    type="text"
                    required
                    value={settingsForm.name}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        name: e.target.value
                      })
                    }
                    className="w-full rounded-xl border border-[#D6B875]/25 bg-white/[0.04] py-3 pl-10 pr-3 text-xs font-semibold text-[#F4E8CB] outline-none transition placeholder:text-gray-600 focus:border-[#D6B875]"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-[#D6B875]">
                  Address
                </label>

                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-[#D6B875]" />

                  <textarea
                    rows={3}
                    value={settingsForm.address}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        address: e.target.value
                      })
                    }
                    className="w-full resize-y rounded-xl border border-[#D6B875]/25 bg-white/[0.04] py-3 pl-10 pr-3 text-xs font-semibold text-[#F4E8CB] outline-none transition placeholder:text-gray-600 focus:border-[#D6B875]"
                    placeholder="Enter your address"
                  />
                </div>

                <p className="mt-1 text-[9px] text-gray-500">
                  This is your saved account address, not a delivery or checkout option.
                </p>
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-[#D6B875]">
                  New Password (Optional)
                </label>

                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-[#D6B875]" />

                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={settingsForm.password}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        password: e.target.value
                      })
                    }
                    className="w-full rounded-xl border border-[#D6B875]/25 bg-white/[0.04] py-3 pl-10 pr-11 text-xs font-semibold text-[#F4E8CB] outline-none transition placeholder:text-gray-600 focus:border-[#D6B875]"
                    placeholder="Enter a new password"
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-500 transition hover:text-[#D6B875]"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Save */}
              <button
                type="submit"
                disabled={savingSettings}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#A47B3F] to-[#E6CC8D] py-3.5 text-xs font-black uppercase tracking-[0.15em] text-[#17110B] shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingSettings ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Save Account Settings
                  </>
                )}
              </button>

            </form>

          </div>
        )}

      </div>

      {/* FOOTER */}
      <div className="border-t border-[#BFA36A]/20 bg-[#0B0909] px-5 py-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <Crown className="h-3.5 w-3.5 text-[#D6B875]" />

          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-gray-500">
            Rahul Jewellers • Your Trusted Jewellery Destination
          </p>
        </div>
      </div>

    </div>
  );
}
