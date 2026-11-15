
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';

import axios from 'axios';
import html2pdf from 'html2pdf.js';

import {
  Gem, Search, UserRound, Menu, X, MapPin,
  Phone, Instagram, MessageCircle, ShieldCheck,
  Award, RefreshCw, ChevronDown, ArrowRight,
  CheckCircle2, Clock, Lock, Receipt, Download,
  LogOut, Gift, History, Smartphone
} from 'lucide-react';

import LiveGoldNavbar from './components/LiveGoldNavbar.jsx';
import CustomerLoginModal from './components/loginmodal.jsx';
import IntroSplash from './components/IntroSplash.jsx';
import CustomerProfileModal from './components/CustomerProfileModal.jsx';
import SupportChatWidget from './components/SupportChatWidget.jsx';

import HeroSlider from './components/HeroSlider.jsx';
import ContactOptions, {
  STORE_CONTACTS
} from './components/ContactOptions.jsx';
import ProductDetails from './components/ProductDetails.jsx';
import SchemeMultiPayment from './components/SchemeMultiPayment.jsx';

const API = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'https://rahul-jewellers-backend-jlr0.onrender.com'
).replace(/\/+$/, '');

const COLLECTIONS = [
  {
    name: 'Gold',
    subtitle: 'Timeless Gold Elegance',
    image:
      'https://images.unsplash.com/photo-1611652022419-a9419f74343d?q=85&w=900&auto=format&fit=crop'
  },
  {
    name: 'Polki',
    subtitle: 'Royal Heritage Craft',
    image:
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=85&w=900&auto=format&fit=crop'
  },
  {
    name: 'Kundan',
    subtitle: 'Traditional Grandeur',
    image:
      'https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=85&w=900&auto=format&fit=crop'
  },
  {
    name: 'Diamond',
    subtitle: 'Brilliance That Lasts',
    image:
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=85&w=900&auto=format&fit=crop'
  },
  {
    name: 'Silver',
    subtitle: 'Grace in Every Detail',
    image:
      'https://images.unsplash.com/photo-1630019852942-f89202989a59?q=85&w=900&auto=format&fit=crop'
  }
];

const HERO_SLIDES = [
  {
    eyebrow: 'THE ROYAL',
    title: 'Heritage\nCollection',
    description:
      'A timeless range of traditional and modern jewellery crafted for every occasion.',
    image:
      'https://images.unsplash.com/photo-1635767798638-3665a6b2b9b5?q=90&w=2000&auto=format&fit=crop',
    category: 'Gold'
  },
  {
    eyebrow: 'CELEBRATE EVERY MOMENT',
    title: 'Bridal\nTreasures',
    description:
      'Discover exquisite designs that make your most special moments unforgettable.',
    image:
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=90&w=2000&auto=format&fit=crop',
    category: 'Kundan'
  },
  {
    eyebrow: 'TIMELESS BEAUTY',
    title: 'Modern\nElegance',
    description:
      'Exceptional craftsmanship, made to become a part of your story.',
    image:
      'https://images.unsplash.com/photo-1611652022419-a9419f74343d?q=90&w=2000&auto=format&fit=crop',
    category: 'Diamond'
  }
];

const ROOT_NAMES = [
  'Gold', 'Polki', 'Kundan', 'Diamond', 'Silver'
];

const money = value =>
  Number(value || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 0
  });

const escapeHtml = value =>
  String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[character]));

const errorText = error =>
  error?.response?.data?.message ||
  error?.message ||
  'Request failed. Please try again.';

const publicConfig = {
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  },
  timeout: 30000
};

function customerConfig() {
  return {
    ...publicConfig,
    headers: {
      ...publicConfig.headers,
      Authorization:
        `Bearer ${localStorage.getItem('customer_token') || ''}`
    }
  };
}

function savedCustomer() {
  if (!localStorage.getItem('customer_token')) return null;

  try {
    return JSON.parse(
      localStorage.getItem('schemeUserInfo') || 'null'
    );
  } catch {
    return null;
  }
}

function readRoute() {
  const hash = window.location.hash.slice(1);

  if (hash === '/scheme') {
    return {
      tab: 'scheme',
      category: 'All',
      collectionView: false
    };
  }

  if (hash.startsWith('/collection/')) {
    let category = 'All';

    try {
      category = decodeURIComponent(
        hash.slice('/collection/'.length)
      );
    } catch {
      category = 'All';
    }

    return {
      tab: 'showroom',
      category: ROOT_NAMES.includes(category)
        ? category
        : 'All',
      collectionView: true
    };
  }

  return {
    tab: 'showroom',
    category: 'All',
    collectionView: false
  };
}

function getId(value) {
  if (!value) return '';

  return String(
    typeof value === 'object' ? value._id : value
  );
}

function descendants(categories, folderId) {
  if (!folderId) return null;

  const ids = new Set([String(folderId)]);
  let changed = true;

  while (changed) {
    changed = false;

    categories.forEach(category => {
      const parent = getId(category.parentCategory);
      const id = getId(category._id);

      if (parent && ids.has(parent) && !ids.has(id)) {
        ids.add(id);
        changed = true;
      }
    });
  }

  return ids;
}

function productImage(product) {
  const first = Array.isArray(product?.images)
    ? product.images[0]
    : null;

  return (
    (typeof first === 'string' ? first : first?.url) ||
    product?.imageUrl ||
    ''
  );
}

function requestMonths(request) {
  const nums =
    Array.isArray(request.monthNums) &&
    request.monthNums.length
      ? request.monthNums
      : [request.monthNum];

  return nums.map(Number);
}

function downloadPdf(element, filename, orientation = 'portrait') {
  return html2pdf()
    .set({
      margin: 0.5,
      filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: {
        unit: 'in',
        format: 'letter',
        orientation
      }
    })
    .from(element)
    .save();
}

