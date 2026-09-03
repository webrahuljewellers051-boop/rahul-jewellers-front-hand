import React, { useState } from 'react';
import { Sparkles, PhoneCall, MapPin } from 'lucide-react';

const collections = [
  {
    id: 1,
    title: "Royal Antique Gold Necklace Set",
    category: "Bridal Wear",
    purity: "22K Gold",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
    description: "Crafted with precision traditional filigree motifs and Kundan setting."
  },
  {
    id: 2,
    title: "Precision Diamond Solitaire Bangle",
    category: "Diamond Jewellery",
    purity: "18K Gold & VVS Diamond",
    image: "https://images.unsplash.com/photo-1611591475850-58071855a822?auto=format&fit=crop&w=800&q=80",
    description: "Modern elegance designed for grand celebrations and everyday luxury."
  },
  {
    id: 3,
    title: "Handcrafted Heritage Peacock Kada",
    category: "Gold Kada",
    purity: "22K Gold",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
    description: "Embossed royal peacock artwork with rubies and emerald accents."
  },
  {
    id: 4,
    title: "Contemporary Diamond Choker",
    category: "High Jewellery",
    purity: "18K White Gold",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
    description: "Sleek contemporary line pattern crafted for unforgettable evenings."
  }
];

export default function JewelleryShowcase() {
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Bridal Wear", "Diamond Jewellery", "Gold Kada", "High Jewellery"];

  const filteredItems = activeCategory === "All"
    ? collections
    : collections.filter(item => item.category === activeCategory);

  return (
    <section id="collections" className="py-10 px-4 max-w-6xl mx-auto">
      {/* Category Filter */}
      <div className="flex justify-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`text-xs md:text-sm px-5 py-2.5 rounded-full font-semibold transition tracking-wide ${
              activeCategory === cat
                ? 'btn-gold shadow-md'
                : 'bg-stone-100 text-stone-700 border border-stone-300 hover:border-amber-600 hover:bg-stone-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredItems.map((item) => (
          <div key={item.id} className="glass-card rounded-2xl overflow-hidden group">
            <div className="relative h-64 overflow-hidden bg-stone-100">
              <img 
                src={item.image} 
                alt={item.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
              <span className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-md text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                {item.purity}
              </span>
            </div>

            <div className="p-5">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-widest">{item.category}</span>
              <h3 className="text-lg font-serif-luxury font-bold text-zinc-900 mt-1 mb-2">{item.title}</h3>
              <p className="text-xs text-stone-600 leading-relaxed mb-4">{item.description}</p>
              
              <div className="flex items-center justify-between pt-3 border-t border-stone-200">
                <a 
                  href="tel:9414533553" 
                  className="text-xs font-bold text-amber-900 hover:text-amber-700 flex items-center gap-1.5 transition"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-amber-800" /> Inquiry Direct
                </a>
                <span className="text-[11px] font-semibold text-stone-500 flex items-center gap-1">
                  Shivganj Showroom <MapPin className="w-3 h-3 text-amber-800" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}