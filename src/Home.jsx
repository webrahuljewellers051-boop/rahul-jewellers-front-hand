
import React, {
  useEffect,
  useMemo,
  useState
} from 'react';

import axios from 'axios';
import html2pdf from 'html2pdf.js';

import {
  Gem,
  Search,
  UserRound,
  Menu,
  X,
  MapPin,
  Phone,
  Instagram,
  MessageCircle,
  ShieldCheck,
  Award,
  RefreshCw,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  Clock,
  Lock,
  Receipt,
  Download,
  LogOut,
  Smartphone,
  Gift,
  History
} from 'lucide-react';

import LiveGoldNavbar from './components/LiveGoldNavbar.jsx';
import CustomerLoginModal from './components/loginmodal.jsx';
import IntroSplash from './components/IntroSplash.jsx';
import CustomerProfileModal from './components/CustomerProfileModal.jsx';
import SupportChatWidget from './components/SupportChatWidget.jsx';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'https://rahul-jewellers-backend-jlr0.onrender.com';

const STORE_PHONE = '9950091024';

const publicRequestConfig = {
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  }
};

function getCustomerToken() {
  return localStorage.getItem('customer_token');
}

function getAuthConfig() {
  const token = getCustomerToken();

  return {
    headers: {
      ...publicRequestConfig.headers,
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : {})
    },
    timeout: 20000
  };
}

function getSavedCustomer() {
  try {
    const token = getCustomerToken();

    if (!token) return null;

    const raw = localStorage.getItem('schemeUserInfo');

    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveCustomer(customer) {
  localStorage.setItem(
    'schemeUserInfo',
    JSON.stringify(customer)
  );
}

function clearCustomerSession() {
  localStorage.removeItem('customer_token');
  localStorage.removeItem('schemeUserInfo');
}

function apiError(error, fallback) {
  return (
    error.response?.data?.message ||
    error.response?.data?.error ||
    fallback
  );
}

const money = value =>
  Number(value || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 0
  });

function escapeHtml(value) {
  return String(value ?? '').replace(
    /[&<>"']/g,
    char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char])
  );
}

