import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import html2pdf from 'html2pdf.js';
import {
  Crown, Gem, Search, UserRound, Heart, Menu, X, MapPin,
  Phone, Instagram, MessageCircle, ShieldCheck, Award,
  Truck, RefreshCw, ChevronDown, ChevronRight, ArrowRight,
  CheckCircle2, Clock, Lock, Receipt, Download, LogOut,
  Smartphone, Gift, Calculator, History, Sparkles
} from 'lucide-react';

import LiveGoldNavbar from './components/LiveGoldNavbar.jsx';
import CustomerLoginModal from './components/loginmodal.jsx';
import IntroSplash from './components/IntroSplash.jsx';
import CustomerProfileModal from './components/CustomerProfileModal.jsx';
import SupportChatWidget from './components/SupportChatWidget.jsx';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'https://rahul-jewellers-backend-jlr0.onrender.com';

const STORE_PHONE = '9950091024';
const requestConfig = {
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  }
};

const collections = [
  {
    name: 'Gold',
    subtitle: 'Timeless Gold Elegance',
    image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?q=85&w=900&auto=format&fit=crop'
  },
  {
    name: 'Polki',
    subtitle: 'Royal Heritage Craft',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=85&w=900&auto=format&fit=crop'
  },
  {
    name: 'Kundan',
    subtitle: 'Traditional Grandeur',
    image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=85&w=900&auto=format&fit=crop'
  },
  {
    name: 'Diamond',
    subtitle: 'Brilliance That Lasts',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=85&w=900&auto=format&fit=crop'
  },
  {
    name: 'Silver',
    subtitle: 'Grace in Every Detail',
    image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?q=85&w=900&auto=format&fit=crop'
  }
];

const heroSlides = [
  {
    eyebrow: 'THE ROYAL',
    title: 'Heritage\nCollection',
    description: 'A timeless range of traditional and modern jewellery crafted for every occasion.',
    image: 'https://images.unsplash.com/photo-1635767798638-3665a6b2b9b5?q=90&w=2000&auto=format&fit=crop',
    category: 'Gold'
  },
  {
    eyebrow: 'CELEBRATE EVERY MOMENT',
    title: 'Bridal\nTreasures',
    description: 'Discover exquisite designs that make your most special moments unforgettable.',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=90&w=2000&auto=format&fit=crop',
    category: 'Kundan'
  },
  {
    eyebrow: 'TIMELESS BEAUTY',
    title: 'Modern\nElegance',
    description: 'Exceptional craftsmanship, made to become a part of your story.',
    image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?q=90&w=2000&auto=format&fit=crop',
    category: 'Diamond'
  }
];

const money = value =>
  Number(value || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 0
  });

