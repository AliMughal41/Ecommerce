import React, { useState } from 'react';
import { MapPin, Phone, Mail, MessageCircle, Send, ChevronDown, ChevronUp, ShieldCheck, Tag, Truck, Shield, Lock, CheckCircle, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAlert } from '../context/AlertContext';
import API_URL from '../config';

/* ─── FAQ DATA ──────────────────────────────────────────────────────── */
const faqs = [
    { q: 'How long does delivery take?', a: 'Standard delivery takes 3-5 business days across Pakistan. Express delivery (1-2 days) is available for major cities.' },
    { q: 'Can I return or exchange an item?', a: 'Yes! We offer a 7-day easy return and exchange policy. Items must be in original condition with tags intact.' },
    { q: 'How can I track my order?', a: 'Once your order is dispatched, you will receive a tracking number via SMS and email to monitor your delivery.' },
    { q: 'Do you offer cash on delivery?', a: 'Yes, we offer Cash on Delivery (COD) across Pakistan. Online payment via card, JazzCash, and EasyPaisa is also available.' },
    { q: 'Are your products original?', a: 'Absolutely! Every item in our store is 100% authentic and goes through a strict quality check before listing.' },
];

const features = [
    { Icon: ShieldCheck, title: 'QUALITY CHECKED', desc: 'Every item is inspected' },
    { Icon: Tag, title: 'AFFORDABLE PRICES', desc: 'Best quality at unbeatable prices' },
    { Icon: Truck, title: 'FAST DELIVERY', desc: 'Nationwide shipping' },
    { Icon: Shield, title: 'EASY RETURNS', desc: '7 Days easy return policy' },
    { Icon: Lock, title: 'SECURE PAYMENT', desc: '100% safe & secure checkout' },
];

