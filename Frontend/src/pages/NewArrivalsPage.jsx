import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, ShieldCheck, Tag, Truck, Shield, Lock, Star, Heart, ShoppingCart, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SubscribeSection from '../components/SubscribeSection';
import Pagination from '../components/Pagination';
import { useAlert } from '../context/AlertContext';
import { useProducts } from '../context/ProductsContext';
import API_URL from '../config';

const sortOptions = ['Newest First', 'Price: Low to High', 'Price: High to Low', 'Top Rated'];

const features = [
    { Icon: ShieldCheck, title: 'QUALITY CHECKED', sub: 'Every item is inspected' },
    { Icon: Tag, title: 'AFFORDABLE PRICES', sub: 'Best quality at unbeatable prices' },
    { Icon: Truck, title: 'FAST DELIVERY', sub: 'Nationwide shipping' },
    { Icon: Shield, title: 'EASY RETURNS', sub: '7 Days easy return policy' },
    { Icon: Lock, title: 'SECURE PAYMENT', sub: '100% safe & secure checkout' },
];

export default function NewArrivalsPage({ wishlist, setWishlist }) {
    const { showAlert } = useAlert();
    const { products: allProducts } = useProducts();
    const [activeCategory, setActiveCategory] = useState('All');
    const [sortBy, setSortBy] = useState('Newest First');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const catDropdownRef = useRef(null);

    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (catDropdownRef.current && !catDropdownRef.current.contains(e.target)) setCatDropdownOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeCategory, sortBy]);

    const getProductId = (product) => product._id || product.id || product.name || '';

    const toggleWishlist = (product) => {
        if (!wishlist || !setWishlist) return;
        const productId = getProductId(product);
        const isInWishlist = wishlist.some(w => getProductId(w) === productId);
        if (isInWishlist) {
            setWishlist(w => w.filter(x => getProductId(x) !== productId));
            showAlert({ type: 'info', message: `${product.name} removed from Wishlist` });
        } else {
            setWishlist(w => [...w, product]);
            showAlert({ type: 'success', message: `${product.name} added to Wishlist!` });
        }
    };

    const isWishlisted = (id) => wishlist?.some(w => getProductId(w) === id);

    const addToCartWithoutRedirect = (product) => {
        const item = {
            id: getProductId(product),
            name: product.name,
            condition: product.condition || '9/10',
            size: product.size || null,
            color: product.color || null,
            category: product.category,
            price: product.salePrice || product.price || 0,
            img: product.mainImage || product.images?.[0]?.url || '',
            qty: 1,
        };

        const existingCart = JSON.parse(localStorage.getItem('thriftora_cart') || '[]');
        const updatedCart = existingCart.map(item => ({ ...item }));
        const existingItem = updatedCart.find(i => i.id === item.id);

        if (existingItem) {
            existingItem.qty += 1;
        } else {
            updatedCart.push(item);
        }

        localStorage.setItem('thriftora_cart', JSON.stringify(updatedCart));
        window.dispatchEvent(new Event('cart-updated'));
        showAlert({ type: 'success', message: `${product.name} added to Cart!` });
    };

    const categoryNames = ['All', ...new Set(allProducts.map(p => p.category).filter(Boolean))];

    const filtered = allProducts.filter(p => {
        const catOk = activeCategory === 'All' || p.category === activeCategory;
        return catOk;
    });

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
            <Navbar wishlistCount={wishlist?.length || 0} />

            {/* ── HERO BANNER ── */}
