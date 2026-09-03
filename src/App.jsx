import React, { useState, useEffect } from 'react';
import axios from 'axios';
import html2pdf from 'html2pdf.js';

import GoldTicker from './components/goldticker';
import CustomerLoginModal from './components/loginmodal';

import { 
  Crown, 
  Sparkles, 
  Gem, 
  MessageCircle, 
  SlidersHorizontal, 
  Search, 
  CheckCircle2, 
  Clock, 
  Receipt, 
  History, 
  X, 
  Download, 
  LogOut,
  Smartphone,
  Lock
} from 'lucide-react';

const STORE_PHONE = '9950091024';

const getApiBaseUrl = () => {
  const currentHost = window.location.hostname;
  if (currentHost.includes('ngrok')) return 'https://squire-brought-decency.ngrok-free.dev';
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') return 'http://localhost:5000';
  return 'https://rahul-jewellers-backend-jlr0.onrender.com';
};

const API_BASE_URL = getApiBaseUrl();

const requestConfig = {
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  }
};

export default function App() {
  const [schemeUser, setSchemeUser] = useState(() => JSON.parse(localStorage.getItem('schemeUserInfo') || 'null'));

  const [activeTab, setActiveTab] = useState(() => {
    const savedUser = localStorage.getItem('schemeUserInfo');
    if (savedUser) return 'scheme';
    return sessionStorage.getItem('rj_customer_active_tab') || 'showroom';
  });

  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  
  const [storeUpiId, setStoreUpiId] = useState('9950091024@okbizaxis');
  const [storeMerchantName, setStoreMerchantName] = useState('Rahul Jewellers');
  const [storeQrCodeUrl, setStoreQrCodeUrl] = useState('');
  
  const [activePaymentMonth, setActivePaymentMonth] = useState(null);
  const [showInstructionModal, setShowInstructionModal] = useState(false);

  const handleTabChange = (tabName) => {
    if (tabName === 'scheme' && !schemeUser) {
      setShowLoginModal(true);
      return;
    }
    setActiveTab(tabName);
    sessionStorage.setItem('rj_customer_active_tab', tabName);
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/products`, requestConfig);
      if (res.data.success) setProducts(res.data.products);
    } catch (err) {
      console.error("Failed to load showroom items");
    }
  };

  const fetchStoreSettings = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/store/settings`, requestConfig);
      if (res.data.success && res.data.settings) {
        if (res.data.settings.upiId) setStoreUpiId(res.data.settings.upiId);
        if (res.data.settings.merchantName) setStoreMerchantName(res.data.settings.merchantName);
        if (res.data.settings.qrCodeUrl) setStoreQrCodeUrl(res.data.settings.qrCodeUrl);
      }
    } catch (err) {
      console.error("Failed to load store settings");
    }
  };

  const syncCustomerData = async () => {
    if (!schemeUser?._id) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/api/customer/profile/${schemeUser._id}`, requestConfig);
      if (res.data.success) {
        if (res.data.customer.isActive === false) {
          alert("Your scheme account has been deactivated by store admin.");
          handleSchemeLogout();
          return;
        }
        setSchemeUser(res.data.customer);
        localStorage.setItem('schemeUserInfo', JSON.stringify(res.data.customer));
      }
    } catch (err) {
      console.error("Failed to sync profile:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchStoreSettings();
    syncCustomerData();
  }, []);

  const handleSchemeLogout = () => {
    localStorage.removeItem('schemeUserInfo');
    setSchemeUser(null);
    handleTabChange('showroom');
  };

  const handleDownloadReceipt = (monthNum, amount) => {
    const element = document.createElement('div');
    element.innerHTML = `
      <div style="padding: 24px; font-family: sans-serif; border: 2px solid #18181b; border-radius: 12px; max-width: 400px; margin: auto;">
        <h2 style="text-align: center; margin-bottom: 4px; font-family: serif; color: #18181b;">RAHUL JEWELLERS</h2>
        <p style="text-align: center; font-size: 10px; color: #52525b; margin: 0; font-weight: bold; letter-spacing: 1px;">SHEOGANJ • OFFICIAL PAYMENT RECEIPT</p>
        <hr style="margin: 16px 0; border: 0; border-top: 1px solid #e4e4e7;" />
        <div style="font-size: 12px; line-height: 1.8;">
          <p style="margin: 0;"><strong>Customer Name:</strong> ${schemeUser?.name}</p>
          <p style="margin: 0;"><strong>Customer ID:</strong> ${schemeUser?.customerId}</p>
          <p style="margin: 0;"><strong>Phone:</strong> ${schemeUser?.phone}</p>
          <p style="margin: 0;"><strong>Installment Verified:</strong> Month #${monthNum}</p>
          <p style="margin: 0;"><strong>Amount:</strong> ₹${amount.toLocaleString('en-IN')}</p>
          <p style="margin: 0;"><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
          <p style="margin: 0;"><strong>Status:</strong> <span style="color: #15803d; font-weight: bold;">PAID / VERIFIED</span></p>
        </div>
        <hr style="margin: 16px 0; border: 0; border-top: 1px solid #e4e4e7;" />
        <p style="text-align: center; font-size: 10px; color: #71717a; margin: 0;">Support / Helpline: +91 ${STORE_PHONE}</p>
      </div>
    `;

    const opt = {
      margin: 0.5,
      filename: `Receipt_Month_${monthNum}_${schemeUser?.customerId}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesPrice = true;
    if (priceRange === 'under_50k') matchesPrice = p.price <= 50000;
    else if (priceRange === '50k_100k') matchesPrice = p.price > 50000 && p.price <= 100000;
    else if (priceRange === 'above_100k') matchesPrice = p.price > 100000;

    return matchesCategory && matchesSearch && matchesPrice;
  });

  const monthly = schemeUser?.customInstallment || 10000;
  const paidCount = schemeUser?.paidMonths || 0;
  const progressPercent = Math.min(100, (paidCount / 12) * 100);

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-zinc-900 pb-12">
      <GoldTicker rate24K="1,58,390" rate22K="1,45,190" />

      <header className="bg-stone-900 text-white sticky top-0 z-40 shadow-xl border-b border-amber-500/20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-600 to-amber-800 p-0.5 shadow-lg">
              <div className="w-full h-full bg-stone-950 rounded-[14px] flex items-center justify-center text-amber-400">
                <Crown className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h1 className="text-base font-serif font-bold tracking-widest bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-100 bg-clip-text text-transparent uppercase">
                RAHUL JEWELLERS
              </h1>
              <p className="text-[9px] text-amber-500/80 font-bold tracking-widest uppercase">SHEOGANJ SHOWROOM</p>
            </div>
          </div>

          <div className="bg-stone-950/80 p-1.5 rounded-full border border-amber-500/30 backdrop-blur-md flex items-center gap-1.5">
            <button
              onClick={() => handleTabChange('showroom')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'showroom' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Gem className="w-3.5 h-3.5" /> Showroom
            </button>

            <button
              onClick={() => handleTabChange('scheme')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider transition flex items-center gap-1.5 ${
                activeTab === 'scheme' && schemeUser
                  ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-stone-950 border border-amber-300'
                  : 'bg-stone-900 text-amber-300 border border-amber-500/50 hover:bg-stone-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="uppercase font-extrabold">Scheme</span>
            </button>

            {schemeUser && (
              <button
                onClick={handleSchemeLogout}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1 transition border border-red-500/30"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-6">
        {activeTab === 'showroom' && (
          <div className="space-y-6">
            <div className="relative rounded-3xl overflow-hidden bg-stone-900 text-white p-6 sm:p-10 border border-stone-800 shadow-xl flex flex-col justify-end min-h-[220px]">
              <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-900/70 to-transparent z-10" />
              <img 
                src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1200&auto=format&fit=crop" 
                alt="Rahul Jewellers Luxury Collection" 
                className="absolute inset-0 w-full h-full object-cover opacity-50"
              />
              <div className="relative z-20 space-y-2 max-w-lg">
                <span className="text-[10px] font-bold text-amber-400 tracking-widest uppercase bg-amber-950/80 px-3 py-1 rounded-full border border-amber-700/50">
                  SHEOGANJ EXCLUSIVE SHOWROOM
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100">
                  Pure 916 Hallmarked Gold & Silver Jewellery
                </h2>
                <p className="text-xs text-stone-300 font-medium">
                  Crafting trust and royal heritage with bespoke bridal sets, antique kadas, and authentic Kundan craftsmanship.
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search kadas, necklaces, rings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-amber-600 transition"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <SlidersHorizontal className="w-4 h-4 text-stone-500" />
                  <span className="text-xs font-bold text-stone-700 shrink-0">Price Filter:</span>
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 outline-none"
                  >
                    <option value="All">All Price Ranges</option>
                    <option value="under_50k">Under ₹50,000</option>
                    <option value="50k_100k">₹50,001 - ₹1,00,000</option>
                    <option value="above_100k">Above ₹1,00,000</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-stone-100 overflow-x-auto pb-1 text-xs font-bold">
                {['All', 'Gold', 'Silver', 'Bridal Wear', 'Antique'].map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-1.5 rounded-full transition shrink-0 ${
                      selectedCategory === category 
                        ? 'bg-amber-900 text-white shadow-sm' 
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {category === 'All' ? 'All Collections' : `${category} Collection`}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.length === 0 ? (
                <div className="col-span-full py-16 text-center space-y-2 bg-white rounded-3xl border border-stone-200">
                  <Gem className="w-8 h-8 text-stone-300 mx-auto" />
                  <p className="text-xs font-bold text-stone-500">No matching jewelry items found.</p>
                </div>
              ) : (
                filteredProducts.map((p) => {
                  const whatsappMessage = `Namaste Rahul Jewellers (Sheoganj), I am interested in this item:\n\n*Title:* ${p.title}\n*Category:* ${p.category}\n*Net Weight:* ${p.weight}\n*Price:* ₹${p.price.toLocaleString('en-IN')}\n*Image:* ${p.imageUrl}\n\nPlease share further details.`;
                  const whatsappUrl = `https://wa.me/91${STORE_PHONE}?text=${encodeURIComponent(whatsappMessage)}`;

                  return (
                    <div 
                      key={p._id}
                      className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group"
                    >
                      <div className="relative aspect-square bg-stone-100 overflow-hidden">
                        <img 
                          src={p.imageUrl} 
                          alt={p.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-2 left-2 bg-stone-900/80 backdrop-blur-sm text-amber-300 text-[9px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                          {p.category}
                        </span>
                      </div>

                      <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                        <div className="space-y-1">
                          <h3 className="text-xs font-bold text-stone-900 line-clamp-2 leading-snug">{p.title}</h3>
                          <p className="text-[10px] text-stone-500 font-semibold">Net Weight: <span className="text-stone-900 font-bold">{p.weight}</span></p>
                        </div>

                        <div className="pt-2 border-t border-stone-100">
                          <p className="text-[9px] font-bold text-stone-400 uppercase">STORE PRICE</p>
                          <p className="text-sm font-black text-amber-900 font-serif">₹{p.price.toLocaleString('en-IN')}</p>
                        </div>

                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => window.open(whatsappUrl, '_blank', 'noopener,noreferrer')}
                            className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95"
                          >
                            <MessageCircle className="w-4 h-4" /> Enquire on WhatsApp
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'scheme' && schemeUser && (
          <div className="max-w-md mx-auto space-y-4">
            <div className="bg-white p-6 rounded-3xl border-2 border-zinc-900 shadow-xl space-y-4">
              <div className="flex justify-between items-start border-b border-stone-200 pb-3">
                <div>
                  <h2 className="text-lg font-bold text-stone-900">{schemeUser.name}</h2>
                  <p className="text-xs text-stone-500 font-medium">Ph: {schemeUser.phone}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs font-mono font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                    ID: {schemeUser.customerId}
                  </span>
                  <button
                    onClick={handleSchemeLogout}
                    className="text-[10px] font-bold text-red-600 hover:underline flex items-center gap-0.5"
                  >
                    <LogOut className="w-3 h-3" /> Logout
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-stone-700 uppercase">12+1 Bonus Scheme Progress</span>
                  <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {paidCount}/12 Paid
                  </span>
                </div>

                <div className="w-full bg-stone-100 h-3.5 rounded-full border border-stone-300 overflow-hidden p-0.5">
                  <div className="bg-amber-800 h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                </div>

                <div className="flex justify-between text-[11px] font-medium text-stone-500 pt-1">
                  <span>Total Paid: ₹{(paidCount * monthly).toLocaleString('en-IN')}</span>
                  <span>Target: ₹{(12 * monthly).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                onClick={() => setShowHistoryModal(true)}
                className="w-full py-2.5 bg-stone-100 hover:bg-amber-50 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <History className="w-4 h-4" /> View Downloadable Receipts
              </button>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-center gap-2.5 text-amber-950 text-xs font-medium">
                <Sparkles className="w-4 h-4 text-amber-800 shrink-0" />
                <p>
                  Complete 12 installments to get <span className="font-bold underline">1 Month Free Store Bonus (₹{monthly.toLocaleString('en-IN')})</span>!
                </p>
              </div>
            </div>

            {/* PASSBOOK CHECKLIST */}
            <div className="bg-white p-6 rounded-3xl border-2 border-zinc-900 shadow-xl space-y-3">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-amber-800" /> Scheme Passbook Status
              </h3>

              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {Array.from({ length: 12 }).map((_, index) => {
                  const monthNum = index + 1;
                  const isPaid = monthNum <= paidCount;
                  const isNextDue = monthNum === paidCount + 1;

                  return (
                    <div
                      key={monthNum}
                      className={`p-3.5 rounded-2xl border-2 flex items-center justify-between text-xs transition ${
                        isPaid ? 'bg-emerald-50 border-emerald-600' : isNextDue ? 'bg-amber-50/50 border-amber-400' : 'bg-stone-50 border-stone-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isPaid ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : isNextDue ? (
                          <Clock className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
                        ) : (
                          <Lock className="w-4 h-4 text-stone-400 shrink-0" />
                        )}
                        <div>
                          <p className="font-bold text-stone-900">Month #{monthNum}</p>
                          <p className="text-[11px] text-stone-500 font-medium">
                            ₹{monthly.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>

                      {isPaid ? (
                        <span className="text-xs font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-xl border border-emerald-300 shadow-sm">
                          Paid / Verified
                        </span>
                      ) : isNextDue ? (
                        <button
                          onClick={() => setActivePaymentMonth(monthNum)}
                          className="px-3.5 py-1.5 bg-[#E65C00] hover:bg-[#CC5200] text-white font-extrabold rounded-xl shadow-sm transition flex items-center gap-1.5 text-xs uppercase animate-bounce"
                        >
                          <Smartphone className="w-3.5 h-3.5" /> Pay
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-stone-500 bg-stone-200 px-2.5 py-1 rounded-lg">
                          Locked (Pay #{paidCount + 1} First)
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      <CustomerLoginModal 
        isOpen={showLoginModal} 
        onClose={() => {
          setShowLoginModal(false);
          if (!schemeUser) handleTabChange('showroom');
        }}
        onLoginSuccess={(user) => {
          setSchemeUser(user);
          localStorage.setItem('schemeUserInfo', JSON.stringify(user));
          syncCustomerData();
          setShowLoginModal(false);
          handleTabChange('scheme');
        }}
      />

      {/* UPI INTENT MODAL WITH DYNAMIC STORE QR CODE DISPLAY */}
      {activePaymentMonth !== null && (() => {
        const note = encodeURIComponent(`Month ${activePaymentMonth} ${schemeUser?.customerId || ''}`);
        const upiIntentUri = `upi://pay?pa=${encodeURIComponent(storeUpiId)}&pn=${encodeURIComponent(storeMerchantName)}&am=${monthly}&cu=INR&tn=${note}`;

        return (
          <div className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-sm w-full p-6 rounded-3xl border-2 border-zinc-900 shadow-2xl space-y-4 text-center">
              <div className="w-12 h-12 bg-amber-100 border border-amber-300 rounded-2xl flex items-center justify-center text-amber-800 mx-auto">
                <Smartphone className="w-6 h-6 text-[#E65C00]" />
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-black uppercase text-stone-900">
                  Pay Month #{activePaymentMonth}
                </h3>
                <p className="text-xs text-stone-600 font-medium">
                  Amount: <strong className="text-[#E65C00]">₹{monthly.toLocaleString('en-IN')}</strong> to <span className="font-mono">{storeUpiId}</span>
                </p>
              </div>

              {storeQrCodeUrl ? (
                <div className="p-3 bg-stone-50 rounded-2xl border-2 border-stone-200 flex flex-col items-center gap-2">
                  <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Scan QR Code via UPI App</p>
                  <img src={storeQrCodeUrl} alt="Store UPI QR Code" className="w-40 h-40 object-contain rounded-xl border border-stone-300 bg-white p-1" />
                </div>
              ) : (
                <div className="p-3 bg-amber-50 rounded-xl text-[11px] text-amber-800 font-medium border border-amber-200">
                  Tip: Admin can upload a custom Store QR code in Folders & UPI section.
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  window.location.href = upiIntentUri;
                  setShowInstructionModal(true);
                }}
                className="w-full py-3.5 bg-[#E65C00] hover:bg-[#CC5200] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4" /> Open UPI App & Pay
              </button>

              <button
                onClick={() => setActivePaymentMonth(null)}
                className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs uppercase rounded-xl transition"
              >
                Cancel
              </button>
            </div>
          </div>
        );
      })()}

      {/* POST-PAYMENT INSTRUCTION MODAL */}
      {showInstructionModal && (
        <div className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full p-6 rounded-3xl border-2 border-zinc-900 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 bg-amber-100 border border-amber-300 rounded-2xl flex items-center justify-center text-amber-800 mx-auto">
              <Smartphone className="w-6 h-6 text-[#E65C00]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-black uppercase text-stone-900">Payment Redirected</h3>
              <p className="text-xs text-stone-600 leading-relaxed font-medium">
                Your UPI app has been opened to process the payment.
              </p>
            </div>

            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-stone-900 text-xs space-y-2 font-medium text-left">
              <p className="font-bold text-amber-900 uppercase text-[10px]">Important Next Step:</p>
              <p>
                1. Complete the payment in your UPI app.<br />
                2. Take a screenshot of the payment receipt.<br />
                3. Send the screenshot on WhatsApp to store number: <strong className="text-[#E65C00] select-all">9950091024</strong>.
              </p>
            </div>

            <div className="p-2 bg-stone-100 rounded-xl text-[11px] text-stone-500 font-bold">
              The admin will verify your screenshot and update your passbook status manually.
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => window.open(`https://wa.me/919950091024?text=${encodeURIComponent(`Namaste Rahul Jewellers, I have paid ₹${monthly} for Month #${activePaymentMonth} of Scheme ID ${schemeUser?.customerId}. Here is my payment screenshot:`)}`, '_blank', 'noopener,noreferrer')}
                className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4" /> Send Screenshot
              </button>
              <button
                onClick={() => {
                  setShowInstructionModal(false);
                  setActivePaymentMonth(null);
                }}
                className="px-4 py-3 bg-stone-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full p-6 rounded-3xl border-2 border-zinc-900 shadow-2xl space-y-4 text-stone-800">
            <div className="flex justify-between items-center border-b border-stone-200 pb-2">
              <h3 className="text-xs font-bold text-stone-900 uppercase flex items-center gap-1.5">
                <History className="w-4 h-4 text-amber-800" /> Payment Receipts
              </h3>
              <button onClick={() => setShowHistoryModal(false)} className="p-1 hover:bg-stone-100 rounded-lg text-stone-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {paidCount === 0 ? (
                <p className="text-xs text-stone-500 py-6 text-center font-medium">No completed transactions yet.</p>
              ) : (
                Array.from({ length: paidCount }).map((_, index) => {
                  const monthNum = index + 1;
                  return (
                    <div key={monthNum} className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-stone-900">Installment #{monthNum}</p>
                        <p className="text-[10px] text-stone-500 font-mono">₹{monthly.toLocaleString('en-IN')} • Paid</p>
                      </div>
                      <button
                        onClick={() => handleDownloadReceipt(monthNum, monthly)}
                        className="px-2.5 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl font-bold text-[10px] flex items-center gap-1 shadow-sm transition"
                      >
                        <Download className="w-3 h-3" /> Receipt PDF
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}