/* ─── COMPONENT ──────────────────────────────────────────────────────── */
export default function ContactPage() {
    const [openFaq, setOpenFaq] = useState(null);
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [loading, setLoading] = useState(false);
    const { showAlert } = useAlert();

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!form.name || !form.email || !form.subject || !form.message) {
            showAlert({ type: 'error', message: 'Please fill in all fields.' });
            return;
        }

        setLoading(true);
        try {
            const { data } = await axios.post(`${API_URL}/api/contact`, form);
            if (data.success) {
                showAlert({ type: 'success', message: data.message || 'Your message has been sent successfully!' });
                setForm({ name: '', email: '', subject: '', message: '' });
            } else {
                showAlert({ type: 'error', message: data.message || 'Failed to send message.' });
            }
        } catch (error) {
            console.error('Contact submission error', error);
            const errMsg = error.response?.data?.message || 'Failed to connect to the server. Please try again later.';
            showAlert({ type: 'error', message: errMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
<div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: '#0a0a0a', minHeight: '100vh', color: '#fff', paddingTop: '130px' }}>
            <Navbar />

            {/* ── HERO + FORM SECTION ── */}
            <section className="py-5 about-hero-section" style={{ 
  height: '100vh', 
  minHeight: '600px', 
  maxWidth: '1920px',
  margin: '0 auto',
  background: '#0a0a0a',
  position: 'relative'
}}>
                <div className="container-fluid px-3 px-md-5">
                    <div className="row g-5 align-items-start">

                        {/* Left — Title + Image */}
                        <div className="col-lg-5">
                            <h1 className="text-white fw-bold text-uppercase mb-0"
                                style={{ fontFamily: "'Playfair Display','Times New Roman',serif", fontSize: 'clamp(42px, 6vw, 72px)', letterSpacing: '4px', lineHeight: 1 }}>
                                CONTACT US
                            </h1>
                            <div className="d-flex align-items-center gap-3 my-3" style={{ maxWidth: '320px' }}>
                                <div style={{ flex: 1, height: '1px', background: '#b89456' }}></div>
                                <Mail size={16} style={{ color: '#b89456' }} />
                                <div style={{ flex: 1, height: '1px', background: '#b89456' }}></div>
                            </div>
                            <p className="mb-4" style={{ color: '#a09080', fontSize: '15px', lineHeight: 1.8, maxWidth: '400px' }}>
                                We'd love to hear from you! Whether you have a question,
                                need help with an order, or just want to say hello —
                                we're here for you.
                            </p>
                            {/* // NAYA: */}
                            <div className="position-relative overflow-hidden" style={{ borderRadius: '4px', height: '340px' }}>
                                <div className="position-relative overflow-hidden" style={{ borderRadius: '4px', height: '280px', background: 'linear-gradient(to top, rgba(10,10,10,0.9) 0%, rgba(10,10,10,0.4) 40%, rgba(10,10,10,0.0) 100%)' }}>
                                    <img
                                        src="/images/hero.png"
                                        alt="Contact"
                                        className="w-100 h-100"
                                        style={{ objectFit: 'cover', objectPosition: 'center', display: 'block' }}
                                    />
                                </div>

                            </div>
                        </div>

                        {/* Right — Form */}
                        <div className="col-lg-7">
                            <div className="p-4 p-md-5" style={{ border: '1px solid #3d3020', borderRadius: '4px', background: '#0f0c09' }}>
                                <h4 className="fw-bold text-white text-uppercase mb-4" style={{ fontSize: '16px', letterSpacing: '3px' }}>
                                    SEND US A MESSAGE
                                </h4>
                                <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Your Name"
                                        value={form.name}
                                        onChange={handleChange}
                                        className="w-100 px-3 py-3"
                                        style={{
                                            background: '#1a1410', border: '1px solid #3d3020', borderRadius: '3px',
                                            color: '#fff', fontSize: '14px', outline: 'none'
                                        }}
                                        onFocus={e => e.target.style.borderColor = '#c9a84c'}
                                        onBlur={e => e.target.style.borderColor = '#3d3020'}
                                    />
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Your Email"
                                        value={form.email}
                                        onChange={handleChange}
                                        className="w-100 px-3 py-3"
                                        style={{
                                            background: '#1a1410', border: '1px solid #3d3020', borderRadius: '3px',
                                            color: '#fff', fontSize: '14px', outline: 'none'
                                        }}
                                        onFocus={e => e.target.style.borderColor = '#c9a84c'}
                                        onBlur={e => e.target.style.borderColor = '#3d3020'}
                                    />
                                    <input
                                        type="text"
                                        name="subject"
                                        placeholder="Subject"
                                        value={form.subject}
                                        onChange={handleChange}
                                        className="w-100 px-3 py-3"
                                        style={{
                                            background: '#1a1410', border: '1px solid #3d3020', borderRadius: '3px',
                                            color: '#fff', fontSize: '14px', outline: 'none'
                                        }}
                                        onFocus={e => e.target.style.borderColor = '#c9a84c'}
                                        onBlur={e => e.target.style.borderColor = '#3d3020'}
                                    />
                                    <textarea
                                        name="message"
                                        placeholder="Your Message"
                                        value={form.message}
                                        onChange={handleChange}
                                        rows={5}
                                        className="w-100 px-3 py-3"
                                        style={{
                                            background: '#1a1410', border: '1px solid #3d3020', borderRadius: '3px',
                                            color: '#fff', fontSize: '14px', outline: 'none', resize: 'vertical'
                                        }}
                                        onFocus={e => e.target.style.borderColor = '#c9a84c'}
                                        onBlur={e => e.target.style.borderColor = '#3d3020'}
                                    />
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn w-100 fw-bold text-uppercase d-flex align-items-center justify-content-center gap-2 py-3"
                                        style={{ background: '#c9a84c', color: '#0a0a0a', fontSize: '13px', letterSpacing: '2px', border: 'none', borderRadius: '3px', transition: 'background 0.2s', opacity: loading ? 0.7 : 1 }}
                                        onMouseEnter={e => !loading && (e.currentTarget.style.background = '#d4b050')}
                                        onMouseLeave={e => !loading && (e.currentTarget.style.background = '#c9a84c')}
                                    >
                                        <Send size={16} />
                                        {loading ? 'SENDING...' : 'SEND MESSAGE'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CONTACT INFO BAR ── */}
            {/* // PURANA section tag se le kar end tak replace karo: */}
            <section style={{ borderBottom: '1px solid #3d3020', background: '#0f0c09' }}>
                <div className="container-fluid px-3 px-md-5 py-4">
                    <div className="row g-0" style={{ border: '1px solid #3d3020', borderRadius: '4px', overflow: 'hidden' }}>
                        {[
                            { Icon: MapPin, title: 'VISIT OUR STORE', lines: ['Shop #12, 2nd Floor, Dolmen Mall', 'Tariq Road, Karachi,', 'Pakistan.'] },
                            { Icon: Phone, title: 'CALL US', lines: ['+92 300 1234567', 'Mon - Sun (10AM - 10PM)'] },
                            { Icon: Mail, title: 'EMAIL US', lines: ['hello@shopvelnora.store', 'We reply within 24 hours'] },
                            { Icon: MessageCircle, title: 'WHATSAPP US', lines: ['+92 300 1234567', 'Chat with us on WhatsApp'] },
                        ].map((item, i) => (
                            <div key={i} className="col-6 col-md-3 p-4"
                                style={{
                                    background: '#0a0a0a',
                                    borderRight: i < 3 ? '1px solid #3d3020' : 'none',
                                    cursor: 'pointer', transition: 'background 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#130f0a'}
                                onMouseLeave={e => e.currentTarget.style.background = '#0a0a0a'}>
                                <div className="d-flex align-items-center gap-3 mb-3">
                                    <div className="d-flex align-items-center justify-content-center flex-shrink-0"
                                        style={{ width: '48px', height: '48px', borderRadius: '50%', border: '1.5px solid #c9a84c', background: 'transparent' }}>
                                        <item.Icon size={20} style={{ color: '#c9a84c' }} strokeWidth={1.5} />
                                    </div>
                                    <div className="fw-bold text-uppercase" style={{ color: '#c9a84c', fontSize: '13px', letterSpacing: '1px' }}>{item.title}</div>
                                </div>
                                {item.lines.map((line, j) => (
                                    <div key={j} style={{ fontSize: '13px', color: '#a09080', lineHeight: 1.7, paddingLeft: '0' }}>{line}</div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── MAP + FAQ ── */}
            <section className="py-5" style={{ borderBottom: '1px solid #3d3020' }}>
                <div className="container-fluid px-3 px-md-5">
                    <div className="row g-4">

                        {/* Map */}
                        <div className="col-lg-5">
                            <div className="p-4" style={{ border: '1px solid #3d3020', borderRadius: '4px', background: '#0f0c09', height: '100%' }}>
                                <h4 className="fw-bold text-white text-uppercase mb-4" style={{ fontSize: '16px', letterSpacing: '3px' }}>FIND US</h4>
                                <div className="overflow-hidden mb-3" style={{ borderRadius: '4px', border: '1px solid #3d3020' }}>
                                    <iframe
                                        title="Velnora Location"
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3620.0!2d67.0299!3d24.8607!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb33e06651d4bbf%3A0x9cf92f44555a0c23!2sDolmen%20Mall%20Tariq%20Road!5e0!3m2!1sen!2s!4v1620000000000!5m2!1sen!2s"
                                        width="100%"
                                        height="280"
                                        style={{ border: 0, display: 'block', filter: 'grayscale(0.3) invert(0.9) hue-rotate(180deg)' }}
                                        allowFullScreen=""
                                        loading="lazy"
                                    />
                                </div>
                                <button
                                    className="btn fw-bold text-uppercase d-flex align-items-center gap-2 px-4 py-2"
                                    style={{ background: 'transparent', border: '1px solid #c9a84c', color: '#c9a84c', fontSize: '11px', letterSpacing: '1px', borderRadius: '3px' }}
                                    onClick={() => window.open('https://maps.google.com/?q=Dolmen+Mall+Tariq+Road+Karachi', '_blank')}
                                >
                                    <Send size={13} />
                                    GET DIRECTIONS
                                </button>
                            </div>
                        </div>

                        {/* FAQ */}
                        <div className="col-lg-7">
                            <div className="p-4" style={{ border: '1px solid #3d3020', borderRadius: '4px', background: '#0f0c09', height: '100%' }}>
                                <h4 className="fw-bold text-white text-uppercase mb-4" style={{ fontSize: '16px', letterSpacing: '3px' }}>
                                    FREQUENTLY ASKED QUESTIONS
                                </h4>
                                <div className="d-flex flex-column gap-2">
                                    {faqs.map((faq, i) => (
                                        <div key={i}
                                            style={{ border: '1px solid #3d3020', borderRadius: '3px', overflow: 'hidden', transition: 'border-color 0.2s' }}>
                                            <button
                                                className="w-100 d-flex align-items-center justify-content-between px-4 py-3 border-0 text-start"
                                                style={{ background: openFaq === i ? '#1a1410' : '#141010', cursor: 'pointer', outline: 'none' }}
                                                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                            >
                                                <span className="text-white fw-semibold" style={{ fontSize: '13px' }}>{faq.q}</span>
                                                {openFaq === i
                                                    ? <ChevronUp size={16} style={{ color: '#c9a84c', flexShrink: 0 }} />
                                                    : <ChevronDown size={16} style={{ color: '#8a7a6a', flexShrink: 0 }} />
                                                }
                                            </button>
                                            {openFaq === i && (
                                                <div className="px-4 py-3" style={{ background: '#1a1410', borderTop: '1px solid #3d3020' }}>
                                                    <p className="mb-0" style={{ color: '#a09080', fontSize: '13px', lineHeight: 1.7 }}>{faq.a}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <p className="mt-4 mb-0" style={{ fontSize: '13px', color: '#8a7a6a' }}>
                                    Still have questions?{' '}
                                    <span style={{ color: '#c9a84c', cursor: 'pointer', textDecoration: 'underline' }}>
                                        Contact our support team.
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FEATURES BAR ── */}
            <section style={{ background: '#0f0c09', borderBottom: '1px solid #2a1f10' }}>
                <div className="container-fluid px-3 px-md-5 py-4">
                    <div className="row g-3 align-items-center">
                        {features.map((f, i) => (
                            <div key={i} className="col-6 col-md-4 col-lg position-relative">
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
                                {i < features.length - 1 && (
                                    <div className="d-none d-lg-block position-absolute top-0 end-0 h-100"
                                        style={{ width: '1px', background: '#2a1f10' }}></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}