<section className="position-relative overflow-hidden" style={{ 
  height: '100vh', 
  minHeight: '600px', 
  maxWidth: '1920px',
  margin: '0 auto',
  background: '#0a0a0a',
  position: 'relative'
}}>
    <div className="position-absolute top-0 start-0 w-100 h-100" style={{ zIndex: 0 }}>
        <img src="/images/hero.png" alt="Hero" className="w-100 h-100"
            style={{ objectFit: 'cover', objectPosition: '70% center', opacity: 1, filter: 'brightness(1) contrast(1.05) saturate(1.1)' }}
        />
    </div>
    <div className="position-absolute top-0 start-0 w-100 h-100"
        style={{ zIndex: 1, background: 'linear-gradient(to right, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.7) 25%, rgba(10,10,10,0.2) 50%, transparent 70%)' }}>
    </div>
    <div className="container-fluid px-4 px-md-5 py-3 position-relative" style={{ zIndex: 2 }}>
        <div className="row h-100 align-items-center" style={{ minHeight: 'calc(80vh - 60px)' }}>
            <div className="col-lg-6 d-flex flex-column justify-content-center">
                <div className="mb-3">
                    <span className="text-uppercase" style={{ color: '#d4af37', fontSize: '14px', letterSpacing: '4px', fontFamily: "'Inter', sans-serif", fontWeight: '500' }}>
                        JUST LANDED
                    </span>
                </div>
                <h1 className="fw-bold mb-2" style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 'clamp(48px, 7vw, 84px)',
                    lineHeight: '1',
                    letterSpacing: '0.5px',
                    color: '#fff'
                }}>
                    <span className="d-block">New</span>
                    <span className="d-block" style={{ color: '#d4af37' }}>Arrivals</span>
                </h1>
                <p className="mb-4" style={{
                    fontSize: 'clamp(15px, 1.1vw, 18px)',
                    color: 'rgba(255,255,255,0.7)',
                    maxWidth: '520px',
                    lineHeight: '1.8',
                    fontFamily: "'Inter', sans-serif"
                }}>
                    Be the first to explore our latest collection of luxury bags & timeless jewellery.
                </p>
                <div>
                    <button className="btn px-5 py-3 fw-bold text-uppercase" style={{
                        background: '#d4af37',
                        color: '#000',
                        border: 'none',
                        fontSize: '14px',
                        letterSpacing: '2px',
                        fontFamily: "'Inter', sans-serif",
                        transition: 'all 0.3s ease'
                    }} onMouseEnter={e => {
                        e.currentTarget.style.background = '#c9a030';
                        e.currentTarget.style.transform = 'scale(1.02)';
                    }} onMouseLeave={e => {
                        e.currentTarget.style.background = '#d4af37';
                        e.currentTarget.style.transform = 'scale(1)';
                    }} onClick={() => navigate('/shop')}>
                        EXPLORE COLLECTION
                    </button>
                </div>
                <div className="d-flex gap-5 mt-4 pt-3" style={{ borderTop: '1px solid rgba(212,175,55,0.15)' }}>
                    <div>
                        <div style={{ fontSize: '12px', color: '#d4af37', letterSpacing: '1px', fontWeight: '600' }}>PREMIUM</div>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', letterSpacing: '0.5px' }}>QUALITY</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: '#d4af37', letterSpacing: '1px', fontWeight: '600' }}>SECURE</div>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', letterSpacing: '0.5px' }}>PAYMENT</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: '#d4af37', letterSpacing: '1px', fontWeight: '600' }}>WORLDWIDE</div>
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
                        {features.map(({ Icon, title, sub }) => (
                            <div key={title} className="col-6 col-md-4 col-lg">
                                <div className="d-flex align-items-center gap-3 justify-content-start justify-content-lg-center px-2">
                                    <div className="d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '44px', height: '44px', border: '1px solid #3d3020', borderRadius: '4px' }}>
                                        <Icon size={22} className="text-warning" strokeWidth={1.3} />
                                    </div>
                                    <div>
                                        <div className="fw-bold text-white" style={{ fontSize: '12px', letterSpacing: '0.5px' }}>{title}</div>
                                        <div className="text-secondary" style={{ fontSize: '11px', lineHeight: 1.3 }}>{sub}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FILTER BAR ── */}
            <div className="container-fluid px-3 px-md-4 py-4">
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 pb-3 filter-bar-mobile" style={{ borderBottom: '1px solid #3d3020' }}>
                    <div className="d-flex gap-3 flex-wrap align-items-center">
                        {/* Categories Dropdown */}
                        <div ref={catDropdownRef} style={{ position: 'relative' }}>
                            <button onClick={() => setCatDropdownOpen(!catDropdownOpen)}
                                className="btn fw-semibold text-uppercase d-flex align-items-center gap-2"
                                style={{
                                    fontSize: '13px', letterSpacing: '1px',
                                    background: catDropdownOpen ? '#b89456' : 'transparent',
                                    color: catDropdownOpen ? '#0a0a0a' : '#8a7a6a',
                                    border: `1px solid ${catDropdownOpen ? '#b89456' : '#3d3020'}`,
                                    borderRadius: '3px', padding: '8px 24px'
                                }}>
                                Categories <ChevronDown size={14} style={{ transform: catDropdownOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                            </button>
                            {catDropdownOpen && (
                                <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', background: '#1a1410', border: '1px solid #3d3020', borderRadius: '4px', minWidth: '200px', zIndex: 100, maxHeight: '300px', overflowY: 'auto' }}>
                                    {categoryNames.map(cat => (
                                        <button key={cat} onClick={() => { setActiveCategory(cat); setCatDropdownOpen(false); }}
                                            className="w-100 text-start px-3 py-2 border-0"
                                            style={{
                                                fontSize: '13px', letterSpacing: '0.5px', cursor: 'pointer',
                                                background: activeCategory === cat ? '#b89456' : 'transparent',
                                                color: activeCategory === cat ? '#0a0a0a' : '#d1c7bc',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={e => { if (activeCategory !== cat) e.currentTarget.style.background = 'rgba(184,148,86,0.15)'; }}
                                            onMouseLeave={e => { if (activeCategory !== cat) e.currentTarget.style.background = 'transparent'; }}>
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Page Links */}
                        <button onClick={() => navigate('/bags')}
                            className="btn fw-semibold text-uppercase"
                            style={{ fontSize: '13px', letterSpacing: '1px', background: 'transparent', color: '#8a7a6a', border: '1px solid #3d3020', borderRadius: '3px', padding: '8px 24px', transition: 'all 0.2s' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#b89456'; e.currentTarget.style.color = '#b89456'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#3d3020'; e.currentTarget.style.color = '#8a7a6a'; }}>
                            Bags
                        </button>
                        <button onClick={() => navigate('/jewellery')}
                            className="btn fw-semibold text-uppercase"
                            style={{ fontSize: '13px', letterSpacing: '1px', background: 'transparent', color: '#8a7a6a', border: '1px solid #3d3020', borderRadius: '3px', padding: '8px 24px', transition: 'all 0.2s' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#b89456'; e.currentTarget.style.color = '#b89456'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#3d3020'; e.currentTarget.style.color = '#8a7a6a'; }}>
                            Jewellery
                        </button>
                    </div>
                    <div className="d-flex gap-3 align-items-center flex-wrap">
                        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                            className="form-select border text-white fw-semibold"
                            style={{ background: '#141010', borderColor: '#3d3020', fontSize: '13px', letterSpacing: '0.5px', padding: '8px 36px 8px 16px', cursor: 'pointer', outline: 'none', boxShadow: 'none', borderRadius: '3px' }}>
                            {sortOptions.map(s => <option key={s} value={s} style={{ background: '#141010' }}>{s}</option>)}
                        </select>
                    </div>
                </div>

                {/* ── PRODUCT GRID ── */}
                <div className="row g-3 g-md-4">
                    {paginatedProducts.map(p => (
                        <div key={p._id || p.id} className="col-6 col-md-4 col-lg-3">
                            <div className="h-100 overflow-hidden position-relative"
                                style={{ background: '#141010', cursor: 'pointer', transition: 'transform 0.25s', border: '1px solid #2a1f10', borderRadius: '4px' }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = '#c9a84c'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#2a1f10'; }}>

                                {/* Wishlist heart */}
                                <button
                                    className="position-absolute top-0 end-0 m-3 d-flex align-items-center justify-content-center border-0 p-0"
                                    style={{ zIndex: 2, background: 'transparent', cursor: 'pointer' }}
                                    onClick={(e) => { e.stopPropagation(); toggleWishlist(p); }}>
                                    <Heart
                                        size={22} strokeWidth={1.5}
                                        fill={isWishlisted(getProductId(p)) ? '#e74c3c' : 'none'}
                                        color={isWishlisted(getProductId(p)) ? '#e74c3c' : '#ffffff'}
                                        style={{ transition: 'all 0.2s', transform: isWishlisted(getProductId(p)) ? 'scale(1.2)' : 'scale(1)' }}
                                    />
                                </button>

                                {/* NEW badge */}
                                {p.isNew && (
                                    <div className="position-absolute top-0 start-0 m-2 px-2 py-1"
                                        style={{ background: '#c9a84c', fontSize: '9px', fontWeight: 700, letterSpacing: '1px', color: '#0a0a0a', borderRadius: '2px', zIndex: 2 }}>
                                        NEW
                                    </div>
                                )}

                                <div className="shop-product-img" style={{ height: '220px', background: '#e5e5e5', overflow: 'hidden' }} onClick={() => navigate(`/product/${getProductId(p)}`)}>
                                    <img src={p.mainImage} alt={p.name} className="w-100 h-100" style={{ objectFit: 'cover', transition: 'transform 0.4s' }}
                                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
                                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                                </div>

                                {/* Card Body */}
                                <div className="p-3 text-center shop-card-buttons" style={{ background: '#141010' }} onClick={() => navigate(`/product/${getProductId(p)}`)}>
                                    <div className="text-white fw-bold mb-1" style={{ fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                                    <div className="mb-2" style={{ fontSize: '12px', color: '#c9a84c', letterSpacing: '0.5px' }}>Click to view details</div>
                                    <div className="d-flex align-items-center justify-content-center gap-1 mb-2">
                                        {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} fill={s <= Math.round(p.rating || 4) ? '#c9a84c' : 'none'} color="#c9a84c" />)}
                                    </div>
                                    <div className="mb-3 d-flex align-items-center justify-content-center gap-2">
                                        <span className="fw-semibold" style={{ color: '#c9a84c', fontSize: '15px' }}>Rs. {p.salePrice ? p.salePrice.toLocaleString() : p.price.toLocaleString()}</span>
                                        {p.salePrice && <span className="text-decoration-line-through" style={{ color: '#555', fontSize: '11px' }}>Rs. {p.price.toLocaleString()}</span>}
                                    </div>
                                    <button
                                        className="btn w-100 d-flex align-items-center justify-content-center gap-2"
                                        style={{ background: 'transparent', border: '1px solid rgba(201,168,76,0.3)', padding: '7px 0', borderRadius: '4px', transition: 'all 0.2s' }}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(201,168,76,0.1)'}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            addToCartWithoutRedirect(p);
                                        }}>
                                        <ShoppingCart size={14} style={{ color: '#c9a84c' }} />
                                        <span className="text-white fw-semibold" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>ADD TO CART</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {sorted.length === 0 && (
                    <div className="text-center py-5">
                        <p className="text-secondary" style={{ fontSize: '16px' }}>No products found for selected filters.</p>
                    </div>
                )}

                {/* Pagination */}
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

            </div>

            <SubscribeSection
                title="GET EXCLUSIVE DROPS & OFFERS!"
                subtitle="Subscribe to get early access to new arrivals and special discounts."
                buttonText="SUBSCRIBE"
            />

            <Footer />
        </div>
    );
}