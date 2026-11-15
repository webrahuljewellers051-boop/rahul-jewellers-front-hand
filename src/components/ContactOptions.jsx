
import React, {
  useEffect,
  useState
} from 'react';

import axios from 'axios';

import {
  X,
  Phone,
  MessageCircle,
  Instagram,
  Gem
} from 'lucide-react';

const API = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'https://rahul-jewellers-backend-jlr0.onrender.com'
).replace(/\/+$/, '');

export const STORE_CONTACTS = [
  '9950091024',
  '9461452322'
];

export function makeEnquiryMessage(product) {
  if (!product) {
    return (
      'Namaste Rahul Jewellers Sheoganj,\n' +
      'I would like to enquire about your jewellery collection.'
    );
  }

  const lines = [
    'Namaste Rahul Jewellers Sheoganj,',
    '',
    'I am interested in this jewellery product:',
    '',
    `Product: ${product.title || 'Jewellery'}`,
    `Category: ${product.category || '—'}`,
    `Weight: ${product.weight || '—'}`,
    `Purity: ${product.purity || '—'}`,
    `Price: ${
      Number(product.price) > 0
        ? `₹${Number(product.price).toLocaleString('en-IN')}`
        : 'On Request'
    }`
  ];

  const image =
    product.imageUrl ||
    product.images?.[0]?.url ||
    (
      typeof product.images?.[0] === 'string'
        ? product.images[0]
        : ''
    );

  if (image && /^https:\/\//i.test(image)) {
    lines.push(`Image: ${image}`);
  }

  lines.push(
    '',
    'Please share more details and availability.'
  );

  return lines.join('\n');
}

export function makeWhatsAppUrl(
  phone,
  productOrMessage
) {
  const digits = String(phone || '')
    .replace(/\D/g, '')
    .replace(/^91(?=\d{10}$)/, '');

  const message =
    typeof productOrMessage === 'string'
      ? productOrMessage
      : makeEnquiryMessage(productOrMessage);

  return (
    `https://wa.me/91${digits}` +
    `?text=${encodeURIComponent(message)}`
  );
}

export default function ContactOptions({
  isOpen = true,
  onClose,
  product = null,
  contactNumbers,
  phones,
  title = 'Contact Rahul Jewellers'
}) {
  const provided =
    contactNumbers || phones;

  const [numbers, setNumbers] = useState(
    Array.isArray(provided) && provided.length
      ? provided
      : STORE_CONTACTS
  );

  useEffect(() => {
    if (
      Array.isArray(provided) &&
      provided.length
    ) {
      setNumbers(provided);
      return;
    }

    let active = true;

    axios.get(
      `${API}/api/store/settings`,
      {
        timeout: 15000,
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      }
    ).then(response => {
      const saved =
        response.data?.settings?.contactNumbers;

      if (
        active &&
        Array.isArray(saved)
      ) {
        const valid = saved.filter(phone =>
          /^[6-9]\d{9}$/.test(
            String(phone)
          )
        );

        if (valid.length) {
          setNumbers(valid);
        }
      }
    }).catch(() => {
      // Keep fallback numbers.
    });

    return () => {
      active = false;
    };
  }, [provided]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={event =>
          event.stopPropagation()
        }
        className="w-full max-w-md rounded-3xl border border-[#d6b875]/40 bg-[#1c1314] p-6 text-[#f2e5ca] shadow-2xl"
      >
        <div className="flex justify-between gap-3 items-start">
          <div className="flex gap-3 items-center">
            <Gem
              size={24}
              className="text-[#d6b875]"
            />

            <div>
              <p className="text-[10px] tracking-widest text-[#d6b875]">
                RAHUL JEWELLERS · Sheoganj
              </p>

              <h2 className="text-lg font-bold mt-1">
                {title}
              </h2>
            </div>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="p-2"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {product && (
          <div className="mt-5 border border-[#d6b875]/20 bg-[#291d1e] p-3 rounded-xl">
            <p className="text-xs text-[#d6b875]">
              Product Enquiry
            </p>

            <p className="font-bold text-sm mt-1">
              {product.title}
            </p>

            <p className="text-xs mt-1">
              {product.category}
              {product.weight
                ? ` · ${product.weight}`
                : ''}
            </p>
          </div>
        )}

        <div className="mt-5 space-y-3">
          {numbers.map(phone => (
            <div
              key={phone}
              className="border border-[#d6b875]/20 rounded-2xl p-3 space-y-2"
            >
              <p className="text-sm font-bold text-center">
                +91 {phone}
              </p>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`tel:+91${phone}`}
                  className="flex justify-center items-center gap-2 bg-[#d6b875] text-[#211718] rounded-xl p-3 text-xs font-bold"
                >
                  <Phone size={16} />
                  Call
                </a>

                <a
                  href={makeWhatsAppUrl(
                    phone,
                    product
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex justify-center items-center gap-2 bg-emerald-700 text-white rounded-xl p-3 text-xs font-bold"
                >
                  <MessageCircle size={16} />
                  WhatsApp
                </a>
              </div>
            </div>
          ))}
        </div>

        <a
          href="https://www.instagram.com/rahuljewellers9/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center justify-center gap-2 text-xs text-[#d6b875]"
        >
          <Instagram size={16} />
          Instagram @rahuljewellers9
        </a>
      </section>
    </div>
  );
}
