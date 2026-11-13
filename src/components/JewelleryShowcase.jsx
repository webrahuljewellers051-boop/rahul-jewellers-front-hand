
import React, { useState } from 'react';
import { Sparkles, PhoneCall, MapPin, ArrowUpRight } from 'lucide-react';

const collections = [
  {
    id: 1,
    title: "Royal Antique Gold Necklace Set",
    category: "Kundan",
    purity: "22K Gold",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=85",
    description: "Crafted with traditional filigree motifs and exquisite Kundan setting.",
  },
  {
    id: 2,
    title: "Precision Diamond Solitaire Bangle",
    category: "Diamond",
    purity: "18K Gold & VVS Diamond",
    image: "https://images.unsplash.com/photo-1611591475850-58071855a822?auto=format&fit=crop&w=1000&q=85",
    description: "Modern elegance designed for grand celebrations and everyday luxury.",
  },
  {
    id: 3,
    title: "Handcrafted Heritage Peacock Kada",
    category: "Gold",
    purity: "22K Gold",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=85",
    description: "Traditional peacock-inspired craftsmanship with rich heritage detailing.",
  },
  {
    id: 4,
    title: "Contemporary Diamond Choker",
    category: "Diamond",
    purity: "18K White Gold",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=85",
    description: "A refined contemporary design for unforgettable occasions.",
  },
];

const categories = ["All", "Gold", "Polki", "Kundan", "Diamond", "Silver"];

export default function JewelleryShowcase() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredItems =
    activeCategory === "All"
      ? collections
      : collections.filter((item) => item.category === activeCategory);

  return (
    <section
      id="collections"
      className="relative overflow-hidden px-4 py-16 sm:px-6 lg:px-8"
      style={{ background: "#100b0c" }}
    >
      {/* Decorative background */}
      <div
        className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full blur-3xl"
        style={{ background: "rgba(151, 91, 47, 0.10)" }}
      />
      <div
        className="pointer-events-none absolute -right-40 bottom-10 h-80 w-80 rounded-full blur-3xl"
        style={{ background: "rgba(112, 34, 48, 0.14)" }}
      />

      <div className="relative z-10 mx-auto max-w-7xl">

        {/* Section Heading */}
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#b99a62]/30 bg-[#b99a62]/10 px-4 py-2">
            <Sparkles className="h-3.5 w-3.5 text-[#d9bd83]" />
            <span className="text-[10px] font-semibold uppercase tracking-[3px] text-[#d9bd83]">
              The Art of Fine Jewellery
            </span>
          </div>

          <h2
            className="font-serif-luxury text-4xl font-medium sm:text-5xl lg:text-6xl"
            style={{ color: "#ead9b6" }}
          >
            Our Collections
          </h2>

          <div className="mx-auto my-5 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-[#9b7845]" />
            <Sparkles className="h-4 w-4 text-[#c9a76b]" />
            <div className="h-px w-12 bg-[#9b7845]" />
          </div>

          <p className="mx-auto max-w-xl text-sm leading-7 text-[#a99a86]">
            Discover timeless craftsmanship, exceptional designs and
            jewellery created to make every moment special.
          </p>
        </div>

        {/* Category Filters */}
        <div className="mb-10 flex justify-start gap-2 overflow-x-auto pb-3 sm:justify-center">
          {categories.map((category) => {
            const isActive = activeCategory === category;

            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className="shrink-0 rounded-full border px-5 py-2.5 text-xs font-semibold tracking-wide transition-all duration-300"
                style={{
                  background: isActive
                    ? "linear-gradient(135deg, #d8bd83, #a47b43)"
                    : "rgba(255,255,255,0.025)",
                  color: isActive ? "#1b1110" : "#c8b99e",
                  borderColor: isActive ? "#d8bd83" : "rgba(201,167,107,0.25)",
                  boxShadow: isActive
                    ? "0 5px 20px rgba(201,167,107,0.16)"
                    : "none",
                }}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* Product Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <article
                key={item.id}
                className="group overflow-hidden rounded-2xl border transition-all duration-500 hover:-translate-y-1"
                style={{
                  background: "linear-gradient(145deg, #211718, #151011)",
                  borderColor: "rgba(201,167,107,0.19)",
                  boxShadow: "0 12px 35px rgba(0,0,0,0.18)",
                }}
              >
                {/* Product Image */}
                <div className="relative aspect-[4/4.2] overflow-hidden bg-[#211718]">
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#100b0c]/75 via-transparent to-black/10" />

                  <span
                    className="absolute left-4 top-4 rounded-full border px-3 py-1.5 text-[9px] font-bold uppercase tracking-[1.5px] backdrop-blur-md"
                    style={{
                      color: "#ead4a2",
                      background: "rgba(20,14,14,0.82)",
                      borderColor: "rgba(201,167,107,0.4)",
                    }}
                  >
                    {item.purity}
                  </span>

                  <span className="absolute bottom-4 left-4 text-[10px] font-semibold uppercase tracking-[2px] text-[#e5c88e]">
                    {item.category} Collection
                  </span>

                  <div className="absolute bottom-3 right-4 flex h-9 w-9 items-center justify-center rounded-full border border-[#d5b77b]/50 bg-black/40 text-[#e4c88f] opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </div>

                {/* Product Details */}
                <div className="p-5 sm:p-6">
                  <h3
                    className="mb-2 font-serif-luxury text-xl font-medium leading-snug sm:text-2xl"
                    style={{ color: "#ead9b6" }}
                  >
                    {item.title}
                  </h3>

                  <p className="mb-5 text-xs leading-6 text-[#a99a86]">
                    {item.description}
                  </p>

                  <div
                    className="flex flex-wrap items-center justify-between gap-3 border-t pt-4"
                    style={{ borderColor: "rgba(201,167,107,0.18)" }}
                  >
                    <a
                      href="tel:9414533553"
                      className="inline-flex items-center gap-2 text-xs font-semibold transition-colors hover:text-[#f0d59b]"
                      style={{ color: "#d6b77a" }}
                    >
                      <PhoneCall className="h-3.5 w-3.5" />
                      Enquire Now
                    </a>

                    <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-[#a99a86]">
                      Sheoganj Showroom
                      <MapPin className="h-3 w-3 text-[#c9a76b]" />
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-[#b99a62]/20 bg-[#211718]/60 px-5 py-16 text-center">
            <Sparkles className="mx-auto mb-4 h-8 w-8 text-[#c9a76b]" />
            <h3 className="font-serif-luxury text-2xl text-[#ead9b6]">
              Coming Soon
            </h3>
            <p className="mt-2 text-sm text-[#a99a86]">
              Our {activeCategory} collection will be showcased here soon.
            </p>
          </div>
        )}

        {/* Bottom Brand Note */}
        <div className="mt-12 text-center">
          <p className="text-[10px] font-medium uppercase tracking-[3px] text-[#9b8768]">
            Rahul Jewellers · Elegance · Heritage · Trust
          </p>
        </div>
      </div>
    </section>
  );
}
