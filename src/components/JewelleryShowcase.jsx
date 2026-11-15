
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Sparkles, ArrowUpRight, MessageCircle,
  Search, Gem, RefreshCw
} from 'lucide-react';
import ProductDetails from './ProductDetails.jsx';
import ContactOptions from './ContactOptions.jsx';

const API = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'https://rahul-jewellers-backend-jlr0.onrender.com'
).replace(/\/+$/, '');

const ROOT_CATEGORIES = [
  'Gold', 'Polki', 'Kundan', 'Diamond', 'Silver'
];

function getId(value) {
  if (!value) return '';
  return String(typeof value === 'object' ? value._id : value);
}

function getProductImage(product) {
  const first = Array.isArray(product.images)
    ? product.images[0]
    : null;

  return (
    (typeof first === 'string' ? first : first?.url) ||
    product.imageUrl ||
    ''
  );
}

function collectDescendants(categories, parentId) {
  const found = new Set([parentId]);
  let changed = true;

  while (changed) {
    changed = false;

    categories.forEach(category => {
      const parent = getId(category.parentCategory);
      const id = getId(category._id);

      if (parent && found.has(parent) && !found.has(id)) {
        found.add(id);
        changed = true;
      }
    });
  }

  return found;
}

export default function JewelleryShowcase() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedFolder, setSelectedFolder] = useState('');
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [enquiryProduct, setEnquiryProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');

    try {
      const [productsResponse, categoriesResponse] =
        await Promise.all([
          axios.get(`${API}/api/products`),
          axios.get(`${API}/api/categories`)
        ]);

      setProducts(productsResponse.data?.products || []);
      setCategories(categoriesResponse.data?.categories || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to load jewellery. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let alive = true;

    Promise.all([
      axios.get(`${API}/api/products`),
      axios.get(`${API}/api/categories`)
    ])
      .then(([productResponse, categoryResponse]) => {
        if (!alive) return;
        setProducts(productResponse.data?.products || []);
        setCategories(categoryResponse.data?.categories || []);
      })
      .catch(() => {
        if (alive) {
          setError('Unable to load jewellery. Please try again.');
        }
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const folderIds = useMemo(
    () => selectedFolder
      ? collectDescendants(categories, selectedFolder)
      : null,
    [categories, selectedFolder]
  );

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter(product => {
      const rootMatches =
        activeCategory === 'All' ||
        String(product.category || '').toLowerCase() ===
          activeCategory.toLowerCase();

      const folderMatches =
        !folderIds ||
        folderIds.has(getId(product.categoryId));

      const searchable = [
        product.title,
        product.category,
        product.description,
        product.design,
        product.purity,
        product.weight
      ].join(' ').toLowerCase();

      return rootMatches &&
        folderMatches &&
        (!query || searchable.includes(query));
    });
  }, [products, activeCategory, folderIds, search]);

  return (
    <section
      id="collections"
      className="relative overflow-hidden bg-[#100b0c] px-4 py-16 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <p className="mb-3 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-[#d8bd83]">
            <Sparkles size={16} />
            The Art of Fine Jewellery
          </p>

          <h2 className="font-serif-luxury text-4xl text-[#ead9b6] sm:text-5xl">
            Our Collections
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#a99a86]">
            Discover exceptional designs and jewellery
            crafted for your special moments.
          </p>
        </div>

        <div className="mb-7 flex justify-start gap-2 overflow-x-auto pb-3 sm:justify-center">
          {['All', ...ROOT_CATEGORIES].map(category => (
            <button
              key={category}
              type="button"
              onClick={() => {
                setActiveCategory(category);
                setSelectedFolder('');
              }}
              className={`shrink-0 rounded-full border px-5 py-2.5 text-xs font-bold ${
                activeCategory === category
                  ? 'border-[#d8bd83] bg-[#d8bd83] text-[#1b1110]'
                  : 'border-[#c9a76b]/30 text-[#c8b99e]'
              }`}
            >
              {category === 'All' ? 'All Collections' : category}
            </button>
          ))}
        </div>

        <div className="mb-8 grid gap-3 sm:grid-cols-2">
          <label className="flex items-center gap-2 rounded-xl border border-[#c9a76b]/30 bg-[#211718] px-4 text-[#ead9b6]">
            <Search size={17} />
            <input
              type="search"
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Search necklaces, rings, bangles..."
              className="w-full bg-transparent py-3 text-sm outline-none"
            />
          </label>

          <select
            aria-label="Select jewellery folder"
            value={selectedFolder}
            onChange={event => setSelectedFolder(event.target.value)}
            className="rounded-xl border border-[#c9a76b]/30 bg-[#211718] px-4 py-3 text-sm text-[#ead9b6]"
          >
            <option value="">All Folders</option>

            {categories
              .filter(category =>
                activeCategory === 'All' ||
                !category.rootCategory ||
                category.rootCategory === activeCategory
              )
              .map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
          </select>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-700 p-4 text-sm text-red-200"
          >
            {error}
            <button
              type="button"
              onClick={load}
              className="ml-3 inline-flex items-center gap-1 underline"
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-[#ead9b6]">
            Loading jewellery...
          </div>
        ) : filteredProducts.length ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map(product => (
              <article
                key={product._id}
                className="group overflow-hidden rounded-2xl border border-[#c9a76b]/20 bg-[#211718]"
              >
                <button
                  type="button"
                  onClick={() => setSelectedProduct(product)}
                  className="relative block aspect-square w-full overflow-hidden bg-[#100b0c]"
                  aria-label={`View ${product.title}`}
                >
                  {getProductImage(product) ? (
                    <img
                      src={getProductImage(product)}
                      alt={product.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Gem size={48} className="text-[#c9a76b]" />
                    </div>
                  )}

                  <span className="absolute bottom-4 right-4 rounded-full bg-black/65 p-2 text-[#e4c88f]">
                    <ArrowUpRight size={18} />
                  </span>
                </button>

                <div className="space-y-3 p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#c9a76b]">
                    {product.category}
                  </p>

                  <h3 className="font-serif-luxury text-xl text-[#ead9b6]">
                    {product.title}
                  </h3>

                  <p className="text-xs text-[#a99a86]">
                    {product.weight ? `Weight: ${product.weight}` : ''}
                    {product.purity ? ` · ${product.purity}` : ''}
                  </p>

                  <p className="text-sm font-bold text-[#e8d5a8]">
                    {Number(product.price) > 0
                      ? `₹${Number(product.price).toLocaleString('en-IN')}`
                      : 'Price on Request'}
                  </p>

                  <div className="grid grid-cols-2 gap-2 border-t border-[#c9a76b]/20 pt-4">
                    <button
                      type="button"
                      onClick={() => setSelectedProduct(product)}
                      className="rounded-xl border border-[#c9a76b]/40 px-3 py-3 text-xs font-bold text-[#ead9b6]"
                    >
                      View Details
                    </button>

                    <button
                      type="button"
                      onClick={() => setEnquiryProduct(product)}
                      className="flex items-center justify-center gap-2 rounded-xl bg-[#c9a76b] px-3 py-3 text-xs font-bold text-[#1b1110]"
                    >
                      <MessageCircle size={15} />
                      Enquire
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-[#c9a76b]/20 p-16 text-center text-[#ead9b6]">
            <Sparkles className="mx-auto mb-4" />
            <h3 className="text-xl font-bold">
              No matching jewellery found
            </h3>
            <p className="mt-2 text-sm text-[#a99a86]">
              Try another category or search term.
            </p>
          </div>
        )}
      </div>

      <ProductDetails
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <ContactOptions
        isOpen={Boolean(enquiryProduct)}
        onClose={() => setEnquiryProduct(null)}
        product={enquiryProduct}
        title="Jewellery Enquiry"
      />
    </section>
  );
}
