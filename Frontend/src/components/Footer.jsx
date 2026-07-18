import React from 'react';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { FaInstagram, FaFacebookF, FaTiktok, FaYoutube, FaWhatsapp } from 'react-icons/fa';

const socialLinks = [
    { Icon: FaInstagram, href: 'https://www.instagram.com/shopvelnora.store?igsh=MWd2OHIzN2NhNnRueg%3D%3D&utm_source=qr' },
    { Icon: FaFacebookF, href: 'https://www.facebook.com/share/1ZzUV3b1za/?mibextid=wwXIfr' },
    { Icon: FaTiktok, href: 'https://www.tiktok.com/@shopvelnora.store?_r=1&_t=ZS-981Zv2xNMof' },
    { Icon: FaYoutube, href: 'https://www.youtube.com/@ShopVelnoraStore' },
    { Icon: FaWhatsapp, href: 'https://wa.me/923444133108' },
];

export default function Footer() {
    return (
        <footer
            className="pt-5 pb-3"
            style={{ background: '#0f0c09', borderTop: '1px solid #2a1f10' }}
        >
            <div className="container-fluid px-3 px-md-5">
                <div className="row mb-5 g-4">
                    <div className="col-lg-3 pe-lg-4">
                        <div className="d-flex align-items-center gap-3 mb-3">
                            <div
                                className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 position-relative"
                                style={{ width: '50px', height: '50px', border: '1px solid #C8A56A', overflow: 'hidden' }}
                            >
                                <img src="/images/logo.png" alt="VELNORA" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </div>
                            <div>
                                <div className="text-white" style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', letterSpacing: '4px' }}>VELNORA</div>
                                <div style={{ color: '#8a7a6a', fontSize: '9px', letterSpacing: '1px' }}>BAGS & JEWELLERY</div>
                            </div>
                        </div>
                        <p className="text-secondary mb-4" style={{ fontSize: '12px', lineHeight: 1.7 }}>
                            Your one-stop shop for premium bags and jewellery. Quality you love. Prices you trust.
                        </p>
                        <div className="d-flex gap-3">
                            {socialLinks.map(({ Icon, href }, i) => (
                                <a
                                    key={i}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="d-flex align-items-center justify-content-center rounded-circle text-decoration-none"
                                    style={{ width: '36px', height: '36px', border: '1px solid #4a3a28', color: '#d1c7bc', cursor: 'pointer', transition: 'all 0.2s' }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#C8A56A'; e.currentTarget.style.color = '#C8A56A'; e.currentTarget.style.boxShadow = '0 0 20px rgba(196,169,97,0.3)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#4a3a28'; e.currentTarget.style.color = '#d1c7bc'; e.currentTarget.style.boxShadow = 'none'; }}
                                >
                                    <Icon size={14} />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="col-6 col-md-3 col-lg-2 ps-lg-4">
                        <div className="fw-bold mb-3" style={{ color: '#C8A56A', fontSize: '13px', letterSpacing: '1px' }}>QUICK LINKS</div>
                        <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
                            {['Home', 'Shop', 'New Arrivals', 'About Us', 'Contact'].map(link => {
                                const routes = { Home: '/', Shop: '/shop', 'New Arrivals': '/new-arrivals', About: '/about', Contact: '/contact' };
                                return (
                                    <li key={link}>
                                        <a
                                            href={routes[link] || '#'}
                                            className="text-decoration-none"
                                            style={{ color: '#d1c7bc', fontSize: '13px', transition: 'color 0.2s' }}
                                            onMouseEnter={e => e.currentTarget.style.color = '#C8A56A'}
                                            onMouseLeave={e => e.currentTarget.style.color = '#d1c7bc'}
                                        >
                                            {link}
                                        </a>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    <div className="col-6 col-md-3 col-lg-2">
                        <div className="fw-bold mb-3" style={{ color: '#C8A56A', fontSize: '13px', letterSpacing: '1px' }}>CUSTOMER SERVICE</div>
                        <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
                            {['Shipping Policy', 'Returns & Exchanges', 'Privacy Policy', 'Terms & Conditions', 'FAQs', 'Track Your Order'].map(link => (
                                <li key={link}>
                                    <span
                                        style={{ color: '#d1c7bc', fontSize: '13px', cursor: 'pointer', transition: 'color 0.2s' }}
                                        onMouseEnter={e => e.currentTarget.style.color = '#C8A56A'}
                                        onMouseLeave={e => e.currentTarget.style.color = '#d1c7bc'}
                                    >
                                        {link}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="col-6 col-md-3 col-lg-2">
                        <div className="fw-bold mb-3" style={{ color: '#C8A56A', fontSize: '13px', letterSpacing: '1px' }}>CATEGORIES</div>
                        <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
                            {['Bags', 'Jewellery'].map(link => (
                                <li key={link}>
                                    <a
                                        href="/shop"
                                        className="text-decoration-none"
                                        style={{ color: '#d1c7bc', fontSize: '13px', transition: 'color 0.2s' }}
                                        onMouseEnter={e => e.currentTarget.style.color = '#C8A56A'}
                                        onMouseLeave={e => e.currentTarget.style.color = '#d1c7bc'}
                                    >
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="col-6 col-md-3 col-lg-3">
                        <div className="fw-bold mb-3" style={{ color: '#C8A56A', fontSize: '13px', letterSpacing: '1px' }}>CONTACT US</div>
                        {[{ Icon: Phone, text: '0344-4133108', href: 'tel:03444133108' }, { Icon: Mail, text: 'hello@shopvelnora.store', href: 'mailto:hello@shopvelnora.store' }, { Icon: MapPin, text: 'Gujranwala, Punjab, Pakistan' }].map(({ Icon, text, href }) => (
                            <div key={text} className="d-flex align-items-center gap-3 mb-3">
                                <Icon size={15} style={{ color: '#C8A56A' }} strokeWidth={1.5} />
                                {href ? (
                                    <a href={href} className="text-decoration-none" style={{ color: '#d1c7bc', fontSize: '13px' }}>{text}</a>
                                ) : (
                                    <span style={{ color: '#d1c7bc', fontSize: '13px' }}>{text}</span>
                                )}
                            </div>
                        ))}
                        <div className="d-flex align-items-start gap-3 mb-4">
                            <Clock size={15} style={{ color: '#C8A56A', marginTop: '2px' }} strokeWidth={1.5} />
                            <span style={{ color: '#d1c7bc', fontSize: '13px', lineHeight: 1.5 }}>Mon - Sun (10AM - 10PM)</span>
                        </div>
                    </div>
                </div>

                <div className="pt-3 d-flex flex-column flex-md-row align-items-center justify-content-between gap-3" style={{ borderTop: '1px solid #2a1f10' }}>
                    <span style={{ color: '#d1c7bc', fontSize: '12px' }}>
                        &copy; {new Date().getFullYear()} Velnora. All Rights Reserved.
                    </span>

                </div>
            </div>
        </footer>
    );
}
