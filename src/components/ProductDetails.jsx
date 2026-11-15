
import React, { useEffect, useMemo, useState } from 'react';
import {
  X, ChevronLeft, ChevronRight, ZoomIn,
  MessageCircle, Gem, ShieldCheck
} from 'lucide-react';
import ContactOptions from './ContactOptions.jsx';

function imageUrls(product) {
  const values = [
    ...(Array.isArray(product?.images) ? product.images : []),
    product?.imageUrl
  ];

  return [...new Set(
    values
      .map(item => typeof item === 'string' ? item : item?.url)
      .filter(item => typeof item === 'string' && item.trim())
  )];
}

const money = amount =>
  Number(amount).toLocaleString('en-IN');

export default function ProductDetails({
  product,
  onClose = () => {}
}) {
  const [activeImage, setActiveImage] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  const images = useMemo(() => imageUrls(product), [product]);

  useEffect(() => {
    setActiveImage(0);
    setZoom(false);
    setContactOpen(false);
  }, [product?._id]);

  useEffect(() => {
    if (!product) return;

    const onKeyDown = event => {
      if (contactOpen) return;

      if (event.key === 'Escape') {
        if (zoom) setZoom(false);
        else onClose();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [product, zoom, contactOpen, onClose]);

  if (!product) return null;

  const nextImage = step => {
    if (!images.length) return;
    setActiveImage(index =>
      (index + step + images.length) % images.length
    );
  };

  const details = [
    ['Category', product.category],
    ['Purity', product.purity],
    ['Metal', product.metal],
    ['Weight', product.weight],
    ['Design', product.design],
    ['Craftsmanship', product.craftsmanship],
    ['Stones', product.stones],
    ['SKU', product.sku]
  ].filter(([, value]) => value !== undefined &&
    value !== null && String(value).trim());

  return (
    <>
      <div
        className="fixed inset-0 z-[9999] overflow-y-auto bg-black/85 p-3 backdrop-blur-sm sm:p-6"
        onMouseDown={event => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <section
          role="dialog"
          aria-modal="true"
          aria-label={product.title || 'Jewellery details'}
          className="relative mx-auto my-4 max-w-5xl overflow-hidden rounded-3xl border border-[#c9a76b]/40 bg-[#1b1415] text-[#ead9b6] shadow-2xl"
        >
          <button
            type="button"
            aria-label="Close product details"
            onClick={onClose}
            className="absolute right-4 top-4 z-20 rounded-full bg-black/65 p-2 text-white"
          >
            <X size={21} />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="bg-[#100b0c] p-4">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#241a1a]">
                {images.length ? (
                  <button
                    type="button"
                    onClick={() => setZoom(true)}
                    className="h-full w-full"
                    aria-label="Zoom product image"
                  >
                    <img
                      src={images[activeImage]}
                      alt={`${product.title} image ${activeImage + 1}`}
                      className="h-full w-full object-contain"
                    />
                  </button>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Gem size={60} className="text-[#c9a76b]" />
                  </div>
                )}

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      aria-label="Previous image"
                      onClick={() => nextImage(-1)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/70 p-2 text-white"
                    >
                      <ChevronLeft size={20} />
                    </button>

                    <button
                      type="button"
                      aria-label="Next image"
                      onClick={() => nextImage(1)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/70 p-2 text-white"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}

                {images.length > 0 && (
                  <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/70 px-3 py-1 text-xs text-white">
                    <ZoomIn size={13} /> Zoom
                  </span>
                )}
              </div>

              {images.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                  {images.map((src, index) => (
                    <button
                      key={`${src}-${index}`}
                      type="button"
                      aria-label={`View image ${index + 1}`}
                      onClick={() => setActiveImage(index)}
                      className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${
                        index === activeImage
                          ? 'border-[#d8bd83]'
                          : 'border-transparent'
                      }`}
                    >
                      <img
                        src={src}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-5 p-6 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-widest text-[#c9a76b]">
                Rahul Jewellers · Sheoganj
              </p>

              <h2 className="font-serif text-2xl font-bold sm:text-3xl">
                {product.title}
              </h2>

              <p className="text-sm text-[#c9b58f]">
                {product.description ||
                  'Explore this beautiful jewellery design at our showroom.'}
              </p>

              <p className="text-2xl font-bold text-[#e8d5a8]">
                {Number(product.price) > 0
                  ? `₹${money(product.price)}`
                  : 'Price on Request'}
              </p>

              <div className="divide-y divide-[#c9a76b]/15 rounded-xl border border-[#c9a76b]/20">
                {details.map(([label, value]) => (
                  <div
                    key={label}
                    className="flex justify-between gap-4 px-4 py-3 text-sm"
                  >
                    <span className="text-[#aa9984]">{label}</span>
                    <span className="text-right font-semibold">
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>

              <p className="flex items-center gap-2 text-xs text-[#c9b58f]">
                <ShieldCheck size={16} />
                Contact the showroom to confirm availability,
                specifications and current price.
              </p>

              <button
                type="button"
                onClick={() => setContactOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#c9a76b] px-5 py-4 font-black text-[#1b1110]"
              >
                <MessageCircle size={19} />
                Enquire on WhatsApp / Call
              </button>
            </div>
          </div>
        </section>
      </div>

      {zoom && images.length > 0 && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/95 p-4"
          onMouseDown={event => {
            if (event.target === event.currentTarget) {
              setZoom(false);
            }
          }}
        >
          <button
            type="button"
            aria-label="Close zoom"
            onClick={() => setZoom(false)}
            className="absolute right-5 top-5 rounded-full bg-white/10 p-3 text-white"
          >
            <X size={24} />
          </button>

          <img
            src={images[activeImage]}
            alt={product.title}
            className="max-h-[90vh] max-w-full object-contain"
          />
        </div>
      )}

      <ContactOptions
        isOpen={contactOpen}
        onClose={() => setContactOpen(false)}
        product={product}
        title="Product Enquiry"
      />
    </>
  );
}
