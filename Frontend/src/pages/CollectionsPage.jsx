import React, { useState, useEffect } from 'react';
import { ShoppingBag, ShieldCheck, Tag, Truck, Shield, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SubscribeSection from '../components/SubscribeSection';
import API_URL from '../config';

export default function CollectionsPage() {
    const navigate = useNavigate();
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCollections();
    }, []);

    const fetchCollections = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/api/collections`);
            if (data.success) {
                setCollections(data.collections.filter(c => c.status === 'Active'));
            }
        } catch (error) {
            console.error('Error fetching collections', error);
        } finally {
            setLoading(false);
        }
    };

    return (
<div className="text-white" style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: '#0a0a0a', minHeight: '100vh', paddingTop: '96px' }}>
            <Navbar />

            {/* Page Header */}
            <section className="py-5 text-center" style={{ background: '#0a0a0a', borderBottom: '1px solid #3d3020' }}>
                <div className="container py-3">
                    <h1 className="text-white text-uppercase mb-3" style={{ fontFamily: "'Playfair Display','Times New Roman',serif", fontSize: 'clamp(36px, 6vw, 64px)', letterSpacing: '6px', fontWeight: 700 }}>
                        OUR COLLECTIONS
                    </h1>
                    <div className="d-flex align-items-center justify-content-center gap-3 mb-4">
                        <div style={{ width: '80px', height: '1px', background: '#b89456' }}></div>
                        <ShoppingBag size={18} style={{ color: '#b89456' }} />
                        <div style={{ width: '80px', height: '1px', background: '#b89456' }}></div>
                    </div>
                    <p className="text-secondary mx-auto" style={{ fontSize: '16px', lineHeight: 1.6, maxWidth: '500px' }}>
                        Handpicked collections of premium products curated just for you.<br />
                        Quality you love. Prices you trust.
                    </p>
                </div>
            </section>

            {/* Collections Grid */}
            <section className="py-5" style={{ background: '#0a0a0a' }}>
                <div className="container-fluid px-3 px-md-4">
                    {loading ? (
                        <div className="text-center py-5">
                            <div style={{ color: '#c9a84c', fontSize: '14px' }}>Loading collections...</div>
                        </div>
                    ) : collections.length === 0 ? (
                        <div className="text-center py-5">
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
                            <div style={{ color: '#8a7a6a', fontSize: '14px' }}>No collections available yet.</div>
                        </div>
                    ) : (
                        <div className="row g-4 collections-grid">
                            {collections.map((col) => (
                                <div key={col._id} className="col-6 col-md-6 col-lg-3">
                                    <div
                                        className="h-100 position-relative overflow-hidden"
                                        style={{ background: '#0f0c09', border: '1px solid #2a1f10', cursor: 'pointer', transition: 'transform 0.25s, border-color 0.25s', borderRadius: '2px' }}
                                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = '#b89456'; }}
                                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#2a1f10'; }}
                                    >
                                        {/* Emoji Badge */}
                                        <div className="position-absolute d-flex align-items-center justify-content-center rounded-circle"
                                            style={{ top: '14px', left: '50%', transform: 'translateX(-50%)', zIndex: 2, width: '48px', height: '48px', background: '#0a0a0a', border: '2px solid #b89456', fontSize: '20px' }}>
                                            {col.emoji}
                                        </div>

                                        {/* Image */}
                                        <div style={{ height: '210px', overflow: 'hidden', background: '#1a1410' }}>
                                            {col.image ? (
                                                <img
                                                    src={col.image}
                                                    alt={col.name}
                                                    className="w-100 h-100"
                                                    style={{ objectFit: 'cover', transition: 'transform 0.4s', filter: 'brightness(0.75)' }}
                                                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.07)'}
                                                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                                />
                                            ) : (
                                                <div className="w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #1a1410, #2a1f10)', fontSize: '60px' }}>
                                                    {col.emoji}
                                                </div>
                                            )}
                                        </div>

                                        {/* Card Body */}
                                        <div className="p-3 text-center">
                                            <div className="fw-bold text-white mb-1 text-uppercase" style={{ fontSize: '15px', letterSpacing: '1.5px' }}>{col.name}</div>
                                            <p className="text-secondary mb-3" style={{ fontSize: '12px', lineHeight: 1.5 }}>{col.description}</p>
                                            <button
                                                className="btn w-100 fw-semibold text-uppercase"
                                                style={{ background: 'transparent', border: '1px solid #b89456', color: '#b89456', fontSize: '11px', letterSpacing: '1.5px', padding: '8px 0', borderRadius: '2px', transition: 'all 0.2s' }}
                                                onMouseEnter={e => { e.currentTarget.style.background = '#b89456'; e.currentTarget.style.color = '#0a0a0a'; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#b89456'; }}
                                                onClick={() => navigate(`/collection/${col._id}`)}
                                            >
                                                EXPLORE COLLECTION
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
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
                                title={"GET EXCLUSIVE DROPS & OFFERS"}
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
