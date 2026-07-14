import React, { useState } from 'react';
import { Heart, ShoppingCart, ChevronLeft, ChevronRight, ShieldCheck, Tag, Truck, Star, Package, Leaf, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

/* ─── DATA ─────────────────────────────────────────────────────────── */
const brandLogos = [
    { name: 'Nike', logo: '/images/nike.svg' },
    { name: 'Adidas', logo: '/images/adidas.svg' },
    { name: 'Puma', logo: '/images/puma.svg' },
    { name: 'Skechers', logo: '/images/nike.svg' },
    { name: 'JanSport', logo: '/images/puma.svg' },
    { name: 'American Tourister', logo: '/images/americanexpress.svg' },
    { name: 'Samsonite', logo: '/images/adidas.svg' },
    { name: 'Reebok', logo: '/images/reebok.svg' },
];

const brandCards = [
    { name: 'Nike', items: 96, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop' },
    { name: 'Adidas', items: 78, img: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=400&fit=crop' },
    { name: 'Puma', items: 62, img: 'https://images.unsplash.com/photo-1556906781-9a412961a28c?w=400&h=400&fit=crop' },
    { name: 'Jansport', items: 58, img: 'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=400&h=400&fit=crop' },
    { name: 'Samsonite', items: 46, img: 'https://images.unsplash.com/photo-1575844264771-892081089af5?w=400&h=400&fit=crop' },
    { name: 'American Tourister', items: 40, img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop' },
];

const brandTabs = ['ALL BRANDS', 'NIKE', 'ADIDAS', 'PUMA', 'JANSPORT', 'SKECHERS', 'SAMSONITE', 'AMERICAN TOURISTER'];

const allProducts = [
    { id: 1, name: 'Nike Air Max 270', brand: 'NIKE', price: 'Rs. 3,499', original: 'Rs. 8,999', condition: '9/10', rating: 4.8, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop' },
    { id: 2, name: 'Adidas Ultraboost 22', brand: 'ADIDAS', price: 'Rs. 4,299', original: 'Rs. 5,000', condition: '9/10', rating: 4.9, img: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=400&fit=crop' },
    { id: 3, name: 'Puma RS-X', brand: 'PUMA', price: 'Rs. 2,999', original: null, condition: '9/10', rating: 4.6, img: 'https://images.unsplash.com/photo-1556906781-9a412961a28c?w=400&h=400&fit=crop' },
    { id: 4, name: 'Jansport Backpack', brand: 'JANSPORT', price: 'Rs. 2,799', original: null, condition: '9/10', rating: 4.7, img: 'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=400&h=400&fit=crop' },
    { id: 5, name: 'Skechers Shoes', brand: 'SKECHERS', price: 'Rs. 2,999', original: null, condition: '9/10', rating: 4.5, img: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=400&h=400&fit=crop' },
    { id: 6, name: 'Nike Air Force 1', brand: 'NIKE', price: 'Rs. 3,199', original: null, condition: '9/10', rating: 4.9, img: 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=400&h=400&fit=crop' },
    { id: 7, name: 'Adidas Crossbody', brand: 'ADIDAS', price: 'Rs. 1,899', original: null, condition: '9/10', rating: 4.5, img: 'https://images.unsplash.com/photo-1598532213005-76decb24e56b?w=400&h=400&fit=crop' },
    { id: 8, name: 'Samsonite Trolley', brand: 'SAMSONITE', price: 'Rs. 5,499', original: null, condition: '8/10', rating: 4.7, img: 'https://images.unsplash.com/photo-1575844264771-892081089af5?w=400&h=400&fit=crop' },
];

const whyReasons = [
    { Icon: ShieldCheck, title: '100% Original', desc: 'All items are authentic & verified' },
    { Icon: Tag, title: 'Quality Checked', desc: 'Every product checked for quality' },
    { Icon: Package, title: 'Best Prices', desc: 'Premium brands at unbeatable prices' },
    { Icon: Heart, title: 'Wide Variety', desc: 'Huge collection from top global brands' },
    { Icon: Leaf, title: 'Sustainable Choice', desc: 'Thrift smart. Help the planet.' },
    { Icon: Truck, title: 'Fast Delivery', desc: 'Quick & secure nationwide shipping' },
];

const scroll = (id, dir) => {
    const el = document.getElementById(id);
    if (el) el.scrollBy({ left: dir === 'next' ? 300 : -300, behavior: 'smooth' });
};

/* ─── COMPONENT ──────────────────────────────────────────────────────── */
export default function BrandsPage() {
    const [activeTab, setActiveTab] = useState('ALL BRANDS');
    const [wishlist, setWishlist] = useState([]);
    const navigate = useNavigate();

    const toggleWishlist = (id) => setWishlist(w => w.includes(id) ? w.filter(x => x !== id) : [...w, id]);

    const filteredProducts = activeTab === 'ALL BRANDS'
        ? allProducts
        : allProducts.filter(p => p.brand === activeTab);

    return (
        <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>

            <Navbar />

            {/* ── HERO SECTION ── */}
            <section className="position-relative overflow-hidden" style={{ borderBottom: '1px solid #3d3020', minHeight: 'calc(100vh - 60px)' }}>
                <div className="position-absolute top-0 start-0 w-100 h-100" style={{ zIndex: 0 }}>
                    <img
                        src="/images/image3.png"
                        alt="Brands Hero"
                        className="w-90 h-95"
                        style={{ objectFit: 'cover', objectPosition: 'center right', transform: 'scale(0.75)', marginLeft: '6%', transformOrigin: 'center right' }}
                    />
                    <div className="position-absolute top-0 start-0 w-100 h-100"
                        style={{ background: 'linear-gradient(to right, rgba(10,10,10,1) 0%, rgba(10,10,10,0.95) 22%, rgba(10,10,10,0.15) 42%, rgba(10,10,10,0.0) 55%)' }}>
                    </div>
                </div>
                <div className="container-fluid px-4 px-md-5 py-3 position-relative" style={{ zIndex: 2 }}>
                    <div className="row">
                        <div className="col-lg-6 py-3">
                            <h1 className="text-white text-uppercase fw-bold mb-0"
                                style={{ fontFamily: "'Playfair Display','Times New Roman',serif", fontSize: 'clamp(52px, 8vw, 90px)', letterSpacing: '4px', lineHeight: 1 }}>
                                TOP BRANDS
                            </h1>
                            <div className="d-flex align-items-center gap-3 my-3" style={{ maxWidth: '360px' }}>
                                <div style={{ flex: 1, height: '1px', background: '#b89456' }}></div>
                                <Heart size={16} style={{ color: '#b89456' }} />
                                <div style={{ flex: 1, height: '1px', background: '#b89456' }}></div>
                            </div>
                            <p className="text-secondary mb-0" style={{ fontSize: '15px', lineHeight: 1.7, maxWidth: '420px' }}>
                                Explore premium brands you love, at prices you'll adore.<br />All items are 100% original and quality checked.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── BRAND LOGOS STRIP ── */}
            <section style={{ background: '#0f0c09', borderBottom: '1px solid #2a1f10' }}>
                <div className="container-fluid px-4 px-md-5 py-4">
                    <div className="d-flex align-items-center justify-content-between gap-4 flex-wrap brand-logo-grid">
                        {brandLogos.map((b, i) => (
                            <div key={i} className="d-flex align-items-center justify-content-center" style={{ cursor: 'pointer', opacity: 0.7, transition: 'opacity 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                                onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}>
                                <img src={b.logo} alt={b.name} style={{ height: '45px', filter: 'brightness(0) invert(1)', objectFit: 'contain', maxWidth: '130px' }} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <div className="container-fluid px-3 px-md-4 py-5">

                {/* ── SHOP BY BRAND ── */}
                <div className="mb-5">
                    <h2 className="text-center fw-bold text-uppercase mb-2" style={{ fontSize: '28px', letterSpacing: '5px' }}>SHOP BY BRAND</h2>
                    <div className="mx-auto mb-4" style={{ width: '60px', height: '2px', background: '#c9a84c' }}></div>
                    <div className="row g-3 brand-logo-grid">
                        {brandCards.map((b, i) => (
                            <div key={i} className="col-6 col-md-4 col-lg-2">
                                <div className="overflow-hidden position-relative"
                                    style={{ border: '1px solid #3d3020', borderRadius: '4px', cursor: 'pointer', transition: 'border-color 0.2s, transform 0.2s' }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#c9a84c'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#3d3020'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                                    <div style={{ height: '160px', background: '#1a1a1a', overflow: 'hidden' }}>
                                        <img src={b.img} alt={b.name} className="w-100 h-100" style={{ objectFit: 'cover', transition: 'transform 0.4s' }}
                                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
                                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                                    </div>
                                    <div className="p-3 text-center" style={{ background: '#111' }}>
                                        <div className="fw-bold text-white mb-1" style={{ fontSize: '15px', letterSpacing: '1px' }}>{b.name}</div>
                                        <div className="text-secondary mb-2" style={{ fontSize: '11px', letterSpacing: '1px' }}>{b.items} ITEMS</div>
                                        <button className="btn w-100 text-uppercase fw-bold"
                                            style={{ background: 'transparent', border: '1px solid #c9a84c', color: '#c9a84c', fontSize: '10px', letterSpacing: '1px', padding: '5px 0', borderRadius: '3px' }}
                                            onClick={() => navigate('/shop')}>
                                            SHOP NOW
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── FEATURED PRODUCTS BY BRAND ── */}
                <div className="mb-5">
                    <h2 className="text-center fw-bold text-uppercase mb-2" style={{ fontSize: '28px', letterSpacing: '5px' }}>FEATURED PRODUCTS BY BRAND</h2>
                    <div className="mx-auto mb-4" style={{ width: '60px', height: '2px', background: '#c9a84c' }}></div>

                    {/* Brand Filter Tabs */}
                    <div className="d-flex gap-2 flex-wrap mb-4">
                        {brandTabs.map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)}
                                className="btn fw-semibold text-uppercase"
                                style={{
                                    fontSize: '11px', letterSpacing: '0.5px',
                                    background: activeTab === tab ? '#c9a84c' : 'transparent',
                                    color: activeTab === tab ? '#0a0a0a' : '#8a7a6a',
                                    border: `1px solid ${activeTab === tab ? '#c9a84c' : '#3d3020'}`,
                                    borderRadius: '3px', padding: '6px 16px'
                                }}>
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Products Slider */}
                    <div className="position-relative px-3">
                        <button
                            className="position-absolute top-50 translate-middle-y d-flex align-items-center justify-content-center border-0"
                            style={{ left: '-10px', zIndex: 10, width: '36px', height: '36px', borderRadius: '50%', background: '#b89456', color: '#0a0a0a', cursor: 'pointer' }}
                            onClick={() => scroll('brand-products', 'prev')}>
                            <ChevronLeft size={18} strokeWidth={2.5} />
                        </button>
                        <div id="brand-products" className="d-flex gap-3 overflow-auto" style={{ scrollBehavior: 'smooth', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            {filteredProducts.map(p => (
                                <div key={p.id} className="flex-shrink-0 overflow-hidden position-relative"
                                    style={{ width: '220px', border: '1px solid #3d3020', borderRadius: '4px', cursor: 'pointer', transition: 'transform 0.2s, border-color 0.2s', background: '#141010' }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = '#c9a84c'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#3d3020'; }}>

                                    {/* Brand badge */}
                                    <div className="position-absolute top-0 start-0 m-2 px-2 py-1"
                                        style={{ background: '#c9a84c', fontSize: '9px', fontWeight: 700, letterSpacing: '1px', color: '#0a0a0a', borderRadius: '2px', zIndex: 2 }}>
                                        {p.brand}
                                    </div>

                                    {/* Wishlist */}
                                    <button className="position-absolute top-0 end-0 m-2 border-0 p-0"
                                        style={{ zIndex: 2, background: 'transparent', cursor: 'pointer' }}
                                        onClick={() => toggleWishlist(p.id)}>
                                        <Heart size={18} strokeWidth={1} fill={wishlist.includes(p.id) ? '#b89456' : 'none'} color={wishlist.includes(p.id) ? '#b89456' : '#ffffff'} />
                                    </button>

                                    <div style={{ height: '200px', background: '#e5e5e5', overflow: 'hidden' }}>
                                        <img src={p.img} alt={p.name} className="w-100 h-100" style={{ objectFit: 'cover', transition: 'transform 0.4s' }}
                                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
                                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                                    </div>

                                    <div className="p-3 text-center">
                                        <div className="text-white fw-bold mb-1" style={{ fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                                        <div className="mb-1" style={{ fontSize: '11px', color: '#8a8a8a' }}>Condition: {p.condition}</div>
                                        <div className="d-flex align-items-center justify-content-center gap-1 mb-2">
                                            {[1, 2, 3, 4, 5].map(s => <Star key={s} size={11} fill={s <= Math.round(p.rating) ? '#c9a84c' : 'none'} color="#c9a84c" />)}
                                        </div>
                                        <div className="mb-2 d-flex align-items-center justify-content-center gap-2">
                                            <span className="fw-semibold" style={{ color: '#c9a84c', fontSize: '14px' }}>{p.price}</span>
                                            {p.original && <span className="text-decoration-line-through" style={{ color: '#555', fontSize: '11px' }}>{p.original}</span>}
                                        </div>
                                        <button className="btn w-100 d-flex align-items-center justify-content-center gap-2"
                                            style={{ background: 'transparent', border: '1px solid rgba(201,168,76,0.3)', padding: '6px 0', borderRadius: '3px', transition: 'all 0.2s' }}
                                            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(201,168,76,0.1)'}
                                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                            onClick={() => navigate('/shop')}>
                                            <ShoppingCart size={13} style={{ color: '#c9a84c' }} />
                                            <span className="text-white fw-semibold" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>SHOP NOW</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button
                            className="position-absolute top-50 translate-middle-y d-flex align-items-center justify-content-center border-0"
                            style={{ right: '-10px', zIndex: 10, width: '36px', height: '36px', borderRadius: '50%', background: '#b89456', color: '#0a0a0a', cursor: 'pointer' }}
                            onClick={() => scroll('brand-products', 'next')}>
                            <ChevronRight size={18} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>

                {/* ── WHY SHOP BY BRANDS ── */}
                <div className="mb-4" style={{ border: '1px solid #3d3020', borderRadius: '4px', background: '#0d0a06' }}>
                    <div className="py-4 px-3 text-center" style={{ borderBottom: '1px solid #3d3020' }}>
                        <h2 className="fw-bold text-uppercase mb-1" style={{ fontSize: '22px', letterSpacing: '4px' }}>
                            WHY SHOP <span style={{ borderBottom: '2px solid #c9a84c' }}>BY</span> BRANDS?
                        </h2>
                    </div>
                    <div className="row g-0">
                        {whyReasons.map((r, i) => (
                            <div key={i} className="col-6 col-md-4 col-lg-2 text-center p-4"
                                style={{ borderRight: i < whyReasons.length - 1 ? '1px solid #3d3020' : 'none' }}>
                                <div className="d-flex flex-column align-items-center gap-3">
                                    <r.Icon size={44} style={{ color: '#c9a84c' }} strokeWidth={1.0} />
                                    <div className="fw-bold text-white" style={{ fontSize: '13px', letterSpacing: '0.5px' }}>{r.title}</div>
                                    <div className="text-secondary" style={{ fontSize: '11px', lineHeight: 1.6 }}>{r.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── CTA BANNER ── */}
                <div className="mb-2 overflow-hidden position-relative" style={{ border: '1px solid #3d3020', borderRadius: '4px', minHeight: '200px' }}>
                    {/* Background image with gradient */}
                    <div className="position-absolute top-0 start-0 w-100 h-100" style={{ zIndex: 0 }}>
                        <img src="/images/image3.png" alt="bg" className="w-100 h-100"
                            style={{ objectFit: 'cover', objectPosition: 'left center', transform: 'scale(1.1)', transformOrigin: 'left center' }} />
                        <div className="position-absolute top-0 start-0 w-100 h-100"
                            style={{ background: 'linear-gradient(to right, rgba(8,5,2,0.85) 0%, rgba(8,5,2,0.75) 30%, rgba(8,5,2,0.88) 60%, rgba(8,5,2,0.95) 100%)' }}>
                        </div>
                    </div>

                    <div className="row g-0 align-items-stretch position-relative" style={{ zIndex: 2, minHeight: '200px' }}>
                        {/* Left image column — real image visible through bg */}
                        <div className="col-md-3 d-none d-md-block" style={{ minHeight: '200px' }}></div>

                        {/* Center text */}
                        <div className="col-md-5 p-4 p-md-5 d-flex flex-column justify-content-center">
                            <h3 className="fw-bold text-white mb-2"
                                style={{ fontFamily: "'Playfair Display','Times New Roman',serif", fontSize: '26px', letterSpacing: '1px' }}>
                                LOVE PREMIUM BRANDS?
                            </h3>
                            <p className="mb-4" style={{ color: '#c8bfb0', fontSize: '14px', lineHeight: 1.7 }}>
                                Get the best deals on top brands. New arrivals every day. Don't miss out!
                            </p>
                            <div>
                                <button className="btn fw-bold text-uppercase px-4 py-2"
                                    style={{ background: '#c9a84c', color: '#0a0a0a', fontSize: '12px', letterSpacing: '1px', border: 'none', borderRadius: '3px' }}
                                    onClick={() => navigate('/new-arrivals')}>
                                    EXPLORE NEW ARRIVALS
                                </button>
                            </div>
                        </div>

                        {/* Right icons */}
                        <div className="col-md-4 p-4 p-md-5 d-none d-md-flex flex-column justify-content-center gap-4"
                            style={{ borderLeft: '1px solid rgba(61,48,32,0.6)' }}>
                            {[
                                { Icon: ShieldCheck, text: 'Easy Returns', sub: '7 days return policy' },
                                { Icon: Tag, text: 'Secure Payment', sub: '100% safe checkout' },
                                { Icon: Heart, text: 'Customer Support', sub: 'We are here to help!' },
                            ].map((item, i) => (
                                <div key={i} className="d-flex align-items-center gap-3">
                                    <div className="d-flex align-items-center justify-content-center flex-shrink-0"
                                        style={{ width: '42px', height: '42px', borderRadius: '50%', border: '1px solid rgba(201,168,76,0.4)', background: 'rgba(201,168,76,0.08)' }}>
                                        <item.Icon size={18} style={{ color: '#c9a84c' }} strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <div className="fw-bold text-white" style={{ fontSize: '13px' }}>{item.text}</div>
                                        <div className="text-secondary" style={{ fontSize: '12px' }}>{item.sub}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>


            </div>

            <Footer />
        </div>
    );
}