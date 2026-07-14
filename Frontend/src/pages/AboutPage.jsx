import React from 'react';
import { ShieldCheck, Tag, Truck, Shield, Lock, Target, Eye, Heart, CheckCircle, ShoppingBag, Package, Smile, Leaf } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SubscribeSection from '../components/SubscribeSection';

/* ─── DATA ──────────────────────────────────────────────────────────── */
const whyFeatures = [
    { Icon: ShieldCheck, title: 'QUALITY CHECKED', desc: 'Every item goes through a strict quality check.' },
    { Icon: Tag, title: 'BEST PRICES', desc: 'Get premium brands at unbeatable prices.' },
    { Icon: Truck, title: 'FAST DELIVERY', desc: 'Nationwide shipping with care and speed.' },
    { Icon: Shield, title: 'EASY RETURNS', desc: '7 days easy return and exchange policy.' },
    { Icon: Lock, title: 'SECURE PAYMENT', desc: '100% safe and secure checkout experience.' },
];

const stats = [
    { Icon: ShoppingBag, value: '10,000+', label: 'Happy Customers' },
    { Icon: Package, value: '20,000+', label: 'Orders Delivered' },
    { Icon: Smile, value: '4.9/5', label: 'Customer Rating' },
    { Icon: Leaf, value: 'Sustainable', label: 'Better for Planet' },
];

