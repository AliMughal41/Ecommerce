import React, { useState, useEffect } from 'react';
import { Trash2, Minus, Plus, ShoppingCart, ArrowLeft, MessageCircle, ShieldCheck, Shield, User, Star, Heart, ChevronLeft, ChevronRight, Tag, Truck, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import API_URL from '../config';

/* ─── INITIAL CART DATA (start empty; items come from ShopPage) ─────────────────────────────────────────────── */
const initialCart = [];

const FREE_DELIVERY_THRESHOLD = 5000;

const scroll = (id, dir) => {
    const el = document.getElementById(id);
    if (el) el.scrollBy({ left: dir === 'next' ? 280 : -280, behavior: 'smooth' });
};

/* ─── COMPONENT ─────────────────────────────────────────────────────── */
export default function CartPage() {
    const [cart, setCart] = useState(initialCart);
    const [wishlist, setWishlist] = useState([]);
    const [suggestedProducts, setSuggestedProducts] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem('thriftora_cart') || '[]');
        if (savedCart.length) {
            setCart(savedCart);
        }
    }, []);

    useEffect(() => {
        const fetchSuggested = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/api/products`);
                if (data.success) {
                    const latest = data.products
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        .slice(0, 8);
                    setSuggestedProducts(latest);
                }
            } catch (err) {
                console.error('Failed to fetch suggested products', err);
            }
        };
        fetchSuggested();
    }, []);

    const updateQty = (id, delta) => {
        setCart(c => c.map(item => {
            if (item.id !== id) return item;
            const newQty = item.qty + delta;
            if (newQty < 1) return item;
            if (delta > 0 && item.stock && newQty > item.stock) return item;
            return { ...item, qty: newQty };
        }));
    };

    const removeItem = (id) => setCart(c => c.filter(item => item.id !== id));
    const clearCart = () => {
        setCart([]);
        localStorage.setItem('thriftora_cart', JSON.stringify([]));
    };
    const toggleWishlist = (id) => setWishlist(w => w.includes(id) ? w.filter(x => x !== id) : [...w, id]);

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);
    const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
    const deliveryProgress = Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100);

    useEffect(() => {
        localStorage.setItem('thriftora_cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('cart-updated'));
    }, [cart]);

    useEffect(() => {
        // Support either a single item (from ShopPage) or a full cart (from other pages)
        const incomingItem = location.state?.item;
        const incomingCart = location.state?.cart;

        if (incomingCart && Array.isArray(incomingCart)) {
            // Replace current cart with provided cart (useful when returning from checkout)
            setCart(incomingCart.map(i => ({ ...i, qty: i.qty || 1 })));
            return;
        }

        if (incomingItem) {
            const normalizedId = incomingItem.id || incomingItem._id || String(Date.now());
            const itemToAdd = {
                id: normalizedId,
                name: incomingItem.name || incomingItem.title || 'Product',
                condition: incomingItem.condition || '9/10',
                size: incomingItem.size || null,
                color: incomingItem.color || null,
                category: incomingItem.category || incomingItem.cat || '',
                price: incomingItem.price || incomingItem.salePrice || 0,
                img: incomingItem.img || incomingItem.mainImage || incomingItem.image || '',
                qty: 1,
            };

            setCart(prev => {
                const existing = prev.find(item => item.id === itemToAdd.id);
                if (existing) {
                    return prev.map(item => item.id === itemToAdd.id ? { ...item, qty: item.qty + 1 } : item);
                }
                return [...prev, itemToAdd];
            });
        }
    }, [location.state]);

    return (
        <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>

            <Navbar />

            <div className="container-fluid px-3 px-md-5 py-4" style={{ paddingTop: '96px' }}>

                {/* ── PAGE TITLE ── */}
                <h1 className="fw-bold text-white text-uppercase mb-1"
                    style={{ fontFamily: "'Playfair Display','Times New Roman',serif", fontSize: 'clamp(28px, 5vw, 48px)', letterSpacing: '3px' }}>
                    YOUR CART
                </h1>
                <div className="d-flex align-items-center gap-2 mb-4" style={{ fontSize: '13px' }}>
                    <span style={{ color: '#8a7a6a', cursor: 'pointer' }} onClick={() => navigate('/')}>Home</span>
                    <span style={{ color: '#3d3020' }}>›</span>
                    <span style={{ color: '#c9a84c' }}>Your Cart</span>
                </div>

                <div className="row g-4">

                    {/* ── LEFT: CART ITEMS ── */}
                    <div className="col-lg-8">

                        {cart.length === 0 ? (
                            <div className="text-center py-5" style={{ border: '1px solid #3d3020', borderRadius: '4px', background: '#0f0c09' }}>
                                <ShoppingCart size={48} style={{ color: '#3d3020', marginBottom: '16px' }} />
                                <div className="text-secondary mb-3" style={{ fontSize: '16px' }}>Your cart is empty</div>
                                <button className="btn fw-bold text-uppercase px-4 py-2"
                                    style={{ background: '#c9a84c', color: '#0a0a0a', fontSize: '12px', letterSpacing: '2px', border: 'none', borderRadius: '3px' }}
                                    onClick={() => navigate('/shop')}>
                                    SHOP NOW
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Table Header */}
                                <div className="row g-0 pb-2 mb-2 d-none d-md-flex" style={{ borderBottom: '1px solid #3d3020' }}>
                                    <div className="col-md-6"><span className="fw-bold text-uppercase" style={{ fontSize: '11px', letterSpacing: '2px', color: '#8a7a6a' }}>PRODUCT</span></div>
                                    <div className="col-md-2 text-center"><span className="fw-bold text-uppercase" style={{ fontSize: '11px', letterSpacing: '2px', color: '#8a7a6a' }}>PRICE</span></div>
                                    <div className="col-md-2 text-center"><span className="fw-bold text-uppercase" style={{ fontSize: '11px', letterSpacing: '2px', color: '#8a7a6a' }}>QUANTITY</span></div>
                                    <div className="col-md-2 text-end"><span className="fw-bold text-uppercase" style={{ fontSize: '11px', letterSpacing: '2px', color: '#8a7a6a' }}>SUBTOTAL</span></div>
                                </div>

                                {/* Cart Items */}
                                {cart.map((item) => (
                                    <div key={item.id} className="row g-0 align-items-center py-4 cart-item-row"
                                        style={{ borderBottom: '1px solid #2a1f10' }}>

                                        {/* Product */}
                                        <div className="col-8 col-md-6 d-flex align-items-center gap-3">
                                            <div style={{ width: '90px', height: '90px', flexShrink: 0, borderRadius: '4px', overflow: 'hidden', border: '1px solid #3d3020' }}>
                                                <img src={item.img} alt={item.name} className="w-100 h-100 cart-item-img" style={{ objectFit: 'cover' }} />
                                            </div>
                                            <div className="cart-item-info">
                                                <div className="fw-bold text-white mb-1" style={{ fontSize: '15px' }}>{item.name}</div>
                                                <div style={{ color: '#8a7a6a', fontSize: '12px', lineHeight: 1.7 }}>
                                                    Condition: {item.condition}<br />
                                                    {item.size && <>Size: {item.size}<br /></>}
                                                    {item.color && <>Color: {item.color}<br /></>}
                                                    Category: {item.category}
                                                </div>
                                                {item.stock !== undefined && item.stock <= 5 && (
                                                    <div style={{ color: item.stock <= 0 ? '#e74c3c' : '#ff9800', fontSize: '11px', marginTop: '4px', fontWeight: 600 }}>
                                                        {item.stock <= 0 ? 'Out of stock' : `Only ${item.stock} left in stock`}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Price */}
                                        <div className="col-md-2 d-none d-md-flex justify-content-center">
                                            <span style={{ color: '#fff', fontSize: '14px', fontWeight: 500 }}>Rs. {item.price.toLocaleString()}</span>
                                        </div>

                                        {/* Qty */}
                                        <div className="col-4 col-md-2 d-flex justify-content-center align-items-center">
                                            <div className="d-flex align-items-center gap-0" style={{ border: '1px solid #3d3020', borderRadius: '3px', overflow: 'hidden' }}>
                                                <button className="border-0 d-flex align-items-center justify-content-center"
                                                    style={{ width: '32px', height: '32px', background: '#1a1410', color: '#c9a84c', cursor: 'pointer', fontSize: '16px' }}
                                                    onClick={() => updateQty(item.id, -1)}>
                                                    <Minus size={12} />
                                                </button>
                                                <span className="text-white text-center" style={{ width: '36px', fontSize: '14px', fontWeight: 600, background: '#141010', lineHeight: '32px' }}>
                                                    {item.qty}
                                                </span>
                                                <button className="border-0 d-flex align-items-center justify-content-center"
                                                    style={{ width: '32px', height: '32px', background: '#1a1410', color: item.stock && item.qty >= item.stock ? '#555' : '#c9a84c', cursor: item.stock && item.qty >= item.stock ? 'not-allowed' : 'pointer', fontSize: '16px' }}
                                                    onClick={() => updateQty(item.id, 1)}>
                                                    <Plus size={12} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Subtotal + Delete */}
                                        <div className="col-md-2 d-none d-md-flex justify-content-end align-items-center gap-3 cart-item-actions">
                                            <span style={{ color: '#c9a84c', fontSize: '14px', fontWeight: 600 }}>
                                                Rs. {(item.price * item.qty).toLocaleString()}
                                            </span>
                                            <button className="border-0 p-0" style={{ background: 'transparent', cursor: 'pointer' }}
                                                onClick={() => removeItem(item.id)}>
                                                <Trash2 size={16} style={{ color: '#555', transition: 'color 0.2s' }}
                                                    onMouseEnter={e => e.currentTarget.style.color = '#e74c3c'}
                                                    onMouseLeave={e => e.currentTarget.style.color = '#555'} />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {/* Bottom Buttons */}
                                <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-3 pt-4 cart-item-actions">
                                    <button className="btn fw-bold text-uppercase d-flex align-items-center gap-2 px-4 py-2"
                                        style={{ background: 'transparent', border: '1px solid #3d3020', color: '#fff', fontSize: '12px', letterSpacing: '1px', borderRadius: '3px', transition: 'border-color 0.2s' }}
                                        onMouseEnter={e => e.currentTarget.style.borderColor = '#c9a84c'}
                                        onMouseLeave={e => e.currentTarget.style.borderColor = '#3d3020'}
                                        onClick={() => navigate('/shop')}>
                                        <ArrowLeft size={14} />
                                        CONTINUE SHOPPING
                                    </button>
                                    <button className="btn fw-bold text-uppercase d-flex align-items-center gap-2 px-4 py-2"
                                        style={{ background: 'transparent', border: '1px solid #3d3020', color: '#8a7a6a', fontSize: '12px', letterSpacing: '1px', borderRadius: '3px', transition: 'all 0.2s' }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#e74c3c'; e.currentTarget.style.color = '#e74c3c'; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#3d3020'; e.currentTarget.style.color = '#8a7a6a'; }}
                                        onClick={clearCart}>
                                        <Trash2 size={14} />
                                        CLEAR CART
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* ── RIGHT: ORDER SUMMARY ── */}
                    <div className="col-lg-4">
                        <div style={{ border: '1px solid #3d3020', borderRadius: '4px', background: '#0f0c09', overflow: 'hidden' }}>

                            {/* Header */}
                            <div className="px-4 py-3" style={{ borderBottom: '1px solid #3d3020' }}>
                                <div className="fw-bold text-white text-uppercase" style={{ fontSize: '15px', letterSpacing: '3px' }}>ORDER SUMMARY</div>
                            </div>

                            <div className="p-4">
                                {/* Subtotal */}
                                <div className="d-flex justify-content-between mb-2">
                                    <span style={{ color: '#8a7a6a', fontSize: '14px' }}>Subtotal ({itemCount} items)</span>
                                    <span className="text-white fw-semibold" style={{ fontSize: '14px' }}>Rs. {subtotal.toLocaleString()}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-3 pb-3" style={{ borderBottom: '1px solid #2a1f10' }}>
                                    <span style={{ color: '#8a7a6a', fontSize: '14px' }}>Shipping</span>
                                    <span className="fw-semibold" style={{ color: remaining === 0 ? '#4caf50' : '#fff', fontSize: '14px' }}>
                                        {remaining === 0 ? 'FREE' : 'Rs. 0'}
                                    </span>
                                </div>

                                {/* Total */}
                                <div className="d-flex justify-content-between mb-4">
                                    <span className="fw-bold text-white text-uppercase" style={{ fontSize: '16px', letterSpacing: '1px' }}>Total</span>
                                    <span className="fw-bold" style={{ color: '#c9a84c', fontSize: '18px' }}>Rs. {subtotal.toLocaleString()}</span>
                                </div>

                                {/* Free delivery progress */}
                                <div className="mb-4 p-3" style={{ border: '1px solid #3d3020', borderRadius: '4px', background: '#141010' }}>
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <span style={{ fontSize: '16px' }}>🎉</span>
                                        <span style={{ fontSize: '12px', color: '#c8bfb0' }}>
                                            {remaining === 0
                                                ? 'Congratulations! You are eligible for'
                                                : `Add Rs. ${remaining.toLocaleString()} more to get`}
                                        </span>
                                    </div>
                                    <div className="fw-bold mb-2" style={{ color: '#c9a84c', fontSize: '13px', letterSpacing: '1px' }}>
                                        ✦ FREE DELIVERY
                                    </div>
                                    <div style={{ height: '4px', background: '#2a1f10', borderRadius: '2px', overflow: 'hidden' }}>
                                        <div style={{ width: `${deliveryProgress}%`, height: '100%', background: 'linear-gradient(to right, #c9a84c, #e8c96a)', borderRadius: '2px', transition: 'width 0.4s' }}></div>
                                    </div>
                                    {remaining > 0 && (
                                        <div className="mt-2" style={{ fontSize: '11px', color: '#8a7a6a' }}>
                                            Add Rs. {remaining.toLocaleString()} more to get free delivery
                                        </div>
                                    )}
                                </div>

                                <button className="btn w-100 fw-bold text-uppercase d-flex align-items-center justify-content-center gap-2 py-3 mb-3"
                                    style={{ background: '#c9a84c', color: '#0a0a0a', fontSize: '13px', letterSpacing: '2px', border: 'none', borderRadius: '3px', transition: 'background 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#d4b050'}
                                    onMouseLeave={e => e.currentTarget.style.background = '#c9a84c'}
                                    onClick={() => navigate('/checkout', { state: { cart } })}>
                                    <ShieldCheck size={16} />
                                    PROCEED TO CHECKOUT
                                </button>

                                <button className="btn w-100 fw-bold text-uppercase d-flex align-items-center justify-content-center gap-2 py-3 mb-4"
                                    style={{ background: 'transparent', border: '1px solid #3d3020', color: '#fff', fontSize: '13px', letterSpacing: '1px', borderRadius: '3px', transition: 'border-color 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = '#25d366'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = '#3d3020'}>
                                    <MessageCircle size={16} style={{ color: '#25d366' }} />
                                    CHECKOUT WITH WHATSAPP
                                </button>

                                {/* Payment Methods */}
                                <div className="mb-4">
                                    <div className="text-uppercase mb-2" style={{ fontSize: '11px', letterSpacing: '2px', color: '#8a7a6a' }}>WE ACCEPT</div>
                                    <div className="d-flex gap-2 flex-wrap">
                                        {['VISA', 'MC', 'Easypaisa', 'JazzCash', 'PayPal'].map((p, i) => (
                                            <div key={i} className="px-2 py-1 d-flex align-items-center justify-content-center"
                                                style={{ border: '1px solid #3d3020', borderRadius: '3px', background: '#fff', minWidth: '48px', height: '28px' }}>
                                                <span style={{ fontSize: '9px', fontWeight: 800, color: '#333', letterSpacing: '0.5px' }}>{p}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Trust badges */}
                                <div className="d-flex flex-column gap-3">
                                    {[
                                        { Icon: ShieldCheck, title: '100% Secure Checkout', sub: 'Your payments are safe with us.' },
                                        { Icon: Shield, title: 'Easy Returns', sub: '7 days easy return & exchange policy.' },
                                        { Icon: User, title: 'Customer Support', sub: 'We are here to help you.' },
                                    ].map((b, i) => (
                                        <div key={i} className="d-flex align-items-center gap-3">
                                            <div className="d-flex align-items-center justify-content-center flex-shrink-0"
                                                style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #3d3020', background: '#141010' }}>
                                                <b.Icon size={16} style={{ color: '#c9a84c' }} strokeWidth={1.5} />
                                            </div>
                                            <div>
                                                <div className="fw-bold text-white" style={{ fontSize: '12px' }}>{b.title}</div>
                                                <div style={{ color: '#8a7a6a', fontSize: '11px' }}>{b.sub}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── YOU MAY ALSO LIKE ── */}
                {suggestedProducts.length > 0 && (
                <div className="mt-5 pt-4" style={{ borderTop: '1px solid #3d3020' }}>
                    <h2 className="text-center fw-bold text-uppercase mb-2" style={{ fontSize: '24px', letterSpacing: '5px' }}>YOU MAY ALSO LIKE</h2>
                    <div className="mx-auto mb-4" style={{ width: '60px', height: '2px', background: '#c9a84c' }}></div>

                    <div className="position-relative px-3">
                        <button
                            className="position-absolute top-50 translate-middle-y d-flex align-items-center justify-content-center border-0"
                            style={{ left: '-10px', zIndex: 10, width: '36px', height: '36px', borderRadius: '50%', background: 'transparent', border: '1px solid #3d3020', color: '#c9a84c', cursor: 'pointer' }}
                            onClick={() => scroll('suggestions', 'prev')}>
                            <ChevronLeft size={18} />
                        </button>
                        <div id="suggestions" className="d-flex gap-3 overflow-auto" style={{ scrollBehavior: 'smooth', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            {suggestedProducts.map(p => {
                                const pid = p._id || p.id;
                                const img = p.mainImage || p.images?.[0]?.url || '';
                                return (
                                <div key={pid} className="flex-shrink-0 overflow-hidden position-relative"
                                    style={{ width: '200px', border: '1px solid #3d3020', borderRadius: '4px', cursor: 'pointer', background: '#0f0c09', transition: 'transform 0.2s, border-color 0.2s' }}
                                    onClick={() => navigate('/shop')}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = '#c9a84c'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#3d3020'; }}>

                                    <div style={{ height: '180px', background: '#e5e5e5', overflow: 'hidden' }}>
                                        <img src={img} alt={p.name} className="w-100 h-100" style={{ objectFit: 'cover', transition: 'transform 0.4s' }}
                                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
                                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                                    </div>

                                    <div className="p-3 text-center">
                                        <div className="fw-bold text-white mb-1" style={{ fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                                        <div className="mb-1" style={{ fontSize: '11px', color: '#8a8a8a' }}>Condition: {p.condition || '9/10'}</div>
                                        <div className="d-flex justify-content-center gap-1 mb-2">
                                            {[1, 2, 3, 4, 5].map(s => <Star key={s} size={10} fill={s <= Math.round(p.rating || 4) ? '#c9a84c' : 'none'} color="#c9a84c" />)}
                                        </div>
                                        <div className="mb-2" style={{ color: '#c9a84c', fontSize: '14px', fontWeight: 600 }}>Rs. {(p.salePrice || p.price).toLocaleString()}</div>
                                        <button className="btn w-100 d-flex align-items-center justify-content-center gap-2"
                                            style={{ background: 'transparent', border: '1px solid rgba(201,168,76,0.3)', padding: '6px 0', borderRadius: '3px', transition: 'all 0.2s' }}
                                            onClick={(e) => { e.stopPropagation(); navigate('/shop'); }}
                                            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(201,168,76,0.1)'}
                                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                            <ShoppingCart size={12} style={{ color: '#c9a84c' }} />
                                            <span className="text-white fw-semibold" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>ADD TO CART</span>
                                        </button>
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                        <button
                            className="position-absolute top-50 translate-middle-y d-flex align-items-center justify-content-center border-0"
                            style={{ right: '-10px', zIndex: 10, width: '36px', height: '36px', borderRadius: '50%', background: 'transparent', border: '1px solid #3d3020', color: '#c9a84c', cursor: 'pointer' }}
                            onClick={() => scroll('suggestions', 'next')}>
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
                )}

                {/* ── FEATURES BAR ── */}
                <div className="mt-5 py-4" style={{ borderTop: '1px solid #3d3020', borderBottom: '1px solid #3d3020' }}>
                    <div className="row g-3 align-items-center">
                        {[
                            { Icon: ShieldCheck, title: 'QUALITY CHECKED', desc: 'Every item is carefully inspected' },
                            { Icon: Tag, title: 'AFFORDABLE PRICES', desc: 'Best quality at unbeatable prices' },
                            { Icon: Truck, title: 'FAST DELIVERY', desc: 'Nationwide shipping' },
                            { Icon: Shield, title: 'EASY RETURNS', desc: '7 Days easy return policy' },
                            { Icon: Lock, title: 'SECURE PAYMENT', desc: '100% safe & secure checkout' },
                        ].map((f, i) => (
                            <div key={i} className="col-6 col-md-4 col-lg">
                                <div className="d-flex align-items-center gap-3 justify-content-start justify-content-lg-center px-2">
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

            </div>

            <Footer />
        </div>
    );
}