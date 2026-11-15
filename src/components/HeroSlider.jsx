
import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';

const FADE_MS = 1200;

export default function HeroSlider({
  slides = [],
  onExplore = () => {},
  intervalMs = 6500
}) {
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState({});
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let alive = true;
    setActive(0);
    setReady({});

    slides.forEach((slide, index) => {
      if (!slide.image) return;

      const image = new Image();
      image.decoding = 'async';

      const done = () => {
        if (!alive) return;
        setReady(old => ({ ...old, [index]: true }));
      };

      image.onload = done;
      image.onerror = () => {
        console.warn('Hero image could not load:', slide.image);
      };

      image.src = slide.image;

      if (image.complete && image.naturalWidth > 0) {
        done();
      }
    });

    return () => {
      alive = false;
    };
  }, [slides]);

  useEffect(() => {
    if (paused || slides.length < 2) return;

    const timer = window.setTimeout(() => {
      const next = (active + 1) % slides.length;
      if (ready[next]) setActive(next);
    }, intervalMs);

    return () => window.clearTimeout(timer);
  }, [active, ready, paused, intervalMs, slides.length]);

  const goTo = index => {
    if (!slides.length) return;
    const next = (index + slides.length) % slides.length;
    if (ready[next]) setActive(next);
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
        className="rj-hero rj-smooth-slider"
        aria-label="Featured jewellery collections"
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
              (active === index && ready[index] ? ' is-active' : '')
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
              onClick={() => onExplore(slide.category)}
            >
              Explore Collection <ArrowRight size={18} />
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
