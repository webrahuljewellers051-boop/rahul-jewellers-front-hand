import React, { useState } from 'react';
import axios from 'axios';
import { 
  User, 
  ShoppingBag, 
  Heart, 
  ShoppingCart, 
  Settings, 
  Trash2, 
  Plus, 
  Minus, 
  Lock, 
  MapPin, 
  ShieldCheck, 
  MessageCircle,
  Gem,
  Calendar,
  AlertCircle,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

const API_BASE_URL = 'https://rahul-jewellers-backend-jlr0.onrender.com';
const requestConfig = {
  headers: {
    'ngrok-skip-browser-warning': 'true'
  }
};

export default function ProfileDashboard({ user, onUpdateUser }) {
  const [activeTab, setActiveTab] = useState('cart');

  const [settingsForm, setSettingsForm] = useState({
    name: user?.name || '',
    address: user?.address || '',
    password: ''
  });
  const [savingSettings, setSavingSettings] = useState(false);

  const handleQuantityChange = async (productId, currentQty, delta) => {
    const newQty = currentQty + delta;
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/customer/cart/update`, 
        {
          userId: user._id,
          productId,
          quantity: newQty
        },
        requestConfig
      );
      if (res.data.success) {
        onUpdateUser(res.data.user);
      }
    } catch (err) {
      alert('Failed to update cart quantity.');
    }
  };

  const handleToggleWishlist = async (productId) => {
    try {
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
      alert('Failed to update wishlist.');
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/customer/settings/update`, 
        {
          userId: user._id,
          name: settingsForm.name,
          address: settingsForm.address,
          ...(settingsForm.password ? { password: settingsForm.password } : {})
        },
        requestConfig
      );

      if (res.data.success) {
        alert('🎉 Account Settings Updated Successfully!');
        onUpdateUser(res.data.user);
        setSettingsForm((prev) => ({ ...prev, password: '' }));
      }
    } catch (err) {
      alert('Failed to update settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  // --- INSTALLMENT STATUS CALCULATIONS ---
  const paidMonths = user?.paidMonths || 0;
  const nextMonthNum = paidMonths + 1;

  const getNextDueDate = () => {
    if (!user?.startDate) return new Date();
    const start = new Date(user.startDate);
    start.setMonth(start.getMonth() + paidMonths); 
    return start;
  };

  const dueDate = getNextDueDate();
  const today = new Date();
  const diffTime = today - dueDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  let statusBanner = null;

  if (paidMonths >= 12) {
    statusBanner = (
      <div className="p-4 bg-emerald-50 border-2 border-emerald-500 rounded-2xl flex items-center gap-3 text-emerald-900">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
        <div>
          <p className="font-bold text-sm">Scheme Completed!</p>
          <p className="text-xs text-emerald-700">All 12 installments plus your free bonus month are unlocked.</p>
        </div>
      </div>
    );
  } else if (diffDays > 5) {
    statusBanner = (
      <div className="p-4 bg-red-50 border-2 border-red-500 rounded-2xl flex items-center gap-3 text-red-900">
        <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
        <div>
          <p className="font-bold text-sm">Critical Warning: Scheme Pending Cancellation</p>
          <p className="text-xs text-red-700">
            Your installment for Month #{nextMonthNum} is over 5 days late (Due: {dueDate.toLocaleDateString()}). Please clear your dues immediately to prevent scheme termination.
          </p>
        </div>
      </div>
    );
  } else if (diffDays > 0) {
    statusBanner = (
      <div className="p-4 bg-amber-50 border-2 border-amber-400 rounded-2xl flex items-center gap-3 text-amber-900">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
        <div>
          <p className="font-bold text-sm">Payment Reminder</p>
          <p className="text-xs text-amber-800">
            Your installment for Month #{nextMonthNum} was due on {dueDate.toLocaleDateString()}. Please make your payment to avoid late penalties.
          </p>
        </div>
      </div>
    );
  } else {
    statusBanner = (
      <div className="p-4 bg-stone-50 border-2 border-stone-200 rounded-2xl flex items-center gap-3 text-stone-800">
        <Calendar className="w-5 h-5 text-[#E65C00] shrink-0" />
        <div>
          <p className="font-bold text-sm">Next Installment Due</p>
          <p className="text-xs text-stone-600">
            Month #{nextMonthNum} due by: <span className="font-bold text-stone-900">{dueDate.toLocaleDateString()}</span>
          </p>
        </div>
      </div>
    );
  }

  const cartItems = user?.cart || [];
  const cartTotal = cartItems.reduce((acc, item) => {
    const price = item.product?.price || 0;
    return acc + price * item.quantity;
  }, 0);

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-3xl border-2 border-zinc-900 shadow-xl overflow-hidden font-sans text-zinc-900 my-6">
      
      {/* USER PROFILE HEADER */}
      <div className="bg-stone-900 text-white p-6 border-b-2 border-zinc-900 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 font-serif font-bold text-xl">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-lg font-bold">{user?.name}</h2>
            <p className="text-xs text-stone-400">Ph: {user?.phone} • ID: <span className="text-amber-400 font-mono font-bold">{user?.customerId}</span></p>
          </div>
        </div>

        <div className="flex bg-stone-950 p-1.5 rounded-2xl border border-stone-800 text-xs font-bold gap-1 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('cart')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition ${activeTab === 'cart' ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-white'}`}
          >
            <ShoppingCart className="w-3.5 h-3.5" /> Cart ({cartItems.length})
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition ${activeTab === 'wishlist' ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-white'}`}
          >
            <Heart className="w-3.5 h-3.5" /> Wishlist ({user?.wishlist?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition ${activeTab === 'orders' ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-white'}`}
          >
            <ShoppingBag className="w-3.5 h-3.5" /> Purchases
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition ${activeTab === 'settings' ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-white'}`}
          >
            <Settings className="w-3.5 h-3.5" /> Settings
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">

        {/* INSTALLMENT STATUS REMINDER / WARNING BANNER */}
        {statusBanner}

        {/* TAB 1: CART */}
        {activeTab === 'cart' && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-amber-800" /> Shopping Cart Items
            </h3>

            {cartItems.length === 0 ? (
              <div className="text-center py-12 space-y-2 border-2 border-dashed border-stone-200 rounded-3xl">
                <Gem className="w-8 h-8 text-stone-300 mx-auto" />
                <p className="text-xs font-bold text-stone-500">Your shopping cart is currently empty.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map((item) => (
                  item.product && (
                    <div key={item.product._id} className="p-3.5 bg-stone-50 rounded-2xl border-2 border-zinc-900 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <img src={item.product.imageUrl} alt={item.product.title} className="w-14 h-14 object-cover rounded-xl border border-zinc-300" />
                        <div>
                          <p className="font-bold text-zinc-900">{item.product.title}</p>
                          <p className="text-[10px] text-zinc-500 font-bold">Weight: {item.product.weight}</p>
                          <p className="font-black text-emerald-800">₹{item.product.price?.toLocaleString('en-IN')}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-white border-2 border-zinc-900 rounded-xl overflow-hidden font-bold">
                          <button onClick={() => handleQuantityChange(item.product._id, item.quantity, -1)} className="p-1.5 hover:bg-stone-100">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 text-xs">{item.quantity}</span>
                          <button onClick={() => handleQuantityChange(item.product._id, item.quantity, 1)} className="p-1.5 hover:bg-stone-100">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button onClick={() => handleQuantityChange(item.product._id, item.quantity, -item.quantity)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                ))}

                <div className="p-4 bg-amber-50 rounded-2xl border-2 border-zinc-900 flex justify-between items-center pt-3">
                  <div>
                    <p className="text-[10px] font-bold text-stone-500 uppercase">Subtotal Amount</p>
                    <p className="text-lg font-black text-amber-900 font-serif">₹{cartTotal.toLocaleString('en-IN')}</p>
                  </div>
                  <a
                    href={`https://wa.me/919829000000?text=${encodeURIComponent(`Namaste Rahul Jewellers, I would like to place an order for the items in my cart. Total Value: ₹${cartTotal.toLocaleString('en-IN')}.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md"
                  >
                    <MessageCircle className="w-4 h-4" /> Checkout via WhatsApp
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: WISHLIST */}
        {activeTab === 'wishlist' && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
              <Heart className="w-4 h-4 text-amber-800" /> Saved Wishlist Items
            </h3>

            {!user?.wishlist || user.wishlist.length === 0 ? (
              <div className="text-center py-12 space-y-2 border-2 border-dashed border-stone-200 rounded-3xl">
                <Heart className="w-8 h-8 text-stone-300 mx-auto" />
                <p className="text-xs font-bold text-stone-500">No favorite items added to your wishlist yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {user.wishlist.map((item) => (
                  <div key={item._id} className="p-3 bg-stone-50 rounded-2xl border-2 border-zinc-900 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <img src={item.imageUrl} alt={item.title} className="w-12 h-12 object-cover rounded-xl border border-zinc-300" />
                      <div>
                        <p className="font-bold text-zinc-900 line-clamp-1">{item.title}</p>
                        <p className="font-black text-amber-900">₹{item.price?.toLocaleString('en-IN')}</p>
                      </div>
                    </div>

                    <button onClick={() => handleToggleWishlist(item._id)} className="p-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-800" /> Past Purchase Receipts
            </h3>

            {!user?.purchaseHistory || user.purchaseHistory.length === 0 ? (
              <div className="text-center py-12 space-y-2 border-2 border-dashed border-stone-200 rounded-3xl">
                <ShoppingBag className="w-8 h-8 text-stone-300 mx-auto" />
                <p className="text-xs font-bold text-stone-500">No past purchases found on your account.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {user.purchaseHistory.map((order, idx) => (
                  <div key={idx} className="p-4 bg-stone-50 rounded-2xl border-2 border-zinc-900 space-y-2 text-xs">
                    <div className="flex justify-between items-center border-b border-stone-200 pb-2">
                      <div>
                        <p className="font-bold text-zinc-900">Order #{order.orderId}</p>
                        <p className="text-[10px] text-stone-500">{new Date(order.date).toLocaleDateString('en-IN')}</p>
                      </div>
                      <span className="font-black text-emerald-800">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="space-y-1">
                      {order.items?.map((p, i) => (
                        <p key={i} className="text-[11px] text-stone-700 font-medium">
                          • {p.title} ({p.weight}) x {p.quantity}
                        </p>
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
          <form onSubmit={handleSaveSettings} className="space-y-4 max-w-md mx-auto text-xs">
            <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-2 mb-2">
              <Settings className="w-4 h-4 text-amber-800" /> Account Settings
            </h3>

            <div>
              <label className="font-bold text-stone-700 uppercase block mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={settingsForm.name}
                  onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border-2 border-zinc-900 rounded-xl font-bold outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-stone-700 uppercase block mb-1">Delivery Address</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <textarea
                  rows="2"
                  required
                  value={settingsForm.address}
                  onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border-2 border-zinc-900 rounded-xl font-bold outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-stone-700 uppercase block mb-1">New Password (Optional)</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={settingsForm.password}
                  onChange={(e) => setSettingsForm({ ...settingsForm, password: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border-2 border-zinc-900 rounded-xl font-bold outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              className="w-full py-3 bg-amber-900 hover:bg-amber-950 border-2 border-zinc-900 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-md transition flex items-center justify-center gap-2"
            >
              {savingSettings ? 'Saving...' : 'Save Settings'} <ShieldCheck className="w-4 h-4" />
            </button>
          </form>
        )}

      </div>
    </div>
  );
}