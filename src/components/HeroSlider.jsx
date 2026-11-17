
import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';

const FADE_MS = 1200;

export default function HeroSlider({
  slides = [],
  onExplore = () => {},
  intervalMs = 6500
}) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  // Navigation is never blocked by an image download. This also allows
  // wrap-around when an image is temporarily unavailable or fails to load.
  useEffect(() => {
    setActive(index => Math.min(index, Math.max(0, slides.length - 1)));
  }, [slides.length]);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const timer = window.setTimeout(() => {
      setActive(index => (index + 1) % slides.length);
    }, intervalMs);
    return () => window.clearTimeout(timer);
  }, [active, paused, intervalMs, slides.length]);

  const goTo = index => {
    if (slides.length < 2) return;
    setActive((index + slides.length) % slides.length);
  };

  if (!slides.length) return null;

  const slide = slides[active] || slides[0];

  return (
    <>
      <style>{`
        .rj-hero.rj-smooth-slider {
          position: relative;
          isolation: isolate;
          overflow: hidden;
          background: #21140d;
        }

        .rj-smooth-slider .rj-slide-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          opacity: 0;
          z-index: 0;
          pointer-events: none;
          transition: opacity ${FADE_MS}ms ease-in-out;
          backface-visibility: hidden;
          transform: translateZ(0);
        }

        .rj-smooth-slider .rj-slide-image.is-active {
          opacity: 1;
        }

        .rj-smooth-slider .rj-hero-shade {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
        }

        .rj-smooth-slider .rj-hero-content {
          position: relative;
          z-index: 2;
        }

        .rj-smooth-slider .rj-hero-arrow,
        .rj-smooth-slider .rj-hero-dots {
          z-index: 4;
        }

        .rj-smooth-slider.is-scheme-slide .rj-hero-content h1 {
          font-size: clamp(42px, 5.4vw, 74px);
          line-height: 1.05;
        }

        .rj-smooth-slider.is-coming-slide .rj-hero-content h1 {
          font-size: clamp(42px, 5.3vw, 72px);
          line-height: 1.12;
        }

        .rj-smooth-slider .rj-hero-arrow:focus-visible,
        .rj-smooth-slider .rj-hero-dots button:focus-visible {
          outline: 3px solid #f6d58f;
          outline-offset: 3px;
        }

        .rj-smooth-slider .rj-slide-text {
          animation: rj-text-enter 850ms ease both;
        }

        @keyframes rj-text-enter {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .rj-smooth-slider .rj-slide-image {
            transition: none;
          }

          .rj-smooth-slider .rj-slide-text {
            animation: none;
          }
        }
      `}</style>

      <section
        className={`rj-hero rj-smooth-slider ${slide.action === 'scheme' ? 'is-scheme-slide' : slide.action === 'coming-soon' ? 'is-coming-slide' : ''}`}
        aria-label="Rahul Jewellers featured collections, schemes and announcements"
        aria-roledescription="carousel"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={event => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setPaused(false);
          }
        }}
      >
        {slides.map((item, index) => (
          <img
            key={`${item.image}-${index}`}
            src={item.image}
            alt=""
            aria-hidden="true"
            className={
              'rj-slide-image' +
              (active === index ? ' is-active' : '')
            }
            loading={index === 0 ? 'eager' : 'lazy'}
            fetchPriority={index === 0 ? 'high' : 'auto'}
            draggable="false"
          />
        ))}

        <div className="rj-hero-shade" />

        <button
          type="button"
          className="rj-hero-arrow left"
          aria-label="Previous slide"
          onClick={() => goTo(active - 1)}
        >
          ‹
        </button>

        <div className="rj-hero-content">
          <div className="rj-slide-text" key={active}>
            <p className="rj-eyebrow">{slide.eyebrow}</p>

            <h1>
              {String(slide.title || '')
                .split('\n')
                .map((line, index, lines) => (
                  <React.Fragment key={index}>
                    {line}
                    {index < lines.length - 1 && <br />}
                  </React.Fragment>
                ))}
            </h1>

            <p className="rj-hero-description">
              {slide.description}
            </p>

            <button
              type="button"
              className="rj-outline-button"
              onClick={() => onExplore(slide)}
            >
              {slide.cta || 'Explore Collection'} <ArrowRight size={18} />
            </button>
          </div>
        </div>

        <button
          type="button"
          className="rj-hero-arrow right"
          aria-label="Next slide"
          onClick={() => goTo(active + 1)}
        >
          ›
        </button>

        <div className="rj-hero-dots">
          {slides.map((item, index) => (
            <button
              key={`${item.title}-${index}`}
              type="button"
              className={active === index ? 'active' : ''}
              aria-label={`Show slide ${index + 1}`}
              aria-current={active === index ? 'true' : undefined}
              onClick={() => goTo(index)}
            />
          ))}
        </div>
      </section>
    </>
  );
}
