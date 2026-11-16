
import React, {
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  MessageCircle,
  Gem,
  ShieldCheck
} from 'lucide-react';

import ContactOptions from './ContactOptions.jsx';

function productImages(product) {
  const raw = [
    ...(Array.isArray(product?.images)
      ? product.images
      : []),
    product?.imageUrl
  ];

  const seen = new Set();

  return raw
    .map(image => ({
      url:
        typeof image === 'string'
          ? image
          : image?.url,

      alt:
        typeof image === 'string'
          ? ''
          : image?.alt || ''
    }))
    .filter(image => {
      if (
        typeof image.url !== 'string' ||
        !image.url.trim() ||
        seen.has(image.url)
      ) {
        return false;
      }

      seen.add(image.url);
      return true;
    });
}

const money = value =>
  Number(value || 0).toLocaleString('en-IN');

const clamp = (value, min, max) =>
  Math.min(max, Math.max(min, value));

export default function ProductDetails({
  product,
  onClose = () => {}
}) {
  const [activeImage, setActiveImage] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [contactOpen, setContactOpen] = useState(false);

  const drag = useRef(null);
  const zoomStage = useRef(null);

  const images = useMemo(
    () => productImages(product),
    [product]
  );

  useEffect(() => {
    setActiveImage(0);
    setZoomOpen(false);
    setZoomScale(1);
    setPan({ x: 0, y: 0 });
    setContactOpen(false);
  }, [product?._id]);

  // Stop background scrolling while details are open.
  useEffect(() => {
    if (!product) return;

    const originalOverflow =
      document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow =
        originalOverflow;
    };
  }, [product]);

  useEffect(() => {
    if (!product) return;

    const onKeyDown = event => {
      if (contactOpen) return;

      if (event.key === 'Escape') {
        if (zoomOpen) {
          setZoomOpen(false);
        } else {
          onClose();
        }
      }

      if (
        zoomOpen &&
        images.length > 1 &&
        event.key === 'ArrowRight'
      ) {
        setActiveImage(
          index => (index + 1) % images.length
        );

        setPan({ x: 0, y: 0 });
        setZoomScale(1);
      }

      if (
        zoomOpen &&
        images.length > 1 &&
        event.key === 'ArrowLeft'
      ) {
        setActiveImage(
          index =>
            (index - 1 + images.length) %
            images.length
        );

        setPan({ x: 0, y: 0 });
        setZoomScale(1);
      }

      if (
        zoomOpen &&
        ['+', '='].includes(event.key)
      ) {
        setZoomScale(
          scale => clamp(scale + 0.5, 1, 4)
        );
      }

      if (
        zoomOpen &&
        event.key === '-'
      ) {
        setZoomScale(
          scale => clamp(scale - 0.5, 1, 4)
        );
      }
    };

    document.addEventListener(
      'keydown',
      onKeyDown
    );

    return () => {
      document.removeEventListener(
        'keydown',
        onKeyDown
      );
    };
  }, [
    product,
    zoomOpen,
    images.length,
    contactOpen,
    onClose
  ]);

  if (!product) return null;

  function changeImage(step) {
    if (images.length < 2) return;

    setActiveImage(
      index =>
        (index + step + images.length) %
        images.length
    );

    setZoomScale(1);
    setPan({ x: 0, y: 0 });
  }

  function selectImage(index) {
    setActiveImage(index);
    setZoomScale(1);
    setPan({ x: 0, y: 0 });
  }

  function changeZoom(nextScale) {
    const value = clamp(nextScale, 1, 4);

    setZoomScale(value);
    setPan({ x: 0, y: 0 });
  }

  function openZoom() {
    if (!images.length) return;

    setZoomOpen(true);
    setZoomScale(2);
    setPan({ x: 0, y: 0 });
  }

  function handlePointerDown(event) {
    if (
      zoomScale <= 1 ||
      event.button !== 0 ||
      event.target.closest?.('button')
    ) {
      return;
    }

    drag.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      panX: pan.x,
      panY: pan.y
    };

    event.currentTarget.setPointerCapture?.(
      event.pointerId
    );
  }

  function handlePointerMove(event) {
    if (
      !drag.current ||
      drag.current.pointerId !== event.pointerId
    ) {
      return;
    }

    const rect =
      zoomStage.current?.getBoundingClientRect();

    if (!rect) return;

    const maxX =
      rect.width * (zoomScale - 1) / 2;

    const maxY =
      rect.height * (zoomScale - 1) / 2;

    setPan({
      x: clamp(
        drag.current.panX +
          event.clientX -
          drag.current.x,
        -maxX,
        maxX
      ),

      y: clamp(
        drag.current.panY +
          event.clientY -
          drag.current.y,
        -maxY,
        maxY
      )
    });
  }

  const details = [
    ['Category', product.category],
    ['Main Weight', product.weight],
    ['Net Weight', product.netWeight],
    ['Gross Weight', product.grossWeight],
    ['Purity / Hallmark', product.purity],
    ['Metal', product.metal],
    ['Design', product.design],
    ['Craftsmanship', product.craftsmanship],
    ['Stones', product.stone || product.stones],
    ['SKU', product.sku]
  ].filter(
    ([, value]) =>
      value !== undefined &&
      value !== null &&
      String(value).trim()
  );

  return (
    <>
      {/* PRODUCT DETAILS */}
      <div
        className="fixed inset-0 z-[9999] overflow-y-auto bg-black/85 p-3 backdrop-blur-sm sm:p-6"
        onMouseDown={event => {
          if (
            event.target === event.currentTarget
          ) {
            onClose();
          }
        }}
      >
        <section
          role="dialog"
          aria-modal="true"
          aria-label={
            product.title || 'Jewellery details'
          }
          className="relative mx-auto my-4 max-w-5xl overflow-hidden rounded-3xl border border-[#c9a76b]/40 bg-[#1b1415] text-[#ead9b6] shadow-2xl"
        >
          <button
            type="button"
            aria-label="Close product details"
            onClick={onClose}
            className="absolute right-4 top-4 z-20 rounded-full bg-black/70 p-2 text-white"
          >
            <X size={21} />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">

            {/* PRODUCT GALLERY */}
            <div className="bg-[#100b0c] p-4">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#241a1a]">

                {images.length ? (
                  <button
                    type="button"
                    onClick={openZoom}
                    className="h-full w-full cursor-zoom-in"
                    aria-label="Open zoomable product photo"
                  >
                    <img
                      src={images[activeImage].url}
                      alt={
                        images[activeImage].alt ||
                        `${product.title} photo ${
                          activeImage + 1
                        }`
                      }
                      className="h-full w-full object-contain"
                    />
                  </button>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Gem
                      size={60}
                      className="text-[#c9a76b]"
                    />
                  </div>
                )}

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      aria-label="Previous photo"
                      onClick={() => changeImage(-1)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/75 p-2 text-white"
                    >
                      <ChevronLeft size={20} />
                    </button>

                    <button
                      type="button"
                      aria-label="Next photo"
                      onClick={() => changeImage(1)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/75 p-2 text-white"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}

                {images.length > 0 && (
                  <span className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/70 px-3 py-1 text-xs text-white">
                    <ZoomIn size={13} />
                    Zoom · {activeImage + 1}/
                    {images.length}
                  </span>
                )}
              </div>

              {/* PHOTO THUMBNAILS */}
              {images.length > 1 && (
                <div
                  className="mt-3 flex gap-2 overflow-x-auto pb-2"
                  aria-label="Product photo angles"
                >
                  {images.map((image, index) => (
                    <button
                      key={`${image.url.slice(0, 70)}-${index}`}
                      type="button"
                      aria-label={
                        `Show photo ${index + 1}` +
                        (
                          image.alt
                            ? `: ${image.alt}`
                            : ''
                        )
                      }
                      aria-pressed={
                        index === activeImage
                      }
                      onClick={() =>
                        selectImage(index)
                      }
                      className={
                        'h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ' +
                        (
                          index === activeImage
                            ? 'border-[#d8bd83]'
                            : 'border-transparent'
                        )
                      }
                    >
                      <img
                        src={image.url}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              <p className="mt-2 text-xs text-[#b6a389]">
                Select a photo angle, then tap
                the main photo to zoom.
              </p>
            </div>

            {/* PRODUCT INFORMATION */}
            <div className="space-y-5 p-6 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-widest text-[#c9a76b]">
                Rahul Jewellers · SHEOGANJ
              </p>

              <h2 className="font-serif text-2xl font-bold sm:text-3xl">
                {product.title}
              </h2>

              <p className="whitespace-pre-line text-sm leading-6 text-[#c9b58f]">
                {product.description ||
                  'Contact our showroom for this jewellery design.'}
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
                    <span className="text-[#aa9984]">
                      {label}
                    </span>

                    <span className="text-right font-semibold">
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>

              <p className="flex items-center gap-2 text-xs text-[#c9b58f]">
                <ShieldCheck size={16} />
                Contact the showroom to confirm
                availability, specifications and
                current price.
              </p>

              <button
                type="button"
                onClick={() =>
                  setContactOpen(true)
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#c9a76b] px-5 py-4 font-black text-[#1b1110]"
              >
                <MessageCircle size={19} />
                Enquire on WhatsApp / Call
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* FULLSCREEN ZOOM */}
      {zoomOpen && images.length > 0 && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={
            `Zoomed photo of ${product.title}`
          }
          className="fixed inset-0 z-[10000] flex flex-col bg-black/95 text-white"
        >
          {/* ZOOM TOOLBAR */}
          <div className="z-10 flex items-center justify-between gap-2 bg-black/70 px-3 py-3 sm:px-6">
            <span className="min-w-0 truncate text-xs text-[#e8d5a8] sm:text-sm">
              {product.title} · Photo{' '}
              {activeImage + 1} of {images.length}
            </span>

            <div className="flex shrink-0 items-center gap-2">

              <button
                type="button"
                aria-label="Zoom out"
                disabled={zoomScale <= 1}
                onClick={() =>
                  changeZoom(zoomScale - 0.5)
                }
                className="rounded-full bg-white/10 p-2 disabled:opacity-40"
              >
                <ZoomOut size={20} />
              </button>

              <span className="w-10 text-center text-xs">
                {Math.round(zoomScale * 100)}%
              </span>

              <button
                type="button"
                aria-label="Zoom in"
                disabled={zoomScale >= 4}
                onClick={() =>
                  changeZoom(zoomScale + 0.5)
                }
                className="rounded-full bg-white/10 p-2 disabled:opacity-40"
              >
                <ZoomIn size={20} />
              </button>

              <button
                type="button"
                aria-label="Reset zoom"
                onClick={() => changeZoom(1)}
                className="rounded-full bg-white/10 p-2"
              >
                <RotateCcw size={19} />
              </button>

              <button
                type="button"
                aria-label="Close zoom"
                onClick={() =>
                  setZoomOpen(false)
                }
                className="rounded-full bg-white/10 p-2"
              >
                <X size={21} />
              </button>
            </div>
          </div>

          {/* ZOOMABLE IMAGE */}
          <div
            ref={zoomStage}
            className="relative min-h-0 flex-1 overflow-hidden"
            style={{
              touchAction:
                zoomScale > 1 ? 'none' : 'auto',
              cursor:
                zoomScale > 1
                  ? 'grab'
                  : 'zoom-in'
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={() => {
              drag.current = null;
            }}
            onPointerCancel={() => {
              drag.current = null;
            }}
            onWheel={event => {
              if (event.deltaY !== 0) {
                changeZoom(
                  zoomScale +
                    (
                      event.deltaY < 0
                        ? 0.25
                        : -0.25
                    )
                );
              }
            }}
            onDoubleClick={() =>
              changeZoom(
                zoomScale > 1 ? 1 : 2
              )
            }
          >
            <img
              src={images[activeImage].url}
              alt={
                images[activeImage].alt ||
                `${product.title}, enlarged angle ${
                  activeImage + 1
                }`
              }
              draggable={false}
              className="pointer-events-none h-full w-full select-none object-contain"
              style={{
                transform:
                  `translate(${pan.x}px, ${pan.y}px) ` +
                  `scale(${zoomScale})`,
                transformOrigin: 'center center'
              }}
            />

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous zoomed photo"
                  onClick={() =>
                    changeImage(-1)
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/70 p-3 sm:left-5"
                >
                  <ChevronLeft size={24} />
                </button>

                <button
                  type="button"
                  aria-label="Next zoomed photo"
                  onClick={() =>
                    changeImage(1)
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/70 p-3 sm:right-5"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>

          <p className="bg-black/70 px-4 py-2 text-center text-[11px] text-[#d8bd83]">
            Use + / − to zoom. Drag to move the
            enlarged photo. Double-click to reset.
          </p>
        </div>
      )}

      {/* WHATSAPP / CALL */}
      <ContactOptions
        isOpen={contactOpen}
        onClose={() =>
          setContactOpen(false)
        }
        product={product}
        title="Product Enquiry"
      />
    </>
  );
}
