import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Heart, ShoppingCart, Star, Tag } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SubscribeSection from '../components/SubscribeSection';
import { useAlert } from '../context/AlertContext';
import { useProducts } from '../context/ProductsContext';
import API_URL from '../config';
import { trackAddToCart } from '../utils/tracking';

export default function CollectionDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const { products: allProducts } = useProducts();
    const [collection, setCollection] = useState(null);
    const [loading, setLoading] = useState(true);

    const [wishlist, setWishlist] = useState(() => {
        try {
            const saved = localStorage.getItem('thriftora_wishlist');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });

    useEffect(() => {
        try { localStorage.setItem('thriftora_wishlist', JSON.stringify(wishlist)); } catch {}
        window.dispatchEvent(new Event('wishlist-updated'));
    }, [wishlist]);

    useEffect(() => {
        fetchCollection();
    }, [id]);

    const fetchCollection = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/api/collections/${id}`);
            if (data.success) setCollection(data.collection);
        } catch (error) {
            console.error('Error fetching collection', error);
        } finally {
            setLoading(false);
        }
    };

    const collectionProducts = allProducts.filter(p => {
        const collectionId = p.collection?._id || p.collection;
        return collectionId === id;
    });

    const getProductId = (p) => p._id || p.id || p.name || '';

    const isWishlisted = (pid) => wishlist.some(w => getProductId(w) === pid);

    const toggleWishlist = (product) => {
        const pid = getProductId(product);
        const isIn = wishlist.some(w => getProductId(w) === pid);
        if (isIn) {
            setWishlist(w => w.filter(x => getProductId(x) !== pid));
            showAlert({ type: 'info', message: `${product.name} removed from Wishlist` });
        } else {
            setWishlist(w => [...w, product]);
            showAlert({ type: 'success', message: `${product.name} added to Wishlist!` });
        }
    };

    const addToCartWithoutRedirect = (product) => {
        if (product.stock <= 0) return;
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
            stock: product.stock,
        };
        const existingCart = JSON.parse(localStorage.getItem('thriftora_cart') || '[]');
        const updatedCart = existingCart.map(it => ({ ...it }));
        const existingItem = updatedCart.find(i => i.id === item.id);
        if (existingItem) {
            if (existingItem.qty >= product.stock) {
                showAlert({ type: 'warning', message: `Stock limit reached for ${product.name}` });
                return;
            }
            existingItem.qty += 1;
        } else {
            updatedCart.push(item);
        }
        localStorage.setItem('thriftora_cart', JSON.stringify(updatedCart));
        window.dispatchEvent(new Event('cart-updated'));
        showAlert({ type: 'success', message: `${product.name} added to Cart!` });
        trackAddToCart(getProductId(product), product.name, 1);
    };

    const buyNow = (product) => {
        if (product.stock <= 0) return;
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
            stock: product.stock,
        };
        const existingCart = JSON.parse(localStorage.getItem('thriftora_cart') || '[]');
        const updatedCart = existingCart.map(it => ({ ...it }));
        const existingItem = updatedCart.find(i => i.id === item.id);
        if (existingItem) {
            if (existingItem.qty >= product.stock) {
                showAlert({ type: 'warning', message: `Stock limit reached for ${product.name}` });
                return;
            }
            existingItem.qty += 1;
        } else {
            updatedCart.push(item);
        }
        localStorage.setItem('thriftora_cart', JSON.stringify(updatedCart));
        window.dispatchEvent(new Event('cart-updated'));
        navigate('/checkout');
        trackAddToCart(getProductId(product), product.name, 1);
    };

    if (loading) {
        return (
            <div className="text-white" style={{ background: '#0a0a0a', minHeight: '100vh', paddingTop: '96px' }}>
                <Navbar />
                <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '50vh' }}>
                    <div style={{ color: '#c9a84c', fontSize: '14px' }}>Loading collection...</div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!collection) {
        return (
            <div className="text-white" style={{ background: '#0a0a0a', minHeight: '100vh', paddingTop: '96px' }}>
                <Navbar />
                <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '50vh' }}>
                    <div className="text-center">
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                        <div style={{ color: '#8a7a6a', fontSize: '16px', marginBottom: '16px' }}>Collection not found.</div>
                        <button onClick={() => navigate('/collections')} style={{ background: '#c9a84c', color: '#0a0a0a', border: 'none', padding: '10px 24px', borderRadius: '4px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>Back to Collections</button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
<div className="text-white" style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: '#0a0a0a', minHeight: '100vh', paddingTop: '96px' }}>
            <Navbar />

            {/* Hero Banner */}
            <section className="position-relative" style={{ height: '300px', overflow: 'hidden', background: '#0a0a0a' }}>
                {collection.image ? (
                    <img src={collection.image} alt={collection.name} className="w-100 h-100"
                        style={{ objectFit: 'cover', filter: 'brightness(0.4)' }} />
                ) : (
                    <div className="w-100 h-100 d-flex align-items-center justify-content-center"
                        style={{ background: 'linear-gradient(135deg, #1a1410, #2a1f10)' }}>
                        <span style={{ fontSize: '120px', opacity: 0.3 }}>{collection.emoji}</span>
                    </div>
                )}
                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="text-center">
                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>{collection.emoji}</div>
                        <h1 className="text-white text-uppercase fw-bold mb-2" style={{ fontFamily: "'Playfair Display','Times New Roman',serif", fontSize: 'clamp(28px, 5vw, 48px)', letterSpacing: '4px' }}>
                            {collection.name}
                        </h1>
                        {collection.description && (
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', maxWidth: '500px', margin: '0 auto' }}>{collection.description}</p>
                        )}
                    </div>
                </div>
            </section>

            {/* Products */}
            <section className="py-5" style={{ background: '#0a0a0a' }}>
                <div className="container-fluid px-3 px-md-4">
                    <div className="d-flex align-items-center justify-content-between mb-4">
                        <div style={{ color: '#8a7a6a', fontSize: '13px' }}>{collectionProducts.length} product{collectionProducts.length !== 1 ? 's' : ''} in this collection</div>
                        <button onClick={() => navigate('/collections')} style={{ background: 'transparent', border: '1px solid #3d3020', color: '#8a7a6a', padding: '6px 16px', borderRadius: '3px', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#c9a84c'; e.currentTarget.style.color = '#c9a84c'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#3d3020'; e.currentTarget.style.color = '#8a7a6a'; }}>
                            ← All Collections
                        </button>
                    </div>

                    {collectionProducts.length === 0 ? (
                        <div className="text-center py-5">
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
                            <div style={{ color: '#8a7a6a', fontSize: '14px', marginBottom: '20px' }}>No products in this collection yet.</div>
                            <button onClick={() => navigate('/shop')} style={{ background: '#c9a84c', color: '#0a0a0a', border: 'none', padding: '10px 24px', borderRadius: '4px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>Browse Shop</button>
                        </div>
                    ) : (
                        <div className="row g-3 g-md-4">
                            {collectionProducts.map(p => (
                                <div key={getProductId(p)} className="col-6 col-md-4 col-lg-3">
                                    <div className="h-100 overflow-hidden position-relative"
                                        style={{ background: '#141010', cursor: 'pointer', transition: 'transform 0.25s', border: '1px solid #2a1f10', borderRadius: '4px' }}
                                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = '#c9a84c'; }}
                                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#2a1f10'; }}>

                                        {/* Wishlist heart — LEFT side */}
                                        <button
                                            className="position-absolute d-flex align-items-center justify-content-center border-0 p-0"
                                            style={{ zIndex: 3, top: '10px', left: '10px', background: 'rgba(10,10,10,0.6)', backdropFilter: 'blur(4px)', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' }}
                                            onClick={(e) => { e.stopPropagation(); toggleWishlist(p); }}>
                                            <Heart
                                                size={16} strokeWidth={1.5}
                                                fill={isWishlisted(getProductId(p)) ? '#e74c3c' : 'none'}
                                                color={isWishlisted(getProductId(p)) ? '#e74c3c' : '#ffffff'}
                                                style={{ transition: 'all 0.2s', transform: isWishlisted(getProductId(p)) ? 'scale(1.2)' : 'scale(1)' }}
                                            />
                                        </button>

                                        {/* Discount / Out-of-stock badge — RIGHT side */}
                                        {p.stock <= 0 ? (
                                            <div className="shop-soldout-badge" style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(10,10,10,0.88)', backdropFilter: 'blur(6px)', border: '1px solid rgba(231,76,60,0.5)', borderRadius: '4px', padding: '5px 12px', zIndex: 2 }}>
                                                <span style={{ color: '#e74c3c', fontSize: '10px', fontWeight: 800, letterSpacing: '2px' }}>SOLD OUT</span>
                                            </div>
                                        ) : p.salePrice && p.price > p.salePrice ? (() => {
                                            const discount = Math.round(((p.price - p.salePrice) / p.price) * 100);
                                            return (
                                                <div className="shop-discount-badge" style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 2 }}>
                                                    <div style={{ background: 'rgba(10,10,10,0.9)', backdropFilter: 'blur(6px)', border: '1px solid rgba(201,168,76,0.5)', borderRadius: '6px', padding: '7px 12px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 12px rgba(201,168,76,0.15)' }}>
                                                        <span data-percent style={{ color: '#c9a84c', fontSize: '18px', fontWeight: 800, lineHeight: 1 }}>{discount}%</span>
                                                        <div className="shop-badge-divider" style={{ width: '1px', height: '18px', background: 'rgba(201,168,76,0.35)' }}></div>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                                                            <span className="shop-badge-text" style={{ color: '#fff', fontSize: '9px', fontWeight: 700, letterSpacing: '1.5px', lineHeight: 1 }}>SAVE</span>
                                                            <span className="shop-badge-text" style={{ color: '#8a7a6a', fontSize: '9px', fontWeight: 700, letterSpacing: '1.5px', lineHeight: 1 }}>OFF</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })() : null}

                                        <style>{`
                                            @media (max-width: 576px) {
                                                .shop-discount-badge { top: 6px !important; right: 6px !important; }
                                                .shop-discount-badge > div { padding: 4px 8px !important; gap: 5px !important; border-radius: 5px !important; }
                                                .shop-discount-badge [data-percent] { font-size: 13px !important; }
                                                .shop-discount-badge .shop-badge-divider { height: 12px !important; }
                                                .shop-discount-badge .shop-badge-text { font-size: 7px !important; letter-spacing: 1px !important; }
                                                .shop-soldout-badge { top: 6px !important; right: 6px !important; padding: 3px 8px !important; }
                                                .shop-soldout-badge span { font-size: 8px !important; letter-spacing: 1.5px !important; }
                                            }
                                        `}</style>

                                        {/* Image */}
                                        <div style={{ height: '220px', background: '#e5e5e5', overflow: 'hidden' }} onClick={() => navigate(`/product/${getProductId(p)}`)}>
                                            <img src={p.mainImage} alt={p.name} className="w-100 h-100" style={{ objectFit: 'cover', transition: 'transform 0.4s' }}
                                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
                                                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                                        </div>

                                        {/* Card Body */}
                                        <div className="p-3 text-center" style={{ background: '#141010' }} onClick={() => navigate(`/product/${getProductId(p)}`)}>
                                            <div className="text-white fw-bold mb-1" style={{ fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                                            <div className="mb-2" style={{ fontSize: '12px', color: '#c9a84c', letterSpacing: '0.5px' }}>Click to view details</div>
                                            <div className="d-flex align-items-center justify-content-center gap-1 mb-2">
                                                {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} fill={s <= Math.round(p.rating || 4) ? '#c9a84c' : 'none'} color="#c9a84c" />)}
                                            </div>
                                            <div className="mb-3 d-flex align-items-center justify-content-center gap-2">
                                                <span className="fw-semibold" style={{ color: '#c9a84c', fontSize: '15px' }}>Rs. {(p.salePrice || p.price).toLocaleString()}</span>
                                                {p.salePrice && <span className="text-decoration-line-through" style={{ color: '#555', fontSize: '11px' }}>Rs. {p.price.toLocaleString()}</span>}
                                            </div>
                                            <div className="d-flex flex-column gap-2">
                                                <button
                                                    className="btn w-100 d-flex align-items-center justify-content-center gap-2"
                                                    style={{
                                                        background: p.stock <= 0 ? '#1a1410' : '#c9a84c',
                                                        border: 'none',
                                                        padding: '7px 0', borderRadius: '4px', transition: 'all 0.2s',
                                                        opacity: p.stock <= 0 ? 0.5 : 1,
                                                        cursor: p.stock <= 0 ? 'not-allowed' : 'pointer'
                                                    }}
                                                    onMouseEnter={e => { if (p.stock > 0) e.currentTarget.style.backgroundColor = '#d4b050'; }}
                                                    onMouseLeave={e => { if (p.stock > 0) e.currentTarget.style.backgroundColor = '#c9a84c'; }}
                                                    disabled={p.stock <= 0}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (p.stock > 0) buyNow(p);
                                                    }}>
                                                    <Tag size={14} style={{ color: p.stock <= 0 ? '#555' : '#0a0a0a' }} />
                                                    <span className="fw-semibold" style={{ fontSize: '11px', letterSpacing: '0.5px', color: p.stock <= 0 ? '#555' : '#0a0a0a' }}>{p.stock <= 0 ? 'OUT OF STOCK' : 'BUY NOW'}</span>
                                                </button>
                                                <button
                                                    className="btn w-100 d-flex align-items-center justify-content-center gap-2"
                                                    style={{
                                                        background: p.stock <= 0 ? '#1a1410' : 'transparent',
                                                        border: `1px solid ${p.stock <= 0 ? '#3d3020' : 'rgba(201,168,76,0.3)'}`,
                                                        padding: '7px 0', borderRadius: '4px', transition: 'all 0.2s',
                                                        opacity: p.stock <= 0 ? 0.5 : 1,
                                                        cursor: p.stock <= 0 ? 'not-allowed' : 'pointer'
                                                    }}
                                                    onMouseEnter={e => { if (p.stock > 0) e.currentTarget.style.backgroundColor = 'rgba(201,168,76,0.1)'; }}
                                                    onMouseLeave={e => { if (p.stock > 0) e.currentTarget.style.backgroundColor = 'transparent'; }}
                                                    disabled={p.stock <= 0}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (p.stock > 0) addToCartWithoutRedirect(p);
                                                    }}>
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
                </div>
            </section>

            <SubscribeSection
                title={"GET EXCLUSIVE DROPS & OFFERS"}
                subtitle="Subscribe to get early access to new collections and special discounts."
                buttonText="SUBSCRIBE"
            />

            <Footer />
        </div>
    );
}