export default function App() {
  const [showIntro, setShowIntro] = useState(
    () => !sessionStorage.getItem('rj_intro_played')
  );

  const [schemeUser, setSchemeUser] = useState(savedCustomer);

  const [authState, setAuthState] = useState(
    () => localStorage.getItem('customer_token')
      ? 'checking'
      : 'guest'
  );

  const [route, setRoute] = useState(readRoute);
  const activeTab = route.tab;
  const selectedCategory = route.category;

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState('');

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactProduct, setContactProduct] = useState(null);
  const [contactMessage, setContactMessage] = useState('');
  const [contactTitle, setContactTitle] = useState(
    'Contact Rahul Jewellers'
  );

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showMultiPayment, setShowMultiPayment] = useState(false);

  const [storeUpiId, setStoreUpiId] = useState('');
  const [storeMerchantName, setStoreMerchantName] =
    useState('Rahul Jewellers');
  const [storeQrCodeUrl, setStoreQrCodeUrl] = useState('');

  const [joinAmount, setJoinAmount] = useState('5000');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [joinTermsAccepted, setJoinTermsAccepted] =
    useState(false);

  const [paymentRequests, setPaymentRequests] = useState([]);
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimError, setClaimError] = useState('');
  const [claim, setClaim] = useState(null);

  const monthly = Number(schemeUser?.customInstallment || 0);

  const installments = Array.isArray(schemeUser?.installments)
    ? schemeUser.installments
    : [];

  const paidCount = installments.length
    ? installments.filter(item => item.paid).length
    : Math.min(
        12,
        Math.max(0, Number(schemeUser?.paidMonths || 0))
      );

  const progressPercent = paidCount / 12 * 100;
  const totalPaid = paidCount * monthly;
  const totalScheme = 12 * monthly;

  const schemeDeadline = schemeUser?.schemeDeadline || {};

  const schemeStatus =
    schemeUser?.schemeStatus ||
    (schemeUser?.schemeJoined ? 'Active' : 'NotJoined');

  const schemeActive = schemeStatus === 'Active';

  const pendingMonths = useMemo(() => {
    const result = new Set();

    paymentRequests
      .filter(item => item.status === 'Pending')
      .forEach(item => {
        requestMonths(item).forEach(num => result.add(num));
      });

    return result;
  }, [paymentRequests]);

  const approvedUnapplied = useMemo(() => {
    const result = new Set();

    paymentRequests
      .filter(item =>
        item.status === 'Approved' &&
        item.passbookApplied === false
      )
      .forEach(item => {
        requestMonths(item).forEach(num => result.add(num));
      });

    return result;
  }, [paymentRequests]);

  const hasPendingPayment = pendingMonths.size > 0;

  const selectedFolderIds = useMemo(
    () => descendants(categories, selectedFolder),
    [categories, selectedFolder]
  );

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return products.filter(product => {
      const root = String(
        product.category || ''
      ).toLowerCase();

      const rootMatch =
        selectedCategory === 'All' ||
        root === selectedCategory.toLowerCase();

      const folderMatch =
        !selectedFolderIds ||
        selectedFolderIds.has(getId(product.categoryId));

      const searchable = [
        product.title,
        product.category,
        product.description,
        product.weight,
        product.purity,
        product.design,
        product.craftsmanship
      ].join(' ').toLowerCase();

      return (
        rootMatch &&
        folderMatch &&
        (!query || searchable.includes(query))
      );
    });
  }, [
    products,
    selectedCategory,
    selectedFolderIds,
    searchQuery
  ]);

  const openContact = ({
    product = null,
    message = '',
    title = 'Contact Rahul Jewellers'
  } = {}) => {
    setContactProduct(product);
    setContactMessage(message);
    setContactTitle(title);
    setContactOpen(true);
  };

  const clearCustomerSession = useCallback(() => {
    localStorage.removeItem('schemeUserInfo');
    localStorage.removeItem('customer_token');

    setPaymentRequests([]);
    setSchemeUser(null);
    setClaim(null);
    setAuthState('guest');
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await axios.get(
        `${API}/api/products`,
        publicConfig
      );

      setProducts(response.data?.products || []);
    } catch (error) {
      console.error('Product loading failed:', error);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(
        `${API}/api/categories`,
        publicConfig
      );

      setCategories(response.data?.categories || []);
    } catch (error) {
      console.error('Category loading failed:', error);
    }
  }, []);

  const fetchStoreSettings = useCallback(async () => {
    try {
      const response = await axios.get(
        `${API}/api/store/settings`,
        publicConfig
      );

      const settings = response.data?.settings;

      if (settings) {
        setStoreUpiId(settings.upiId || '');
        setStoreMerchantName(
          settings.merchantName || 'Rahul Jewellers'
        );
        setStoreQrCodeUrl(settings.qrCodeUrl || '');
      }
    } catch (error) {
      console.error('Store settings failed:', error);
    }
  }, []);

  const syncCustomerData = useCallback(async () => {
    const token = localStorage.getItem('customer_token');
    const saved = savedCustomer();

    if (!token || !saved?._id) {
      clearCustomerSession();
      return;
    }

    try {
      const response = await axios.get(
        `${API}/api/customer/profile/${saved._id}`,
        customerConfig()
      );

      if (!response.data?.success ||
          !response.data?.customer) {
        throw new Error('Unable to verify customer profile.');
      }

      const customer = response.data.customer;

      if (customer.isActive === false) {
        clearCustomerSession();
        return;
      }

      setSchemeUser(customer);
      localStorage.setItem(
        'schemeUserInfo',
        JSON.stringify(customer)
      );

      setAuthState('authenticated');
    } catch (error) {
      if ([401, 403, 404].includes(error.response?.status)) {
        clearCustomerSession();
      } else {
        setAuthState('offline');
        console.error('Profile sync failed:', error);
      }
    }
  }, [clearCustomerSession]);

  const fetchPaymentRequests = useCallback(async () => {
    if (!localStorage.getItem('customer_token')) return;

    try {
      const response = await axios.get(
        `${API}/api/customer/payment-requests`,
        customerConfig()
      );

      setPaymentRequests(
        response.data?.requests ||
        response.data?.paymentRequests ||
        []
      );
    } catch (error) {
      console.error('Payment history failed:', error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchStoreSettings();
    syncCustomerData();
    fetchPaymentRequests();
  }, [
    fetchProducts,
    fetchCategories,
    fetchStoreSettings,
    syncCustomerData,
    fetchPaymentRequests
  ]);

  useEffect(() => {
    const handleHash = () => {
      setRoute(readRoute());
      setSelectedFolder('');
      setMobileMenuOpen(false);

      window.scrollTo({
        top: 0,
        behavior: 'auto'
      });
    };

    window.addEventListener('hashchange', handleHash);

    return () =>
      window.removeEventListener('hashchange', handleHash);
  }, []);

  useEffect(() => {
    if (!route.collectionView) return;

    const timer = window.setTimeout(() => {
      document
        .getElementById('showroom-products')
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
    }, 150);

    return () => window.clearTimeout(timer);
  }, [route]);

  useEffect(() => {
    if (activeTab === 'scheme' && authState === 'guest') {
      setShowLoginModal(true);
    }
  }, [activeTab, authState]);

  useEffect(() => {
    if (
      activeTab !== 'scheme' ||
      authState !== 'authenticated'
    ) return;

    const refresh = () => {
      syncCustomerData();
      fetchPaymentRequests();
    };

    const timer = window.setInterval(refresh, 60000);

    const onVisibility = () => {
      if (document.visibilityState === 'visible') refresh();
    };

    document.addEventListener(
      'visibilitychange',
      onVisibility
    );

    return () => {
      window.clearInterval(timer);
      document.removeEventListener(
        'visibilitychange',
        onVisibility
      );
    };
  }, [
    activeTab,
    authState,
    syncCustomerData,
    fetchPaymentRequests
  ]);

  const handleTabChange = tab => {
    const hash = tab === 'scheme' ? '#/scheme' : '#/';

    if (window.location.hash === hash) {
      setRoute(readRoute());
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      window.location.hash = hash;
    }

    setMobileMenuOpen(false);

    if (tab === 'scheme' && authState === 'guest') {
      setShowLoginModal(true);
    }
  };

  const openCollection = category => {
    const hash =
      `#/collection/${encodeURIComponent(category)}`;

    if (window.location.hash === hash) {
      setRoute(readRoute());

      document
        .getElementById('showroom-products')
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
    } else {
      window.location.hash = hash;
    }

    setMobileMenuOpen(false);
  };

  const handleIntroFinish = () => {
    setShowIntro(false);
    sessionStorage.setItem('rj_intro_played', 'true');
  };

  const handleLoginSuccess = (customer, token) => {
    if (token) {
      localStorage.setItem('customer_token', token);
    }

    setSchemeUser(customer);

    localStorage.setItem(
      'schemeUserInfo',
      JSON.stringify(customer)
    );

    setAuthState('authenticated');
    setPaymentRequests([]);
    setShowLoginModal(false);

    handleTabChange('scheme');

    window.setTimeout(() => {
      syncCustomerData();
      fetchPaymentRequests();
    }, 300);
  };

  const handleSchemeLogout = () => {
    clearCustomerSession();
    setShowProfileModal(false);
    setShowHistoryModal(false);
    setShowMultiPayment(false);
    handleTabChange('showroom');
  };

  const handleJoinScheme = async event => {
    event.preventDefault();

    const amount = Number(joinAmount);
    setJoinError('');

    if (
      !Number.isInteger(amount) ||
      amount < 5000 ||
      amount > 1000000
    ) {
      setJoinError(
        'Monthly installment must be between ₹5,000 and ₹10,00,000.'
      );
      return;
    }

    if (!joinTermsAccepted) {
      setJoinError(
        'Please accept the scheme deadline and refund terms.'
      );
      return;
    }

    if (!schemeUser?.email) {
      setJoinError(
        'Please add your email in My Profile before joining.'
      );
      return;
    }

    const confirmed = window.confirm(
      `Join Rahul Jewellers Gold Scheme at ₹${money(amount)} ` +
      'per month for 12 months? Your first payment window ' +
      'starts on the enrollment date.'
    );

    if (!confirmed) return;

    setJoinLoading(true);

    try {
      const response = await axios.post(
        `${API}/api/customer/join-scheme`,
        {
          amount,
          termsAccepted: true
        },
        customerConfig()
      );

      if (!response.data?.success ||
          !response.data?.customer) {
        throw new Error(
          response.data?.message || 'Unable to join scheme.'
        );
      }

      setSchemeUser(response.data.customer);

      localStorage.setItem(
        'schemeUserInfo',
        JSON.stringify(response.data.customer)
      );

      setJoinTermsAccepted(false);
      await fetchPaymentRequests();
    } catch (error) {
      setJoinError(errorText(error));
    } finally {
      setJoinLoading(false);
    }
  };

  const handleDownloadReceipt = monthNum => {
    const verified = (schemeUser?.paymentHistory || [])
      .find(entry => Number(entry.monthNum) === monthNum);

    if (!verified) {
      window.alert(
        'Verified receipt is unavailable. Contact the showroom.'
      );
      return;
    }

    const element = document.createElement('div');

    element.innerHTML = `
      <div style="padding:30px;font-family:Arial;
                  border:3px double #b88a3b;color:#2b160d">
        <h1 style="text-align:center;color:#b88a3b">
          RAHUL JEWELLERS
        </h1>
        <p style="text-align:center">
          Sheoganj · PAYMENT RECEIPT
        </p>
        <hr/>
        <p>Customer: ${escapeHtml(schemeUser?.name)}</p>
        <p>Customer ID:
          ${escapeHtml(schemeUser?.customerId)}
        </p>
        <p>Phone: ${escapeHtml(schemeUser?.phone)}</p>
        <p>Installment: Month #${monthNum}</p>
        <p>Amount: ₹${money(verified.amount)}</p>
        <p>Verified on:
          ${verified.verifiedAt
            ? new Date(verified.verifiedAt)
                .toLocaleDateString('en-IN')
            : 'Not recorded'}
        </p>
        <p>Transaction:
          ${escapeHtml(
            verified.transactionId || 'Manual verification'
          )}
        </p>
        <p>Status: ADMIN VERIFIED</p>
        <hr/>
        <p style="text-align:center">
          Support: +91 9950091024 / +91 9461452322
        </p>
      </div>
    `;

    downloadPdf(
      element,
      `Rahul_Jewellers_Receipt_Month_${monthNum}.pdf`
    );
  };

  const handleClaimBenefit = async () => {
    if (!schemeUser?.eligibleForMakingChargeDiscount) {
      setClaimError(
        'Your benefit is not eligible yet.'
      );
      return;
    }

    setClaimLoading(true);
    setClaimError('');

    try {
      const response = await axios.post(
        `${API}/api/customer/benefit-claim`,
        {},
        customerConfig()
      );

      if (!response.data?.success ||
          !response.data?.claim) {
        throw new Error(
          response.data?.message ||
          'Unable to create benefit claim.'
        );
      }

      setClaim(response.data.claim);
      await syncCustomerData();
    } catch (error) {
      setClaimError(errorText(error));
    } finally {
      setClaimLoading(false);
    }
  };

  const handleDownloadBenefitCard = () => {
    // A saved or revoked claim alone is never sufficient to issue a valid card.
    if (!claim?.claimId ||
        !schemeUser?.eligibleForMakingChargeDiscount ||
        !['Pending', 'Verified'].includes(claim.status)) return;

    const element = document.createElement('div');

    element.innerHTML = `
      <div style="padding:35px;
                  border:7px double #b88a3b;
                  text-align:center;
                  font-family:Georgia;
                  color:#321b10">
        <h1 style="color:#b88a3b">
          RAHUL JEWELLERS Sheoganj
        </h1>
        <h2>Gold Scheme Benefit Claim Card</h2>
        <p>Customer</p>
        <h2>${escapeHtml(schemeUser?.name)}</h2>
        <p>Customer ID:
          ${escapeHtml(schemeUser?.customerId)}
        </p>
        <p>Scheme ID:
          ${escapeHtml(schemeUser?.schemeId)}
        </p>
        <p>Enrollment Date:
          ${escapeHtml(schemeUser?.startDate)}
        </p>
        <p>Benefit Date:
          ${escapeHtml(schemeUser?.schemeBenefitDate)}
        </p>
        <p>Installment 1:
          ${escapeHtml(schemeUser?.schemeSchedule?.firstInstallmentDate)}
        </p>
        <p>Installment 12:
          ${escapeHtml(schemeUser?.schemeSchedule?.twelfthInstallmentDate)}
        </p>
        <p>Verified Installments: 12 / 12</p>
        <p>Total Paid: ₹${money(totalPaid)}</p>
        <h2>100% OFF MAKING / LABOUR CHARGES</h2>
        <p>On eligible Gold Jewellery only.</p>
        <p>Not free gold or a free installment.</p>
        <h3>Claim ID:
          ${escapeHtml(claim.claimId)}
        </h3>
        <p>Status:
          ${escapeHtml(claim.status || 'Pending Verification')}
        </p>
        <p>
          Subject to store verification and scheme terms.
        </p>
      </div>
    `;

    downloadPdf(
      element,
      `RJ_Benefit_${claim.claimId}.pdf`,
      'landscape'
    );
  };

  const scrollToAbout = () => {
    handleTabChange('showroom');

    window.setTimeout(() => {
      document.getElementById('about')?.scrollIntoView({
        behavior: 'smooth'
      });
    }, 150);
  };

  return (
    <div className="rj-site min-h-screen">
      {showIntro && (
        <IntroSplash onFinish={handleIntroFinish} />
      )}

      <SupportChatWidget />

      {/* Top bar */}
      <div className="rj-topbar">
        <div className="rj-topbar-inner">
          <span>
            <MapPin size={14} />
            Sheoganj, Rajasthan
          </span>

          <div className="rj-topbar-trust">
            <span>
              <ShieldCheck size={14} />
              Jewellery Showroom
            </span>
            <i />
            <span>
              <Gem size={14} />
              Gold · Diamond · Silver
            </span>
          </div>

          <div className="rj-topbar-contact">
            {STORE_CONTACTS.map(contact => (
              <a
                key={contact.id}
                href={`tel:+91${contact.number}`}
              >
                <Phone size={14} />
                +91 {contact.number}
              </a>
            ))}

            <a
              href="https://www.instagram.com/rahuljewellers9/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <Instagram size={16} />
            </a>

            <button
              type="button"
              aria-label="WhatsApp contacts"
              onClick={() => openContact()}
            >
              <MessageCircle size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <header className="rj-header">
        <div className="rj-header-inner">
          <button
            type="button"
            className="rj-mobile-menu"
            aria-label="Toggle menu"
            onClick={() => setMobileMenuOpen(value => !value)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>

          <button
            type="button"
            className="rj-brand"
            onClick={() => handleTabChange('showroom')}
          >
            <span className="rj-brand-mark">
              R<span>J</span><Gem size={15} />
            </span>

            <span className="rj-brand-copy">
              <strong>RAHUL JEWELLERS</strong>
              <small>Sheoganj</small>
            </span>
          </button>

          <nav className={
            `rj-nav ${mobileMenuOpen ? 'is-open' : ''}`
          }>
            <button
              type="button"
              className={
                activeTab === 'showroom' ? 'active' : ''
              }
              onClick={() => handleTabChange('showroom')}
            >
              Home
            </button>

            <div className="rj-nav-dropdown">
              <button
                type="button"
                onClick={() => openCollection('All')}
              >
                Collections <ChevronDown size={13} />
              </button>

              <div className="rj-dropdown-menu">
                {COLLECTIONS.map(item => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => openCollection(item.name)}
                  >
                    {item.name} Collection
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleTabChange('scheme')}
            >
              Gold Scheme <ChevronDown size={13} />
            </button>

            <button type="button" onClick={scrollToAbout}>
              About Us
            </button>

            <button
              type="button"
              onClick={() => openContact()}
            >
              Contact
            </button>
          </nav>

          <div className="rj-header-actions">
            <button
              type="button"
              aria-label="Search jewellery"
              onClick={() => {
                setSearchOpen(value => !value);

                window.setTimeout(() => {
                  document
                    .getElementById('rj-search-input')
                    ?.focus();
                }, 50);
              }}
            >
              <Search />
            </button>

            <button
              type="button"
              aria-label="Customer profile"
              onClick={() =>
                authState === 'authenticated' && schemeUser
                  ? setShowProfileModal(true)
                  : setShowLoginModal(true)
              }
            >
              <UserRound />
            </button>

            <button
              type="button"
              aria-label="WhatsApp enquiry"
              onClick={() => openContact()}
            >
              <MessageCircle />
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="rj-search-panel">
            <Search size={18} />

            <input
              id="rj-search-input"
              type="search"
              value={searchQuery}
              onChange={event =>
                setSearchQuery(event.target.value)
              }
              placeholder="Search necklaces, rings, bangles..."
            />

            <button
              type="button"
              aria-label="Close search"
              onClick={() => {
                setSearchOpen(false);
                setSearchQuery('');
              }}
            >
              <X size={18} />
            </button>
          </div>
        )}
      </header>

      <LiveGoldNavbar />

      {activeTab === 'showroom' && (
        <>
          {/* Smooth slider */}
          <HeroSlider
            slides={HERO_SLIDES}
            onExplore={openCollection}
            intervalMs={6500}
          />

          {/* Trust strip */}
          <section className="rj-trust-strip">
            <div>
              <Gem />
              <span>
                <b>Fine Jewellery</b>
                <small>Collections</small>
              </span>
            </div>

            <div>
              <ShieldCheck />
              <span>
                <b>Product Details</b>
                <small>Enquire Before Purchase</small>
              </span>
            </div>

            <div>
              <Award />
              <span>
                <b>Jewellery</b>
                <small>Craftsmanship</small>
              </span>
            </div>

            <div>
              <MessageCircle />
              <span>
                <b>Personal</b>
                <small>Assistance</small>
              </span>
            </div>

            <div>
              <RefreshCw />
              <span>
                <b>Showroom</b>
                <small>Support</small>
              </span>
            </div>
          </section>

          {/* Main collections */}
          <section className="rj-section rj-collections">
            <div className="rj-section-heading">
              <span />
              <h2>Explore Our Collections</h2>
              <span />
            </div>

            <div className="rj-collection-grid">
              {COLLECTIONS.map(item => (
                <button
                  key={item.name}
                  type="button"
                  className="rj-collection-card"
                  onClick={() => openCollection(item.name)}
                >
                  <img
                    src={item.image}
                    alt={`${item.name} jewellery collection`}
                    loading="lazy"
                  />

                  <span className="rj-collection-overlay" />

                  <span className="rj-collection-caption">
                    <strong>{item.name}</strong>
                    <small>{item.subtitle}</small>
                    <em>
                      Explore <ArrowRight size={15} />
                    </em>
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Scheme banner */}
          <section className="rj-scheme-banner">
            <div className="rj-scheme-art">
              <div className="rj-gold-stack">
                <span /><span /><span /><span />
              </div>

              <div className="rj-calendar">
                <b>12</b>
                <small>Months</small>
              </div>
            </div>

            <div className="rj-scheme-copy">
              <p className="rj-eyebrow">
                RAHUL JEWELLERS GOLD SCHEME
              </p>

              <h2>
                Pay in 12 Monthly Installments &amp; Get
                <br />
                <strong>
                  100% OFF on Making Charges!
                </strong>
              </h2>

              <p>
                Monthly installments from ₹5,000 to
                ₹10,00,000. After all 12 payments are
                verified, the benefit unlocks on the
                original 13th-month eligibility date.
                The benefit applies to making/labour
                charges on eligible Gold Jewellery only.
                No free gold or 13th installment.
              </p>
            </div>

            <button
              type="button"
              className="rj-gold-button"
              onClick={() => handleTabChange('scheme')}
            >
              Join Scheme <ArrowRight size={17} />
            </button>
          </section>

          {/* Product catalogue */}
          <section
            className="rj-section rj-products"
            id="showroom-products"
          >
            <div className="rj-products-heading">
              <div>
                <p className="rj-eyebrow">
                  MADE TO BE TREASURED
                </p>
                <h2>Discover Our Jewellery</h2>
              </div>

              <div className="rj-product-search">
                <Search size={16} />

                <input
                  type="search"
                  value={searchQuery}
                  onChange={event =>
                    setSearchQuery(event.target.value)
                  }
                  placeholder="Search jewellery"
                />
              </div>
            </div>

            <div className="rj-category-pills">
              {['All', ...ROOT_NAMES].map(category => (
                <button
                  key={category}
                  type="button"
                  className={
                    selectedCategory === category
                      ? 'active'
                      : ''
                  }
                  onClick={() => openCollection(category)}
                >
                  {category === 'All'
                    ? 'All Collections'
                    : category}
                </button>
              ))}
            </div>

            {categories.length > 0 && (
              <div style={{
                maxWidth: 460,
                margin: '0 auto 28px',
                padding: '0 14px'
              }}>
                <label
                  htmlFor="rj-folder-filter"
                  style={{
                    display: 'block',
                    marginBottom: 8,
                    fontWeight: 700
                  }}
                >
                  Browse Jewellery Folders
                </label>

                <select
                  id="rj-folder-filter"
                  value={selectedFolder}
                  onChange={event =>
                    setSelectedFolder(event.target.value)
                  }
                  style={{
                    width: '100%',
                    padding: 13,
                    border: '1px solid #c9a76b',
                    borderRadius: 10,
                    background: '#fffdf9',
                    color: '#302015'
                  }}
                >
                  <option value="">
                    All Folders
                  </option>

                  {categories.map(category => (
                    <option
                      key={category._id}
                      value={category._id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="rj-product-grid">
              {filteredProducts.length === 0 ? (
                <div className="rj-empty-products">
                  <Gem size={35} />

                  <h3>
                    {products.length
                      ? 'No matching jewellery found'
                      : 'Our collection is being updated'}
                  </h3>

                  <p>
                    Please contact our showroom for
                    personalised assistance.
                  </p>

                  <button
                    type="button"
                    onClick={() => openContact({
                      title: 'Jewellery Enquiry'
                    })}
                  >
                    Enquire on WhatsApp
                    <ArrowRight size={15} />
                  </button>
                </div>
              ) : filteredProducts.map(product => (
                <article
                  className="rj-product-card"
                  key={product._id}
                >
                  <button
                    type="button"
                    className="rj-product-image"
                    onClick={() =>
                      setSelectedProduct(product)
                    }
                  >
                    {productImage(product) ? (
                      <img
                        src={productImage(product)}
                        alt={product.title}
                        loading="lazy"
                      />
                    ) : (
                      <Gem size={45} />
                    )}

                    <span>{product.category}</span>
                  </button>

                  <div className="rj-product-info">
                    <h3>{product.title}</h3>

                    <p>
                      Net Weight:
                      {' '}
                      {product.weight || 'Ask in showroom'}
                    </p>

                    {product.purity && (
                      <p>Purity: {product.purity}</p>
                    )}

                    {Number(product.price) > 0 && (
                      <strong>
                        ₹{money(product.price)}
                      </strong>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedProduct(product)
                      }
                      style={{
                        display: 'block',
                        marginBottom: 10,
                        textDecoration: 'underline'
                      }}
                    >
                      View Product Details
                    </button>

                    <button
                      type="button"
                      onClick={() => openContact({
                        product,
                        title: 'Product Enquiry'
                      })}
                    >
                      <MessageCircle size={15} />
                      WhatsApp / Call Enquiry
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rj-about" id="about">
            <p className="rj-eyebrow">
              RAHUL JEWELLERS Sheoganj
            </p>

            <h2>
              Timeless Jewellery. Personal Service.
            </h2>

            <p>
              Explore thoughtfully selected jewellery
              designs and connect with our Sheoganj
              showroom for product enquiries.
            </p>
          </section>
        </>
      )}

      {/* Scheme: checking */}
      {activeTab === 'scheme' &&
        authState === 'checking' && (
          <main
            className="rj-scheme-dashboard"
            role="status"
          >
            <div className="rj-dashboard-heading">
              <h1>Verifying your session...</h1>
            </div>
          </main>
        )}

      {/* Scheme: offline */}
      {activeTab === 'scheme' &&
        authState === 'offline' && (
          <main className="rj-scheme-dashboard">
            <div className="rj-dashboard-heading">
              <h1>Unable to verify your account</h1>

              <p>
                Please check your connection and retry.
                Your passbook is hidden until verified.
              </p>

              <button
                type="button"
                className="rj-gold-button"
                onClick={syncCustomerData}
              >
                Retry Verification
              </button>
            </div>
          </main>
        )}

      {/* Scheme: guest */}
      {activeTab === 'scheme' &&
        authState === 'guest' && (
          <main className="rj-scheme-dashboard">
            <div className="rj-dashboard-heading">
              <h1>Customer Login Required</h1>

              <p>
                Log in or create your profile to access
                the Gold Scheme.
              </p>

              <button
                type="button"
                className="rj-gold-button"
                onClick={() => setShowLoginModal(true)}
              >
                Login / Create Profile
              </button>
            </div>
          </main>
        )}

      {/* Scheme: join */}
      {activeTab === 'scheme' &&
        authState === 'authenticated' &&
        schemeUser &&
        !schemeUser.schemeJoined && (
          <main className="rj-scheme-dashboard">
            <div className="rj-dashboard-heading">
              <p className="rj-eyebrow">
                RAHUL JEWELLERS · Sheoganj
              </p>

              <h1>Welcome, {schemeUser.name}</h1>

              <p>
                Customer ID: {schemeUser.customerId}
              </p>

              {schemeStatus === 'Refunded' && (
                <div
                  role="status"
                  style={{
                    border: '1px solid #c69c50',
                    padding: 16,
                    borderRadius: 12,
                    marginTop: 12
                  }}
                >
                  <strong>
                    Previous Scheme Refunded
                  </strong>

                  <p>
                    Your previous scheme has been
                    closed and its refund recorded.
                    Reference:
                    {' '}
                    {schemeUser.schemeRefundReference ||
                      'Contact Store'}
                  </p>
                </div>
              )}
            </div>

            <section
              className="rj-progress-card"
              style={{
                maxWidth: 680,
                margin: '20px auto'
              }}
            >
              <div className="rj-progress-top">
                <div>
                  <small>
                    OPTIONAL · GOLD ONLY
                  </small>
                  <h2>
                    Choose Your Gold Scheme
                  </h2>
                </div>
              </div>

              <p style={{ marginBottom: 18 }}>
                Choose your fixed monthly installment.
                Option A: Your joining date is also the
                first installment due date. Installments
                2–12 are due on the same date in each
                following month. You have five calendar
                dates (including the due date) to submit
                each payment. The making-charge benefit
                opens in month 13, never earlier.
              </p>

              <p style={{ marginBottom: 10 }}>
                Registered email:
                {' '}
                <strong>
                  {schemeUser.email || 'Not provided'}
                </strong>
                {' '}
                <button
                  type="button"
                  onClick={() =>
                    setShowProfileModal(true)
                  }
                  style={{
                    textDecoration: 'underline'
                  }}
                >
                  Edit Email
                </button>
              </p>

              <form
                onSubmit={handleJoinScheme}
                style={{
                  display: 'grid',
                  gap: 14
                }}
              >
                <label htmlFor="join-amount">
                  Monthly Installment
                  (₹5,000 – ₹10,00,000)
                </label>

                <input
                  id="join-amount"
                  type="number"
                  min="5000"
                  max="1000000"
                  step="1"
                  required
                  value={joinAmount}
                  onChange={event =>
                    setJoinAmount(event.target.value)
                  }
                  style={{
                    padding: 14,
                    borderRadius: 10,
                    color: '#22170d',
                    background: '#fff',
                    width: '100%'
                  }}
                />

                <div className="rj-progress-numbers">
                  <div>
                    <small>Monthly</small>
                    <strong>
                      ₹{money(joinAmount)}
                    </strong>
                  </div>

                  <div>
                    <small>
                      12 Installments Total
                    </small>
                    <strong>
                      ₹{money(Number(joinAmount) * 12)}
                    </strong>
                  </div>
                </div>

                <p>
                  All 12 installments must be verified.
                  Installment 1 begins on the joining date.
                  The making/labour charge benefit on
                  eligible Gold Jewellery unlocks only
                  on the original 13th-month eligibility
                  date. No free gold or 13th installment.
                </p>

                <label style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'start'
                }}>
                  <input
                    type="checkbox"
                    required
                    checked={joinTermsAccepted}
                    onChange={event =>
                      setJoinTermsAccepted(
                        event.target.checked
                      )
                    }
                  />

                  <span>
                    I accept the five-calendar-date
                    installment deadline, cancellation,
                    admin reactivation and refund review
                    terms.
                  </span>
                </label>

                {joinError && (
                  <p
                    role="alert"
                    style={{ color: '#ffaaa5' }}
                  >
                    {joinError}
                  </p>
                )}

                <button
                  className="rj-gold-button"
                  type="submit"
                  disabled={joinLoading}
                >
                  {joinLoading
                    ? 'Joining...'
                    : 'Confirm & Join Gold Scheme'}

                  <ArrowRight size={16} />
                </button>
              </form>

              <div
                className="rj-dashboard-actions"
                style={{ marginTop: 18 }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setShowProfileModal(true)
                  }
                >
                  <UserRound size={16} />
                  My Profile
                </button>

                <button
                  type="button"
                  onClick={handleSchemeLogout}
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </section>
          </main>
        )}

      {/* Scheme: dashboard */}
      {activeTab === 'scheme' &&
        authState === 'authenticated' &&
        schemeUser?.schemeJoined && (
          <main className="rj-scheme-dashboard">
            <div className="rj-dashboard-heading">
              <p className="rj-eyebrow">
                CUSTOMER SAVINGS ACCOUNT
              </p>

              <h1>
                Welcome, {schemeUser.name}
              </h1>

              <p>
                Customer ID:
                {' '}
                {schemeUser.customerId || '—'}
                {' · '}
                {schemeUser.phone || ''}
              </p>

              <p style={{
                fontWeight: 700,
                marginTop: 10
              }}>
                Scheme Started:
                {' '}
                {schemeDeadline.schemeStartDate ||
                  schemeUser.startDate ||
                  '—'}
              </p>

              <p style={{ fontWeight: 700 }}>
                Next Due:
                {' '}
                {schemeDeadline.dueDate ||
                  'All installments completed'}
                {' · '}
                Last Date:
                {' '}
                {schemeDeadline.graceEndDate || '—'}
              </p>

              {schemeUser.schemeSchedule && (
                <p style={{ fontWeight: 700 }}>
                  Installment 1: {schemeUser.schemeSchedule.firstInstallmentDate}
                  {' · '}
                  Installment 12: {schemeUser.schemeSchedule.twelfthInstallmentDate}
                </p>
              )}

              <p style={{ fontWeight: 700 }}>
                Benefit Eligibility Date:
                {' '}
                {schemeUser.schemeBenefitDate || '—'}
              </p>
            </div>

            {/* Status and deadline */}
            <section
              role="status"
              aria-live="polite"
              style={{
                margin: '0 auto 22px',
                padding: '18px 20px',
                borderRadius: 16,
                maxWidth: 1100,
                background:
                  ['Cancelled', 'Suspended'].includes(
                    schemeStatus
                  )
                    ? '#fff0ed'
                    : schemeStatus === 'RefundPending'
                    ? '#fff6e4'
                    : '#fff9eb',
                color: '#40250f',
                border: '2px solid #c69c50',
                lineHeight: 1.6
              }}
            >
              {['Cancelled', 'Suspended'].includes(
                schemeStatus
              ) ? (
                <>
                  <h2 style={{
                    fontSize: 19,
                    fontWeight: 900
                  }}>
                    Your Gold Scheme is Paused /
                    Cancelled
                  </h2>

                  <p>
                    Your payment deadline was missed.
                    Contact Rahul Jewellers Sheoganj
                    to explain the delay and request
                    admin review.
                  </p>

                  <button
                    type="button"
                    onClick={() => openContact({
                      title: 'Scheme Reactivation Help',
                      message:
                        `Namaste Rahul Jewellers Sheoganj,\n` +
                        `Customer ID: ${schemeUser.customerId}\n` +
                        'Please help me with my paused Gold Scheme.'
                    })}
                    style={{
                      fontWeight: 900,
                      textDecoration: 'underline'
                    }}
                  >
                    Contact Store
                  </button>
                </>
              ) : schemeStatus === 'RefundPending' ? (
                <>
                  <h2>
                    Scheme Closed — Refund Under Review
                  </h2>

                  <p>
                    Refund Amount:
                    {' '}
                    ₹{money(schemeUser.schemeRefundAmount)}
                    . Contact the store for actual
                    refund status.
                  </p>

                  <button
                    type="button"
                    onClick={() => openContact({
                      title: 'Scheme Refund Help'
                    })}
                  >
                    Contact Store
                  </button>
                </>
              ) : hasPendingPayment ? (
                <>
                  <h2>
                    UPI Submitted — Verification Pending
                  </h2>

                  <p>
                    {pendingMonths.size} installment(s)
                    have pending payment requests.
                    They will count only after
                    admin verification.
                  </p>
                </>
              ) : schemeDeadline.stage === 'DUE' ? (
                <>
                  <h2>
                    Installment Due — Day
                    {' '}
                    {schemeDeadline.dueDay} of 5
                  </h2>

                  <p>
                    Due Date:
                    {' '}
                    {schemeDeadline.dueDate}
                    {' · '}
                    Last Date:
                    {' '}
                    {schemeDeadline.graceEndDate}
                  </p>

                  <p>
                    You may also prepay future
                    installments using the multiple
                    payment option.
                  </p>
                </>
              ) : schemeDeadline.stage ===
                'UPCOMING' ? (
                <>
                  <h2>
                    Next Installment:
                    {' '}
                    {schemeDeadline.dueDate}
                  </h2>

                  <p>
                    Future installments can be prepaid,
                    subject to scheme rules.
                  </p>
                </>
              ) : paidCount === 12 ? (
                <>
                  <h2>
                    All 12 Installments Completed
                  </h2>

                  <p>
                    Your making-charge benefit unlocks
                    on the original eligibility date,
                    not immediately after early payment.
                  </p>
                </>
              ) : (
                <>
                  <h2>
                    Scheme Status:
                    {' '}
                    {schemeStatus}
                  </h2>

                  <p>
                    Contact the showroom if you need
                    assistance.
                  </p>
                </>
              )}
            </section>

            {/* Progress */}
            <section className="rj-progress-card">
              <div className="rj-progress-top">
                <div>
                  <small>
                    12-MONTH GOLD SCHEME
                  </small>
                  <h2>Your Scheme Progress</h2>
                </div>

                <span>{paidCount}/12 Paid</span>
              </div>

              <div className="rj-progress-track">
                <span style={{
                  width: `${progressPercent}%`
                }} />
              </div>

              <div className="rj-progress-numbers">
                <div>
                  <small>Amount Paid</small>
                  <strong>
                    ₹{money(totalPaid)}
                  </strong>
                </div>

                <div>
                  <small>Scheme Target</small>
                  <strong>
                    ₹{money(totalScheme)}
                  </strong>
                </div>

                <div>
                  <small>Remaining</small>
                  <strong>
                    ₹{money(
                      Math.max(0, totalScheme - totalPaid)
                    )}
                  </strong>
                </div>
              </div>

              <div className="rj-dashboard-actions">
                <button
                  type="button"
                  onClick={() => setShowHistoryModal(true)}
                >
                  <History size={16} />
                  Payment Receipts
                </button>

                <button
                  type="button"
                  onClick={() => setShowProfileModal(true)}
                >
                  <UserRound size={16} />
                  My Profile
                </button>

                <button
                  type="button"
                  onClick={handleSchemeLogout}
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </section>

            {/* Multi installment payment */}
            {schemeActive && paidCount < 12 && (
              <section
                className="rj-progress-card"
                style={{
                  marginTop: 22,
                  textAlign: 'center'
                }}
              >
                <h2>
                  Pay One or Multiple Installments
                </h2>

                <p style={{ margin: '12px 0' }}>
                  एक साथ 1, 2, 3 या सभी उपलब्ध
                  भविष्य की किस्तें चुनकर भुगतान करें।
                </p>

                <button
                  type="button"
                  className="rj-gold-button"
                  onClick={() =>
                    setShowMultiPayment(true)
                  }
                >
                  <Smartphone size={18} />
                  Select Installments & Pay
                </button>
              </section>
            )}

            {/* Passbook */}
            <section className="rj-installments">
              <div className="rj-dashboard-section-title">
                <div>
                  <p className="rj-eyebrow">
                    YOUR PASSBOOK
                  </p>
                  <h2>Monthly Installments</h2>
                </div>

                <Receipt size={25} />
              </div>

              {Array.from({ length: 12 }).map(
                (_, index) => {
                  const month = index + 1;
                  const row = installments.find(item =>
                    Number(item.monthNum) === month
                  );

                  const paid = row
                    ? Boolean(row.paid)
                    : month <= paidCount;

                  const pending = pendingMonths.has(month);
                  const adjusted =
                    approvedUnapplied.has(month);

                  const payable =
                    schemeActive &&
                    !paid &&
                    !pending &&
                    Boolean(row?.payableNow);

                  return (
                    <div
                      key={month}
                      className={
                        `rj-installment-row ${
                          paid
                            ? 'paid'
                            : payable
                            ? 'next'
                            : ''
                        }`
                      }
                    >
                      <div className="rj-installment-icon">
                        {paid ? (
                          <CheckCircle2 />
                        ) : pending ? (
                          <Clock />
                        ) : (
                          <Lock />
                        )}
                      </div>

                      <div className="rj-installment-name">
                        <strong>
                          Month #{month}
                        </strong>
                        <small>
                          ₹{money(monthly)}
                        </small>
                      </div>

                      {paid ? (
                        <span className="rj-paid-label">
                          Verified Paid
                        </span>
                      ) : pending ? (
                        <span className="rj-locked-label">
                          Admin Verification Pending
                        </span>
                      ) : adjusted ? (
                        <span className="rj-locked-label">
                          Contact Admin
                        </span>
                      ) : payable ? (
                        <button
                          type="button"
                          className="rj-pay-button"
                          onClick={() =>
                            setShowMultiPayment(true)
                          }
                        >
                          <Smartphone size={15} />
                          Pay / Prepay
                        </button>
                      ) : (
                        <span className="rj-locked-label">
                          {schemeActive
                            ? 'Not Available'
                            : 'Scheme Paused'}
                        </span>
                      )}
                    </div>
                  );
                }
              )}
            </section>

            {/* Benefit */}
            <section className="rj-benefit-card">
              <Gift size={27} />

              <div>
                <h3>
                  {schemeUser.eligibleForMakingChargeDiscount
                    ? 'Making Charge Benefit Eligible'
                    : 'Your Scheme Benefit'}
                </h3>

                <p>
                  {schemeUser.eligibleForMakingChargeDiscount
                    ? (
                      'Your 12 installments are verified ' +
                      'and the original 13th-month ' +
                      'eligibility date has arrived. ' +
                      'Claim 100% making/labour charge ' +
                      'discount on eligible Gold Jewellery.'
                    )
                    : (
                      'Complete all 12 verified ' +
                      'installments. Your benefit ' +
                      'unlocks on the original ' +
                      '13th-month date. Gold Jewellery ' +
                      'making/labour charges only.'
                    )}
                </p>

                {schemeUser.schemeBenefitDate && (
                  <p>
                    Benefit Date:
                    {' '}
                    <strong>
                      {schemeUser.schemeBenefitDate}
                    </strong>
                  </p>
                )}
              </div>

              {schemeUser.eligibleForMakingChargeDiscount &&
                !claim && (
                  <button
                    type="button"
                    disabled={claimLoading}
                    onClick={handleClaimBenefit}
                  >
                    <Gift size={15} />
                    {claimLoading
                      ? 'Processing...'
                      : 'Claim Benefit'}
                  </button>
                )}

              {claim?.claimId &&
                schemeUser.eligibleForMakingChargeDiscount &&
                ['Pending', 'Verified'].includes(claim.status) && (
                <button
                  type="button"
                  onClick={handleDownloadBenefitCard}
                >
                  <Download size={15} />
                  Download Benefit Card
                </button>
              )}
            </section>

            {claimError && (
              <p
                role="alert"
                style={{
                  color: '#b91c1c',
                  textAlign: 'center',
                  padding: 12
                }}
              >
                {claimError}
              </p>
            )}

            {claim?.claimId && (
              <section
                className="rj-progress-card"
                style={{ marginTop: 20 }}
              >
                <h2>Benefit Claim Details</h2>

                <p>
                  Claim ID:
                  {' '}
                  <strong>{claim.claimId}</strong>
                </p>

                <p>
                  Status:
                  {' '}
                  <strong>
                    {claim.status || 'Pending Verification'}
                  </strong>
                </p>

                <p>
                  Present this card at Rahul Jewellers
                  Sheoganj. Final redemption requires
                  admin verification.
                </p>
              </section>
            )}
          </main>
        )}

      {/* Footer */}
      <footer className="rj-footer" id="contact">
        <div className="rj-footer-brand">
          <span className="rj-brand-mark">
            R<span>J</span>
            <Gem size={14} />
          </span>

          <div>
            <strong>RAHUL JEWELLERS</strong>
            <small>Sheoganj</small>
          </div>
        </div>

        <div className="rj-footer-contact">
          <span>
            <MapPin size={15} />
            Sheoganj, Rajasthan
          </span>

          {STORE_CONTACTS.map(contact => (
            <a
              key={contact.id}
              href={`tel:+91${contact.number}`}
            >
              <Phone size={15} />
              +91 {contact.number}
            </a>
          ))}

          <button
            type="button"
            onClick={() => openContact()}
          >
            <MessageCircle size={15} />
            WhatsApp Enquiry
          </button>
        </div>

        <p>
          © {new Date().getFullYear()}
          {' '}
          Rahul Jewellers Sheoganj.
          All rights reserved.
        </p>
      </footer>

      {/* Customer Login */}
      <CustomerLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Customer Profile */}
      <CustomerProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={schemeUser}
        onUpdateUser={(updatedUser, newToken) => {
          if (newToken) {
            localStorage.setItem(
              'customer_token',
              newToken
            );
          }

          setSchemeUser(updatedUser);

          localStorage.setItem(
            'schemeUserInfo',
            JSON.stringify(updatedUser)
          );
        }}
      />

      {/* Product Details */}
      <ProductDetails
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {/* Both contact numbers */}
      <ContactOptions
        isOpen={contactOpen}
        onClose={() => setContactOpen(false)}
        product={contactProduct}
        message={contactMessage}
        title={contactTitle}
      />

      {/* Multiple Installment UPI */}
      <SchemeMultiPayment
        isOpen={showMultiPayment}
        onClose={() => setShowMultiPayment(false)}
        user={schemeUser}
        paymentRequests={paymentRequests}
        upiId={storeUpiId}
        merchantName={storeMerchantName}
        qrCodeUrl={storeQrCodeUrl}
        onSubmitted={async () => {
          await fetchPaymentRequests();
          await syncCustomerData();
        }}
      />

      {/* Verified Payment Receipts */}
      {showHistoryModal &&
        authState === 'authenticated' && (
          <div className="rj-modal-backdrop">
            <div className="rj-history-modal">
              <button
                type="button"
                className="rj-modal-close"
                aria-label="Close payment history"
                onClick={() =>
                  setShowHistoryModal(false)
                }
              >
                <X />
              </button>

              <p className="rj-eyebrow">
                CUSTOMER PASSBOOK
              </p>

              <h2>Payment Receipts</h2>

              {paidCount === 0 ? (
                <p className="rj-no-history">
                  No verified installments recorded yet.
                </p>
              ) : (
                Array.from({ length: 12 })
                  .filter((_, index) => {
                    const month = index + 1;
                    const row = installments.find(item =>
                      Number(item.monthNum) === month
                    );

                    return row
                      ? Boolean(row.paid)
                      : month <= paidCount;
                  })
                  .map((_, index, paidArray) => {
                    const month = installments.length
                      ? installments
                          .filter(item => item.paid)
                          .sort(
                            (a, b) =>
                              Number(a.monthNum) -
                              Number(b.monthNum)
                          )[index]?.monthNum
                      : index + 1;

                    return (
                      <div
                        className="rj-history-row"
                        key={month}
                      >
                        <span>
                          Month #{month}
                          {' · '}
                          ₹{money(monthly)}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            handleDownloadReceipt(month)
                          }
                        >
                          <Download size={14} />
                          PDF
                        </button>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        )}
    </div>
  );
}
