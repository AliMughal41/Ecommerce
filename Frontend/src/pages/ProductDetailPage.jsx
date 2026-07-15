import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Star, ShoppingCart, Tag, ChevronRight, Minus, Plus, ShieldCheck, Truck, Shield, Lock } from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAlert } from '../context/AlertContext';
import API_URL from '../config';

export default function ProductDetailPage({ wishlist, setWishlist }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImageIdx, setSelectedImageIdx] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const { showAlert } = useAlert();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/api/products/${id}`);
                if (data.success) {
                    setProduct(data.product);
                }
            } catch (error) {
                console.error('Error fetching product', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);



    const getProductId = (p) => p?._id || p?.id || '';

    const isWishlisted = product ? wishlist.some(w => (w._id || w.id) === getProductId(product)) : false;

    const toggleWishlist = () => {
        if (!product) return;
        const pid = getProductId(product);
        if (isWishlisted) {
            setWishlist(w => w.filter(x => (x._id || x.id) !== pid));
            showAlert({ type: 'info', message: `${product.name} removed from Wishlist` });
        } else {
            setWishlist(w => [...w, product]);
            showAlert({ type: 'success', message: `${product.name} added to Wishlist!` });
        }
    };

    const addToCart = () => {
        if (!product || product.stock <= 0) return;

        const item = {
            id: getProductId(product),
            name: product.name,
            condition: product.condition || '9/10',
            size: product.size || null,
            color: product.color || null,
            category: product.category,
            price: product.salePrice || product.price || 0,
            img: product.mainImage || product.images?.[0]?.url || '',
            qty: quantity,
            stock: product.stock,
        };

        const existingCart = JSON.parse(localStorage.getItem('thriftora_cart') || '[]');
        const updatedCart = existingCart.map(i => ({ ...i }));
        const existingItem = updatedCart.find(i => i.id === item.id);

        if (existingItem) {
            if (existingItem.qty + quantity > product.stock) {
                showAlert({ type: 'warning', message: `Stock limit reached for ${product.name}` });
                return;
            }
            existingItem.qty += quantity;
        } else {
            updatedCart.push(item);
        }

        localStorage.setItem('thriftora_cart', JSON.stringify(updatedCart));
        window.dispatchEvent(new Event('cart-updated'));
        showAlert({ type: 'success', message: `${product.name} added to Cart!` });
    };

    const buyNow = () => {
        if (!product || product.stock <= 0) return;

        const item = {
            id: getProductId(product),
            name: product.name,
            condition: product.condition || '9/10',
            size: product.size || null,
            color: product.color || null,
            category: product.category,
            price: product.salePrice || product.price || 0,
            img: product.mainImage || product.images?.[0]?.url || '',
            qty: quantity,
            stock: product.stock,
        };

        navigate('/checkout', { state: { cart: [item] } });
    };

    if (loading) {
        return (
            <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
                <Navbar />
                <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
                    <div style={{ color: '#c9a84c', fontSize: '16px' }}>Loading...</div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!product) {
        return (
            <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
                <Navbar />
                <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
                    <div style={{ color: '#8a7a6a', fontSize: '18px', marginBottom: '16px' }}>Product not found</div>
                    <button className="btn fw-bold text-uppercase px-4 py-2" style={{ background: '#c9a84c', color: '#0a0a0a', fontSize: '12px', letterSpacing: '2px', border: 'none', borderRadius: '3px' }} onClick={() => navigate('/shop')}>
                        BACK TO SHOP
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    const images = product.images || [];
    const displayPrice = product.salePrice || product.price;
    const hasDiscount = product.salePrice && product.salePrice < product.price;

    return (
        <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
            <Navbar />

            <div className="container-fluid px-3 px-md-5 py-4" style={{ paddingTop: '96px' }}>

                {/* Breadcrumb */}
                <div className="d-flex align-items-center gap-2 mb-4" style={{ fontSize: '13px' }}>
                    <span style={{ color: '#8a7a6a', cursor: 'pointer' }} onClick={() => navigate('/')}>Home</span>
                    <ChevronRight size={12} style={{ color: '#3d3020' }} />
                    <span style={{ color: '#8a7a6a', cursor: 'pointer' }} onClick={() => navigate('/shop')}>Shop</span>
                    <ChevronRight size={12} style={{ color: '#3d3020' }} />
                    <span style={{ color: '#c9a84c' }}>{product.name}</span>
                </div>

                {/* Main Content */}
                <div className="row g-4 mb-5">

                    {/* LEFT: Image Gallery */}
                    <div className="col-lg-7">
                        <div style={{ background: '#0f0c09', border: '1px solid #2a1f10', borderRadius: '6px', overflow: 'hidden' }}>
                            {/* Main Image */}
                            <div style={{ width: '100%', aspectRatio: '1/1', overflow: 'hidden', background: '#141010' }} className="product-detail-gallery">
                                <img
                                    src={images.length > 0 ? images[selectedImageIdx]?.url : product.mainImage}
                                    alt={product.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                />
                            </div>
                            {/* Thumbnail Grid */}
                            {images.length > 1 && (
                                <div className="d-flex gap-2 p-3" style={{ borderTop: '1px solid #2a1f10', flexWrap: 'wrap' }}>
                                    {images.map((img, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => setSelectedImageIdx(idx)}
                                            style={{
                                                width: '70px', height: '70px', borderRadius: '4px', overflow: 'hidden', cursor: 'pointer',
                                                border: selectedImageIdx === idx ? '2px solid #c9a84c' : '1px solid #3d3020',
                                                opacity: selectedImageIdx === idx ? 1 : 0.6, transition: 'all 0.2s', flexShrink: 0
                                            }}>
                                            <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Image Collage Grid */}
                        {images.length > 1 && (
                            <div className="mt-3 product-detail-collage" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                {images.slice(0, 6).map((img, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedImageIdx(idx)}
                                        style={{
                                            aspectRatio: '1/1', borderRadius: '4px', overflow: 'hidden', cursor: 'pointer',
                                            border: selectedImageIdx === idx ? '2px solid #c9a84c' : '1px solid #2a1f10',
                                            background: '#141010', transition: 'border-color 0.2s'
                                        }}>
                                        <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Product Details */}
                    <div className="col-lg-5">
                        <div className="product-detail-sticky" style={{ position: 'sticky', top: '100px' }}>
                            {/* Category */}
                            <div style={{ fontSize: '12px', color: '#c9a84c', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 600 }}>
                                {product.category}
                            </div>

                            {/* Name */}
                            <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#fff', marginBottom: '12px', lineHeight: 1.2, fontFamily: "'Cormorant Garamond', serif" }}>
                                {product.name}
                            </h1>

                            {/* Rating */}
                            <div className="d-flex align-items-center gap-1 mb-4">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <Star key={s} size={16} fill={s <= Math.round(product.rating || 4) ? '#c9a84c' : 'none'} color="#c9a84c" />
                                ))}
                                <span style={{ fontSize: '13px', color: '#8a7a6a', marginLeft: '8px' }}>(4.0 Reviews)</span>
                            </div>

                            {/* Price */}
                            <div className="d-flex align-items-center gap-3 mb-4" style={{ paddingBottom: '20px', borderBottom: '1px solid #2a1f10' }}>
                                <span style={{ fontSize: '28px', fontWeight: 700, color: '#c9a84c' }}>
                                    Rs. {displayPrice.toLocaleString()}
                                </span>
                                {hasDiscount && (
                                    <>
                                        <span className="text-decoration-line-through" style={{ fontSize: '18px', color: '#555' }}>
                                            Rs. {product.price.toLocaleString()}
                                        </span>
                                        <span style={{ background: '#e74c3c20', color: '#e74c3c', fontSize: '12px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px' }}>
                                            -{Math.round(((product.price - product.salePrice) / product.price) * 100)}%
                                        </span>
                                    </>
                                )}
                            </div>

                            {/* Stock */}
                            <div className="mb-4" style={{ paddingBottom: '20px', borderBottom: '1px solid #2a1f10' }}>
                                <div style={{ fontSize: '13px', fontWeight: 600, color: product.stock <= 0 ? '#e74c3c' : product.stock <= 10 ? '#ff9800' : '#4caf50' }}>
                                    {product.stock <= 0
                                        ? 'Out of Stock'
                                        : product.stock <= 10
                                            ? `Only ${product.stock} left in stock - order soon!`
                                            : `In Stock (${product.stock} available)`
                                    }
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mb-4" style={{ paddingBottom: '20px', borderBottom: '1px solid #2a1f10' }}>
                                <h4 style={{ fontSize: '12px', fontWeight: 600, color: '#8a7a6a', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>Description</h4>
                                <p style={{ fontSize: '14px', color: '#a09080', lineHeight: 1.7, margin: 0 }}>
                                    {product.description || 'No description available for this product.'}
                                </p>
                            </div>

                            {/* Quantity Selector */}
                            <div className="mb-4" style={{ paddingBottom: '20px', borderBottom: '1px solid #2a1f10' }}>
                                <h4 style={{ fontSize: '12px', fontWeight: 600, color: '#8a7a6a', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>Quantity</h4>
                                <div className="d-flex align-items-center gap-0" style={{ border: '1px solid #3d3020', borderRadius: '4px', overflow: 'hidden', width: 'fit-content' }}>
                                    <button className="border-0 d-flex align-items-center justify-content-center"
                                        style={{ width: '40px', height: '40px', background: '#1a1410', color: '#c9a84c', cursor: 'pointer' }}
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                                        <Minus size={14} />
                                    </button>
                                    <span className="text-white text-center" style={{ width: '50px', fontSize: '16px', fontWeight: 600, background: '#141010', lineHeight: '40px' }}>
                                        {quantity}
                                    </span>
                                    <button className="border-0 d-flex align-items-center justify-content-center"
                                        style={{
                                            width: '40px', height: '40px', background: '#1a1410',
                                            color: quantity >= product.stock ? '#555' : '#c9a84c',
                                            cursor: quantity >= product.stock ? 'not-allowed' : 'pointer'
                                        }}
                                        disabled={quantity >= product.stock}
                                        onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}>
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="d-flex gap-3 mb-4 product-actions flex-wrap">
                                <button
                                    onClick={buyNow}
                                    disabled={product.stock <= 0}
                                    className="btn d-flex align-items-center justify-content-center gap-2 flex-grow-1"
                                    style={{
                                        background: product.stock <= 0 ? '#1a1410' : '#c9a84c',
                                        color: product.stock <= 0 ? '#555' : '#0a0a0a',
                                        border: 'none', padding: '14px', borderRadius: '4px', fontWeight: 700, fontSize: '14px', letterSpacing: '0.5px',
                                        opacity: product.stock <= 0 ? 0.5 : 1,
                                        cursor: product.stock <= 0 ? 'not-allowed' : 'pointer'
                                    }}>
                                    <Tag size={18} /> {product.stock <= 0 ? 'OUT OF STOCK' : 'BUY NOW'}
                                </button>
                                <button
                                    onClick={addToCart}
                                    disabled={product.stock <= 0}
                                    className="btn d-flex align-items-center justify-content-center gap-2 flex-grow-1"
                                    style={{
                                        background: 'transparent',
                                        border: `1px solid ${product.stock <= 0 ? '#3d3020' : '#c9a84c'}`,
                                        color: '#c9a84c', padding: '14px', borderRadius: '4px', fontWeight: 700, fontSize: '14px', letterSpacing: '0.5px',
                                        opacity: product.stock <= 0 ? 0.5 : 1,
                                        cursor: product.stock <= 0 ? 'not-allowed' : 'pointer'
                                    }}>
                                    <ShoppingCart size={18} /> {product.stock <= 0 ? 'OUT OF STOCK' : 'ADD TO CART'}
                                </button>
                                <button
                                    onClick={toggleWishlist}
                                    className="btn d-flex align-items-center justify-content-center"
                                    style={{ width: '52px', background: 'transparent', border: `1px solid ${isWishlisted ? '#e74c3c' : '#3d3020'}`, borderRadius: '4px', color: isWishlisted ? '#e74c3c' : '#fff', flexShrink: 0 }}>
                                    <Heart size={20} fill={isWishlisted ? '#e74c3c' : 'none'} />
                                </button>
                            </div>

                            {/* Trust Badges */}
                            <div className="d-flex flex-column gap-3">
                                {[
                                    { Icon: ShieldCheck, text: '100% Authentic Products' },
                                    { Icon: Truck, text: 'Free Delivery on Orders' },
                                    { Icon: Shield, text: '7 Days Easy Return' },
                                    { Icon: Lock, text: 'Secure Payment Gateway' },
                                ].map((b, i) => (
                                    <div key={i} className="d-flex align-items-center gap-3">
                                        <b.Icon size={16} style={{ color: '#c9a84c' }} strokeWidth={1.5} />
                                        <span style={{ fontSize: '13px', color: '#8a7a6a' }}>{b.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Bar */}
                <div className="mt-4 py-4" style={{ borderTop: '1px solid #3d3020' }}>
                    <div className="row g-3 align-items-center">
                        {[
                            { Icon: ShieldCheck, title: 'QUALITY CHECKED', desc: 'Every item is carefully inspected' },
                            { Icon: Tag, title: 'AFFORDABLE PRICES', desc: 'Best quality at unbeatable prices' },
                            { Icon: Truck, title: 'FAST DELIVERY', desc: 'Nationwide shipping' },
                            { Icon: Shield, title: 'EASY RETURNS', desc: '7 Days easy return policy' },
                        ].map((f, i) => (
                            <div key={i} className="col-6 col-md-3">
                                <div className="d-flex align-items-center gap-3 justify-content-center px-2">
                                    <div className="d-flex align-items-center justify-content-center flex-shrink-0"
                                        style={{ width: '40px', height: '40px', border: '1px solid #3d3020', borderRadius: '4px' }}>
                                        <f.Icon size={20} style={{ color: '#c9a84c' }} strokeWidth={1.3} />
                                    </div>
                                    <div>
                                        <div className="fw-bold text-white" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>{f.title}</div>
                                        <div style={{ color: '#8a7a6a', fontSize: '11px', lineHeight: 1.3 }}>{f.desc}</div>
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
