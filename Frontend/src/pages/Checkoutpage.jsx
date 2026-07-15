import React, { useState } from 'react';
import { MapPin, Phone, Mail, MessageCircle, ShieldCheck, Shield, Truck, User, Lock, Tag, CreditCard, CheckCircle, ChevronRight, Minus, Plus, LogIn, UserPlus } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import API_URL from '../config';

/* ─── ORDER ITEMS (populated from Cart via navigation state) ───────────────────────────────────── */
const orderItems = [];

const provinces = ['Select your province', 'Punjab', 'Sindh', 'KPK', 'Balochistan', 'Islamabad (ICT)', 'Gilgit-Baltistan', 'AJK'];

const features = [
    { Icon: ShieldCheck, title: 'QUALITY CHECKED', desc: 'Every item is inspected' },
    { Icon: Tag, title: 'BEST PRICES', desc: 'Unbeatable prices on top brands' },
    { Icon: Shield, title: 'EASY RETURNS', desc: '7 days return & exchange' },
    { Icon: Lock, title: 'SECURE PAYMENT', desc: '100% safe & secure checkout' },
];

/* ─── INPUT COMPONENT ───────────────────────────────────────────────── */
const Input = ({ label, placeholder, required, type = 'text', value, onChange, name }) => (
    <div>
        <label style={{ fontSize: '14px', color: '#a09080', marginBottom: '8px', display: 'block', letterSpacing: '0.5px' }}>
            {label} {required && <span style={{ color: '#c9a84c' }}>*</span>}
        </label>
        <input
            type={type}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            style={{
                width: '100%', background: '#1a1410', border: '1px solid #3d3020',
                borderRadius: '3px', color: '#fff', fontSize: '14px',
                padding: '12px 16px', outline: 'none', transition: 'border-color 0.2s'
            }}
            onFocus={e => e.target.style.borderColor = '#c9a84c'}
            onBlur={e => e.target.style.borderColor = '#3d3020'}
        />
    </div>
);

const Select = ({ label, required, options, value, onChange, name }) => (
    <div>
        <label style={{ fontSize: '14px', color: '#a09080', marginBottom: '8px', display: 'block', letterSpacing: '0.5px' }}>
            {label} {required && <span style={{ color: '#c9a84c' }}>*</span>}
        </label>
        <select
            name={name}
            value={value}
            onChange={onChange}
            style={{
                width: '100%', background: '#1a1410', border: '1px solid #3d3020',
                borderRadius: '3px', color: value === options[0] ? '#666' : '#fff',
                fontSize: '13px', padding: '10px 14px', outline: 'none',
                appearance: 'none', cursor: 'pointer', transition: 'border-color 0.2s'
            }}
            onFocus={e => e.target.style.borderColor = '#c9a84c'}
            onBlur={e => e.target.style.borderColor = '#3d3020'}
        >
            {options.map((o, i) => (
                <option key={i} value={o} style={{ background: '#1a1410', color: '#fff' }}>{o}</option>
            ))}
        </select>
    </div>
);