const collections = [
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

const heroSlides = [
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

function getBenefitDate(customer) {
  const supplied = customer?.benefitAvailableFrom;

  if (supplied) {
    const date = new Date(supplied);

    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  if (!customer?.startDate) return null;

  const start = new Date(
    `${customer.startDate.slice(0, 10)}T00:00:00Z`
  );

  if (Number.isNaN(start.getTime())) {
    return null;
  }

  const day = start.getUTCDate();

  start.setUTCDate(1);
  start.setUTCMonth(start.getUTCMonth() + 12);

  const lastDay = new Date(Date.UTC(
    start.getUTCFullYear(),
    start.getUTCMonth() + 1,
    0
  )).getUTCDate();

  start.setUTCDate(Math.min(day, lastDay));

  return start;
}

export default function App() {
  const [showIntro, setShowIntro] = useState(
    () => !sessionStorage.getItem('rj_intro_played')
  );

  const [schemeUser, setSchemeUser] = useState(
    getSavedCustomer
  );

  const [products, setProducts] = useState([]);

  const [activeTab, setActiveTab] = useState(
    () => {
      const saved = sessionStorage.getItem(
        'rj_customer_active_tab'
      );

      return ['showroom', 'scheme'].includes(saved)
        ? saved
        : 'showroom';
    }
  );

  const [selectedCategory, setSelectedCategory] =
    useState('All');

  const [searchQuery, setSearchQuery] =
    useState('');

  const [searchOpen, setSearchOpen] =
    useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [activeSlide, setActiveSlide] =
    useState(0);

  const [showLoginModal, setShowLoginModal] =
    useState(false);

  const [showProfileModal, setShowProfileModal] =
    useState(false);

  const [showHistoryModal, setShowHistoryModal] =
    useState(false);

  const [previewImage, setPreviewImage] =
    useState(null);

  const [storeUpiId, setStoreUpiId] = useState(
    '9950091024@okbizaxis'
  );

  const [
    storeMerchantName,
    setStoreMerchantName
  ] = useState('Rahul Jewellers');

  const [storeQrCodeUrl, setStoreQrCodeUrl] =
    useState('');

  const [
    activePaymentMonth,
    setActivePaymentMonth
  ] = useState(null);

  const [
    showInstructionModal,
    setShowInstructionModal
  ] = useState(false);

  const [paymentUtr, setPaymentUtr] =
    useState('');

  const [paymentSubmitting, setPaymentSubmitting] =
    useState(false);

  const [paymentRequests, setPaymentRequests] =
    useState([]);

  const [joinAmount, setJoinAmount] =
    useState('10000');

  const [joiningScheme, setJoiningScheme] =
    useState(false);

  const [notice, setNotice] =
    useState('');

  const [actionError, setActionError] =
    useState('');

  const isSchemeJoined =
    Boolean(schemeUser) &&
    schemeUser.schemeJoined !== false;

  const monthly = Number(
    schemeUser?.customInstallment || 10000
  );

  const paidCount = Math.min(
    12,
    Math.max(
      0,
      Number(schemeUser?.paidMonths || 0)
    )
  );

  const progressPercent =
    (paidCount / 12) * 100;

  const paidHistory = Array.isArray(
    schemeUser?.paymentHistory
  )
    ? schemeUser.paymentHistory
    : [];

  const totalAccumulatedValue =
    paidHistory.length > 0
      ? paidHistory.reduce(
          (sum, item) =>
            sum + Number(item.amount || 0),
          0
        )
      : paidCount * monthly;

  const totalSchemeValue =
    12 * monthly;

  const benefitDate = getBenefitDate(
    schemeUser
  );

  const benefitEligible =
    isSchemeJoined &&
    paidCount >= 12 &&
    benefitDate !== null &&
    Date.now() >= benefitDate.getTime();

  const nextPaymentMonth =
    paidCount < 12
      ? paidCount + 1
      : null;

  const currentSlide =
    heroSlides[activeSlide];

  const pendingPayment = paymentRequests.find(
    request =>
      request.status === 'Pending' &&
      Number(request.monthNum) ===
        nextPaymentMonth
  );

  const handleIntroFinish = () => {
    setShowIntro(false);

    sessionStorage.setItem(
      'rj_intro_played',
      'true'
    );
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/products`,
        publicRequestConfig
      );

      if (
        response.data?.success &&
        Array.isArray(response.data.products)
      ) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error(
        'Unable to load jewellery products:',
        error
      );
    }
  };

  const fetchStoreSettings = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/store/settings`,
        publicRequestConfig
      );

      const settings =
        response.data?.settings;

      if (
        response.data?.success &&
        settings
      ) {
        setStoreUpiId(
          settings.upiId ||
          '9950091024@okbizaxis'
        );

        setStoreMerchantName(
          settings.merchantName ||
          'Rahul Jewellers'
        );

        setStoreQrCodeUrl(
          settings.qrCodeUrl || ''
        );
      }
    } catch (error) {
      console.error(
        'Unable to load store settings:',
        error
      );
    }
  };

  const fetchPaymentRequests = async () => {
    if (!getCustomerToken()) {
      setPaymentRequests([]);
      return;
    }

    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/customer/payment-requests`,
        getAuthConfig()
      );

      if (
        response.data?.success &&
        Array.isArray(response.data.requests)
      ) {
        setPaymentRequests(
          response.data.requests
        );
      }
    } catch (error) {
      console.error(
        'Unable to load payment requests:',
        error
      );
    }
  };

  const syncCustomerData = async () => {
    const savedUser = getSavedCustomer();

    if (!savedUser?._id) {
      setSchemeUser(null);
      return;
    }

    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/customer/profile/${savedUser._id}`,
        getAuthConfig()
      );

      if (
        response.data?.success &&
        response.data.customer
      ) {
        const customer =
          response.data.customer;

        if (customer.isActive === false) {
          clearCustomerSession();
          setSchemeUser(null);
          setPaymentRequests([]);
          setActiveTab('showroom');
          return;
        }

        setSchemeUser(customer);
        saveCustomer(customer);
      }
    } catch (error) {
      console.error(
        'Unable to sync customer profile:',
        error
      );

      const status =
        error.response?.status;

      if (
        status === 401 ||
        status === 403 ||
        status === 404
      ) {
        clearCustomerSession();
        setSchemeUser(null);
        setPaymentRequests([]);
        setActiveTab('showroom');

        setNotice(
          'Your session has expired. Please login again.'
        );
      }
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchStoreSettings();

    if (getCustomerToken()) {
      syncCustomerData();
      fetchPaymentRequests();
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem(
      'rj_customer_active_tab',
      activeTab
    );
  }, [activeTab]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide(
        current =>
          (current + 1) % heroSlides.length
      );
    }, 6500);

    return () =>
      window.clearInterval(timer);
  }, []);

  const handleTabChange = tab => {
    setNotice('');
    setActionError('');

    if (
      tab === 'scheme' &&
      !schemeUser
    ) {
      setShowLoginModal(true);
      return;
    }

    setActiveTab(tab);
    setMobileMenuOpen(false);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleSchemeLogout = () => {
    clearCustomerSession();

    setSchemeUser(null);
    setPaymentRequests([]);
    setShowProfileModal(false);
    setShowHistoryModal(false);
    setActivePaymentMonth(null);
    setActiveTab('showroom');

    setNotice(
      'You have logged out successfully.'
    );
  };

  const handleLoginSuccess = (
    customer,
    token
  ) => {
    if (token) {
      localStorage.setItem(
        'customer_token',
        token
      );
    }

    saveCustomer(customer);

    setSchemeUser(customer);
    setShowLoginModal(false);
    setActiveTab('scheme');
    setNotice('');
    setActionError('');

    fetchPaymentRequests();

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleJoinScheme = async event => {
    event.preventDefault();

    if (!schemeUser || joiningScheme) {
      return;
    }

    const amount = Number(joinAmount);

    if (
      !Number.isInteger(amount) ||
      amount < 1000 ||
      amount > 1000000
    ) {
      setActionError(
        'Please enter a monthly amount between ₹1,000 and ₹10,00,000.'
      );
      return;
    }

    setJoiningScheme(true);
    setActionError('');
    setNotice('');

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/customer/join-scheme`,
        {
          customInstallment: amount
        },
        getAuthConfig()
      );

      if (
        response.data?.success &&
        response.data.customer
      ) {
        const updated =
          response.data.customer;

        setSchemeUser(updated);
        saveCustomer(updated);

        setNotice(
          'You have successfully joined the Gold Savings Scheme. Your customer account remains separate from the scheme.'
        );

        fetchPaymentRequests();
      } else {
        throw new Error(
          'Unable to join scheme.'
        );
      }
    } catch (error) {
      setActionError(
        apiError(
          error,
          'Unable to join Gold Savings Scheme.'
        )
      );
    } finally {
      setJoiningScheme(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const category = String(
        product.category || ''
      ).toLowerCase();

      const title = String(
        product.title || ''
      ).toLowerCase();

      const query =
        searchQuery.toLowerCase();

      const categoryMatch =
        selectedCategory === 'All' ||
        category.includes(
          selectedCategory.toLowerCase()
        );

      const searchMatch =
        !query ||
        title.includes(query) ||
        category.includes(query);

      return (
        categoryMatch &&
        searchMatch
      );
    });
  }, [
    products,
    selectedCategory,
    searchQuery
  ]);

  const openCollection = category => {
    setSelectedCategory(category);
    setActiveTab('showroom');
    setMobileMenuOpen(false);

    window.setTimeout(() => {
      document
        .getElementById('showroom-products')
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
    }, 80);
  };

  const openPaymentModal = month => {
    setPaymentUtr('');
    setActionError('');
    setActivePaymentMonth(month);
  };

  const handleSubmitPayment = async event => {
    event.preventDefault();

    if (
      !schemeUser ||
      activePaymentMonth === null ||
      paymentSubmitting
    ) {
      return;
    }

    const transactionId = paymentUtr
      .trim()
      .toUpperCase();

    if (
      !/^[A-Z0-9]{10,20}$/.test(
        transactionId
      )
    ) {
      setActionError(
        'Enter your valid 10–20 character UPI transaction reference number.'
      );
      return;
    }

    setPaymentSubmitting(true);
    setActionError('');

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/customer/pay-installment`,
        {
          userId: schemeUser._id,
          monthNum: activePaymentMonth,
          amount: monthly,
          transactionId
        },
        getAuthConfig()
      );

      if (!response.data?.success) {
        throw new Error(
          'Payment reference submission failed.'
        );
      }

      await fetchPaymentRequests();

      setNotice(
        `Month #${activePaymentMonth} payment reference submitted. Your installment will show Paid only after Rahul Jewellers verifies the payment.`
      );

      setActivePaymentMonth(null);
      setShowInstructionModal(false);
      setPaymentUtr('');
    } catch (error) {
      setActionError(
        apiError(
          error,
          'Unable to submit payment reference.'
        )
      );
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const handleDownloadReceipt = monthNum => {
    const entry = paidHistory.find(
      item =>
        Number(item.monthNum) ===
        Number(monthNum)
    );

    if (!entry) {
      setNotice(
        'A verified receipt is not available for this installment.'
      );
      return;
    }

    const element =
      document.createElement('div');

    const paidAt = entry.paidAt
      ? new Date(entry.paidAt)
          .toLocaleDateString('en-IN')
      : 'As per account record';

    element.innerHTML = `
      <div style="
        padding:35px;
        font-family:Arial,sans-serif;
        border:3px double #b88a3b;
        color:#2b160d
      ">
        <h1 style="
          text-align:center;
          font-family:Georgia,serif;
          color:#b88a3b
        ">RAHUL JEWELLERS</h1>

        <p style="text-align:center">
          SHIVGANJ · PAYMENT RECEIPT
        </p>

        <hr/>

        <p>Customer:
          ${escapeHtml(schemeUser?.name)}
        </p>

        <p>Customer ID:
          ${escapeHtml(schemeUser?.customerId)}
        </p>

        <p>Phone:
          ${escapeHtml(schemeUser?.phone)}
        </p>

        <p>Scheme: Gold Savings Scheme</p>
        <p>Installment: Month #${monthNum}</p>
        <p>Amount: ₹${money(entry.amount)}</p>
        <p>Payment Date: ${escapeHtml(paidAt)}</p>

        <p>Transaction Reference:
          ${escapeHtml(entry.transactionId)}
        </p>

        <p>Status: PAID / RECORDED</p>

        <hr/>

        <p style="text-align:center">
          Support: +91 ${STORE_PHONE}
        </p>
      </div>
    `;

    html2pdf()
      .set({
        margin: 0.5,
        filename:
          `Rahul_Jewellers_Receipt_Month_${monthNum}.pdf`,
        image: {
          type: 'jpeg',
          quality: 0.98
        },
        html2canvas: {
          scale: 2
        },
        jsPDF: {
          unit: 'in',
          format: 'letter',
          orientation: 'portrait'
        }
      })
      .from(element)
      .save();
  };

  const handleDownloadMaturityCertificate = () => {
    if (!benefitEligible) {
      setNotice(
        'The labour cost benefit becomes available in the month after the 12-month installment period, once all payments are verified.'
      );
      return;
    }

    const element =
      document.createElement('div');

    element.innerHTML = `
      <div style="
        padding:45px;
        border:8px double #b88a3b;
        text-align:center;
        font-family:Georgia,serif;
        color:#321b10
      ">
        <h1 style="color:#b88a3b">
          RAHUL JEWELLERS
        </h1>

        <p>SHIVGANJ</p>

        <h2>
          Certificate of Scheme Completion
        </h2>

        <p>Presented to</p>

        <h2>
          ${escapeHtml(schemeUser?.name)}
        </h2>

        <p>
          Customer ID:
          ${escapeHtml(schemeUser?.customerId)}
        </p>

        <p>
          For completing all 12 verified
          monthly installments toward Gold
          Jewellery Value.
        </p>

        <h3>
          Eligible for 100% OFF on
          Labour / Making Charges
        </h3>

        <p>
          Subject to Gold Savings Scheme
          terms and showroom verification.
        </p>

        <p>
          Date:
          ${new Date().toLocaleDateString('en-IN')}
        </p>
      </div>
    `;

    html2pdf()
      .set({
        margin: 0.5,
        filename:
          `Rahul_Jewellers_Certificate_${schemeUser?.customerId || 'customer'}.pdf`,
        image: {
          type: 'jpeg',
          quality: 0.98
        },
        html2canvas: {
          scale: 2
        },
        jsPDF: {
          unit: 'in',
          format: 'letter',
          orientation: 'landscape'
        }
      })
      .from(element)
      .save();
  };

  const upiNote = encodeURIComponent(
    `Gold Scheme Month ${activePaymentMonth} ${schemeUser?.customerId || ''}`
  );

  const upiUri =
    `upi://pay?pa=${encodeURIComponent(storeUpiId)}` +
    `&pn=${encodeURIComponent(storeMerchantName)}` +
    `&am=${monthly}` +
    `&cu=INR` +
    `&tn=${upiNote}`;

  return (
    <div className="rj-site min-h-screen">
      {showIntro && (
        <IntroSplash
          onFinish={handleIntroFinish}
        />
      )}

      <SupportChatWidget />

      {/* TOP TRUST BAR */}
      <div className="rj-topbar">
        <div className="rj-topbar-inner">
          <span>
            <MapPin size={14} />
            Shivganj, Rajasthan
          </span>

          <div className="rj-topbar-trust">
            <span>
              <Award size={14} />
              100 Years of Trust
            </span>

            <i />

            <span>
              <ShieldCheck size={14} />
              BIS Certified
            </span>

            <i />

            <span>
              <Gem size={14} />
              HUID Hallmark Jewellery
            </span>
          </div>

          <div className="rj-topbar-contact">
            <a href={`tel:+91${STORE_PHONE}`}>
              <Phone size={14} />
              +91 9950091024
            </a>

            <a
              href="https://www.instagram.com/rahuljewellers9/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
            >
              <Instagram size={16} />
            </a>

            <a
              href={`https://wa.me/91${STORE_PHONE}`}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
            >
              <MessageCircle size={16} />
            </a>
          </div>
        </div>
      </div>

      {/* MAIN NAVIGATION */}
      <header className="rj-header">
        <div className="rj-header-inner">
          <button
            className="rj-mobile-menu"
            onClick={() =>
              setMobileMenuOpen(
                previous => !previous
              )
            }
            aria-label="Open menu"
          >
            {mobileMenuOpen
              ? <X />
              : <Menu />}
          </button>

          <button
            className="rj-brand"
            onClick={() =>
              handleTabChange('showroom')
            }
          >
            <span className="rj-brand-mark">
              R<span>J</span>
              <Gem size={15} />
            </span>

            <span className="rj-brand-copy">
              <strong>
                RAHUL JEWELLERS
              </strong>

              <small>
                S H I V G A N J
              </small>
            </span>
          </button>

          <nav
            className={`rj-nav ${
              mobileMenuOpen
                ? 'is-open'
                : ''
            }`}
          >
            <button
              className={
                activeTab === 'showroom'
                  ? 'active'
                  : ''
              }
              onClick={() =>
                handleTabChange('showroom')
              }
            >
              Home
            </button>

            <div className="rj-nav-dropdown">
              <button
                onClick={() =>
                  openCollection('All')
                }
              >
                Collections
                <ChevronDown size={13} />
              </button>

              <div className="rj-dropdown-menu">
                {collections.map(item => (
                  <button
                    key={item.name}
                    onClick={() =>
                      openCollection(item.name)
                    }
                  >
                    {item.name} Collection
                  </button>
                ))}
              </div>
            </div>

            <button
              className={
                activeTab === 'scheme'
                  ? 'active'
                  : ''
              }
              onClick={() =>
                handleTabChange('scheme')
              }
            >
              Gold Scheme
              <ChevronDown size={13} />
            </button>

            <a href="#about">
              About Us
            </a>

            <a href="#contact">
              Contact
            </a>
          </nav>

          <div className="rj-header-actions">
            <button
              aria-label="Search"
              onClick={() => {
                setSearchOpen(
                  previous => !previous
                );

                window.setTimeout(() => {
                  document
                    .getElementById(
                      'rj-search-input'
                    )
                    ?.focus();
                }, 50);
              }}
            >
              <Search />
            </button>

            <button
              aria-label="Customer profile"
              onClick={() =>
                schemeUser
                  ? setShowProfileModal(true)
                  : setShowLoginModal(true)
              }
            >
              <UserRound />
            </button>

            <a
              aria-label="WhatsApp enquiry"
              href={`https://wa.me/91${STORE_PHONE}`}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle />
            </a>
          </div>
        </div>

        {searchOpen && (
          <div className="rj-search-panel">
            <Search size={18} />

            <input
              id="rj-search-input"
              value={searchQuery}
              onChange={event =>
                setSearchQuery(
                  event.target.value
                )
              }
              placeholder="Search necklaces, rings, bangles..."
            />

            <button
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

      {/* LIVE GOLD RATE */}
      <LiveGoldNavbar />

      {/* GLOBAL INFORMATION */}
      {notice && (
        <div
          role="status"
          className="mx-auto my-4 flex max-w-6xl items-start justify-between gap-3 rounded-xl border border-[#C8A565]/30 bg-[#C8A565]/10 p-4 text-sm text-[#E8D1A3]"
        >
          <span>{notice}</span>

          <button
            onClick={() => setNotice('')}
            aria-label="Dismiss message"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* HOME / SHOWROOM */}
      {activeTab === 'showroom' && (
        <>
          {/* HERO SLIDER */}
          <section
            className="rj-hero"
            style={{
              backgroundImage:
                `url("${currentSlide.image}")`,
              backgroundSize: 'cover',
              backgroundPosition:
                'center center',
              backgroundRepeat: 'no-repeat',
              position: 'relative'
            }}
          >
            <div className="rj-hero-shade" />

            <button
              className="rj-hero-arrow left"
              onClick={() =>
                setActiveSlide(
                  (
                    activeSlide +
                    heroSlides.length -
                    1
                  ) % heroSlides.length
                )
              }
              aria-label="Previous slide"
            >
              ‹
            </button>

            <div className="rj-hero-content">
              <p className="rj-eyebrow">
                {currentSlide.eyebrow}
              </p>

              <h1>
                {currentSlide.title
                  .split('\n')
                  .map((line, index) => (
                    <React.Fragment
                      key={`${line}-${index}`}
                    >
                      {line}
                      {index === 0 && <br />}
                    </React.Fragment>
                  ))}
              </h1>

              <p className="rj-hero-description">
                {currentSlide.description}
              </p>

              <button
                className="rj-outline-button"
                onClick={() =>
                  openCollection(
                    currentSlide.category
                  )
                }
              >
                Explore Collection
                <ArrowRight size={18} />
              </button>
            </div>

            <button
              className="rj-hero-arrow right"
              onClick={() =>
                setActiveSlide(
                  (
                    activeSlide + 1
                  ) % heroSlides.length
                )
              }
              aria-label="Next slide"
            >
              ›
            </button>

            <div className="rj-hero-dots">
              {heroSlides.map(
                (slide, index) => (
                  <button
                    key={slide.title}
                    className={
                      activeSlide === index
                        ? 'active'
                        : ''
                    }
                    onClick={() =>
                      setActiveSlide(index)
                    }
                    aria-label={
                      `Show slide ${index + 1}`
                    }
                  />
                )
              )}
            </div>
          </section>

          {/* TRUST STRIP */}
          <section className="rj-trust-strip">
            <div>
              <Gem />
              <span>
                <b>BIS Certified</b>
                <small>Jewellery</small>
              </span>
            </div>

            <div>
              <ShieldCheck />
              <span>
                <b>HUID</b>
                <small>Hallmark</small>
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
                <b>Trusted</b>
                <small>Showroom</small>
              </span>
            </div>
          </section>

          {/* COLLECTIONS */}
          <section className="rj-section rj-collections">
            <div className="rj-section-heading">
              <span />
              <h2>
                Explore Our Collections
              </h2>
              <span />
            </div>

            <div className="rj-collection-grid">
              {collections.map(item => (
                <button
                  className="rj-collection-card"
                  key={item.name}
                  onClick={() =>
                    openCollection(item.name)
                  }
                >
                  <img
                    src={item.image}
                    alt={
                      `${item.name} jewellery collection`
                    }
                    loading="lazy"
                  />

                  <span className="rj-collection-overlay" />

                  <span className="rj-collection-caption">
                    <strong>
                      {item.name}
                    </strong>

                    <small>
                      {item.subtitle}
                    </small>

                    <em>
                      Explore
                      <ArrowRight size={15} />
                    </em>
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* GOLD SCHEME BANNER */}
          <section className="rj-scheme-banner">
            <div className="rj-scheme-art">
              <div className="rj-gold-stack">
                <span />
                <span />
                <span />
                <span />
              </div>

              <div className="rj-calendar">
                <b>12</b>
                <small>Months</small>
              </div>
            </div>

            <div className="rj-scheme-copy">
              <p className="rj-eyebrow">
                SHIVGANJ GOLD SAVINGS SCHEME
              </p>

              <h2>
                Pay 12 Monthly Installments
                <br />

                <strong>
                  100% OFF on Labour Charges
                  in the Following Month!
                </strong>
              </h2>

              <p>
                Save toward the value of
                Gold Jewellery. Complete
                12 monthly installments
                and become eligible for
                the labour/making charge
                benefit in the following
                month, subject to scheme
                terms.
              </p>

              <p>
                Gold Jewellery Only.
                Silver is not included
                in this scheme.
              </p>
            </div>

            <button
              className="rj-gold-button"
              onClick={() =>
                handleTabChange('scheme')
              }
            >
              {isSchemeJoined
                ? 'My Gold Scheme'
                : 'Join Gold Scheme'}

              <ArrowRight size={17} />
            </button>
          </section>

          {/* PRODUCT CATALOGUE */}
          <section
            className="rj-section rj-products"
            id="showroom-products"
          >
            <div className="rj-products-heading">
              <div>
                <p className="rj-eyebrow">
                  MADE TO BE TREASURED
                </p>

                <h2>
                  Discover Our Jewellery
                </h2>
              </div>

              <div className="rj-product-search">
                <Search size={16} />

                <input
                  value={searchQuery}
                  onChange={event =>
                    setSearchQuery(
                      event.target.value
                    )
                  }
                  placeholder="Search jewellery"
                />
              </div>
            </div>

            <div className="rj-category-pills">
              {[
                'All',
                'Gold',
                'Polki',
                'Kundan',
                'Diamond',
                'Silver'
              ].map(category => (
                <button
                  key={category}
                  className={
                    selectedCategory ===
                    category
                      ? 'active'
                      : ''
                  }
                  onClick={() =>
                    setSelectedCategory(
                      category
                    )
                  }
                >
                  {category === 'All'
                    ? 'All Collections'
                    : category}
                </button>
              ))}
            </div>

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
                    Please contact our
                    showroom for personalised
                    assistance.
                  </p>

                  <a
                    href={
                      `https://wa.me/91${STORE_PHONE}`
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    Enquire on WhatsApp
                    <ArrowRight size={15} />
                  </a>
                </div>
              ) : (
                filteredProducts.map(product => {
                  const message =
                    `Namaste Rahul Jewellers, I am interested in:\n` +
                    `${product.title}\n` +
                    `Category: ${product.category}\n` +
                    `Weight: ${product.weight || 'Please share'}\n` +
                    `Please share further details.`;

                  const whatsappUrl =
                    `https://wa.me/91${STORE_PHONE}?text=` +
                    encodeURIComponent(message);

                  return (
                    <article
                      className="rj-product-card"
                      key={product._id}
                    >
                      <button
                        className="rj-product-image"
                        onClick={() =>
                          setPreviewImage(
                            product.imageUrl
                          )
                        }
                      >
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          loading="lazy"
                        />

                        <span>
                          {product.category}
                        </span>
                      </button>

                      <div className="rj-product-info">
                        <h3>
                          {product.title}
                        </h3>

                        <p>
                          Net Weight:{' '}
                          {product.weight ||
                            'Ask in showroom'}
                        </p>

                        {Number(product.price) > 0 && (
                          <strong>
                            ₹{money(product.price)}
                          </strong>
                        )}

                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <MessageCircle size={15} />
                          Enquire on WhatsApp
                        </a>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>

          {/* ABOUT */}
          <section
            className="rj-about"
            id="about"
          >
            <p className="rj-eyebrow">
              A LEGACY OF TRUST
            </p>

            <h2>
              100 Years of Trust.
              A Lifetime of Elegance.
            </h2>

            <p>
              Discover thoughtfully selected
              jewellery and personal service
              at Rahul Jewellers, Shivganj.
            </p>
          </section>
        </>
      )}

      {/* CUSTOMER ACCOUNT */}
      {activeTab === 'scheme' &&
        schemeUser && (
          <main className="rj-scheme-dashboard">

            <div className="rj-dashboard-heading">
              <p className="rj-eyebrow">
                RAHUL JEWELLERS · SHIVGANJ
              </p>

              <h1>
                Welcome, {schemeUser.name}
              </h1>

              <p>
                Customer ID:{' '}
                {schemeUser.customerId || '—'}
                {' · '}
                {schemeUser.phone || ''}
              </p>
            </div>

            {actionError && (
              <div
                role="alert"
                className="my-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"
              >
                {actionError}
              </div>
            )}

            {/* CUSTOMER ACCOUNT WITHOUT SCHEME */}
            {!isSchemeJoined && (
              <>
                <section className="rj-progress-card">
                  <div className="rj-progress-top">
                    <div>
                      <small>
                        YOUR CUSTOMER PROFILE
                      </small>

                      <h2>
                        Your Account Is Active
                      </h2>
                    </div>

                    <span>
                      <CheckCircle2 size={17} />
                      Registered
                    </span>
                  </div>

                  <p className="my-5 text-sm leading-relaxed opacity-80">
                    Your Rahul Jewellers
                    customer account has been
                    created successfully.
                    Joining the Gold Savings
                    Scheme is optional.
                  </p>

                  <div className="rj-dashboard-actions">
                    <button
                      onClick={() =>
                        setShowProfileModal(true)
                      }
                    >
                      <UserRound size={16} />
                      My Profile
                    </button>

                    <button
                      onClick={handleSchemeLogout}
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </section>

                <section className="rj-benefit-card">
                  <Gem size={28} />

                  <div>
                    <h3>
                      Gold Savings Scheme
                    </h3>

                    <p>
                      Pay 12 monthly
                      installments toward
                      Gold Jewellery Value.
                      After completing the
                      installment period,
                      eligible customers
                      receive 100% OFF on
                      labour/making charges
                      in the following month,
                      subject to scheme terms.
                    </p>

                    <p className="mt-2">
                      This scheme is for
                      Gold Jewellery only.
                    </p>
                  </div>
                </section>

                <section className="rj-progress-card">
                  <div className="rj-progress-top">
                    <div>
                      <small>
                        OPTIONAL ENROLLMENT
                      </small>

                      <h2>
                        Join Gold Savings Scheme
                      </h2>
                    </div>
                  </div>

                  <form
                    onSubmit={handleJoinScheme}
                    className="mt-5"
                  >
                    <label
                      htmlFor="rj-join-amount"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Monthly Installment Amount
                    </label>

                    <input
                      id="rj-join-amount"
                      type="number"
                      min="1000"
                      max="1000000"
                      step="1"
                      value={joinAmount}
                      onChange={event =>
                        setJoinAmount(
                          event.target.value
                        )
                      }
                      required
                      className="w-full max-w-sm rounded-xl border border-[#C6A66B]/40 bg-black/20 px-4 py-3 text-base outline-none"
                    />

                    <p className="mt-3 text-sm opacity-75">
                      12 installments:
                      {' '}
                      ₹{money(
                        Number(joinAmount || 0) * 12
                      )}
                    </p>

                    <p className="mt-2 text-xs opacity-65">
                      Enrollment starts
                      the Gold Scheme only.
                      Your customer profile
                      remains active
                      independently.
                    </p>

                    <button
                      type="submit"
                      disabled={joiningScheme}
                      className="rj-gold-button mt-5"
                    >
                      {joiningScheme
                        ? 'Joining...'
                        : 'Confirm & Join Gold Scheme'}

                      <ArrowRight size={17} />
                    </button>
                  </form>
                </section>
              </>
            )}

            {/* JOINED GOLD SCHEME */}
            {isSchemeJoined && (
              <>
                <section className="rj-progress-card">
                  <div className="rj-progress-top">
                    <div>
                      <small>
                        GOLD SAVINGS SCHEME
                      </small>

                      <h2>
                        Your Scheme Progress
                      </h2>
                    </div>

                    <span>
                      {paidCount}/12 Paid
                    </span>
                  </div>

                  <div className="rj-progress-track">
                    <span
                      style={{
                        width:
                          `${progressPercent}%`
                      }}
                    />
                  </div>

                  <div className="rj-progress-numbers">
                    <div>
                      <small>
                        Amount Paid
                      </small>

                      <strong>
                        ₹{money(
                          totalAccumulatedValue
                        )}
                      </strong>
                    </div>

                    <div>
                      <small>
                        Scheme Target
                      </small>

                      <strong>
                        ₹{money(
                          totalSchemeValue
                        )}
                      </strong>
                    </div>

                    <div>
                      <small>
                        Remaining
                      </small>

                      <strong>
                        ₹{money(
                          Math.max(
                            0,
                            totalSchemeValue -
                              totalAccumulatedValue
                          )
                        )}
                      </strong>
                    </div>
                  </div>

                  <p className="mt-4 text-xs opacity-70">
                    Scheme Type: Gold Only
                    {' · '}
                    Monthly Installment:
                    {' '}
                    ₹{money(monthly)}
                  </p>

                  <div className="rj-dashboard-actions">
                    <button
                      onClick={() =>
                        setShowHistoryModal(true)
                      }
                    >
                      <History size={16} />
                      Payment Receipts
                    </button>

                    <button
                      onClick={() =>
                        setShowProfileModal(true)
                      }
                    >
                      <UserRound size={16} />
                      My Profile
                    </button>

                    <button
                      onClick={async () => {
                        await syncCustomerData();
                        await fetchPaymentRequests();

                        setNotice(
                          'Your account and payment status have been refreshed.'
                        );
                      }}
                    >
                      <RefreshCw size={16} />
                      Refresh
                    </button>

                    <button
                      onClick={handleSchemeLogout}
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </section>

                {/* INSTALLMENTS */}
                <section className="rj-installments">
                  <div className="rj-dashboard-section-title">
                    <div>
                      <p className="rj-eyebrow">
                        GOLD SCHEME PASSBOOK
                      </p>

                      <h2>
                        Monthly Installments
                      </h2>
                    </div>

                    <Receipt size={25} />
                  </div>

                  {Array.from({
                    length: 12
                  }).map((_, index) => {
                    const month =
                      index + 1;

                    const paid =
                      month <= paidCount;

                    const next =
                      month ===
                      paidCount + 1;

                    const pending =
                      paymentRequests.some(
                        request =>
                          Number(
                            request.monthNum
                          ) === month &&
                          request.status ===
                            'Pending'
                      );

                    return (
                      <div
                        className={
                          `rj-installment-row ${
                            paid
                              ? 'paid'
                              : next
                                ? 'next'
                                : ''
                          }`
                        }
                        key={month}
                      >
                        <div className="rj-installment-icon">
                          {paid
                            ? <CheckCircle2 />
                            : next
                              ? <Clock />
                              : <Lock />}
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
                            Paid / Verified
                          </span>
                        ) : pending ? (
                          <span className="rj-locked-label">
                            Pending Verification
                          </span>
                        ) : next ? (
                          <button
                            className="rj-pay-button"
                            onClick={() =>
                              openPaymentModal(
                                month
                              )
                            }
                          >
                            <Smartphone size={15} />
                            Pay
                          </button>
                        ) : (
                          <span className="rj-locked-label">
                            Locked
                          </span>
                        )}
                      </div>
                    );
                  })}
                </section>

                {/* BENEFIT */}
                <section className="rj-benefit-card">
                  <Gift size={27} />

                  <div>
                    <h3>
                      {benefitEligible
                        ? 'Labour Cost Benefit Available'
                        : paidCount >= 12
                          ? '12 Installments Completed'
                          : 'Your Gold Scheme Benefit'}
                    </h3>

                    <p>
                      {benefitEligible
                        ? 'All 12 installments are recorded and the following-month eligibility date has arrived. Contact Rahul Jewellers for Gold Jewellery redemption and verification.'
                        : paidCount >= 12
                          ? 'Your 12 installments are complete. The 100% labour/making charge benefit becomes available in the following month, subject to scheme terms.'
                          : 'Complete 12 monthly installments toward Gold Jewellery Value. The eligible 100% labour/making charge benefit becomes available in the following month, subject to scheme terms.'}
                    </p>

                    {benefitDate && (
                      <p className="mt-2 text-xs opacity-70">
                        Benefit eligibility date:
                        {' '}
                        {benefitDate.toLocaleDateString(
                          'en-IN'
                        )}
                      </p>
                    )}
                  </div>

                  {benefitEligible && (
                    <button
                      onClick={
                        handleDownloadMaturityCertificate
                      }
                    >
                      <Download size={15} />
                      Certificate
                    </button>
                  )}
                </section>
              </>
            )}
          </main>
        )}

      {/* FOOTER */}
      <footer
        className="rj-footer"
        id="contact"
      >
        <div className="rj-footer-brand">
          <span className="rj-brand-mark">
            R<span>J</span>
            <Gem size={14} />
          </span>

          <div>
            <strong>
              RAHUL JEWELLERS
            </strong>

            <small>
              SHIVGANJ
            </small>
          </div>
        </div>

        <div className="rj-footer-contact">
          <span>
            <MapPin size={15} />
            Main Market, Shivganj,
            Rajasthan
          </span>

          <a href={`tel:+91${STORE_PHONE}`}>
            <Phone size={15} />
            +91 9950091024
          </a>

          <a
            href={`https://wa.me/91${STORE_PHONE}`}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={15} />
            WhatsApp Enquiry
          </a>
        </div>

        <p>
          © {new Date().getFullYear()}
          {' '}
          Rahul Jewellers.
          All rights reserved.
        </p>
      </footer>

      {/* LOGIN MODAL */}
      <CustomerLoginModal
        isOpen={showLoginModal}
        onClose={() =>
          setShowLoginModal(false)
        }
        onLoginSuccess={
          handleLoginSuccess
        }
      />

      {/* CUSTOMER PROFILE MODAL */}
      <CustomerProfileModal
        isOpen={showProfileModal}
        onClose={() =>
          setShowProfileModal(false)
        }
        user={schemeUser}
        onUpdateUser={updatedUser => {
          if (!updatedUser) return;

          setSchemeUser(updatedUser);
          saveCustomer(updatedUser);
        }}
      />

      {/* PRODUCT IMAGE PREVIEW */}
      {previewImage && (
        <div
          className="rj-lightbox"
          onClick={() =>
            setPreviewImage(null)
          }
        >
          <button
            onClick={() =>
              setPreviewImage(null)
            }
            aria-label="Close preview"
          >
            <X />
          </button>

          <img
            src={previewImage}
            alt="Jewellery preview"
            onClick={event =>
              event.stopPropagation()
            }
          />
        </div>
      )}

      {/* PAYMENT MODAL */}
      {activePaymentMonth !== null && (
        <div className="rj-modal-backdrop">
          <div className="rj-payment-modal">
            <button
              className="rj-modal-close"
              onClick={() => {
                setActivePaymentMonth(null);
                setActionError('');
              }}
              aria-label="Close payment"
            >
              <X />
            </button>

            <Smartphone size={32} />

            <p className="rj-eyebrow">
              GOLD SCHEME PAYMENT
            </p>

            <h2>
              Month #{activePaymentMonth}
            </h2>

            <strong className="rj-payment-amount">
              ₹{money(monthly)}
            </strong>

            <p>
              Pay to {storeMerchantName}
            </p>

            <p className="rj-upi-id">
              {storeUpiId}
            </p>

            {storeQrCodeUrl && (
              <img
                className="rj-payment-qr"
                src={storeQrCodeUrl}
                alt="Store UPI QR code"
              />
            )}

            <a
              className="rj-gold-button rj-pay-full"
              href={upiUri}
              onClick={() =>
                setShowInstructionModal(true)
              }
            >
              Open UPI App & Pay
              <ArrowRight size={16} />
            </a>

            <p className="my-3 text-center text-xs opacity-75">
              After completing your
              payment, enter the UPI
              transaction reference
              below. Payment is not
              considered verified until
              the store approves it.
            </p>

            <form
              onSubmit={
                handleSubmitPayment
              }
            >
              <label
                htmlFor="rj-payment-utr"
                className="mb-2 block text-sm font-semibold"
              >
                UPI Transaction Reference / UTR
              </label>

              <input
                id="rj-payment-utr"
                type="text"
                value={paymentUtr}
                onChange={event =>
                  setPaymentUtr(
                    event.target.value
                      .toUpperCase()
                      .replace(
                        /[^A-Z0-9]/g,
                        ''
                      )
                  )
                }
                maxLength={20}
                minLength={10}
                placeholder="Enter UPI reference number"
                required
                className="mb-3 w-full rounded-lg border border-[#C9A66D]/40 bg-black/20 px-3 py-3 text-sm outline-none"
              />

              {actionError && (
                <p
                  role="alert"
                  className="mb-3 text-xs text-red-400"
                >
                  {actionError}
                </p>
              )}

              <button
                type="submit"
                disabled={
                  paymentSubmitting
                }
                className="rj-gold-button rj-pay-full"
              >
                {paymentSubmitting
                  ? 'Submitting...'
                  : 'Submit Payment for Verification'}

                <ArrowRight size={16} />
              </button>
            </form>

            <button
              className="rj-secondary-button"
              onClick={() =>
                setActivePaymentMonth(null)
              }
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* PAYMENT INSTRUCTIONS */}
      {showInstructionModal && (
        <div className="rj-modal-backdrop">
          <div className="rj-payment-modal">
            <button
              className="rj-modal-close"
              onClick={() =>
                setShowInstructionModal(false)
              }
              aria-label="Close instructions"
            >
              <X />
            </button>

            <Smartphone size={34} />

            <h2>
              Payment Verification
            </h2>

            <p>
              Complete payment in your
              UPI app. Keep your UPI
              transaction reference
              and payment screenshot.
            </p>

            <p>
              Return to the payment
              form and submit your UTR.
              Rahul Jewellers will
              verify the payment
              before marking the
              installment as Paid.
            </p>

            <a
              className="rj-gold-button rj-pay-full"
              href={
                `https://wa.me/91${STORE_PHONE}?text=` +
                encodeURIComponent(
                  `Namaste Rahul Jewellers, I have initiated Gold Scheme Month #${activePaymentMonth} payment for Customer ID ${schemeUser?.customerId || ''}. I will share my payment receipt for verification.`
                )
              }
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={16} />
              Share Receipt on WhatsApp
            </a>

            <button
              className="rj-secondary-button"
              onClick={() =>
                setShowInstructionModal(false)
              }
            >
              Back to Payment Form
            </button>
          </div>
        </div>
      )}

      {/* PAYMENT HISTORY */}
      {showHistoryModal && (
        <div className="rj-modal-backdrop">
          <div className="rj-history-modal">
            <button
              className="rj-modal-close"
              onClick={() =>
                setShowHistoryModal(false)
              }
              aria-label="Close payment history"
            >
              <X />
            </button>

            <p className="rj-eyebrow">
              GOLD SCHEME PASSBOOK
            </p>

            <h2>
              Payment Receipts
            </h2>

            {paidCount === 0 ? (
              <p className="rj-no-history">
                No verified installments
                are recorded yet.
              </p>
            ) : (
              Array.from({
                length: paidCount
              }).map((_, index) => {
                const month =
                  index + 1;

                const entry =
                  paidHistory.find(
                    item =>
                      Number(
                        item.monthNum
                      ) === month
                  );

                return (
                  <div
                    className="rj-history-row"
                    key={month}
                  >
                    <span>
                      Month #{month}
                      {' · '}
                      ₹{money(
                        entry?.amount ||
                        monthly
                      )}
                    </span>

                    {entry ? (
                      <button
                        onClick={() =>
                          handleDownloadReceipt(
                            month
                          )
                        }
                      >
                        <Download size={14} />
                        PDF
                      </button>
                    ) : (
                      <span>
                        Recorded
                      </span>
                    )}
                  </div>
                );
              })
            )}

            {pendingPayment && (
              <p className="mt-4 text-xs opacity-70">
                Month #
                {pendingPayment.monthNum}
                {' '}
                is awaiting payment
                verification.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
