import React, { useState } from 'react';
import { Heart, ShoppingCart, Trash2, Share2, Lock, ShieldCheck, Tag, Shield, Truck, Star, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAlert } from '../context/AlertContext';

const features = [
    { Icon: ShieldCheck, title: 'QUALITY CHECKED', desc: 'Every item is inspected' },
    { Icon: Tag, title: 'BEST PRICES', desc: 'Unbeatable prices on top brands' },
    { Icon: Shield, title: 'EASY RETURNS', desc: '7 days return & exchange' },
    { Icon: Lock, title: 'SECURE PAYMENT', desc: '100% safe & secure checkout' },
    { Icon: Truck, title: 'FAST DELIVERY', desc: 'Nationwide shipping' },
];

export default function WishlistPage({ wishlistItems, onRemove, onAddToBag }) {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedImageIdx, setSelectedImageIdx] = useState(0);
    const navigate = useNavigate();
    const { showAlert } = useAlert();

    return (
        <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
            <Navbar />

            <div className="container-fluid px-3 px-md-5 py-4" style={{ paddingTop: '130px' }}>

                {/* Breadcrumb */}
                <div className="d-flex align-items-center gap-2 mb-3" style={{ fontSize: '13px' }}>
                    <span style={{ color: '#8a7a6a', cursor: 'pointer' }} onClick={() => navigate('/')}>Home</span>
                    <span style={{ color: '#3d3020' }}>›</span>
                    <span style={{ color: '#c9a84c' }}>My Wishlist</span>
                </div>

                {/* Title Row */}
                <div className="d-flex align-items-center justify-content-between mb-1 flex-wrap gap-3">
                    <div className="d-flex align-items-center gap-3">
                        <h1 className="fw-bold text-white text-uppercase mb-0"
                            style={{ fontFamily: "'Playfair Display','Times New Roman',serif", fontSize: 'clamp(24px, 4vw, 36px)', letterSpacing: '2px' }}>
                            MY WISHLIST
                        </h1>
                        <Heart size={28} style={{ color: '#c9a84c' }} strokeWidth={1.5} />
                    </div>
                    <div className="d-flex gap-3">
                        <button className="btn d-flex align-items-center gap-2 fw-semibold text-uppercase"
                            style={{ background: 'transparent', border: '1px solid #3d3020', color: '#fff', fontSize: '12px', letterSpacing: '1px', borderRadius: '3px', padding: '8px 18px', transition: 'border-color 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = '#c9a84c'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = '#3d3020'}>
                            <Share2 size={14} />
                            SHARE WISHLIST
                        </button>
                        <button className="btn d-flex align-items-center gap-2 fw-semibold text-uppercase"
                            style={{ background: '#c9a84c', border: 'none', color: '#0a0a0a', fontSize: '12px', letterSpacing: '1px', borderRadius: '3px', padding: '8px 18px', transition: 'background 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#d4b050'}
                            onMouseLeave={e => e.currentTarget.style.background = '#c9a84c'}
                            onClick={() => { wishlistItems.forEach(item => onAddToBag(item)); const count = wishlistItems.length; wishlistItems.forEach(item => onRemove(item._id || item.id)); showAlert({ type: 'success', message: `${count} item${count > 1 ? 's' : ''} moved to bag!` }); }}>
                            <Lock size={14} />
                            MOVE ALL TO BAG
                        </button>
                    </div>
                </div>
                <div className="mb-4" style={{ color: '#c9a84c', fontSize: '14px', fontWeight: 600 }}>
                    {wishlistItems.length} Items
                </div>

                {/* Empty state */}
                {wishlistItems.length === 0 ? (
                    <div className="text-center py-5 mb-4" style={{ border: '1px solid #3d3020', borderRadius: '4px', background: '#0f0c09' }}>
                        <Heart size={48} style={{ color: '#3d3020', marginBottom: '16px' }} />
                        <div className="text-secondary mb-3" style={{ fontSize: '16px' }}>Your wishlist is empty</div>
                        <button className="btn fw-bold text-uppercase px-4 py-2"
                            style={{ background: '#c9a84c', color: '#0a0a0a', fontSize: '12px', letterSpacing: '2px', border: 'none', borderRadius: '3px' }}
                            onClick={() => navigate('/shop')}>
                            EXPLORE PRODUCTS
                        </button>
                    </div>
                ) : (
                    <div className="row g-3 mb-5 wishlist-grid">
                        {wishlistItems.map(p => {
                            const pid = p._id || p.id;
                            return (
                            <div key={pid} className="col-6 col-md-4 col-lg" style={{ minWidth: '180px', maxWidth: '220px' }}>
                                <div className="overflow-hidden position-relative h-100"
                                    style={{ border: '1px solid #3d3020', borderRadius: '4px', background: '#0f0c09', transition: 'transform 0.2s, border-color 0.2s', cursor: 'pointer' }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = '#c9a84c'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#3d3020'; }}>

                                    {/* Heart filled red */}
                                    <button className="position-absolute top-0 end-0 m-2 border-0 p-0"
                                        style={{ zIndex: 2, background: 'transparent', cursor: 'pointer' }}
                                        onClick={(e) => { e.stopPropagation(); onRemove(pid); }}>
                                        <Heart size={20} fill="#e74c3c" color="#e74c3c" strokeWidth={1} />
                                    </button>

                                    {/* Image */}
                                    <div style={{ height: '180px', background: '#1a1a1a', overflow: 'hidden' }} onClick={() => { setSelectedProduct(p); setSelectedImageIdx(0); }}>
                                        <img src={p.mainImage} alt={p.name} className="w-100 h-100"
                                            style={{ objectFit: 'cover', transition: 'transform 0.4s' }}
                                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
                                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                                    </div>

                                    <div className="p-3">
                                        <div onClick={() => { setSelectedProduct(p); setSelectedImageIdx(0); }} style={{ cursor: 'pointer' }}>
                                            <div style={{ color: '#8a7a6a', fontSize: '11px', marginBottom: '2px' }}>{p.category || p.brand}</div>
                                            <div className="fw-bold text-white mb-1" style={{ fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                                            <div className="fw-bold mb-1" style={{ color: '#c9a84c', fontSize: '15px' }}>Rs. {p.salePrice ? p.salePrice.toLocaleString() : p.price?.toLocaleString()}</div>

                                            {/* Stars + review count */}
                                            <div className="d-flex align-items-center gap-1 mb-1">
                                                {[1, 2, 3, 4, 5].map(s => (
                                                    <svg key={s} width="11" height="11" viewBox="0 0 24 24" fill={s <= Math.round(p.rating) ? '#c9a84c' : 'none'} stroke="#c9a84c" strokeWidth="2">
                                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                                    </svg>
                                                ))}
                                                <span style={{ color: '#8a7a6a', fontSize: '11px' }}>({p.reviews || Math.floor(Math.random() * 100 + 50)})</span>
                                            </div>
                                        </div>

                                        {/* Size/Color detail */}
                                        {p.size && <div style={{ color: '#8a7a6a', fontSize: '12px', marginBottom: '8px' }}>Size: {p.size}</div>}
                                        {p.color && <div style={{ color: '#8a7a6a', fontSize: '12px', marginBottom: '8px' }}>Color: {p.color}</div>}

                                        {/* Buttons — outside modal trigger div */}
                                        <div className="d-flex gap-2 mt-2">
                                            <button className="btn flex-grow-1 d-flex align-items-center justify-content-center gap-1 fw-semibold"
                                                style={{ background: 'transparent', border: '1px solid rgba(201,168,76,0.4)', color: '#fff', fontSize: '11px', letterSpacing: '0.5px', padding: '6px 0', borderRadius: '3px', transition: 'all 0.2s' }}
                                                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(201,168,76,0.12)'}
                                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                                onClick={(e) => { e.stopPropagation(); onAddToBag(p); onRemove(pid); showAlert({ type: 'success', message: `${p.name} added to bag!` }); }}>
                                                <ShoppingCart size={12} style={{ color: '#c9a84c' }} />
                                                ADD TO BAG
                                            </button>
                                            <button className="btn d-flex align-items-center justify-content-center"
                                                style={{ background: 'transparent', border: '1px solid #3d3020', color: '#8a7a6a', padding: '6px 10px', borderRadius: '3px', transition: 'all 0.2s' }}
                                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#e74c3c'; e.currentTarget.style.color = '#e74c3c'; }}
                                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#3d3020'; e.currentTarget.style.color = '#8a7a6a'; }}
                                                onClick={(e) => { e.stopPropagation(); onRemove(pid); }}>
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            );
                        })}
                    </div>
                )}

                {/* CTA Banner */}
                <div className="mb-5 overflow-hidden position-relative"
                    style={{ border: '1px solid #3d3020', borderRadius: '4px', minHeight: '200px' }}>
                    <div className="position-absolute top-0 start-0 w-100 h-100" style={{ zIndex: 0 }}>
                        <img src="/images/image3.png" alt="bg" className="w-100 h-100"
                            style={{ objectFit: 'cover', objectPosition: 'center' }} />
                        <div className="position-absolute top-0 start-0 w-100 h-100"
                            style={{ background: 'linear-gradient(to right, rgba(10,10,10,0.97) 0%, rgba(10,10,10,0.9) 40%, rgba(10,10,10,0.5) 70%, rgba(10,10,10,0.1) 100%)' }}>
                        </div>
                    </div>
                    <div className="position-relative p-4 p-md-5 d-flex flex-column justify-content-center" style={{ zIndex: 2, minHeight: '200px', maxWidth: '460px' }}>
                        <h3 className="fw-bold text-white mb-2"
                            style={{ fontFamily: "'Playfair Display','Times New Roman',serif", fontSize: '22px', letterSpacing: '1px' }}>
                            Don't see anything you like?
                        </h3>
                        <p className="mb-4" style={{ color: '#a09080', fontSize: '14px', lineHeight: 1.7 }}>
                            Explore more amazing products and find something you'll love.
                        </p>
                        <div>
                            <button className="btn fw-bold text-uppercase px-4 py-2"
                                style={{ background: '#c9a84c', color: '#0a0a0a', fontSize: '12px', letterSpacing: '2px', border: 'none', borderRadius: '3px', transition: 'background 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#d4b050'}
                                onMouseLeave={e => e.currentTarget.style.background = '#c9a84c'}
                                onClick={() => navigate('/shop')}>
                                CONTINUE SHOPPING
                            </button>
                        </div>
                    </div>
                </div>

                {/* Features Bar */}
                <div className="py-4" style={{ borderTop: '1px solid #3d3020' }}>
                    <div className="row g-3 align-items-center">
                        {features.map((f, i) => (
                            <div key={i} className="col-6 col-md-4 col-lg">
                                <div className="d-flex align-items-center gap-3 px-2">
                                    <div className="d-flex align-items-center justify-content-center flex-shrink-0"
                                        style={{ width: '44px', height: '44px', border: '1px solid #3d3020', borderRadius: '4px' }}>
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

                {/* Newsletter */}
                <div className="py-5 mt-2" style={{ background: 'linear-gradient(90deg, #181208 0%, #2f2210 50%, #181208 100%)', borderRadius: '4px', border: '1px solid #3d3020' }}>
                    <div className="row align-items-center justify-content-between px-4 px-md-5 g-4">
                        <div className="col-lg-6 d-flex align-items-center gap-4">
                            <div className="d-flex align-items-center justify-content-center flex-shrink-0"
                                style={{ width: '64px', height: '64px', borderRadius: '50%', border: '1px solid #b89456' }}>
                                <span style={{ fontSize: '24px' }}>✉</span>
                            </div>
                            <div>
                                <h4 className="fw-bold text-white mb-1" style={{ fontFamily: "'Playfair Display','Times New Roman',serif", fontSize: '18px' }}>
                                    GET EXCLUSIVE OFFERS & UPDATES
                                </h4>
                                <p className="mb-0" style={{ color: '#a09080', fontSize: '13px', lineHeight: 1.6 }}>
                                    Subscribe to get early access to new arrivals and exclusive discounts.
                                </p>
                            </div>
                        </div>
                        <div className="col-lg-5">
                            <div className="d-flex" style={{ borderRadius: '3px', overflow: 'hidden' }}>
                                <input type="email" placeholder="Enter your email"
                                    className="form-control border-0 px-4"
                                    style={{ background: '#f2f2f2', color: '#333', fontSize: '14px', height: '48px', boxShadow: 'none', borderRadius: '3px 0 0 3px' }} />
                                <button className="btn fw-bold text-uppercase text-white px-4"
                                    style={{ background: '#c9a84c', fontSize: '13px', letterSpacing: '1px', border: 'none', borderRadius: '0 3px 3px 0', height: '48px', minWidth: '120px', whiteSpace: 'nowrap' }}>
                                    SUBSCRIBE
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* ── PRODUCT DETAILS MODAL ── */}
            {selectedProduct && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
                    onClick={e => { if (e.target === e.currentTarget) setSelectedProduct(null); }}>
                    <div style={{ background: '#0f0c09', border: '1px solid #3d3020', borderRadius: '8px', width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflow: 'hidden', position: 'relative' }}>
                        <button onClick={() => setSelectedProduct(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}>
                            <X size={18} />
                        </button>
                        <div className="row g-0 h-100" style={{ overflowY: 'auto' }}>
                            <div className="col-md-6 p-4" style={{ background: '#141010', borderRight: '1px solid #2a1f10' }}>
                                <img src={selectedProduct.images?.[selectedImageIdx]?.url || selectedProduct.mainImage} alt={selectedProduct.name} style={{ width: '100%', height: 'auto', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '4px', border: '1px solid #2a1f10', marginBottom: '16px' }} />
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {selectedProduct.images?.map((img, idx) => (
                                        <img key={idx} src={img.url} alt="" onClick={() => setSelectedImageIdx(idx)} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: selectedImageIdx === idx ? '2px solid #c9a84c' : '1px solid #3d3020', cursor: 'pointer', opacity: selectedImageIdx === idx ? 1 : 0.6, transition: 'all 0.2s' }} />
                                    ))}
                                </div>
                            </div>
                            <div className="col-md-6 p-4 p-md-5 d-flex flex-column justify-content-center">
                                <div style={{ fontSize: '12px', color: '#c9a84c', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 600 }}>{selectedProduct.category}</div>
                                <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', marginBottom: '12px', lineHeight: 1.2 }}>{selectedProduct.name}</h2>
                                <div className="d-flex align-items-center gap-1 mb-4">
                                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} fill={s <= Math.round(selectedProduct.rating || 4) ? '#c9a84c' : 'none'} color="#c9a84c" />)}
                                    <span style={{ fontSize: '13px', color: '#8a7a6a', marginLeft: '8px' }}>(4.0 Reviews)</span>
                                </div>
                                <div className="d-flex align-items-center gap-3 mb-4">
                                    <span style={{ fontSize: '24px', fontWeight: 700, color: '#c9a84c' }}>Rs. {selectedProduct.salePrice ? selectedProduct.salePrice.toLocaleString() : selectedProduct.price?.toLocaleString()}</span>
                                    {selectedProduct.salePrice && <span className="text-decoration-line-through" style={{ fontSize: '16px', color: '#555' }}>Rs. {selectedProduct.price?.toLocaleString()}</span>}
                                </div>
                                <div style={{ background: '#1a1410', border: '1px solid #2a1f10', borderRadius: '4px', padding: '16px', marginBottom: '24px' }}>
                                    <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Description</h4>
                                    <p style={{ fontSize: '14px', color: '#a09080', lineHeight: 1.6, margin: 0 }}>{selectedProduct.description}</p>
                                </div>
                                <div className="d-flex gap-3 mt-auto">
                                    <button onClick={() => { onAddToBag(selectedProduct); onRemove(selectedProduct._id || selectedProduct.id); showAlert({ type: 'success', message: `${selectedProduct.name} added to bag!` }); setSelectedProduct(null); }} className="btn d-flex align-items-center justify-content-center gap-2 flex-grow-1" style={{ background: '#c9a84c', color: '#0a0a0a', border: 'none', padding: '14px', borderRadius: '4px', fontWeight: 700, fontSize: '14px', letterSpacing: '0.5px' }}>
                                        <ShoppingCart size={18} /> ADD TO BAG
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}