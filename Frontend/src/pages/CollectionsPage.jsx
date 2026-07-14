import React from 'react';
import { ShoppingBag, ShieldCheck, Tag, Truck, Shield, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SubscribeSection from '../components/SubscribeSection';

const collections = [
    {
        id: 1,
        name: 'LUXURY HANDBAGS',
        items: 96,
        description: 'Premium handbags crafted for elegance and timeless style.',
        icon: '👜',
        img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=500&fit=crop',
    },
    {
        id: 2,
        name: 'FINE JEWELLERY',
        items: 72,
        description: 'Exquisite diamond & gold pieces for every special occasion.',
        icon: '💎',
        img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=500&fit=crop',
    },
    {
        id: 3,
        name: 'DESIGNER BAGS',
        items: 48,
        description: 'Curated designer bags that define sophistication and luxury.',
        icon: '👛',
        img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=500&fit=crop',
    },
    {
        id: 4,
        name: 'GOLD COLLECTION',
        items: 58,
        description: 'Stunning gold jewellery crafted with precision and care.',
        icon: '✨',
        img: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&h=500&fit=crop',
    },
    {
        id: 5,
        name: 'WEDDING COLLECTION',
        items: 34,
        description: 'Bridal jewellery & bags for your special day.',
        icon: '💍',
        img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=500&fit=crop',
    },
    {
        id: 6,
        name: 'EVERYDAY BAGS',
        items: 64,
        description: 'Stylish and functional bags for your daily routine.',
        icon: '🛍️',
        img: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=500&fit=crop',
    },
    {
        id: 7,
        name: 'GIFT SETS',
        items: 42,
        description: 'Perfectly curated gift sets for your loved ones.',
        icon: '🎁',
        img: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=600&h=500&fit=crop',
    },
    {
        id: 8,
        name: 'ACCESSORIES',
        items: 26,
        description: 'Complete your look with our premium accessory collection.',
        icon: '✨',
        img: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=500&fit=crop',
    },
];

export default function CollectionsPage() {
    const navigate = useNavigate();

    return (
<div className="text-white" style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: '#0a0a0a', minHeight: '100vh', paddingTop: '130px' }}>
            <Navbar />

            {/* Page Header */}
            <section className="py-5 text-center" style={{ background: '#0a0a0a', borderBottom: '1px solid #3d3020' }}>
                <div className="container py-3">
                    <h1 className="text-white text-uppercase mb-3" style={{ fontFamily: "'Playfair Display','Times New Roman',serif", fontSize: 'clamp(36px, 6vw, 64px)', letterSpacing: '6px', fontWeight: 700 }}>
                        OUR COLLECTIONS
                    </h1>
                    {/* Decorative Divider */}
                    <div className="d-flex align-items-center justify-content-center gap-3 mb-4">
                        <div style={{ width: '80px', height: '1px', background: '#b89456' }}></div>
                        <ShoppingBag size={18} style={{ color: '#b89456' }} />
                        <div style={{ width: '80px', height: '1px', background: '#b89456' }}></div>
                    </div>
                    <p className="text-secondary mx-auto" style={{ fontSize: '16px', lineHeight: 1.6, maxWidth: '500px' }}>
                        Handpicked collections of premium thrifted shoes, bags and travel gear.<br />
                        Quality you love. Prices you trust.
                    </p>
                </div>
            </section>

            {/* Collections Grid */}
            <section className="py-5" style={{ background: '#0a0a0a' }}>
                <div className="container-fluid px-3 px-md-4">
                    <div className="row g-4 collections-grid">
                        {collections.map((col) => (
                            <div key={col.id} className="col-6 col-md-6 col-lg-3">
                                <div
                                    className="h-100 position-relative overflow-hidden"
                                    style={{ background: '#0f0c09', border: '1px solid #2a1f10', cursor: 'pointer', transition: 'transform 0.25s, border-color 0.25s', borderRadius: '2px' }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = '#b89456'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#2a1f10'; }}
                                >
                                    {/* Icon Badge */}
                                    <div className="position-absolute d-flex align-items-center justify-content-center rounded-circle"
                                        style={{ top: '14px', left: '50%', transform: 'translateX(-50%)', zIndex: 2, width: '48px', height: '48px', background: '#0a0a0a', border: '2px solid #b89456', fontSize: '20px' }}>
                                        {col.icon}
                                    </div>

                                    {/* Image */}
                                    <div style={{ height: '210px', overflow: 'hidden', background: '#1a1410' }}>
                                        <img
                                            src={col.img}
                                            alt={col.name}
                                            className="w-100 h-100"
                                            style={{ objectFit: 'cover', transition: 'transform 0.4s', filter: 'brightness(0.75)' }}
                                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.07)'}
                                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                        />
                                    </div>

                                    {/* Card Body */}
                                    <div className="p-3 text-center">
                                        <div className="fw-bold text-white mb-1 text-uppercase" style={{ fontSize: '15px', letterSpacing: '1.5px' }}>{col.name}</div>
                                        <div className="mb-2" style={{ color: '#b89456', fontSize: '12px', letterSpacing: '1px', fontWeight: 600 }}>{col.items} ITEMS</div>
                                        <p className="text-secondary mb-3" style={{ fontSize: '12px', lineHeight: 1.5 }}>{col.description}</p>
                                        <button
                                            className="btn w-100 fw-semibold text-uppercase"
                                            style={{ background: 'transparent', border: '1px solid #b89456', color: '#b89456', fontSize: '11px', letterSpacing: '1.5px', padding: '8px 0', borderRadius: '2px', transition: 'all 0.2s' }}
                                            onMouseEnter={e => { e.currentTarget.style.background = '#b89456'; e.currentTarget.style.color = '#0a0a0a'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#b89456'; }}
                                            onClick={() => navigate('/shop')}
                                        >
                                            EXPLORE COLLECTION
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Bar */}
            <section className="py-4" style={{ background: '#0f0c09', borderTop: '1px solid #2a1f10', borderBottom: '1px solid #2a1f10' }}>
                <div className="container-fluid px-3 px-md-5">
                    <div className="row g-3 align-items-center">
                        {[
                            { Icon: ShieldCheck, title: 'QUALITY CHECKED', sub: 'Every item is carefully inspected' },
                            { Icon: Tag, title: 'AFFORDABLE PRICES', sub: 'Best quality at unbeatable prices' },
                            { Icon: Truck, title: 'FAST DELIVERY', sub: 'Nationwide shipping' },
                            { Icon: Shield, title: 'EASY RETURNS', sub: '7 Days easy return policy' },
                            { Icon: Lock, title: 'SECURE PAYMENT', sub: '100% safe & secure checkout' },
                        ].map(({ Icon, title, sub }) => (
                            <div key={title} className="col-6 col-md-4 col-lg">
                                <div className="d-flex align-items-center gap-3 justify-content-center px-2">
                                    <Icon size={36} className="text-warning flex-shrink-0" strokeWidth={1.2} />
                                    <div className="text-start">
                                        <div className="fw-bold text-white" style={{ fontSize: '13px', letterSpacing: '0.5px' }}>{title}</div>
                                        <div className="text-secondary" style={{ fontSize: '11px', lineHeight: 1.3 }}>{sub}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="py-5" style={{ background: '#0a0a0a', borderBottom: '1px solid #2a1f10' }}>
                <div className="container-fluid px-3 px-md-5">
                    <div className="row align-items-center g-4">
                        {/* Left image decorative */}
                        <div className="col-lg-3 d-none d-lg-block">
                           <img
    src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300&h=220&fit=crop"
    alt="Newsletter"
    className="w-100 rounded"
    style={{ objectFit: 'cover', height: '160px', opacity: 0.7, filter: 'grayscale(20%)' }}
/>
                        </div>
                        <div className="col-lg-9">
                            <SubscribeSection
                                title="GET EXCLUSIVE DROPS & OFFERS"
                                subtitle="Subscribe to get early access to new collections and special discounts."
                                buttonText="SUBSCRIBE"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}