const team = [
    { name: 'Ahmed Raza', role: 'FOUNDER & CEO', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&face' },
    { name: 'Fatima Khan', role: 'OPERATIONS MANAGER', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&face' },
    { name: 'Usman Ali', role: 'MARKETING HEAD', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&face' },
    { name: 'Hira Sheikh', role: 'CUSTOMER SUPPORT LEAD', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&face' },
];

/* ─── COMPONENT ─────────────────────────────────────────────────────── */
export default function AboutPage() {
    const navigate = useNavigate();

    return (
        <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>

            <Navbar />

            {/* ── HERO SECTION ── */}
            <section className="position-relative overflow-hidden about-hero-section" style={{ 
  height: '100vh', 
  minHeight: '600px', 
  maxWidth: '1920px',
  margin: '0 auto',
  background: '#0a0a0a',
  position: 'relative'
}}>
                <div className="position-absolute top-0 start-0 w-100 h-100" style={{ zIndex: 0 }}>
                    <div className="position-absolute top-0 start-0 w-100 h-100" style={{ zIndex: 0 }}>
                        <img src="/images/image1.png" alt="Hero" className="w-100 h-100"
                            style={{ objectFit: 'contain', objectPosition: 'center right', transform: 'scale(1.1)', transformOrigin: 'center right' }}
                        />
                    </div>
                    <div className="position-absolute top-0 start-0 w-100 h-100"
                        style={{ zIndex: 1, background: 'linear-gradient(to right, rgba(10,10,10,1) 0%, rgba(10,10,10,0.95) 22%, rgba(10,10,10,0.15) 42%, rgba(10,10,10,0.0) 55%)' }}>
                    </div>
                </div>
                <div className="container-fluid px-4 px-md-5 py-3 position-relative" style={{ zIndex: 2 }}>
                    <div className="row">
                        <div className="col-lg-6 py-3">
                            <div className="mb-3" style={{ color: '#c9a84c', fontSize: '13px', letterSpacing: '2px', fontWeight: 600 }}>ABOUT US</div>
                            <h1 className="text-white fw-bold text-uppercase mb-0"
                                style={{ fontFamily: "'Playfair Display','Times New Roman',serif", fontSize: 'clamp(38px, 6vw, 72px)', letterSpacing: '2px', lineHeight: 1.1 }}>
                                TIMELESS FINDS.<br />ENDLESS VALUE.
                            </h1>
                            <div className="d-flex align-items-center gap-3 my-3" style={{ maxWidth: '360px' }}>
                                <div style={{ flex: 1, height: '1px', background: '#b89456' }}></div>
                                <ShoppingBag size={16} style={{ color: '#b89456' }} />
                                <div style={{ flex: 1, height: '1px', background: '#b89456' }}></div>
                            </div>
                            <p className="mb-4" style={{ color: '#a09080', fontSize: '15px', lineHeight: 1.8, maxWidth: '420px' }}>
                                Velora is more than just a store — it's a movement towards sustainable fashion and smart shopping. We handpick premium quality shoes, bags and travel gear so you can enjoy top brands at the best prices.
                            </p>
                            <button
                                className="btn fw-bold text-uppercase px-4 py-2"
                                style={{ background: 'transparent', border: '1px solid #c9a84c', color: '#c9a84c', fontSize: '12px', letterSpacing: '2px', borderRadius: '3px', transition: 'all 0.2s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#c9a84c'; e.currentTarget.style.color = '#0a0a0a'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#c9a84c'; }}
                                onClick={() => navigate('/collections')}
                            >
                                SHOP OUR COLLECTIONS
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── MISSION / VISION / VALUES ── */}
            <section style={{ borderBottom: '1px solid #3d3020', background: 'linear-gradient(135deg, #0f0c09 0%, #1a1208 50%, #0f0c09 100%)' }}>
                <div className="container-fluid px-3 px-md-5 py-5">
                    <div className="row g-0" style={{ border: '1px solid #3d3020', borderRadius: '6px', overflow: 'hidden' }}>

                        {/* Mission */}
                        <div className="col-md-4 p-4 p-md-5 position-relative"
                            style={{ borderRight: '1px solid #3d3020', background: 'linear-gradient(160deg, #1a1208 0%, #0d0a06 100%)' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', height: '100%', background: 'linear-gradient(to bottom, #c9a84c, transparent)' }}></div>
                            <Target size={52} style={{ color: '#c9a84c', marginBottom: '16px', opacity: 0.9 }} strokeWidth={1.0} />
                            <div className="fw-bold text-white text-uppercase mb-3" style={{ fontSize: '14px', letterSpacing: '3px' }}>OUR MISSION</div>
                            <p style={{ color: '#a09080', fontSize: '14px', lineHeight: 1.9, marginBottom: 0 }}>
                                To provide high-quality, authentic thrifted products that combine style, affordability, and sustainability.
                            </p>
                        </div>

                        {/* Vision */}
                        <div className="col-md-4 p-4 p-md-5 position-relative"
                            style={{ borderRight: '1px solid #3d3020', background: 'linear-gradient(160deg, #120e07 0%, #1a1208 100%)' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', height: '100%', background: 'linear-gradient(to bottom, #c9a84c, transparent)' }}></div>
                            <Eye size={52} style={{ color: '#c9a84c', marginBottom: '16px', opacity: 0.9 }} strokeWidth={1.0} />
                            <div className="fw-bold text-white text-uppercase mb-3" style={{ fontSize: '14px', letterSpacing: '3px' }}>OUR VISION</div>
                            <p style={{ color: '#a09080', fontSize: '14px', lineHeight: 1.9, marginBottom: 0 }}>
                                To become Pakistan's most trusted online thrift store, inspiring a community that values quality and conscious consumerism.
                            </p>
                        </div>

                        {/* Values */}
                        <div className="col-md-4 p-4 p-md-5 position-relative"
                            style={{ background: 'linear-gradient(160deg, #1a1208 0%, #0d0a06 100%)' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', height: '100%', background: 'linear-gradient(to bottom, #c9a84c, transparent)' }}></div>
                            <Heart size={52} style={{ color: '#c9a84c', marginBottom: '16px', opacity: 0.9 }} strokeWidth={1.0} />
                            <div className="fw-bold text-white text-uppercase mb-3" style={{ fontSize: '14px', letterSpacing: '3px' }}>OUR VALUES</div>
                            <div className="d-flex flex-column gap-3">
                                {['Quality You Can Trust', 'Affordable for Everyone', 'Sustainable Choices', 'Customer First'].map((v, i) => (
                                    <div key={i} className="d-flex align-items-center gap-2">
                                        <CheckCircle size={16} style={{ color: '#c9a84c', flexShrink: 0 }} strokeWidth={1.5} />
                                        <span style={{ color: '#a09080', fontSize: '14px' }}>{v}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* ── WHY CHOOSE VELNORA ── */}
            <section style={{ borderBottom: '1px solid #3d3020', background: '#0a0a0a' }}>
                <div className="container-fluid px-3 px-md-5 py-5">
                    <div className="row g-4 align-items-start">

                        {/* Left text */}
                        <div className="col-lg-3">
                            <div className="mb-2" style={{ color: '#c9a84c', fontSize: '12px', letterSpacing: '2px', fontWeight: 600 }}>WHY CHOOSE VELNORA?</div>
                            <h2 className="fw-bold text-white text-uppercase mb-3"
                                style={{ fontFamily: "'Playfair Display','Times New Roman',serif", fontSize: '28px', lineHeight: 1.2 }}>
                                SMART SHOPPING.<br />BETTER PLANET.
                            </h2>
                            <p style={{ color: '#a09080', fontSize: '13px', lineHeight: 1.8, marginBottom: '24px' }}>
                                Every product is carefully inspected and authenticated to ensure you receive the best quality. By choosing thrifted, you're not just saving money — you're helping reduce waste and build a better future.
                            </p>
                            <button
                                className="btn fw-bold text-uppercase px-4 py-2"
                                style={{ background: 'transparent', border: '1px solid #c9a84c', color: '#c9a84c', fontSize: '11px', letterSpacing: '2px', borderRadius: '3px', transition: 'all 0.2s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#c9a84c'; e.currentTarget.style.color = '#0a0a0a'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#c9a84c'; }}
                            >
                                LEARN MORE
                            </button>
                        </div>

                        {/* Right feature cards */}
                        <div className="col-lg-9">
                            <div className="row g-3">
                                {whyFeatures.map((f, i) => (
                                    <div key={i} className="col-6 col-md-4 col-lg">
                                        <div className="p-4 text-center h-100 d-flex flex-column align-items-center gap-3"
                                            style={{ border: '1px solid #3d3020', borderRadius: '4px', background: '#0f0c09', transition: 'border-color 0.2s, transform 0.2s', cursor: 'default' }}
                                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#c9a84c'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#3d3020'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                                            <f.Icon size={38} style={{ color: '#c9a84c' }} strokeWidth={1.0} />
                                            <div className="fw-bold text-white text-uppercase" style={{ fontSize: '12px', letterSpacing: '1px' }}>{f.title}</div>
                                            <div style={{ color: '#8a7a6a', fontSize: '12px', lineHeight: 1.6 }}>{f.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── STATS BAR ── */}
            <section style={{ borderBottom: '1px solid #3d3020', background: '#0f0c09' }}>
                <div className="container-fluid px-3 px-md-5 py-4">
                    <div className="row g-0">
                        {stats.map((s, i) => (
                            <div key={i} className="col-6 col-md-3 py-4 px-3 text-center"
                                style={{ borderRight: i < stats.length - 1 ? '1px solid #3d3020' : 'none' }}>
                                <div className="d-flex align-items-center justify-content-center gap-3">
                                    <s.Icon size={36} style={{ color: '#c9a84c' }} strokeWidth={1.0} />
                                    <div className="text-start">
                                        <div className="fw-bold text-white" style={{ fontSize: '22px', letterSpacing: '1px', lineHeight: 1.1 }}>{s.value}</div>
                                        <div style={{ color: '#8a7a6a', fontSize: '12px', marginTop: '2px' }}>{s.label}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── OUR TEAM ── */}
            <section style={{ borderBottom: '1px solid #3d3020', background: '#0a0a0a' }}>
                <div className="container-fluid px-3 px-md-5 py-5">
                    <h2 className="text-center fw-bold text-uppercase mb-2" style={{ fontSize: '28px', letterSpacing: '5px' }}>OUR TEAM</h2>
                    <div className="mx-auto mb-5" style={{ width: '60px', height: '2px', background: '#c9a84c' }}></div>
                    <div className="row g-4">
                        {team.map((member, i) => (
                            <div key={i} className="col-6 col-md-3">
                                <div className="overflow-hidden"
                                    style={{ border: '1px solid #3d3020', borderRadius: '4px', background: '#0f0c09', transition: 'border-color 0.2s, transform 0.2s', cursor: 'default' }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#c9a84c'; e.currentTarget.style.transform = 'translateY(-6px)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#3d3020'; e.currentTarget.style.transform = 'translateY(0)'; }}>

                                    {/* Photo */}
                                    <div className="position-relative overflow-hidden" style={{ height: '260px' }}>
                                        <img src={member.img} alt={member.name} className="w-100 h-100"
                                            style={{ objectFit: 'cover', objectPosition: 'center top', transition: 'transform 0.4s' }}
                                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                                        <div className="position-absolute bottom-0 start-0 w-100"
                                            style={{ height: '60%', background: 'linear-gradient(to top, rgba(10,10,10,0.9) 0%, rgba(10,10,10,0) 100%)' }}>
                                        </div>
                                        {/* Name overlay */}
                                        <div className="position-absolute bottom-0 start-0 w-100 p-3">
                                            <div className="fw-bold text-white" style={{ fontSize: '15px' }}>{member.name}</div>
                                            <div style={{ color: '#c9a84c', fontSize: '11px', letterSpacing: '1px', fontWeight: 600 }}>{member.role}</div>
                                        </div>
                                    </div>

                                    {/* Social icons */}
                                    <div className="d-flex align-items-center gap-3 px-3 py-3" style={{ borderTop: '1px solid #2a1f10' }}>
                                        // NAYA:
                                        {['in', 'f', 'ig'].map((icon, j) => (
                                            <span key={j}
                                                style={{ color: '#8a7a6a', cursor: 'pointer', fontSize: '11px', fontWeight: 800, letterSpacing: '0.5px', transition: 'color 0.2s' }}
                                                onMouseEnter={e => e.currentTarget.style.color = '#c9a84c'}
                                                onMouseLeave={e => e.currentTarget.style.color = '#8a7a6a'}>
                                                {icon}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <SubscribeSection
                title="STAY UPDATED"
                subtitle="Subscribe to get early access to new arrivals and exclusive offers."
                buttonText="SUBSCRIBE"
            />

            <Footer />
        </div>
    );
}