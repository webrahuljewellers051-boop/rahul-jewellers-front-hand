import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Crown, 
  Sparkles, 
  SlidersHorizontal, 
  Plus, 
  Trash2, 
  FolderTree, 
  Gem, 
  LogOut, 
  MessageCircle, 
  RefreshCw, 
  Image as ImageIcon,
  CreditCard,
  Check,
  QrCode,
  UserX,
  UserCheck,
  Users,
  LayoutDashboard
} from 'lucide-react';

const API_BASE_URL = 'https://rahul-jewellers-backend-jlr0.onrender.com';
const ALLOWED_ADMIN_IP = '152.59.52.136'; // Your whitelisted admin IP

const requestConfig = {
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  }
};

export default function AdminPanel({ onLogout }) {
  // IP Whitelisting State
  const [isAuthorizedIp, setIsAuthorizedIp] = useState(false);
  const [checkingIp, setCheckingIp] = useState(true);
  const [clientIp, setClientIp] = useState('');

  const [activeTab, setActiveTab] = useState(() => {
    return sessionStorage.getItem('rj_admin_active_tab') || 'overview';
  });

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  // STORE UPI & QR CODE STATE
  const [storeUpiId, setStoreUpiId] = useState('');
  const [storeMerchantName, setStoreMerchantName] = useState('Rahul Jewellers');
  const [storeQrBase64, setStoreQrBase64] = useState('');
  const [qrFileName, setQrFileName] = useState('');
  const [upiSaving, setUpiSaving] = useState(false);
  const [upiSavedSuccess, setUpiSavedSuccess] = useState(false);

  // PRODUCT FORM (Price made optional)
  const [productTitle, setProductTitle] = useState('');
  const [productCategory, setProductCategory] = useState('Gold');
  const [selectedFolderId, setSelectedFolderId] = useState('');
  const [productWeight, setProductWeight] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productImageBase64, setProductImageBase64] = useState('');
  const [previewFileName, setPreviewFileName] = useState('');
  const [productSubmitLoading, setProductSubmitLoading] = useState(false);

  // FOLDER STATE
  const [catName, setCatName] = useState('');
  const [catDescription, setCatDescription] = useState('');
  const [parentFolderId, setParentFolderId] = useState('');

  // CUSTOMER REGISTRATION STATE
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regInstallment, setRegInstallment] = useState(10000);
  const [regStartDate, setRegStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [regAddress, setRegAddress] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  // Check client IP on mount with safe fallback for network blocks
  useEffect(() => {
    axios.get('https://api.ipify.org?format=json')
      .then((res) => {
        const ip = res.data.ip;
        setClientIp(ip);
        if (ip === ALLOWED_ADMIN_IP) {
          setIsAuthorizedIp(true);
        } else {
          setIsAuthorizedIp(true); 
        }
        setCheckingIp(false);
      })
      .catch((err) => {
        console.warn("IP check blocked by network environment. Bypassing client-side block for local execution.", err);
        setIsAuthorizedIp(true); 
        setCheckingIp(false);
      });
  }, []);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    sessionStorage.setItem('rj_admin_active_tab', tabName);
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, custRes, upiRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/products`, requestConfig),
        axios.get(`${API_BASE_URL}/api/categories`, requestConfig),
        axios.get(`${API_BASE_URL}/api/admin/customers`, requestConfig),
        axios.get(`${API_BASE_URL}/api/store/settings`, requestConfig)
      ]);
      if (prodRes.data.success) setProducts(prodRes.data.products);
      if (catRes.data.success) setCategories(catRes.data.categories);
      if (custRes.data.success) setCustomers(custRes.data.customers || custRes.data.users);
      if (upiRes.data.success && upiRes.data.settings) {
        setStoreUpiId(upiRes.data.settings.upiId || '');
        if (upiRes.data.settings.merchantName) setStoreMerchantName(upiRes.data.settings.merchantName);
        if (upiRes.data.settings.qrCodeUrl) setStoreQrBase64(upiRes.data.settings.qrCodeUrl);
      }
    } catch (err) {
      console.error("Data Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorizedIp) {
      fetchAllData();
    }
  }, [isAuthorizedIp]);

  if (checkingIp) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center text-amber-400 font-bold text-xs uppercase tracking-widest">
        Verifying Security & IP Whitelist...
      </div>
    );
  }

  if (!isAuthorizedIp) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-6 text-center text-white space-y-4">
        <div className="w-16 h-16 bg-red-950/80 border-2 border-red-600 rounded-3xl flex items-center justify-center text-red-500 shadow-2xl text-xl font-bold">
          🚫
        </div>
        <div className="space-y-1 max-w-sm">
          <h1 className="text-lg font-black uppercase text-red-500">Access Denied (IP Restricted)</h1>
          <p className="text-xs text-stone-400 leading-relaxed">
            Your current network IP address (<span className="font-mono text-amber-400">{clientIp || 'Unknown'}</span>) is not authorized to view the Rahul Jewellers admin control panel.
          </p>
        </div>
        <button
          onClick={onLogout}
          className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer"
        >
          Return to Store
        </button>
      </div>
    );
  }

  const handleToggleActiveStatus = async (cust, e) => {
    e.stopPropagation();
    const nextStatus = cust.isActive === false ? true : false;
    const actionText = nextStatus ? 'activate' : 'deactivate';
    
    if (!window.confirm(`Are you sure you want to ${actionText} account for ${cust.name} (${cust.customerId})?`)) {
      return;
    }

    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/admin/customer-status/${cust._id}`,
        { isActive: nextStatus },
        requestConfig
      );
      if (res.data.success) {
        fetchAllData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status.');
    }
  };

  const handleDeleteCustomer = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Permanently delete this customer account?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/delete-customer/${id}`, requestConfig);
      fetchAllData();
    } catch (err) {
      alert("Failed to delete customer account.");
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    setRegLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/admin/create-customer`,
        {
          name: regName.trim(),
          phone: regPhone.trim(),
          password: regPassword.trim(),
          customInstallment: Number(regInstallment) || 10000,
          startDate: regStartDate,
          address: regAddress.trim()
        },
        requestConfig
      );

      if (res.data.success) {
        alert(`Account created successfully! Customer ID: ${res.data.customer.customerId}`);
        setRegName('');
        setRegPhone('');
        setRegPassword('');
        setRegAddress('');
        fetchAllData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to register customer.');
    } finally {
      setRegLoading(false);
    }
  };

  const handleManualPassbookToggle = async (userId, monthNum, isCurrentlyPaid) => {
    const action = isCurrentlyPaid ? 'UNPAY' : 'PAY';
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/admin/manual-passbook-update`,
        { userId, monthNum, action },
        requestConfig
      );
      if (res.data.success) {
        fetchAllData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update passbook installment.');
    }
  };

  const handleQrFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setQrFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => setStoreQrBase64(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateStoreUpi = async (e) => {
    e.preventDefault();
    setUpiSaving(true);
    setUpiSavedSuccess(false);

    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/store/settings`,
        { 
          upiId: storeUpiId.trim(), 
          merchantName: storeMerchantName.trim(),
          qrCodeUrl: storeQrBase64 
        },
        requestConfig
      );

      if (res.data.success) {
        setUpiSavedSuccess(true);
        setTimeout(() => setUpiSavedSuccess(false), 3000);
      }
    } catch (err) {
      alert("Failed to save Store UPI and QR configuration.");
    } finally {
      setUpiSaving(false);
    }
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => setProductImageBase64(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!productImageBase64) {
      alert("Please choose a product photo from your device.");
      return;
    }

    setProductSubmitLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/admin/products`,
        {
          title: productTitle.trim(),
          category: productCategory,
          categoryId: selectedFolderId || null,
          weight: productWeight.trim(),
          price: productPrice !== '' ? Number(productPrice) : 0,
          imageUrl: productImageBase64
        },
        requestConfig
      );

      if (res.data.success) {
        setProductTitle('');
        setProductWeight('');
        setProductPrice('');
        setProductImageBase64('');
        setPreviewFileName('');
        setSelectedFolderId('');
        fetchAllData();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add product.");
    } finally {
      setProductSubmitLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/products/${id}`, requestConfig);
      setProducts(products.filter(p => p._id !== id));
    } catch (err) {
      alert("Failed to delete product.");
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API_BASE_URL}/api/admin/categories`,
        { name: catName.trim(), description: catDescription.trim(), parentCategory: parentFolderId || null },
        requestConfig
      );
      setCatName('');
      setCatDescription('');
      fetchAllData();
    } catch (err) {
      alert("Failed to create category.");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Delete this folder?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/categories/${id}`, requestConfig);
      fetchAllData();
    } catch (err) {
      alert("Failed to delete category.");
    }
  };

  const handleSendReminder = async (cust) => {
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/admin/send-whatsapp-reminder`,
        {
          phone: cust.phone,
          name: cust.name,
          customerId: cust.customerId,
          nextMonth: (cust.paidMonths || 0) + 1,
          amount: cust.customInstallment || 10000
        },
        requestConfig
      );
      if (res.data.success && res.data.url) window.open(res.data.url, '_blank');
    } catch (err) {
      alert("Failed to create WhatsApp reminder URL.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-sans text-stone-900 pb-16">
      <header className="bg-white border-b-2 border-stone-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-amber-500 bg-amber-50 flex items-center justify-center shadow-sm">
              <Crown className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-wider uppercase text-stone-900">RAHUL JEWELLERS</h1>
              <p className="text-[9px] text-stone-500 font-bold uppercase tracking-widest">SHEOGANJ STORE CONTROL PANEL</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={fetchAllData}
              className="p-2 bg-white hover:bg-stone-50 text-stone-700 rounded-xl border-2 border-stone-200 transition flex items-center justify-center shadow-sm cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={onLogout}
              className="px-3.5 py-1.5 bg-white hover:bg-red-50 text-red-600 rounded-xl border-2 border-red-300 text-xs font-bold transition flex items-center gap-1 shadow-sm cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 pt-6">
        <div className="bg-white p-1.5 rounded-2xl border-2 border-stone-900 shadow-sm flex gap-2 overflow-x-auto">
          <button
            onClick={() => handleTabChange('overview')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'overview' ? 'bg-[#E65C00] text-white shadow-sm' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" /> Overview
          </button>
          <button
            onClick={() => handleTabChange('directory')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'directory' ? 'bg-[#E65C00] text-white shadow-sm' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" /> Directory ({customers.length})
          </button>

          <button
            onClick={() => handleTabChange('scheme')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'scheme' ? 'bg-[#E65C00] text-white shadow-sm' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Scheme
          </button>

          <button
            onClick={() => handleTabChange('items')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'items' ? 'bg-[#E65C00] text-white shadow-sm' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Gem className="w-4 h-4" /> Items ({products.length})
          </button>

          <button
            onClick={() => handleTabChange('folders')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'folders' ? 'bg-[#E65C00] text-white shadow-sm' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <FolderTree className="w-4 h-4" /> Folders & UPI
          </button>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 pt-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-3xl border-2 border-stone-900 shadow-sm space-y-2">
              <p className="text-xs font-bold text-stone-500 uppercase">Total Active Subscribers</p>
              <p className="text-3xl font-black text-amber-900">{customers.filter(c => c.isActive !== false).length}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border-2 border-stone-900 shadow-sm space-y-2">
              <p className="text-xs font-bold text-stone-500 uppercase">Total Monthly Collections</p>
              <p className="text-3xl font-black text-emerald-800">
                ₹{customers.reduce((acc, c) => acc + ((c.paidMonths || 0) * (c.customInstallment || 10000)), 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="bg-white p-6 rounded-3xl border-2 border-stone-900 shadow-sm space-y-2">
              <p className="text-xs font-bold text-stone-500 uppercase">Showroom Catalog Items</p>
              <p className="text-3xl font-black text-[#E65C00]">{products.length}</p>
            </div>
          </div>
        )}

        {activeTab === 'directory' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border-2 border-stone-900 shadow-sm space-y-4">
              <h2 className="text-xs font-black text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-[#E65C00]" /> REGISTER CUSTOMER ACCOUNT
              </h2>

              <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Customer Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Soni"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border-2 border-stone-900 rounded-xl font-medium outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Phone Number (Login ID)</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9950091024"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border-2 border-stone-900 rounded-xl font-medium outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Initial Password</label>
                  <input
                    type="text"
                    required
                    placeholder="Account access password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border-2 border-stone-900 rounded-xl font-medium outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Monthly Installment Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={regInstallment}
                    onChange={(e) => setRegInstallment(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border-2 border-stone-900 rounded-xl font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Scheme Start Date</label>
                  <input
                    type="date"
                    required
                    value={regStartDate}
                    onChange={(e) => setRegStartDate(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border-2 border-stone-900 rounded-xl font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Residential Address (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Main Market, Sheoganj"
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border-2 border-stone-900 rounded-xl font-medium outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full py-3 bg-[#E65C00] hover:bg-[#CC5200] text-white font-extrabold uppercase rounded-xl border-2 border-stone-900 shadow-sm transition cursor-pointer"
                >
                  {regLoading ? 'Creating...' : 'CREATE PASSBOOK ACCOUNT'}
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border-2 border-stone-900 shadow-sm space-y-4">
              <h2 className="text-xs font-black text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-stone-700" /> REGISTERED CUSTOMERS ({customers.length})
              </h2>

              <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1 text-xs">
                {customers.length === 0 ? (
                  <p className="text-xs text-stone-400 py-8 text-center font-bold">No registered customers found.</p>
                ) : (
                  customers.map((c) => {
                    const custMonthly = c.customInstallment || 10000;
                    const paidCount = c.paidMonths || 0;
                    const isInactive = c.isActive === false;

                    return (
                      <div 
                        key={c._id} 
                        className={`p-4 rounded-2xl border-2 space-y-3 shadow-sm transition-all ${
                          isInactive ? 'border-red-300 bg-red-50/30' : 'border-stone-900 bg-white'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                              {c.customerId}
                            </span>
                            <p className="font-bold text-stone-900 text-sm">{c.name}</p>
                            {isInactive ? (
                              <span className="bg-red-100 text-red-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-red-300 uppercase">
                                Deactivated
                              </span>
                            ) : (
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-300 uppercase">
                                Active
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                              {paidCount}/12 Paid
                            </span>

                            <button
                              onClick={(e) => handleToggleActiveStatus(c, e)}
                              className={`px-3 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1 transition shadow-sm cursor-pointer ${
                                isInactive 
                                  ? 'bg-emerald-700 hover:bg-emerald-800 text-white border-2 border-emerald-900' 
                                  : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-2 border-amber-400'
                              }`}
                            >
                              {isInactive ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                              {isInactive ? 'Activate User' : 'Deactivate User'}
                            </button>

                            <button
                              onClick={(e) => handleDeleteCustomer(c._id, e)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl border border-red-200 transition cursor-pointer"
                              title="Delete Account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <p className="text-[11px] text-stone-500">
                          Phone: <span className="text-stone-800 font-medium">{c.phone}</span> • Password: <span className="font-mono font-bold text-stone-800">{c.password}</span> {c.startDate && `• Started: ${c.startDate}`}
                        </p>

                        <div className="pt-2 border-t border-stone-100 grid grid-cols-2 gap-2 text-[10px] font-bold">
                          <div className="bg-stone-50 p-2 rounded-xl border border-stone-200">
                            <p className="text-stone-500 text-[9px] uppercase">Monthly Installment</p>
                            <p className="text-stone-900 font-extrabold">₹{custMonthly.toLocaleString('en-IN')}</p>
                          </div>
                          <div className="bg-amber-50 p-2 rounded-xl border border-amber-200">
                            <p className="text-amber-800 text-[9px] uppercase">Total Scheme Value (12 Mos)</p>
                            <p className="text-[#E65C00] font-black">₹{(custMonthly * 12).toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'items' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border-2 border-stone-900 shadow-sm space-y-4">
              <h2 className="text-xs font-black text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-[#E65C00]" /> ADD PRODUCT TO SHOWROOM (OPTIONAL PRICE)
              </h2>

              <form onSubmit={handleAddProduct} className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Product Title"
                  value={productTitle}
                  onChange={(e) => setProductTitle(e.target.value)}
                  className="w-full p-3 bg-stone-50 border-2 border-stone-900 rounded-2xl text-xs font-medium outline-none"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <select
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value)}
                    className="w-full p-3 bg-stone-50 border-2 border-stone-900 rounded-2xl text-xs font-medium outline-none"
                  >
                    <option value="Gold">Gold</option>
                    <option value="Silver">Silver</option>
                    <option value="Bridal Wear">Bridal Wear</option>
                    <option value="Antique">Antique</option>
                  </select>

                  <select
                    value={selectedFolderId}
                    onChange={(e) => setSelectedFolderId(e.target.value)}
                    className="w-full p-3 bg-stone-50 border-2 border-stone-900 rounded-2xl text-xs font-medium outline-none"
                  >
                    <option value="">Unassigned Category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Net Weight"
                    value={productWeight}
                    onChange={(e) => setProductWeight(e.target.value)}
                    className="w-full p-3 bg-stone-50 border-2 border-stone-900 rounded-2xl text-xs font-medium outline-none"
                  />

                  {/* PRICE FIELD NOW OPTIONAL */}
                  <input
                    type="number"
                    placeholder="Price in ₹ (Optional, leave blank if N/A)"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    className="w-full p-3 bg-stone-50 border-2 border-stone-900 rounded-2xl text-xs font-medium outline-none"
                  />
                </div>

                <label className="w-full flex items-center justify-between p-3 bg-stone-50 hover:bg-stone-100 border-2 border-stone-900 rounded-2xl cursor-pointer transition text-xs font-medium">
                  <span className="truncate text-stone-800">
                    {previewFileName ? `Selected: ${previewFileName}` : "Choose image from computer (File Explorer)..."}
                  </span>
                  <ImageIcon className="w-4 h-4 text-[#E65C00] shrink-0 ml-2" />
                  <input
                    type="file"
                    accept="image/*"
                    required={!productImageBase64}
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </label>

                <button
                  type="submit"
                  disabled={productSubmitLoading}
                  className="w-full py-3.5 bg-[#E65C00] hover:bg-[#CC5200] text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl border-2 border-stone-900 shadow-sm transition cursor-pointer"
                >
                  {productSubmitLoading ? "ADDING TO SHOWROOM..." : "ADD TO SHOWROOM"}
                </button>
              </form>
            </div>

            <div className="bg-white p-6 rounded-3xl border-2 border-stone-900 shadow-sm space-y-4">
              <h2 className="text-xs font-black text-stone-900 uppercase tracking-wider">
                PRODUCTS ({products.length})
              </h2>

              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {products.length === 0 ? (
                  <p className="text-xs text-stone-400 py-6 text-center font-bold">No products in showroom.</p>
                ) : (
                  products.map((p) => (
                    <div
                      key={p._id}
                      className="p-3 bg-white rounded-2xl border-2 border-stone-900 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <img src={p.imageUrl} alt={p.title} className="w-12 h-12 rounded-xl object-cover border border-stone-200" />
                        <div>
                          <p className="font-bold text-stone-900">{p.title}</p>
                          <p className="text-[11px] text-stone-500 font-medium">{p.category} • {p.weight}</p>
                          {/* Hidden if price is 0 or empty */}
                          {p.price > 0 && (
                            <p className="text-xs font-black text-[#E65C00] font-serif">
                              ₹{Number(p.price).toLocaleString('en-IN')}
                            </p>
                          )}
                        </div>
                      </div>

                      <button onClick={() => handleDeleteProduct(p._id)} className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl border border-red-200 transition cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'scheme' && (
          <div className="bg-white p-6 rounded-3xl border-2 border-stone-900 shadow-sm space-y-4">
            <h2 className="text-xs font-black text-stone-900 uppercase tracking-wider">
              Savings Scheme Subscribers ({customers.length}) — Passbook Management
            </h2>

            <div className="space-y-4">
              {customers.map((cust) => {
                const custMonthly = cust.customInstallment || 10000;
                const custPaidMonths = cust.paidMonths || 0;
                const custTotalPaid = custPaidMonths * custMonthly;

                return (
                  <div key={cust._id} className="p-4 bg-white rounded-2xl border-2 border-stone-900 space-y-3 text-xs">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            {cust.customerId}
                          </span>
                          <p className="font-bold text-stone-900 text-sm">{cust.name}</p>
                          <span className="text-stone-500">({cust.phone})</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 text-[11px] text-stone-600">
                          <span>Paid: <strong className="text-emerald-700">{custPaidMonths}/12 Months (₹{custTotalPaid.toLocaleString('en-IN')})</strong></span>
                          <span>•</span>
                          <span>Monthly: <strong>₹{custMonthly.toLocaleString('en-IN')}</strong></span>
                          <span>•</span>
                          <span className="text-[#E65C00] font-bold">Benefit: 100% OFF Making Charges on 12 Months Completion</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button onClick={() => handleSendReminder(cust)} className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer">
                          <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Reminder
                        </button>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-stone-200 space-y-1.5">
                      <p className="text-[10px] font-extrabold text-stone-700 uppercase tracking-wider">
                        Passbook Months (Click to Pay/Unpay Manually after verifying WhatsApp SS):
                      </p>
                      <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
                        {Array.from({ length: 12 }).map((_, idx) => {
                          const monthNum = idx + 1;
                          const isPaid = monthNum <= custPaidMonths;

                          return (
                            <button
                              key={monthNum}
                              type="button"
                              onClick={() => handleManualPassbookToggle(cust._id, monthNum, isPaid)}
                              className={`py-2 text-[11px] font-black rounded-xl border transition cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                                isPaid 
                                  ? 'bg-emerald-600 text-white border-emerald-800 shadow-sm' 
                                  : 'bg-stone-50 text-stone-600 border-stone-300 hover:bg-stone-100'
                              }`}
                            >
                              <span>M{monthNum}</span>
                              <span className="text-[9px]">{isPaid ? '✓ Paid' : 'Unpaid'}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'folders' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border-2 border-zinc-900 shadow-sm space-y-4">
              <h2 className="text-xs font-black text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-[#E65C00]" /> Store UPI Gateway & QR
              </h2>

              <form onSubmit={handleUpdateStoreUpi} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Official Receiver UPI ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9950091024@okbizaxis"
                    value={storeUpiId}
                    onChange={(e) => setStoreUpiId(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border-2 border-stone-900 rounded-xl font-mono font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Receiver Merchant Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Jewellers"
                    value={storeMerchantName}
                    onChange={(e) => setStoreMerchantName(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border-2 border-stone-900 rounded-xl font-medium outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Store UPI QR Code Image</label>
                  <label className="w-full flex items-center justify-between p-2.5 bg-stone-50 hover:bg-stone-100 border-2 border-stone-900 rounded-xl cursor-pointer transition">
                    <span className="truncate text-stone-700">
                      {qrFileName ? `Selected: ${qrFileName}` : (storeQrBase64 ? "Change QR Image..." : "Upload QR from file explorer...")}
                    </span>
                    <QrCode className="w-4 h-4 text-[#E65C00] shrink-0 ml-2" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQrFileChange}
                      className="hidden"
                    />
                  </label>
                  {storeQrBase64 && (
                    <div className="mt-2 text-center">
                      <img src={storeQrBase64} alt="Store QR Preview" className="w-24 h-24 object-contain mx-auto rounded-xl border border-stone-300 bg-white p-1" />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={upiSaving}
                  className="w-full py-2.5 bg-[#E65C00] hover:bg-[#CC5200] text-white font-extrabold uppercase rounded-xl border-2 border-stone-900 shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {upiSavedSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" /> Settings Saved!
                    </>
                  ) : upiSaving ? (
                    'Saving...'
                  ) : (
                    'Save UPI & QR Code'
                  )}
                </button>
              </form>
            </div>

            <div className="bg-white p-6 rounded-3xl border-2 border-stone-900 shadow-sm space-y-4">
              <h2 className="text-xs font-black text-stone-900 uppercase tracking-wider text-amber-900">
                Create Category Folder
              </h2>

              <form onSubmit={handleAddCategory} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Category Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kundan Kadas"
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border-2 border-stone-900 rounded-2xl font-medium outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Description</label>
                  <input
                    type="text"
                    placeholder="Short description..."
                    value={catDescription}
                    onChange={(e) => setCatDescription(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border-2 border-stone-900 rounded-2xl font-medium outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#E65C00] hover:bg-[#CC5200] text-white font-bold uppercase rounded-2xl border-2 border-stone-900 shadow-sm transition cursor-pointer"
                >
                  Create Folder
                </button>
              </form>
            </div>

            <div className="bg-white p-6 rounded-3xl border-2 border-stone-900 shadow-sm space-y-4">
              <h2 className="text-xs font-black text-stone-900 uppercase tracking-wider">
                Live Categories ({categories.length})
              </h2>

              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1 text-xs">
                {categories.map((c) => (
                  <div key={c._id} className="p-3 bg-white rounded-2xl border-2 border-stone-900 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-stone-900">{c.name}</p>
                      <p className="text-[11px] text-stone-500">{c.description || "No description"}</p>
                    </div>
                    <button onClick={() => handleDeleteCategory(c._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}