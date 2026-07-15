import React, { useState, useEffect } from 'react';
import { Heart, Star, Truck, Shield, Lock, ShoppingCart, ShoppingBag, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Pagination from '../components/Pagination';
import { useAlert } from '../context/AlertContext';
import API_URL from '../config';

const sortOptions = ['Newest First', 'Price: Low to High', 'Price: High to Low', 'Top Rated'];

export default function BagsPage({ wishlist, setWishlist }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Newest First');
  const { showAlert } = useAlert();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsRes, categoriesRes, superCatRes] = await Promise.all([
          axios.get(`${API_URL}/api/products`),
          axios.get(`${API_URL}/api/categories`),
          axios.get(`${API_URL}/api/super-categories`),
        ]);
        if (productsRes.data.success) {
          const allProducts = productsRes.data.products;
          const superCat = superCatRes.data.superCategories?.find(s => s.name.toLowerCase() === 'bags');
          if (superCat) {
            const bagsCategories = categoriesRes.data.categories
              .filter(c => c.superCategory?._id === superCat._id)
              .map(c => c.name);
            const filtered = allProducts.filter(p => bagsCategories.includes(p.category));
            setProducts(filtered);
          }
          setCategories(categoriesRes.data.categories || []);
        }
      } catch (error) {
        console.error('Error fetching data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => { setCurrentPage(1); }, [activeCategory, sortBy]);

  const getProductId = (product) => product._id || product.id || '';

  const toggleWishlist = (product) => {
    const id = getProductId(product);
    const isIn = wishlist.some(w => getProductId(w) === id);
    if (isIn) {
      setWishlist(w => w.filter(x => getProductId(x) !== id));
      showAlert({ type: 'info', message: `${product.name} removed from Wishlist` });
    } else {
      setWishlist(w => [...w, product]);
      showAlert({ type: 'success', message: `${product.name} added to Wishlist!` });
    }
  };

  const isWishlisted = (id) => wishlist.some(w => getProductId(w) === id);

  const addToCart = (product) => {
    if (product.stock <= 0) return;
    const item = {
      id: getProductId(product), name: product.name, condition: product.condition || '9/10',
      size: product.size || null, color: product.color || null, category: product.category,
      price: product.salePrice || product.price || 0, img: product.mainImage || product.images?.[0]?.url || '', qty: 1, stock: product.stock,
    };
    const cart = JSON.parse(localStorage.getItem('thriftora_cart') || '[]');
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
      if (existing.qty >= product.stock) { showAlert({ type: 'warning', message: `Stock limit reached for ${product.name}` }); return; }
      existing.qty += 1;
    } else { cart.push(item); }
    localStorage.setItem('thriftora_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cart-updated'));
    showAlert({ type: 'success', message: `${product.name} added to Cart!` });
  };

  const buyNow = (product) => {
    if (product.stock <= 0) return;
    const item = {
      id: getProductId(product), name: product.name, condition: product.condition || '9/10',
      size: product.size || null, color: product.color || null, category: product.category,
      price: product.salePrice || product.price || 0, img: product.mainImage || product.images?.[0]?.url || '', qty: 1, stock: product.stock,
    };
    navigate('/checkout', { state: { cart: [item] } });
  };

  const subCategoryNames = categories
    .filter(c => c.superCategory?.name?.toLowerCase() === 'bags')
    .map(c => c.name);

  const categoryNames = ['All', ...subCategoryNames];

  const filtered = products.filter(p => activeCategory === 'All' || p.category === activeCategory);

  const sorted = [...filtered].sort((a, b) => {
    const getPrice = (p) => p.salePrice || p.price;
    if (sortBy === 'Price: Low to High') return getPrice(a) - getPrice(b);
    if (sortBy === 'Price: High to Low') return getPrice(b) - getPrice(a);
    if (sortBy === 'Top Rated') return (b.rating || 0) - (a.rating || 0);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const paginatedProducts = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="text-white" style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: '#0a0a0a', minHeight: '100vh', paddingTop: '96px' }}>
      <Navbar wishlistCount={wishlist.length} />

      {/* ── HERO BANNER ── */}
      <section className="position-relative overflow-hidden hero-section" style={{ height: '100vh', minHeight: '600px', maxWidth: '1920px', margin: '0 auto', background: '#0a0a0a' }}>
        <div className="position-absolute top-0 start-0 w-100 h-100" style={{ zIndex: 0 }}>
          <img src="/images/hero.png" alt="Hero" className="w-100 h-100"
            style={{ objectFit: 'cover', objectPosition: '70% center', opacity: 1, filter: 'brightness(0.9) contrast(1.05) saturate(1.1)' }} />
        </div>
        <div className="position-absolute top-0 start-0 w-100 h-100"
          style={{ zIndex: 1, background: 'linear-gradient(to right, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.7) 25%, rgba(10,10,10,0.2) 50%, transparent 70%)' }} />
        <div className="container-fluid px-4 px-md-5 py-3 position-relative" style={{ zIndex: 2 }}>
          <div className="row h-100 align-items-center" style={{ minHeight: 'calc(80vh - 60px)' }}>
            <div className="col-lg-6 d-flex flex-column justify-content-center">
              <div className="mb-3">
                <span className="text-uppercase" style={{ color: '#d4af37', fontSize: '14px', letterSpacing: '4px', fontFamily: "'Inter', sans-serif", fontWeight: '500' }}>
                  PREMIUM COLLECTION
                </span>
              </div>
              <h1 className="fw-bold mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(48px, 7vw, 84px)', lineHeight: '1', letterSpacing: '0.5px', color: '#fff' }}>
                <span className="d-block">Luxury</span>
                <span className="d-block" style={{ color: '#d4af37' }}>Bags</span>
              </h1>
              <p className="mb-4" style={{ fontSize: 'clamp(15px, 1.1vw, 18px)', color: 'rgba(255,255,255,0.7)', maxWidth: '520px', lineHeight: '1.8', fontFamily: "'Inter', sans-serif" }}>
                Explore our handpicked collection of premium handbags. From elegant totes to statement crossbodies — each piece is curated for the modern woman.
              </p>
              <div>
                <button className="btn px-5 py-3 fw-bold text-uppercase" style={{ background: '#d4af37', color: '#000', border: 'none', fontSize: '14px', letterSpacing: '2px', fontFamily: "'Inter', sans-serif" }}
                  onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}>
                  EXPLORE BAGS
                </button>
              </div>
              <div className="d-flex gap-5 mt-4 pt-3" style={{ borderTop: '1px solid rgba(212,175,55,0.15)' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#d4af37', letterSpacing: '1px', fontWeight: '600' }}>HANDCRAFTED</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', letterSpacing: '0.5px' }}>BAGS</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#d4af37', letterSpacing: '1px', fontWeight: '600' }}>PREMIUM</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', letterSpacing: '0.5px' }}>QUALITY</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#d4af37', letterSpacing: '1px', fontWeight: '600' }}>NATIONWIDE</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', letterSpacing: '0.5px' }}>DELIVERY</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES BAR ── */}
      <section style={{ background: '#0f0c09', borderBottom: '1px solid #2a1f10' }}>
        <div className="container-fluid px-3 px-md-5 py-4">
          <div className="row g-3 align-items-center">
            {[
              { Icon: ShoppingBag, title: 'PREMIUM BAGS', desc: 'Luxury handbags for every occasion' },
              { Icon: Truck, title: 'FAST DELIVERY', desc: 'Nationwide shipping' },
              { Icon: Shield, title: 'EASY RETURNS', desc: '7 Days easy return policy' },
              { Icon: Lock, title: 'SECURE PAYMENT', desc: '100% safe & secure checkout' },
            ].map((f, i) => (
              <div key={i} className="col-6 col-md-4 col-lg">
                <div className="d-flex align-items-center gap-3 justify-content-start justify-content-lg-center px-2">
                  <div className="d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '44px', height: '44px', border: '1px solid #3d3020', borderRadius: '4px' }}>
                    <f.Icon size={22} className="text-warning" strokeWidth={1.3} />
                  </div>
                  <div>
                    <div className="fw-bold text-white" style={{ fontSize: '12px', letterSpacing: '0.5px' }}>{f.title}</div>
                    <div className="text-secondary" style={{ fontSize: '11px', lineHeight: 1.3 }}>{f.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container-fluid px-3 px-md-4 py-4">
        {/* Filter Bar */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 pb-3" style={{ borderBottom: '1px solid #3d3020' }}>
          <div className="d-flex gap-3 flex-wrap">
            {categoryNames.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className="btn fw-semibold text-uppercase"
                style={{
                  fontSize: '13px', letterSpacing: '1px',
                  background: activeCategory === cat ? '#b89456' : 'transparent',
                  color: activeCategory === cat ? '#0a0a0a' : '#8a7a6a',
                  border: `1px solid ${activeCategory === cat ? '#b89456' : '#3d3020'}`,
                  borderRadius: '3px', padding: '8px 24px'
                }}>
                {cat}
              </button>
            ))}
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="form-select border text-white fw-semibold"
            style={{ background: '#141010', borderColor: '#3d3020', fontSize: '13px', letterSpacing: '0.5px', padding: '8px 36px 8px 16px', cursor: 'pointer', outline: 'none', boxShadow: 'none', borderRadius: '3px', width: 'auto' }}>
            {sortOptions.map(s => <option key={s} value={s} style={{ background: '#141010' }}>{s}</option>)}
          </select>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="row g-3 g-md-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="col-6 col-md-4 col-lg-3">
                <div style={{ background: '#141010', border: '1px solid #2a1f10', borderRadius: '4px' }}>
                  <div style={{ height: '220px', background: 'linear-gradient(90deg, #1a1410 25%, #1f1812 50%, #1a1410 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: '4px 4px 0 0' }} />
                  <div style={{ padding: '16px' }}>
                    <div style={{ height: '14px', background: '#1a1410', borderRadius: '3px', marginBottom: '8px', width: '70%' }} />
                    <div style={{ height: '12px', background: '#1a1410', borderRadius: '3px', marginBottom: '12px', width: '50%' }} />
                  </div>
                </div>
              </div>
            ))}
            <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
          </div>
        ) : (
          <div className="row g-3 g-md-4">
            {paginatedProducts.map(p => (
              <div key={getProductId(p)} className="col-6 col-md-4 col-lg-3">
                <div className="h-100 overflow-hidden position-relative"
                  style={{ background: '#141010', cursor: 'pointer', transition: 'transform 0.25s', border: '1px solid #2a1f10', borderRadius: '4px' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = '#c9a84c'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#2a1f10'; }}>
                  <button className="position-absolute d-flex align-items-center justify-content-center border-0 p-0"
                    style={{ zIndex: 3, top: '10px', left: '10px', background: 'rgba(10,10,10,0.6)', backdropFilter: 'blur(4px)', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' }}
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(p); }}>
                    <Heart size={16} strokeWidth={1.5}
                      fill={isWishlisted(getProductId(p)) ? '#e74c3c' : 'none'}
                      color={isWishlisted(getProductId(p)) ? '#e74c3c' : '#ffffff'}
                      style={{ transition: 'all 0.2s', transform: isWishlisted(getProductId(p)) ? 'scale(1.2)' : 'scale(1)' }} />
                  </button>
                  {p.stock <= 0 ? (
                    <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(10,10,10,0.88)', backdropFilter: 'blur(6px)', border: '1px solid rgba(231,76,60,0.5)', borderRadius: '4px', padding: '5px 12px', zIndex: 2 }}>
                      <span style={{ color: '#e74c3c', fontSize: '10px', fontWeight: 800, letterSpacing: '2px' }}>SOLD OUT</span>
                    </div>
                  ) : p.salePrice && p.price > p.salePrice ? (() => {
                    const discount = Math.round(((p.price - p.salePrice) / p.price) * 100);
                    return (
                      <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 2 }}>
                        <div style={{ background: 'rgba(10,10,10,0.9)', backdropFilter: 'blur(6px)', border: '1px solid rgba(201,168,76,0.5)', borderRadius: '6px', padding: '7px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: '#c9a84c', fontSize: '18px', fontWeight: 800 }}>{discount}%</span>
                          <div style={{ width: '1px', height: '18px', background: 'rgba(201,168,76,0.35)' }}></div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                            <span style={{ color: '#fff', fontSize: '9px', fontWeight: 700, letterSpacing: '1.5px' }}>SAVE</span>
                            <span style={{ color: '#8a7a6a', fontSize: '9px', fontWeight: 700, letterSpacing: '1.5px' }}>OFF</span>
                          </div>
                        </div>
                      </div>
                    );
                  })() : null}
                  <div style={{ height: '220px', background: '#e5e5e5', overflow: 'hidden' }} onClick={() => navigate(`/product/${getProductId(p)}`)}>
                    <img src={p.mainImage} alt={p.name} className="w-100 h-100" style={{ objectFit: 'cover', transition: 'transform 0.4s' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                  </div>
                  <div className="p-3 text-center" style={{ background: '#141010' }} onClick={() => navigate(`/product/${getProductId(p)}`)}>
                    <div className="text-white fw-bold mb-1" style={{ fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                    <div className="mb-2" style={{ fontSize: '12px', color: '#8a8a8a' }}>Category: {p.category}</div>
                    <div className="d-flex align-items-center justify-content-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} fill={s <= Math.round(p.rating || 4) ? '#c9a84c' : 'none'} color="#c9a84c" />)}
                    </div>
                    <div className="mb-3 d-flex align-items-center justify-content-center gap-2">
                      <span className="fw-semibold" style={{ color: '#c9a84c', fontSize: '15px' }}>Rs. {(p.salePrice || p.price).toLocaleString()}</span>
                      {p.salePrice && <span className="text-decoration-line-through" style={{ color: '#555', fontSize: '11px' }}>Rs. {p.price.toLocaleString()}</span>}
                    </div>
                    <div className="d-flex flex-column gap-2">
                      <button className="btn w-100 d-flex align-items-center justify-content-center gap-2"
                        style={{ background: p.stock <= 0 ? '#1a1410' : '#c9a84c', border: 'none', padding: '7px 0', borderRadius: '4px', opacity: p.stock <= 0 ? 0.5 : 1, cursor: p.stock <= 0 ? 'not-allowed' : 'pointer' }}
                        disabled={p.stock <= 0} onClick={(e) => { e.stopPropagation(); if (p.stock > 0) buyNow(p); }}>
                        <span className="fw-semibold" style={{ fontSize: '11px', letterSpacing: '0.5px', color: p.stock <= 0 ? '#555' : '#0a0a0a' }}>{p.stock <= 0 ? 'OUT OF STOCK' : 'BUY NOW'}</span>
                      </button>
                      <button className="btn w-100 d-flex align-items-center justify-content-center gap-2"
                        style={{ background: p.stock <= 0 ? '#1a1410' : 'transparent', border: `1px solid ${p.stock <= 0 ? '#3d3020' : 'rgba(201,168,76,0.3)'}`, padding: '7px 0', borderRadius: '4px', opacity: p.stock <= 0 ? 0.5 : 1, cursor: p.stock <= 0 ? 'not-allowed' : 'pointer' }}
                        disabled={p.stock <= 0} onClick={(e) => { e.stopPropagation(); if (p.stock > 0) addToCart(p); }}>
                        <ShoppingCart size={14} style={{ color: p.stock <= 0 ? '#555' : '#c9a84c' }} />
                        <span className="text-white fw-semibold" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>{p.stock <= 0 ? 'OUT OF STOCK' : 'ADD TO CART'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && sorted.length === 0 && (
          <div className="text-center py-5">
            <p className="text-secondary" style={{ fontSize: '16px' }}>No bags found for selected filters.</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="container px-3 px-md-5">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
            />
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