/* ─── COMPONENT ─────────────────────────────────────────────────────── */
export default function CheckoutPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { customer, token } = useCustomerAuth();
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [notes, setNotes] = useState('');
    const [currentStep, setCurrentStep] = useState(1);
    const [createdOrder, setCreatedOrder] = useState(null);
    const [form, setForm] = useState({
        fullName: customer ? `${customer.firstName} ${customer.lastName}` : '',
        phone: customer?.phone || '',
        email: customer?.email || '',
        whatsapp: '',
        address1: '', address2: '', city: '', province: provinces[0],
        postal: '', country: 'Pakistan'
    });

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const initialCart = location.state?.cart || JSON.parse(localStorage.getItem('thriftora_cart') || '[]');
    const [cartItems, setCartItems] = useState(initialCart);
    const subtotal = cartItems.reduce((s, i) => s + (i.price * (i.qty || 1)), 0);
    const itemCount = cartItems.reduce((s, i) => s + (i.qty || 1), 0);

    const updateQty = (id, delta) => {
        setCartItems(prev => prev.map(item => {
            if (item.id !== id) return item;
            const newQty = item.qty + delta;
            if (newQty < 1) return item;
            if (delta > 0 && item.stock && newQty > item.stock) return item;
            return { ...item, qty: newQty };
        }));
    };

    const handleGoToReview = () => {
        if (!form.fullName || !form.phone || !form.address1 || !form.city || !form.province || form.province === provinces[0]) {
            setMessage('Please complete the required shipping information.');
            return;
        }

        setMessage('');
        setCurrentStep(2);
    };

    const handleConfirmOrder = async () => {
        setLoading(true);
        setMessage('');

        try {
            const payload = {
                customer: {
                    ...form,
                    paymentMethod,
                    notes,
                },
                items: cartItems.map(item => ({
                    productId: item.productId || item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.qty || 1,
                    image: item.img || '',
                    size: item.size || '',
                    color: item.color || '',
                    category: item.category || '',
                })),
                subtotal,
                shippingFee: 0,
                total: subtotal,
                isGuest: !customer,
                customerRef: customer?._id || null,
            };

            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const { data } = await axios.post(`${API_URL}/api/orders`, payload, { headers });
            if (data.success) {
                setCreatedOrder(data.order);
                setCurrentStep(3);
            }
        } catch (error) {
            setMessage(error.response?.data?.message || 'Unable to place order right now.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>

            <Navbar />

            <div className="container-fluid px-3 px-md-5 py-4" style={{ paddingTop: '96px' }}>

                {/* ── BREADCRUMB ── */}
                <div className="d-flex align-items-center gap-2 mb-4" style={{ fontSize: '15px' }}>
                    <span style={{ color: '#8a7a6a', cursor: 'pointer' }} onClick={() => navigate('/')}>Home</span>
                    <ChevronRight size={14} style={{ color: '#3d3020' }} />
                    <span style={{ color: '#8a7a6a', cursor: 'pointer' }} onClick={() => navigate('/cart')}>Your Cart</span>
                    <ChevronRight size={14} style={{ color: '#3d3020' }} />
                    <span style={{ color: '#c9a84c' }}>Checkout</span>
                </div>

                {/* ── STEPPER ── */}
                <div className="d-flex align-items-center mb-5 checkout-stepper">
                    {[{ step: 1, title: 'Shipping Information' }, { step: 2, title: 'Order Review' }, { step: 3, title: 'Order Placed' }].map((item, index) => {
                        const isActive = currentStep === item.step;
                        const isDone = currentStep > item.step;
                        return (
                            <React.Fragment key={item.step}>
                                <div className="d-flex align-items-center gap-2">
                                    <div className="d-flex align-items-center justify-content-center"
                                        style={{ width: '36px', height: '36px', borderRadius: '50%', border: `2px solid ${isActive || isDone ? '#c9a84c' : '#3d3020'}`, background: isActive || isDone ? '#c9a84c' : 'transparent', color: isActive || isDone ? '#0a0a0a' : '#8a7a6a', fontWeight: 700, fontSize: '14px', flexShrink: 0 }}>
                                        {item.step}
                                    </div>
                                    <span className="fw-bold" style={{ color: isActive || isDone ? '#c9a84c' : '#8a7a6a', fontSize: '13px', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{item.title}</span>
                                </div>
                                {index < 2 && <div style={{ flex: 1, height: '1px', background: '#3d3020', margin: '0 12px' }}></div>}
                            </React.Fragment>
                        );
                    })}
                </div>

                <div className="row g-4">

                    {/* ── LEFT: FORM / REVIEW / CONFIRMATION ── */}
                    <div className="col-lg-7">
                        {!customer && currentStep === 1 && (
                            <div className="d-flex align-items-center justify-content-between p-3 mb-4" style={{ border: '1px solid #3d3020', borderRadius: '6px', background: 'rgba(201,168,76,0.05)' }}>
                                <div className="d-flex align-items-center gap-3">
                                    <LogIn size={20} style={{ color: '#c9a84c' }} />
                                    <div>
                                        <div className="fw-semibold" style={{ color: '#fff', fontSize: '14px' }}>Already have an account?</div>
                                        <div style={{ color: '#8a7a6a', fontSize: '12px' }}>Login or create an account for faster checkout</div>
                                    </div>
                                </div>
                                <div className="d-flex gap-2">
                                    <button className="btn btn-sm fw-bold text-uppercase" style={{ background: '#c9a84c', color: '#0a0a0a', padding: '6px 14px', borderRadius: '3px', fontSize: '11px' }} onClick={() => navigate('/login')}>Login</button>
                                    <button className="btn btn-sm fw-bold text-uppercase" style={{ background: 'transparent', border: '1px solid #3d3020', color: '#c9a84c', padding: '6px 14px', borderRadius: '3px', fontSize: '11px' }} onClick={() => navigate('/register')}>Register</button>
                                </div>
                            </div>
                        )}
                        {currentStep === 1 && (
                            <>
                                <div className="p-4 mb-4" style={{ border: '1px solid #3d3020', borderRadius: '4px', background: '#0f0c09' }}>
                                    <div className="d-flex align-items-center gap-3 mb-1">
                                        <MapPin size={22} style={{ color: '#c9a84c' }} strokeWidth={1.5} />
                                        <div>
                                            <div className="fw-bold text-white text-uppercase" style={{ fontSize: '17px', letterSpacing: '2px' }}>SHIPPING INFORMATION</div>
                                            <div style={{ color: '#8a7a6a', fontSize: '14px' }}>Please provide your details to complete the order.</div>
                                        </div>
                                    </div>
                                    <div style={{ height: '1px', background: '#2a1f10', margin: '16px 0 20px' }}></div>

                                    <div className="row g-3">
                                        <div className="col-md-6"><Input label="Full Name" placeholder="Enter your full name" required name="fullName" value={form.fullName} onChange={handleChange} /></div>
                                        <div className="col-md-6"><Input label="Phone Number" placeholder="03xxxxxxxxx" required name="phone" value={form.phone} onChange={handleChange} type="tel" /></div>
                                        <div className="col-md-6"><Input label="Email Address (Optional)" placeholder="Enter your email address" name="email" value={form.email} onChange={handleChange} type="email" /></div>
                                        <div className="col-md-6"><Input label="WhatsApp Number (Optional)" placeholder="03xxxxxxxxx" name="whatsapp" value={form.whatsapp} onChange={handleChange} type="tel" /></div>
                                        <div className="col-12"><Input label="Address Line 1" placeholder="House No., Street Address" required name="address1" value={form.address1} onChange={handleChange} /></div>
                                        <div className="col-12"><Input label="Address Line 2 (Optional)" placeholder="Apartment, Flat, Building, Floor, etc." name="address2" value={form.address2} onChange={handleChange} /></div>
                                        <div className="col-md-6"><Input label="City / Town" placeholder="Enter your city" required name="city" value={form.city} onChange={handleChange} /></div>
                                        <div className="col-md-6"><Select label="Province / State" required options={provinces} name="province" value={form.province} onChange={handleChange} /></div>
                                        <div className="col-md-6"><Input label="Postal Code (Optional)" placeholder="Enter postal code" name="postal" value={form.postal} onChange={handleChange} /></div>
                                        <div className="col-md-6"><Select label="Country" required options={['Pakistan']} name="country" value={form.country} onChange={handleChange} /></div>
                                    </div>
                                </div>

                                <div className="p-4 mb-4" style={{ border: '1px solid #3d3020', borderRadius: '4px', background: '#0f0c09' }}>
                                    <div className="d-flex align-items-center gap-3 mb-1">
                                        <Truck size={22} style={{ color: '#c9a84c' }} strokeWidth={1.5} />
                                        <div>
                                            <div className="fw-bold text-white text-uppercase" style={{ fontSize: '17px', letterSpacing: '2px' }}>DELIVERY INFORMATION</div>
                                            <div style={{ color: '#8a7a6a', fontSize: '12px' }}>Help us deliver your order smoothly.</div>
                                        </div>
                                    </div>
                                    <div style={{ height: '1px', background: '#2a1f10', margin: '16px 0 20px' }}></div>
                                    <div>
                                        <label style={{ fontSize: '14px', color: '#a09080', marginBottom: '8px', display: 'block' }}>Order Notes (Optional)</label>
                                        <textarea placeholder="Any special instructions for delivery?" value={notes} onChange={e => setNotes(e.target.value.slice(0, 200))} rows={4} style={{ width: '100%', background: '#1a1410', border: '1px solid #3d3020', borderRadius: '3px', color: '#fff', fontSize: '14px', padding: '12px 16px', outline: 'none', resize: 'vertical', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor = '#c9a84c'} onBlur={e => e.target.style.borderColor = '#3d3020'} />
                                        <div className="text-end mt-1" style={{ fontSize: '15px', color: '#555' }}>{notes.length}/200</div>
                                    </div>
                                </div>

                                <div className="p-4 mb-4" style={{ border: '1px solid #3d3020', borderRadius: '4px', background: '#0f0c09' }}>
                                    <div className="d-flex align-items-center gap-3 mb-1">
                                        <CreditCard size={22} style={{ color: '#c9a84c' }} strokeWidth={1.5} />
                                        <div>
                                            <div className="fw-bold text-white text-uppercase" style={{ fontSize: '15px', letterSpacing: '2px' }}>PAYMENT METHOD</div>
                                            <div style={{ color: '#8a7a6a', fontSize: '14px' }}>Choose a payment method.</div>
                                        </div>
                                    </div>
                                    <div style={{ height: '1px', background: '#2a1f10', margin: '16px 0 20px' }}></div>
                                    <div className="d-flex align-items-center justify-content-between p-3 mb-3" style={{ border: `1px solid ${paymentMethod === 'cod' ? '#c9a84c' : '#3d3020'}`, borderRadius: '4px', background: paymentMethod === 'cod' ? 'rgba(201,168,76,0.08)' : '#141010', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => setPaymentMethod('cod')}>
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="d-flex align-items-center justify-content-center" style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${paymentMethod === 'cod' ? '#c9a84c' : '#555'}`, flexShrink: 0 }}>{paymentMethod === 'cod' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#c9a84c' }}></div>}</div>
                                            <div>
                                                <div className="fw-bold text-white" style={{ fontSize: '15px' }}>Cash on Delivery (COD)</div>
                                                <div style={{ color: '#8a7a6a', fontSize: '14px' }}>Pay in cash when you receive your order.</div>
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '24px' }}>💵</div>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-between p-3" style={{ border: `1px solid ${paymentMethod === 'whatsapp' ? '#25d366' : '#3d3020'}`, borderRadius: '4px', background: paymentMethod === 'whatsapp' ? 'rgba(37,211,102,0.06)' : '#141010', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => setPaymentMethod('whatsapp')}>
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="d-flex align-items-center justify-content-center" style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${paymentMethod === 'whatsapp' ? '#25d366' : '#555'}`, flexShrink: 0 }}>{paymentMethod === 'whatsapp' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#25d366' }}></div>}</div>
                                            <div>
                                                <div className="fw-bold text-white" style={{ fontSize: '15px' }}>WhatsApp Order Confirmation</div>
                                                <div style={{ color: '#8a7a6a', fontSize: '14px' }}>Our team will confirm your order on WhatsApp.</div>
                                            </div>
                                        </div>
                                        <MessageCircle size={24} style={{ color: '#25d366' }} />
                                    </div>
                                </div>

                                {message && <div className="alert alert-warning py-2 mb-3" style={{ background: 'rgba(201,168,76,0.12)', color: '#f4d58d', border: '1px solid rgba(201,168,76,0.35)' }}>{message}</div>}
                                <button className="btn w-100 fw-bold text-uppercase d-flex align-items-center justify-content-center gap-2 py-3 mb-2" style={{ background: '#c9a84c', color: '#0a0a0a', fontSize: '14px', letterSpacing: '3px', border: 'none', borderRadius: '3px', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#d4b050'} onMouseLeave={e => e.currentTarget.style.background = '#c9a84c'} onClick={handleGoToReview}>
                                    <Lock size={16} /> CONTINUE TO REVIEW
                                </button>
                                <div className="text-center" style={{ fontSize: '12px', color: '#8a7a6a' }}>🔒 Your information is 100% secure and will never be shared.</div>
                            </>
                        )}

                        {currentStep === 2 && (
                            <div className="p-4" style={{ border: '1px solid #3d3020', borderRadius: '4px', background: '#0f0c09' }}>
                                <div className="d-flex align-items-center gap-3 mb-3">
                                    <CheckCircle size={22} style={{ color: '#c9a84c' }} />
                                    <div>
                                        <div className="fw-bold text-white text-uppercase" style={{ fontSize: '17px', letterSpacing: '2px' }}>ORDER REVIEW</div>
                                        <div style={{ color: '#8a7a6a', fontSize: '14px' }}>Please review the information below before confirming the order.</div>
                                    </div>
                                </div>
                                <div className="mb-4" style={{ border: '1px solid #2a1f10', borderRadius: '6px', padding: '16px', background: '#141010' }}>
                                    <div className="fw-bold text-white mb-2">Shipping Details</div>
                                    <div style={{ color: '#d6d6d6', fontSize: '14px' }}>{form.fullName}</div>
                                    <div style={{ color: '#d6d6d6', fontSize: '14px' }}>{form.phone}</div>
                                    <div style={{ color: '#d6d6d6', fontSize: '14px' }}>{form.address1}{form.address2 ? `, ${form.address2}` : ''}</div>
                                    <div style={{ color: '#d6d6d6', fontSize: '14px' }}>{form.city}, {form.province}</div>
                                    <div style={{ color: '#d6d6d6', fontSize: '14px' }}>{form.country}</div>
                                    {notes && <div className="mt-2" style={{ color: '#8a7a6a', fontSize: '13px' }}>Notes: {notes}</div>}
                                </div>
                                <div className="mb-4" style={{ border: '1px solid #2a1f10', borderRadius: '6px', padding: '16px', background: '#141010' }}>
                                    <div className="fw-bold text-white mb-2">Payment Method</div>
                                    <div style={{ color: '#d6d6d6', fontSize: '14px' }}>{paymentMethod === 'cod' ? 'Cash on Delivery' : 'WhatsApp Confirmation'}</div>
                                </div>
                                <div className="d-flex gap-3" style={{ flexDirection: 'row' }}>
                                    <button className="btn flex-grow-1 fw-bold text-uppercase checkout-btn" style={{ background: 'transparent', border: '1px solid #3d3020', color: '#fff', padding: '12px', borderRadius: '3px', fontSize: '13px' }} onClick={() => setCurrentStep(1)}>Back</button>
                                    <button className="btn flex-grow-1 fw-bold text-uppercase checkout-btn" style={{ background: '#c9a84c', color: '#0a0a0a', padding: '12px', borderRadius: '3px', fontSize: '13px' }} onClick={handleConfirmOrder} disabled={loading}>
                                        {loading ? 'CONFIRMING...' : 'CONFIRM ORDER'}
                                    </button>
                                </div>
                                {message && <div className="alert alert-warning py-2 mt-3" style={{ background: 'rgba(201,168,76,0.12)', color: '#f4d58d', border: '1px solid rgba(201,168,76,0.35)' }}>{message}</div>}
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="p-4" style={{ border: '1px solid #3d3020', borderRadius: '4px', background: '#0f0c09' }}>
                                <div className="d-flex align-items-center gap-3 mb-3">
                                    <CheckCircle size={28} style={{ color: '#4caf50' }} />
                                    <div>
                                        <div className="fw-bold text-white text-uppercase" style={{ fontSize: '17px', letterSpacing: '2px' }}>ORDER PLACED</div>
                                        <div style={{ color: '#8a7a6a', fontSize: '14px' }}>Your order has been submitted successfully and sent to the admin panel.</div>
                                    </div>
                                </div>
                                <div className="mb-3" style={{ border: '1px solid #2a1f10', borderRadius: '6px', padding: '16px', background: '#141010' }}>
                                    <div style={{ color: '#8a7a6a', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Order ID</div>
                                    <div className="fw-bold text-white" style={{ fontSize: '18px' }}>{createdOrder?.orderNumber || 'Processing'}</div>
                                </div>
                                <div className="d-flex gap-3" style={{ flexDirection: 'row' }}>
                                    <button className="btn flex-grow-1 fw-bold text-uppercase checkout-btn" style={{ background: 'transparent', border: '1px solid #3d3020', color: '#fff', padding: '12px', borderRadius: '3px', fontSize: '13px' }} onClick={() => navigate('/shop')}>Continue Shopping</button>
                                    <button className="btn flex-grow-1 fw-bold text-uppercase checkout-btn" style={{ background: '#c9a84c', color: '#0a0a0a', padding: '12px', borderRadius: '3px', fontSize: '13px' }} onClick={() => navigate('/track-order')}>Track Order</button>
                                </div>
                                {!customer && (
                                    <div className="mt-4 p-4" style={{ border: '1px solid #c9a84c', borderRadius: '6px', background: 'rgba(201,168,76,0.05)' }}>
                                        <div className="d-flex align-items-center gap-3 mb-3">
                                            <UserPlus size={24} style={{ color: '#c9a84c' }} />
                                            <div>
                                                <div className="fw-bold" style={{ color: '#c9a84c', fontSize: '15px', letterSpacing: '0.5px' }}>Create an Account</div>
                                                <div style={{ color: '#a09080', fontSize: '13px' }}>Track orders, view history, save addresses & checkout faster next time!</div>
                                            </div>
                                        </div>
                                        <div className="d-flex gap-3" style={{ flexDirection: 'row' }}>
                                            <button className="btn flex-grow-1 fw-bold text-uppercase checkout-btn" style={{ background: '#c9a84c', color: '#0a0a0a', padding: '10px', borderRadius: '3px', fontSize: '13px' }} onClick={() => navigate('/register')}>
                                                <UserPlus size={14} className="me-1" /> Create Account
                                            </button>
                                            <button className="btn flex-grow-1 fw-bold text-uppercase checkout-btn" style={{ background: 'transparent', border: '1px solid #3d3020', color: '#c9a84c', padding: '10px', borderRadius: '3px', fontSize: '13px' }} onClick={() => navigate('/login')}>
                                                <LogIn size={14} className="me-1" /> Sign In
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── RIGHT: ORDER SUMMARY ── */}
                    <div className="col-lg-5">
                        <div style={{ border: '1px solid #3d3020', borderRadius: '4px', background: '#0f0c09', overflow: 'hidden', position: 'sticky', top: '80px' }}>

                            <div className="px-4 py-3" style={{ borderBottom: '1px solid #3d3020' }}>
                                <div className="fw-bold text-white text-uppercase" style={{ fontSize: '17px', letterSpacing: '3px' }}>ORDER SUMMARY</div>
                            </div>

                            <div className="p-4">
                                {/* Items */}
                                <div className="d-flex flex-column gap-3 mb-4 pb-4" style={{ borderBottom: '1px solid #2a1f10' }}>
                                    {cartItems.map(item => (
                                        <div key={item.id} className="d-flex align-items-center gap-3">
                                            <div style={{ width: '56px', height: '56px', flexShrink: 0, borderRadius: '4px', overflow: 'hidden', border: '1px solid #3d3020' }}>
                                                <img src={item.img} alt={item.name} className="w-100 h-100" style={{ objectFit: 'cover' }} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div className="fw-bold text-white" style={{ fontSize: '15px' }}>{item.name}</div>
                                                <div style={{ color: '#8a7a6a', fontSize: '12px' }}>{item.detail}</div>
                                                <div className="d-flex align-items-center gap-0 mt-1" style={{ border: '1px solid #3d3020', borderRadius: '3px', overflow: 'hidden', width: 'fit-content' }}>
                                                    <button className="border-0 d-flex align-items-center justify-content-center"
                                                        style={{ width: '26px', height: '26px', background: '#1a1410', color: '#c9a84c', cursor: 'pointer', fontSize: '14px' }}
                                                        onClick={() => updateQty(item.id, -1)}>
                                                        <Minus size={10} />
                                                    </button>
                                                    <span className="text-white text-center" style={{ width: '32px', fontSize: '13px', fontWeight: 600, background: '#141010', lineHeight: '26px' }}>
                                                        {item.qty || 1}
                                                    </span>
                                                    <button className="border-0 d-flex align-items-center justify-content-center"
                                                        style={{ width: '26px', height: '26px', background: '#1a1410', color: item.stock && (item.qty || 1) >= item.stock ? '#555' : '#c9a84c', cursor: item.stock && (item.qty || 1) >= item.stock ? 'not-allowed' : 'pointer', fontSize: '14px' }}
                                                        onClick={() => updateQty(item.id, 1)}>
                                                        <Plus size={10} />
                                                    </button>
                                                </div>
                                                {item.stock !== undefined && item.stock <= 5 && (
                                                    <div style={{ color: item.stock <= 0 ? '#e74c3c' : '#ff9800', fontSize: '10px', marginTop: '2px', fontWeight: 600 }}>
                                                        {item.stock <= 0 ? 'Out of stock' : `Only ${item.stock} left`}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="fw-semibold" style={{ color: '#c9a84c', fontSize: '13px', whiteSpace: 'nowrap' }}>
                                                Rs. {(item.price * (item.qty || 1)).toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Totals */}
                                <div className="d-flex justify-content-between mb-2">
                                    <span style={{ color: '#8a7a6a', fontSize: '15px' }}>Subtotal ({itemCount} items)</span>
                                    <span className="text-white" style={{ fontSize: '17px' }}>Rs. {subtotal.toLocaleString()}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-3 pb-3" style={{ borderBottom: '1px solid #2a1f10' }}>
                                    <span style={{ color: '#8a7a6a', fontSize: '15px' }}>Shipping</span>
                                    <span style={{ color: '#4caf50', fontSize: '15px', fontWeight: 600 }}>Rs. 0</span>
                                </div>
                                <div className="d-flex justify-content-between mb-4">
                                    <span className="fw-bold text-white text-uppercase" style={{ fontSize: '18px' }}>Total</span>
                                    <span className="fw-bold" style={{ color: '#c9a84c', fontSize: '18px' }}>Rs. {subtotal.toLocaleString()}</span>
                                </div>

                                {/* Free delivery */}
                                <div className="mb-4 p-3" style={{ border: '1px solid #3d3020', borderRadius: '4px', background: '#141010' }}>
                                    <div className="d-flex align-items-center gap-2 mb-1">
                                        <Truck size={16} style={{ color: '#c9a84c' }} />
                                        <span style={{ fontSize: '14px', color: '#c8bfb0' }}>You are eligible for</span>
                                    </div>
                                    <div className="fw-bold mb-2" style={{ color: '#c9a84c', fontSize: '15px', letterSpacing: '1px' }}>FREE DELIVERY</div>
                                    <div style={{ height: '4px', background: '#2a1f10', borderRadius: '2px', overflow: 'hidden' }}>
                                        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(to right, #c9a84c, #e8c96a)', borderRadius: '2px' }}></div>
                                    </div>
                                    <div className="mt-2" style={{ fontSize: '15px', color: '#8a7a6a' }}>Add Rs. 0 more to get free delivery</div>
                                </div>

                                {/* Trust badges */}
                                <div className="d-flex flex-column gap-3">
                                    {[
                                        { Icon: ShieldCheck, title: '100% Secure Checkout', sub: 'Your payments are safe with us.' },
                                        { Icon: Shield, title: 'Easy Returns', sub: '7 days easy return & exchange policy.' },
                                        { Icon: Truck, title: 'Fast Delivery', sub: 'We deliver orders quickly and safely.' },
                                        { Icon: User, title: 'Customer Support', sub: 'We are here to help you.' },
                                    ].map((b, i) => (
                                        <div key={i} className="d-flex align-items-center gap-3">
                                            <div className="d-flex align-items-center justify-content-center flex-shrink-0"
                                                style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #3d3020', background: '#141010' }}>
                                                <b.Icon size={16} style={{ color: '#c9a84c' }} strokeWidth={1.5} />
                                            </div>
                                            <div>
                                                <div className="fw-semibold text-white" style={{ fontSize: '14px' }}>{b.title}</div>
                                                <div style={{ color: '#8a7a6a', fontSize: '15px' }}>{b.sub}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── FEATURES BAR ── */}
                <div className="mt-5 py-4" style={{ borderTop: '1px solid #3d3020' }}>
                    <div className="row g-3 align-items-center">
                        {features.map((f, i) => (
                            <div key={i} className="col-6 col-md-3">
                                <div className="d-flex align-items-center gap-3 px-2">
                                    <div className="d-flex align-items-center justify-content-center flex-shrink-0"
                                        style={{ width: '44px', height: '44px', border: '1px solid #3d3020', borderRadius: '4px' }}>
                                        <f.Icon size={22} className="text-warning" strokeWidth={1.3} />
                                    </div>
                                    <div>
                                        <div className="fw-bold text-white" style={{ fontSize: '14px', letterSpacing: '0.5px' }}>{f.title}</div>
                                        <div className="text-secondary" style={{ fontSize: '15px', lineHeight: 1.3 }}>{f.desc}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            <Footer />

            <style>{`
                @media (max-width: 576px) {
                    .checkout-btn {
                        padding: 8px 6px !important;
                        font-size: 11px !important;
                        letter-spacing: 0.5px !important;
                    }
                }
            `}</style>
        </div>
    );
}