export default function App() {
  const [showIntro, setShowIntro] = useState(
    () => !sessionStorage.getItem('rj_intro_played')
  );
  const [schemeUser, setSchemeUser] = useState(
    () => JSON.parse(localStorage.getItem('schemeUserInfo') || 'null')
  );

  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('showroom');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const [storeUpiId, setStoreUpiId] = useState('9950091024@okbizaxis');
  const [storeMerchantName, setStoreMerchantName] = useState('Rahul Jewellers');
  const [storeQrCodeUrl, setStoreQrCodeUrl] = useState('');
  const [activePaymentMonth, setActivePaymentMonth] = useState(null);
  const [showInstructionModal, setShowInstructionModal] = useState(false);

  const monthly = Number(schemeUser?.customInstallment || 10000);
  const paidCount = Math.min(12, Math.max(0, Number(schemeUser?.paidMonths || 0)));
  const progressPercent = (paidCount / 12) * 100;
  const totalAccumulatedValue = paidCount * monthly;
  const totalSchemeValue = 12 * monthly;

  const handleIntroFinish = () => {
    setShowIntro(false);
    sessionStorage.setItem('rj_intro_played', 'true');
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/products`, requestConfig);
      if (res.data?.success && Array.isArray(res.data.products)) {
        setProducts(res.data.products);
      }
    } catch (error) {
      console.error('Unable to load jewellery products:', error);
    }
  };

  const fetchStoreSettings = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/store/settings`, requestConfig);
      if (res.data?.success && res.data.settings) {
        setStoreUpiId(res.data.settings.upiId || '9950091024@okbizaxis');
        setStoreMerchantName(res.data.settings.merchantName || 'Rahul Jewellers');
        setStoreQrCodeUrl(res.data.settings.qrCodeUrl || '');
      }
    } catch (error) {
      console.error('Unable to load store settings:', error);
    }
  };

  const syncCustomerData = async () => {
    const savedUser = JSON.parse(localStorage.getItem('schemeUserInfo') || 'null');
    if (!savedUser?._id) return;

    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/customer/profile/${savedUser._id}`,
        requestConfig
      );

      if (res.data?.success && res.data.customer) {
        if (res.data.customer.isActive === false) {
          localStorage.removeItem('schemeUserInfo');
          setSchemeUser(null);
          return;
        }
        setSchemeUser(res.data.customer);
        localStorage.setItem('schemeUserInfo', JSON.stringify(res.data.customer));
      }
    } catch (error) {
      console.error('Unable to sync customer profile:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchStoreSettings();
    syncCustomerData();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide(current => (current + 1) % heroSlides.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, []);

  const handleTabChange = tab => {
    if (tab === 'scheme' && !schemeUser) {
      setShowLoginModal(true);
      return;
    }
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSchemeLogout = () => {
    localStorage.removeItem('schemeUserInfo');
    setSchemeUser(null);
    setActiveTab('showroom');
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const category = String(product.category || '').toLowerCase();
      const title = String(product.title || '').toLowerCase();
      const query = searchQuery.toLowerCase();

      const categoryMatch =
        selectedCategory === 'All' ||
        category.includes(selectedCategory.toLowerCase());

      const searchMatch = !query || title.includes(query) || category.includes(query);
      return categoryMatch && searchMatch;
    });
  }, [products, selectedCategory, searchQuery]);

  const openCollection = category => {
    setSelectedCategory(category);
    setActiveTab('showroom');
    setTimeout(() => {
      document.getElementById('showroom-products')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 80);
  };

  const handleDownloadReceipt = monthNum => {
    const element = document.createElement('div');
    element.innerHTML = `
      <div style="padding:30px;font-family:Arial;border:3px double #b88a3b;color:#2b160d">
        <h1 style="text-align:center;font-family:Georgia;color:#b88a3b">RAHUL JEWELLERS</h1>
        <p style="text-align:center">SHEOGANJ • PAYMENT RECEIPT</p>
        <hr/>
        <p>Customer: ${schemeUser?.name || ''}</p>
        <p>Customer ID: ${schemeUser?.customerId || ''}</p>
        <p>Phone: ${schemeUser?.phone || ''}</p>
        <p>Installment: Month #${monthNum}</p>
        <p>Amount: ₹${money(monthly)}</p>
        <p>Date: ${new Date().toLocaleDateString('en-IN')}</p>
        <p>Status: PAID (as recorded in customer account)</p>
        <hr/>
        <p style="text-align:center">Support: +91 ${STORE_PHONE}</p>
      </div>
    `;

    html2pdf().set({
      margin: 0.5,
      filename: `Rahul_Jewellers_Receipt_Month_${monthNum}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    }).from(element).save();
  };

  const handleDownloadMaturityCertificate = () => {
    const element = document.createElement('div');
    element.innerHTML = `
      <div style="padding:45px;border:8px double #b88a3b;text-align:center;font-family:Georgia;color:#321b10">
        <h1 style="color:#b88a3b">RAHUL JEWELLERS</h1>
        <p>MAIN MARKET, SHEOGANJ</p>
        <h2>Certificate of Scheme Completion</h2>
        <p>Presented to</p>
        <h2>${schemeUser?.name || 'Customer'}</h2>
        <p>Customer ID: ${schemeUser?.customerId || ''}</p>
        <p>For completing all 12 monthly installments under the Rahul Jewellers Savings Scheme.</p>
        <h3>100% OFF on Making Charges / Labour Cost</h3>
        <p>Date: ${new Date().toLocaleDateString('en-IN')}</p>
      </div>
    `;

    html2pdf().set({
      margin: 0.5,
      filename: `Rahul_Jewellers_Certificate_${schemeUser?.customerId || 'customer'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
    }).from(element).save();
  };

  const handleLoginSuccess = user => {
    setSchemeUser(user);
    localStorage.setItem('schemeUserInfo', JSON.stringify(user));
    setShowLoginModal(false);
    setActiveTab('scheme');
    setTimeout(syncCustomerData, 300);
  };

  const currentSlide = heroSlides[activeSlide];

  return (
    <div className="rj-site min-h-screen">
      {showIntro && <IntroSplash onFinish={handleIntroFinish} />}
      <SupportChatWidget />

      {/* Top trust and contact strip */}
      <div className="rj-topbar">
        <div className="rj-topbar-inner">
          <span><MapPin size={14}/> Sheoganj, Rajasthan</span>
          <div className="rj-topbar-trust">
            <span><Award size={14}/> 100 Years of Trust</span>
            <i />
            <span><ShieldCheck size={14}/> BIS Certified</span>
            <i />
            <span><Gem size={14}/> HUID Hallmark Jewellery</span>
          </div>
          <div className="rj-topbar-contact">
            <a href={`tel:+91${STORE_PHONE}`}><Phone size={14}/> +91 9950091024</a>
            <a href="https://www.instagram.com/rahuljewellers9/" target="_blank" rel="noreferrer"><Instagram size={16}/></a>
            <a href={`https://wa.me/91${STORE_PHONE}`} target="_blank" rel="noreferrer"><MessageCircle size={16}/></a>
          </div>
        </div>
      </div>

      {/* Main premium navigation */}
      <header className="rj-header">
        <div className="rj-header-inner">
          <button className="rj-mobile-menu" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Open menu">
            {mobileMenuOpen ? <X/> : <Menu/>}
          </button>

          <button className="rj-brand" onClick={() => handleTabChange('showroom')}>
            <span className="rj-brand-mark">R<span>J</span><Gem size={15}/></span>
            <span className="rj-brand-copy">
              <strong>RAHUL JEWELLERS</strong>
              <small>S H E O G A N J&nbsp; S H O W R O O M</small>
            </span>
          </button>

          <nav className={`rj-nav ${mobileMenuOpen ? 'is-open' : ''}`}>
            <button className={activeTab === 'showroom' ? 'active' : ''} onClick={() => handleTabChange('showroom')}>Home</button>
            <div className="rj-nav-dropdown">
              <button onClick={() => openCollection('All')}>Collections <ChevronDown size={13}/></button>
              <div className="rj-dropdown-menu">
                {collections.map(item => (
                  <button key={item.name} onClick={() => openCollection(item.name)}>{item.name} Collection</button>
                ))}
              </div>
            </div>
            <button onClick={() => handleTabChange('scheme')}>Schemes <ChevronDown size={13}/></button>
            <a href="#about">About Us</a>
            <a href="#contact">Contact</a>
          </nav>

          <div className="rj-header-actions">
            <button aria-label="Search" onClick={() => {
              setSearchOpen(!searchOpen);
              setTimeout(() => document.getElementById('rj-search-input')?.focus(), 50);
            }}><Search/></button>
            <button aria-label="Customer profile" onClick={() => schemeUser ? setShowProfileModal(true) : setShowLoginModal(true)}><UserRound/></button>
            <a aria-label="WhatsApp enquiry" href={`https://wa.me/91${STORE_PHONE}`} target="_blank" rel="noreferrer"><MessageCircle/></a>
          </div>
        </div>

        {searchOpen && (
          <div className="rj-search-panel">
            <Search size={18}/>
            <input
              id="rj-search-input"
              value={searchQuery}
              onChange={event => setSearchQuery(event.target.value)}
              placeholder="Search necklaces, rings, bangles..."
            />
            <button onClick={() => { setSearchOpen(false); setSearchQuery(''); }}><X size={18}/></button>
          </div>
        )}
      </header>

      {/* Live rates */}
      <LiveGoldNavbar />

      {activeTab === 'showroom' && (
        <>
          {/* Hero slider with bridal model */}
          <section className="rj-hero rj-hero-with-model">
            <div className="rj-hero-shade" />

            {/* Bridal model image on the right */}
            <div className="rj-hero-model">
              <img
                src="/heritage-bride.png"
                alt="Rahul Jewellers Bridal Heritage Collection"
                fetchPriority="high"
              />
            </div>

            {/* Previous slide */}
            <button
              className="rj-hero-arrow left"
              onClick={() =>
                setActiveSlide(current =>
                  (current + heroSlides.length - 1) % heroSlides.length
                )
              }
              aria-label="Previous slide"
            >
              ‹
            </button>

            {/* Hero text on the left */}
            <div className="rj-hero-content">
              <p className="rj-eyebrow">{currentSlide.eyebrow}</p>

              <h1>
                {currentSlide.title.split('\n').map((line, index) => (
                  <React.Fragment key={`${line}-${index}`}>
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
                onClick={() => openCollection(currentSlide.category)}
              >
                Explore Collection <ArrowRight size={18} />
              </button>
            </div>

            {/* Next slide */}
            <button
              className="rj-hero-arrow right"
              onClick={() =>
                setActiveSlide(current =>
                  (current + 1) % heroSlides.length
                )
              }
              aria-label="Next slide"
            >
              ›
            </button>

            {/* Slider navigation dots */}
            <div className="rj-hero-dots">
              {heroSlides.map((slide, index) => (
                <button
                  key={slide.title}
                  type="button"
                  className={activeSlide === index ? 'active' : ''}
                  onClick={() => setActiveSlide(index)}
                  aria-label={`Show slide ${index + 1}`}
                  aria-current={activeSlide === index ? 'true' : undefined}
                />
              ))}
            </div>
          </section>

          {/* Trust strip */}
          <section className="rj-trust-strip">
            <div><Gem/><span><b>BIS Certified</b><small>Jewellery</small></span></div>
            <div><ShieldCheck/><span><b>HUID</b><small>Hallmark</small></span></div>
            <div><Award/><span><b>Jewellery</b><small>Craftsmanship</small></span></div>
            <div><MessageCircle/><span><b>Personal</b><small>Assistance</small></span></div>
            <div><RefreshCw/><span><b>Trusted</b><small>Showroom</small></span></div>
          </section>

          {/* Collections */}
          <section className="rj-section rj-collections">
            <div className="rj-section-heading">
              <span/>
              <h2>Explore Our Collections</h2>
              <span/>
            </div>
            <div className="rj-collection-grid">
              {collections.map(item => (
                <button className="rj-collection-card" key={item.name} onClick={() => openCollection(item.name)}>
                  <img src={item.image} alt={`${item.name} jewellery collection`} loading="lazy"/>
                  <span className="rj-collection-overlay"/>
                  <span className="rj-collection-caption">
                    <strong>{item.name}</strong>
                    <small>{item.subtitle}</small>
                    <em>Explore <ArrowRight size={15}/></em>
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Savings scheme banner */}
          <section className="rj-scheme-banner">
            <div className="rj-scheme-art">
              <div className="rj-gold-stack"><span/><span/><span/><span/></div>
              <div className="rj-calendar"><b>12</b><small>Months</small></div>
            </div>
            <div className="rj-scheme-copy">
              <p className="rj-eyebrow">SHEOGANJ EXCLUSIVE SAVINGS SCHEME</p>
              <h2>Pay in 12 Monthly Installments &amp; Get<br/><strong>100% OFF on Making Charges!</strong></h2>
              <p>Invest securely in pure 916 hallmarked gold &amp; silver.</p>
            </div>
            <button className="rj-gold-button" onClick={() => handleTabChange('scheme')}>
              Join Scheme <ArrowRight size={17}/>
            </button>
          </section>

          {/* Product catalogue */}
          <section className="rj-section rj-products" id="showroom-products">
            <div className="rj-products-heading">
              <div>
                <p className="rj-eyebrow">MADE TO BE TREASURED</p>
                <h2>Discover Our Jewellery</h2>
              </div>
              <div className="rj-product-search">
                <Search size={16}/>
                <input value={searchQuery} onChange={event => setSearchQuery(event.target.value)} placeholder="Search jewellery"/>
              </div>
            </div>

            <div className="rj-category-pills">
              {['All', 'Gold', 'Polki', 'Kundan', 'Diamond', 'Silver'].map(category => (
                <button key={category} className={selectedCategory === category ? 'active' : ''} onClick={() => setSelectedCategory(category)}>
                  {category === 'All' ? 'All Collections' : category}
                </button>
              ))}
            </div>

            <div className="rj-product-grid">
              {filteredProducts.length === 0 ? (
                <div className="rj-empty-products">
                  <Gem size={35}/>
                  <h3>{products.length ? 'No matching jewellery found' : 'Our collection is being updated'}</h3>
                  <p>Please contact our showroom for personalised assistance.</p>
                  <a href={`https://wa.me/91${STORE_PHONE}`} target="_blank" rel="noreferrer">Enquire on WhatsApp <ArrowRight size={15}/></a>
                </div>
              ) : filteredProducts.map(product => {
                const message = `Namaste Rahul Jewellers, I am interested in:\n${product.title}\nCategory: ${product.category}\nWeight: ${product.weight || 'Please share'}\nPlease share further details.`;
                const whatsappUrl = `https://wa.me/91${STORE_PHONE}?text=${encodeURIComponent(message)}`;

                return (
                  <article className="rj-product-card" key={product._id}>
                    <button className="rj-product-image" onClick={() => setPreviewImage(product.imageUrl)}>
                      <img src={product.imageUrl} alt={product.title} loading="lazy"/>
                      <span>{product.category}</span>
                    </button>
                    <div className="rj-product-info">
                      <h3>{product.title}</h3>
                      <p>Net Weight: {product.weight || 'Ask in showroom'}</p>
                      {Number(product.price) > 0 && <strong>₹{money(product.price)}</strong>}
                      <a href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={15}/> Enquire on WhatsApp</a>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="rj-about" id="about">
            <p className="rj-eyebrow">A LEGACY OF TRUST</p>
            <h2>100 Years of Trust. A Lifetime of Elegance.</h2>
            <p>Discover thoughtfully selected jewellery and personal service at Rahul Jewellers, Sheoganj.</p>
          </section>
        </>
      )}

      {/* Savings scheme customer dashboard */}
      {activeTab === 'scheme' && schemeUser && (
        <main className="rj-scheme-dashboard">
          <div className="rj-dashboard-heading">
            <p className="rj-eyebrow">CUSTOMER SAVINGS ACCOUNT</p>
            <h1>Welcome, {schemeUser.name}</h1>
            <p>Customer ID: {schemeUser.customerId || '—'} · {schemeUser.phone || ''}</p>
          </div>

          <section className="rj-progress-card">
            <div className="rj-progress-top">
              <div><small>12-MONTH SAVINGS SCHEME</small><h2>Your Scheme Progress</h2></div>
              <span>{paidCount}/12 Paid</span>
            </div>
            <div className="rj-progress-track"><span style={{ width: `${progressPercent}%` }}/></div>
            <div className="rj-progress-numbers">
              <div><small>Amount Paid</small><strong>₹{money(totalAccumulatedValue)}</strong></div>
              <div><small>Scheme Target</small><strong>₹{money(totalSchemeValue)}</strong></div>
              <div><small>Remaining</small><strong>₹{money(Math.max(0, totalSchemeValue - totalAccumulatedValue))}</strong></div>
            </div>
            <div className="rj-dashboard-actions">
              <button onClick={() => setShowHistoryModal(true)}><History size={16}/> Payment Receipts</button>
              <button onClick={() => setShowProfileModal(true)}><UserRound size={16}/> My Profile</button>
              <button onClick={handleSchemeLogout}><LogOut size={16}/> Logout</button>
            </div>
          </section>

          <section className="rj-installments">
            <div className="rj-dashboard-section-title">
              <div><p className="rj-eyebrow">YOUR PASSBOOK</p><h2>Monthly Installments</h2></div>
              <Receipt size={25}/>
            </div>
            {Array.from({ length: 12 }).map((_, index) => {
              const month = index + 1;
              const paid = month <= paidCount;
              const next = month === paidCount + 1;
              return (
                <div className={`rj-installment-row ${paid ? 'paid' : next ? 'next' : ''}`} key={month}>
                  <div className="rj-installment-icon">
                    {paid ? <CheckCircle2/> : next ? <Clock/> : <Lock/>}
                  </div>
                  <div className="rj-installment-name"><strong>Month #{month}</strong><small>₹{money(monthly)}</small></div>
                  {paid ? <span className="rj-paid-label">Paid / Recorded</span> : next ? (
                    <button className="rj-pay-button" onClick={() => setActivePaymentMonth(month)}><Smartphone size={15}/> Pay</button>
                  ) : <span className="rj-locked-label">Locked</span>}
                </div>
              );
            })}
          </section>

          <section className="rj-benefit-card">
            <Gift size={27}/>
            <div>
              <h3>{paidCount >= 12 ? 'Scheme Benefit Unlocked' : 'Your Scheme Benefit'}</h3>
              <p>{paidCount >= 12
                ? 'Your account shows all 12 installments completed. Contact the showroom for redemption.'
                : 'Complete all 12 installments to become eligible for 100% OFF on Making Charges, subject to scheme terms.'}</p>
            </div>
            {paidCount >= 12 && <button onClick={handleDownloadMaturityCertificate}><Download size={15}/> Certificate</button>}
          </section>
        </main>
      )}

      {/* Footer */}
      <footer className="rj-footer" id="contact">
        <div className="rj-footer-brand">
          <span className="rj-brand-mark">R<span>J</span><Gem size={14}/></span>
          <div><strong>RAHUL JEWELLERS</strong><small>SHEOGANJ SHOWROOM</small></div>
        </div>
        <div className="rj-footer-contact">
          <span><MapPin size={15}/> Main Market, Sheoganj, Rajasthan</span>
          <a href={`tel:+91${STORE_PHONE}`}><Phone size={15}/> +91 9950091024</a>
          <a href={`https://wa.me/91${STORE_PHONE}`} target="_blank" rel="noreferrer"><MessageCircle size={15}/> WhatsApp Enquiry</a>
        </div>
        <p>© {new Date().getFullYear()} Rahul Jewellers. All rights reserved.</p>
      </footer>

      {/* Login modal */}
      <CustomerLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Profile modal */}
      <CustomerProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={schemeUser}
        onUpdateUser={updatedUser => {
          setSchemeUser(updatedUser);
          localStorage.setItem('schemeUserInfo', JSON.stringify(updatedUser));
        }}
      />

      {/* Product image preview */}
      {previewImage && (
        <div className="rj-lightbox" onClick={() => setPreviewImage(null)}>
          <button onClick={() => setPreviewImage(null)}><X/></button>
          <img src={previewImage} alt="Jewellery preview" onClick={event => event.stopPropagation()}/>
        </div>
      )}

      {/* UPI payment modal */}
      {activePaymentMonth !== null && (
        <div className="rj-modal-backdrop">
          <div className="rj-payment-modal">
            <button className="rj-modal-close" onClick={() => setActivePaymentMonth(null)}><X/></button>
            <Smartphone size={32}/>
            <p className="rj-eyebrow">SAVINGS SCHEME PAYMENT</p>
            <h2>Month #{activePaymentMonth}</h2>
            <strong className="rj-payment-amount">₹{money(monthly)}</strong>
            <p>Pay to {storeMerchantName}</p>
            <p className="rj-upi-id">{storeUpiId}</p>
            {storeQrCodeUrl && <img className="rj-payment-qr" src={storeQrCodeUrl} alt="Store UPI QR code"/>}
            <button className="rj-gold-button rj-pay-full" onClick={() => {
              const note = encodeURIComponent(`Month ${activePaymentMonth} ${schemeUser?.customerId || ''}`);
              const uri = `upi://pay?pa=${encodeURIComponent(storeUpiId)}&pn=${encodeURIComponent(storeMerchantName)}&am=${monthly}&cu=INR&tn=${note}`;
              window.location.href = uri;
              setShowInstructionModal(true);
            }}>Open UPI App & Pay <ArrowRight size={16}/></button>
            <button className="rj-secondary-button" onClick={() => setActivePaymentMonth(null)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Payment screenshot instructions */}
      {showInstructionModal && (
        <div className="rj-modal-backdrop">
          <div className="rj-payment-modal">
            <button className="rj-modal-close" onClick={() => setShowInstructionModal(false)}><X/></button>
            <CheckCircle2 size={34}/>
            <h2>Next Step</h2>
            <p>Complete payment in your UPI app, take a screenshot of the receipt and send it to the showroom for manual verification.</p>
            <a className="rj-gold-button rj-pay-full" href={`https://wa.me/91${STORE_PHONE}?text=${encodeURIComponent(`Namaste Rahul Jewellers, I have made my Month #${activePaymentMonth} scheme payment. Please find my payment screenshot.`)}`} target="_blank" rel="noreferrer">
              <MessageCircle size={16}/> Send Screenshot on WhatsApp
            </a>
            <button className="rj-secondary-button" onClick={() => {
              setShowInstructionModal(false);
              setActivePaymentMonth(null);
            }}>Close</button>
          </div>
        </div>
      )}

      {/* Payment history */}
      {showHistoryModal && (
        <div className="rj-modal-backdrop">
          <div className="rj-history-modal">
            <button className="rj-modal-close" onClick={() => setShowHistoryModal(false)}><X/></button>
            <p className="rj-eyebrow">CUSTOMER PASSBOOK</p>
            <h2>Payment Receipts</h2>
            {paidCount === 0 ? <p className="rj-no-history">No completed installments are recorded yet.</p> :
              Array.from({ length: paidCount }).map((_, index) => (
                <div className="rj-history-row" key={index}>
                  <span>Month #{index + 1} · ₹{money(monthly)}</span>
                  <button onClick={() => handleDownloadReceipt(index + 1)}><Download size={14}/> PDF</button>
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}