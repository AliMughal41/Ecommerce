import React, { useState, useEffect } from 'react';
import { Search, Heart, User, ShoppingCart, Bell, Clock, Menu, X, ChevronDown, Trash2, ShoppingBag, Gem, Truck, Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import API_URL from '../config';

const navLinks = [
    { label: 'HOME', path: '/home' },    { label: 'BAGS', path: '/bags' },
    { label: 'JEWELLERY', path: '/jewellery' },
    { label: 'SHOP', path: '/shop' },
    { label: 'NEW ARRIVALS', path: '/new-arrivals' },
    { label: 'COLLECTIONS', path: '/collections' },
    // { label: 'ABOUT US', path: '/about' },
    { label: 'CONTACT', path: '/contact' },
    { label: 'TRACK ORDER', path: '/track-order' },
];

const adminLinks = [
    { label: 'ADMIN PRODUCTS', path: '/adminproducts' },
    { label: 'ADMIN ORDERS', path: '/admin-orders' },
    { label: 'CUSTOMERS', path: '/admin-customers' },
];

export default function Navbar() {
    const { customer, token, logout } = useCustomerAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);

    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [customerNotifications, setCustomerNotifications] = useState([]);
    const [customerUnreadCount, setCustomerUnreadCount] = useState(0);
    const [showCustomerNotifications, setShowCustomerNotifications] = useState(false);
    const [notifLoading, setNotifLoading] = useState(null);
    const [selectedNotif, setSelectedNotif] = useState(null);
    const [selectedAdminNotif, setSelectedAdminNotif] = useState(null);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    const isAdminRoute = location.pathname.startsWith('/admin');
    const isAdmin = isAdminRoute && Boolean(localStorage.getItem('adminToken'));
    const links = isAdmin ? adminLinks : navLinks;

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const updateCounts = () => {
        try {
            const cart = JSON.parse(localStorage.getItem('thriftora_cart') || '[]');
            const count = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
            setCartCount(count);
        } catch (e) {
            setCartCount(0);
        }

        try {
            const wishlist = JSON.parse(localStorage.getItem('thriftora_wishlist') || '[]');
            setWishlistCount(wishlist.length);
        } catch (e) {
            setWishlistCount(0);
        }
    };

    const fetchNotifications = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/api/contact/notifications`);
            if (data.success) {
                setNotifications(data.notifications);
            }
        } catch (error) {
            console.error('Error fetching admin notifications', error);
        }
    };

    const fetchCustomerNotifications = async () => {
        if (!customer || !token) return;
        try {
            const { data } = await axios.get(`${API_URL}/api/customer-notifications`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (data.success) {
                setCustomerNotifications(data.notifications);
                setCustomerUnreadCount(data.unreadCount);
            }
        } catch (error) {
            console.error('Error fetching customer notifications', error);
        }
    };

    const handleMarkCustomerNotifRead = async (id) => {
        setNotifLoading(id);
        try {
            await axios.put(`${API_URL}/api/customer-notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCustomerNotifications(prev => prev.map(n => n._id === id ? { ...n, readBy: [...(n.readBy || []), customer.email] } : n));
            setCustomerUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read', error);
        } finally {
            setNotifLoading(null);
        }
    };

    const handleMarkAllCustomerNotifRead = async () => {
        setNotifLoading('all');
        try {
            await axios.put(`${API_URL}/api/customer-notifications/read-all`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCustomerNotifications(prev => prev.map(n => ({ ...n, readBy: [...(n.readBy || []), customer.email] })));
            setCustomerUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read', error);
        } finally {
            setNotifLoading(null);
        }
    };

    useEffect(() => {
        updateCounts();

        window.addEventListener('cart-updated', updateCounts);
        window.addEventListener('wishlist-updated', updateCounts);
        window.addEventListener('storage', updateCounts);

        if (isAdmin) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 15000);
            return () => {
                clearInterval(interval);
                window.removeEventListener('cart-updated', updateCounts);
                window.removeEventListener('wishlist-updated', updateCounts);
                window.removeEventListener('storage', updateCounts);
            };
        }

        if (customer && !isAdmin) {
            fetchCustomerNotifications();
            const interval = setInterval(fetchCustomerNotifications, 30000);
            return () => {
                clearInterval(interval);
                window.removeEventListener('cart-updated', updateCounts);
                window.removeEventListener('wishlist-updated', updateCounts);
                window.removeEventListener('storage', updateCounts);
            };
        }

        return () => {
            window.removeEventListener('cart-updated', updateCounts);
            window.removeEventListener('wishlist-updated', updateCounts);
            window.removeEventListener('storage', updateCounts);
        };
    }, [isAdmin, customer, token]);

    const handleToggleMenu = (open) => {
        setIsMenuOpen(open);
        if (open) {
            document.body.classList.add('menu-open');
        } else {
            document.body.classList.remove('menu-open');
        }
    };

    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (showNotifications && !e.target.closest('.notifications-container')) {
                setShowNotifications(false);
            }
            if (showCustomerNotifications && !e.target.closest('.notifications-container')) {
                setShowCustomerNotifications(false);
            }
        };
        document.addEventListener('click', handleOutsideClick);
        return () => document.removeEventListener('click', handleOutsideClick);
    }, [showNotifications, showCustomerNotifications]);

    useEffect(() => {
        return () => {
            document.body.classList.remove('menu-open');
        };
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            const { data } = await axios.put(`${API_URL}/api/contact/notifications/${id}/read`);
            if (data.success) {
                setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            }
        } catch (error) {
            console.error('Error marking notification as read', error);
        }
    };

    const handleDelete = async (idsToDelete) => {
        try {
            const { data } = await axios.delete(`${API_URL}/api/contact/notifications`, {
                data: { ids: idsToDelete }
            });
            if (data.success) {
                setNotifications(prev => prev.filter(n => !idsToDelete.includes(n._id)));
            }
        } catch (error) {
            console.error('Error deleting notifications', error);
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }
        setSearchLoading(true);
        try {
            const { data } = await axios.get(`${API_URL}/api/products/search?q=${encodeURIComponent(query.trim())}`);
            if (data.success) {
                setSearchResults(data.products);
            }
        } catch (error) {
            console.error('Search error', error);
        } finally {
            setSearchLoading(false);
        }
    };

    return (
        <>
            {/* ── SEARCH OVERLAY ── */}
            {showSearch && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
                    zIndex: 10000, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', paddingTop: '10vh',
                    animation: 'notifModalFadeIn 0.2s ease-out'
                }} onClick={() => { setShowSearch(false); setSearchQuery(''); setSearchResults([]); }}>
                    <div style={{ width: '90%', maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <div style={{ flex: 1, position: 'relative' }}>
                                <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#8a7a6a' }} />
                                <input
                                    autoFocus
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => handleSearch(e.target.value)}
                                    placeholder="Search products by name, category, price..."
                                    style={{
                                        width: '100%', background: '#141010', border: '1px solid #3d3020',
                                        borderRadius: '8px', color: '#fff', padding: '16px 16px 16px 48px',
                                        fontSize: '16px', outline: 'none',
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#c9a84c'}
                                    onBlur={e => e.target.style.borderColor = '#3d3020'}
                                />
                            </div>
                            <button onClick={() => { setShowSearch(false); setSearchQuery(''); setSearchResults([]); }}
                                style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '8px', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,0.2)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(201,168,76,0.1)'}
                            >
                                <X size={20} style={{ color: '#c9a84c' }} />
                            </button>
                        </div>

                        {searchLoading && (
                            <div style={{ textAlign: 'center', padding: '30px', color: '#8a7a6a', fontSize: '13px' }}>
                                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite', color: '#c9a84c', marginBottom: '8px' }} />
                                <div>Searching...</div>
                            </div>
                        )}

                        {!searchLoading && searchQuery && searchResults.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#8a7a6a', fontSize: '14px' }}>
                                No products found for "{searchQuery}"
                            </div>
                        )}

                        {!searchLoading && searchResults.length > 0 && (
                            <div style={{ maxHeight: '50vh', overflowY: 'auto', borderRadius: '8px', border: '1px solid #3d3020', background: '#141010' }}>
                                {searchResults.map(p => (
                                    <div key={p._id}
                                        onClick={() => { setShowSearch(false); setSearchQuery(''); setSearchResults([]); navigate(`/product/${p._id}`); }}
                                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderBottom: '1px solid #2a1f10', cursor: 'pointer', transition: 'background 0.15s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,0.06)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <img src={p.mainImage} alt={p.name} style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #3d3020', flexShrink: 0 }} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ color: '#fff', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                                            <div style={{ color: '#8a7a6a', fontSize: '11px', marginTop: '2px' }}>{p.category}</div>
                                        </div>
                                        <div style={{ color: '#c9a84c', fontSize: '13px', fontWeight: 700, flexShrink: 0 }}>Rs. {(p.salePrice || p.price).toLocaleString()}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!searchLoading && !searchQuery && (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#555', fontSize: '13px' }}>
                                Type to search products...
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Navbar - FIXED at top */}
            <nav
                
    className={`border-bottom py-2 position-fixed`}
    style={{
        top: '0',
        left: '0',
        right: '0',
        width: '100%',
        borderColor: scrolled ? 'rgba(212,175,55,0.3)' : '#3d3020',
        background: scrolled 
            ? 'linear-gradient(135deg, rgba(30,20,5,0.95) 0%, rgba(40,25,5,0.95) 50%, rgba(20,15,5,0.95) 100%)' 
            : 'rgba(10,10,10,0.9)',
        backdropFilter: 'blur(18px)',
        zIndex: 1000,
        transition: 'background 0.4s, border-color 0.4s, box-shadow 0.4s',
        boxShadow: scrolled 
            ? '0 4px 30px rgba(212,175,55,0.15)' 
            : '0 2px 20px rgba(0,0,0,0.3)',
    }}
>
                {/* Gold line animation - Top */}
                <div className="position-absolute top-0 start-0 w-100" style={{ height: '2px', background: 'linear-gradient(90deg, transparent, #d4af37, transparent)', opacity: 0.3 }}></div>
                <div className="position-absolute top-0 start-0 w-100" style={{ 
                    height: '2px', 
                    background: 'linear-gradient(90deg, transparent, #d4af37, transparent)',
                    animation: 'goldLine 3s ease-in-out infinite',
                    opacity: 0.6
                }}></div>
                
                {/* Gold line animation - Bottom */}
                <div className="position-absolute bottom-0 start-0 w-100" style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.15), transparent)', opacity: 0.5 }}></div>
                
                <style>{`
                    @keyframes goldLine {
                        0% { transform: translateX(-100%); }
                        100% { transform: translateX(100%); }
                    }
                    @keyframes notifSlideIn {
                        0% { opacity: 0; transform: translateY(-8px); }
                        100% { opacity: 1; transform: translateY(0); }
                    }
                    .notif-dropdown::-webkit-scrollbar { width: 4px; }
                    .notif-dropdown::-webkit-scrollbar-track { background: transparent; }
                    .notif-dropdown::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.2); border-radius: 4px; }
                    .notif-dropdown::-webkit-scrollbar-thumb:hover { background: rgba(201,168,76,0.4); }
                    .notif-item:hover { background: rgba(201,168,76,0.06) !important; }
                    @media (max-width: 576px) {
                        .navbar-right-icons { gap: 4px !important; }
                        .navbar-right-icons > div { padding: 2px 4px !important; }
                        .navbar-right-icons .icon-label { display: none !important; }
                    }
                `}</style>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'nowrap', padding: '0 12px', width: '100%', overflow: 'visible' }}>
                    {/* Logo */}
                    <div
                        className="d-flex align-items-center gap-2 gap-md-3"
                        style={{ cursor: 'pointer', flexShrink: 0 }}
                        onClick={() => navigate('/')}
                    >
                        <div
                            className="position-relative"
                            style={{ 
                                width: '44px', 
                                height: '44px',
                                minWidth: '44px',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                                e.currentTarget.querySelector('img').style.filter = 'drop-shadow(0 0 20px rgba(212,175,55,0.3))';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.querySelector('img').style.filter = 'drop-shadow(0 0 10px rgba(212,175,55,0.1))';
                            }}
                        >
                            <img 
                                src="/images/logo.png" 
                                alt="VELNORA" 
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                    filter: 'drop-shadow(0 0 10px rgba(212,175,55,0.1))',
                                    transition: 'all 0.3s ease'
                                }}
                            />
                            {/* Rotating ring effect */}
                            <div className="position-absolute" style={{
                                top: '-8px',
                                left: '-8px',
                                right: '-8px',
                                bottom: '-8px',
                                borderRadius: '50%',
                                border: '1px solid rgba(212,175,55,0.1)',
                                animation: 'spin 10s linear infinite',
                                pointerEvents: 'none'
                            }}></div>
                            <div className="position-absolute" style={{
                                top: '-14px',
                                left: '-14px',
                                right: '-14px',
                                bottom: '-14px',
                                borderRadius: '50%',
                                border: '1px solid rgba(212,175,55,0.05)',
                                animation: 'spin 15s linear infinite reverse',
                                pointerEvents: 'none'
                            }}></div>
                            <style>{`
                                @keyframes spin {
                                    0% { transform: rotate(0deg); }
                                    100% { transform: rotate(360deg); }
                                }
                            `}</style>
                        </div>
                        <div className="d-flex flex-column">
                            <span className="fw-bolder" style={{ 
                                fontSize: 'clamp(16px, 3vw, 22px)', 
                                letterSpacing: '4px', 
                                lineHeight: 1, 
                                color: '#fff',
                                fontFamily: "'Cormorant Garamond', serif"
                            }}>
                                VELNORA
                            </span>
                            <span className="text-secondary" style={{ 
                                fontSize: '8px', 
                                letterSpacing: '3px',
                                color: '#d4af37'
                            }}>
                                BAGS & JEWELLERY
                            </span>
                        </div>
                    </div>

                    {/* Nav Links */}
                    <ul className="nav d-none d-lg-flex" style={{ gap: '6px', flexShrink: 1, overflow: 'hidden', margin: 0, padding: 0, listStyle: 'none' }}>
                        {links.map((link) => {
                            const isActive = location.pathname === link.path;
                            const isHome = link.path === '/home' && location.pathname === '/home';
                            const active = isActive || isHome;
                            return (
                                <li key={link.label} className="nav-item">
                                    <span
                                        className={`nav-link fw-semibold d-flex align-items-center gap-1 ${active ? 'text-warning' : 'text-secondary'}`}
                                        style={{
                                            letterSpacing: '1px',
                                            paddingBottom: '2px',
                                            cursor: 'pointer',
                                            position: 'relative',
                                            transition: 'color 0.3s',
                                            fontSize: '13px',
                                            fontFamily: "'Inter', sans-serif",
                                            fontWeight: 600,
                                            padding: '8px 6px',
                                            whiteSpace: 'nowrap'
                                        }}
                                        onClick={() => navigate(link.path)}
                                        onMouseEnter={e => { 
                                            if (!active) {
                                                e.currentTarget.style.color = '#d4af37';
                                                e.currentTarget.querySelector('.nav-glow').style.opacity = '1';
                                            }
                                        }}
                                        onMouseLeave={e => { 
                                            if (!active) {
                                                e.currentTarget.style.color = '';
                                                e.currentTarget.querySelector('.nav-glow').style.opacity = '0';
                                            }
                                        }}
                                    >
                                        {link.label}
                                        {active && (
                                            <span style={{
                                                position: 'absolute',
                                                bottom: '-2px',
                                                left: '0',
                                                right: '0',
                                                height: '2px',
                                                background: '#d4af37',
                                                boxShadow: '0 0 15px rgba(212,175,55,0.6)',
                                                borderRadius: '2px'
                                            }}></span>
                                        )}
                                        <span className="nav-glow" style={{
                                            position: 'absolute',
                                            bottom: '-2px',
                                            left: '0',
                                            right: '0',
                                            height: '2px',
                                            background: '#d4af37',
                                            boxShadow: '0 0 25px rgba(212,175,55,0.4)',
                                            opacity: 0,
                                            transition: 'opacity 0.3s'
                                        }}></span>
                                        {link.label === 'COLLECTIONS' && !isAdmin && <ChevronDown size={14} />}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>

                    {/* Right Icons - Bigger with labels */}
                    {!isAdmin && (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }} className="navbar-right-icons">
                            <div 
                                className="d-flex flex-column align-items-center gap-0"
                                style={{ 
                                    cursor: 'pointer',
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    transition: 'all 0.3s ease'
                                }}
                                onClick={() => setShowSearch(true)}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'rgba(212,175,55,0.08)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.querySelector('.icon-label').style.color = '#d4af37';
                                    e.currentTarget.querySelector('.icon-svg').style.color = '#d4af37';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.querySelector('.icon-label').style.color = 'rgba(255,255,255,0.25)';
                                    e.currentTarget.querySelector('.icon-svg').style.color = '';
                                }}
                            >
                                <Search size={22} className="icon-svg text-secondary" style={{ transition: 'all 0.3s ease' }} />
                                <span className="icon-label" style={{ fontSize: '8px', color: 'rgba(255,255,255,0.25)', letterSpacing: '1px', marginTop: '2px', transition: 'all 0.3s ease' }}>SEARCH</span>
                            </div>

                            <div
                                className="position-relative d-flex flex-column align-items-center gap-0"
                                style={{ 
                                    cursor: 'pointer',
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    transition: 'all 0.3s ease'
                                }}
                                onClick={() => navigate('/wishlist')}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'rgba(212,175,55,0.08)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.querySelector('.icon-label').style.color = '#d4af37';
                                    e.currentTarget.querySelector('.icon-svg').style.color = '#d4af37';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.querySelector('.icon-label').style.color = 'rgba(255,255,255,0.25)';
                                    e.currentTarget.querySelector('.icon-svg').style.color = '';
                                }}
                            >
                                <div className="position-relative">
                                    <Heart size={22} className="icon-svg text-secondary" style={{ transition: 'all 0.3s ease' }} />
                                    {wishlistCount > 0 && (
                                        <span
                                            className="position-absolute top-0 start-100 translate-middle badge rounded-circle d-flex align-items-center justify-content-center"
                                            style={{ fontSize: '9px', width: '18px', height: '18px', fontWeight: 600, background: '#d4af37', color: '#0a0a0a' }}
                                        >
                                            {wishlistCount}
                                        </span>
                                    )}
                                </div>
                                <span className="icon-label" style={{ fontSize: '8px', color: 'rgba(255,255,255,0.25)', letterSpacing: '1px', marginTop: '2px', transition: 'all 0.3s ease' }}>WISHLIST</span>
                            </div>

                            {customer && (
                                <div
                                    className="position-relative d-flex flex-column align-items-center gap-0 notifications-container"
                                    style={{
                                        cursor: 'pointer',
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onClick={() => setShowCustomerNotifications(!showCustomerNotifications)}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = 'rgba(212,175,55,0.08)';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.querySelector('.icon-label').style.color = '#d4af37';
                                        e.currentTarget.querySelector('.icon-svg').style.color = '#d4af37';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.querySelector('.icon-label').style.color = 'rgba(255,255,255,0.25)';
                                        e.currentTarget.querySelector('.icon-svg').style.color = '';
                                    }}
                                >
                                    <div className="position-relative">
                                        <Bell size={22} className="icon-svg text-secondary" style={{ transition: 'all 0.3s ease' }} />
                                        {customerUnreadCount > 0 && (
                                            <span
                                                className="position-absolute top-0 start-100 translate-middle badge rounded-circle d-flex align-items-center justify-content-center"
                                                style={{ fontSize: '9px', width: '18px', height: '18px', fontWeight: 600, background: '#d4af37', color: '#0a0a0a' }}
                                            >
                                                {customerUnreadCount}
                                            </span>
                                        )}
                                    </div>
                                    <span className="icon-label" style={{ fontSize: '8px', color: 'rgba(255,255,255,0.25)', letterSpacing: '1px', marginTop: '2px', transition: 'all 0.3s ease' }}>ALERTS</span>

                                    {showCustomerNotifications && (
                                        <div className="notif-dropdown" style={{
                                            position: 'absolute', top: '45px', right: '0', width: '370px',
                                            background: 'linear-gradient(180deg, #141010 0%, #0f0c09 100%)',
                                            border: '1px solid rgba(201,168,76,0.2)', borderRadius: '8px',
                                            boxShadow: '0 12px 40px rgba(0,0,0,0.9), 0 0 0 1px rgba(201,168,76,0.05)', zIndex: 1001,
                                            maxHeight: '420px', overflowY: 'auto', animation: 'notifSlideIn 0.25s ease-out'
                                        }}>
                                            <div className="d-flex justify-content-between align-items-center" style={{ padding: '16px 18px', borderBottom: '1px solid rgba(201,168,76,0.12)' }}>
                                                <div className="d-flex align-items-center gap-2">
                                                    <Bell size={14} style={{ color: '#c9a84c' }} />
                                                    <span style={{ fontSize: '11px', letterSpacing: '2px', color: '#c9a84c', fontWeight: 700, textTransform: 'uppercase' }}>Notifications</span>
                                                    {customerUnreadCount > 0 && (
                                                        <span style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '10px', padding: '1px 8px', fontSize: '10px', color: '#c9a84c', fontWeight: 700 }}>{customerUnreadCount}</span>
                                                    )}
                                                </div>
                                                {customerUnreadCount > 0 && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleMarkAllCustomerNotifRead(); }}
                                                        disabled={notifLoading === 'all'}
                                                        className="d-flex align-items-center gap-1"
                                                        style={{ fontSize: '10px', color: 'rgba(201,168,76,0.6)', background: 'none', border: 'none', cursor: notifLoading === 'all' ? 'not-allowed' : 'pointer', transition: 'color 0.2s', padding: '2px 6px', borderRadius: '4px' }}
                                                        onMouseEnter={e => e.currentTarget.style.color = '#c9a84c'}
                                                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(201,168,76,0.6)'}
                                                    >
                                                        {notifLoading === 'all' && <Loader2 size={10} style={{ animation: 'spin 1s linear infinite' }} />}
                                                        {notifLoading === 'all' ? 'Marking...' : 'Mark all read'}
                                                    </button>
                                                )}
                                            </div>
                                            <div className="d-flex flex-column">
                                                {customerNotifications.length === 0 ? (
                                                    <div className="d-flex flex-column align-items-center justify-content-center" style={{ padding: '40px 20px' }}>
                                                        <Bell size={28} style={{ color: 'rgba(201,168,76,0.15)', marginBottom: '10px' }} />
                                                        <span style={{ color: 'rgba(201,168,76,0.35)', fontSize: '12px', letterSpacing: '1px' }}>No notifications yet</span>
                                                    </div>
                                                ) : (
                                                    customerNotifications.map((n, idx) => {
                                                        const isRead = n.readBy?.includes(customer.email);
                                                        return (
                                                            <div
                                                                key={n._id}
                                                                onClick={() => {
                                                                    setSelectedNotif(n);
                                                                    if (!isRead && notifLoading !== n._id) handleMarkCustomerNotifRead(n._id);
                                                                }}
                                                                className="position-relative notif-item"
                                                                style={{
                                                                    padding: '14px 18px',
                                                                    borderBottom: idx < customerNotifications.length - 1 ? '1px solid rgba(61,48,32,0.4)' : 'none',
                                                                    background: isRead ? 'transparent' : 'rgba(201,168,76,0.04)',
                                                                    cursor: isRead || notifLoading === n._id ? 'default' : 'pointer',
                                                                    transition: 'background 0.3s ease',
                                                                    borderLeft: isRead ? '2px solid transparent' : '2px solid #c9a84c'
                                                                }}
                                                                onMouseEnter={e => { if (!isRead) e.currentTarget.style.background = 'rgba(201,168,76,0.08)'; }}
                                                                onMouseLeave={e => { if (!isRead) e.currentTarget.style.background = 'rgba(201,168,76,0.04)'; }}
                                                            >
                                                                {!isRead && (
                                                                    <div style={{ position: 'absolute', top: '18px', right: '16px', width: '7px', height: '7px', borderRadius: '50%', background: '#c9a84c', boxShadow: '0 0 8px rgba(201,168,76,0.5)' }} />
                                                                )}
                                                                <div className="d-flex gap-3">
                                                                    {n.productImage && (
                                                                        <div style={{ flexShrink: 0 }}>
                                                                            <img src={n.productImage} alt="" style={{ width: '46px', height: '46px', borderRadius: '6px', objectFit: 'cover', border: '1px solid rgba(201,168,76,0.2)' }} />
                                                                        </div>
                                                                    )}
                                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                                        <div style={{ fontSize: '12px', fontWeight: 700, color: isRead ? 'rgba(255,255,255,0.5)' : '#fff', marginBottom: '3px', lineHeight: 1.3 }}>{n.title}</div>
                                                                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.message}</div>
                                                                        <div className="d-flex align-items-center gap-1 mt-1" style={{ fontSize: '10px', color: 'rgba(201,168,76,0.4)' }}>
                                                                            <Clock size={9} />
                                                                            {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div 
                                className="d-flex flex-column align-items-center gap-0"
                                style={{ 
                                    cursor: 'pointer',
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    transition: 'all 0.3s ease'
                                }}
                                onClick={() => navigate(customer ? '/account' : '/login')}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'rgba(212,175,55,0.08)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.querySelector('.icon-label').style.color = '#d4af37';
                                    e.currentTarget.querySelector('.icon-svg').style.color = '#d4af37';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.querySelector('.icon-label').style.color = 'rgba(255,255,255,0.25)';
                                    e.currentTarget.querySelector('.icon-svg').style.color = '';
                                }}
                            >
                                <User size={22} className="icon-svg text-secondary" style={{ transition: 'all 0.3s ease' }} />
                                <span className="icon-label" style={{ fontSize: '8px', color: 'rgba(255,255,255,0.25)', letterSpacing: '1px', marginTop: '2px', transition: 'all 0.3s ease' }}>ACCOUNT</span>
                            </div>

                            <div
                                className="position-relative d-flex flex-column align-items-center gap-0"
                                style={{ 
                                    cursor: 'pointer',
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    transition: 'all 0.3s ease'
                                }}
                                onClick={() => navigate('/cart')}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'rgba(212,175,55,0.08)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.querySelector('.icon-label').style.color = '#d4af37';
                                    e.currentTarget.querySelector('.icon-svg').style.color = '#d4af37';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.querySelector('.icon-label').style.color = 'rgba(255,255,255,0.25)';
                                    e.currentTarget.querySelector('.icon-svg').style.color = '';
                                }}
                            >
                                <div className="position-relative">
                                    <ShoppingCart size={22} className="icon-svg text-secondary" style={{ transition: 'all 0.3s ease' }} />
                                    {cartCount > 0 && (
                                        <span
                                            className="position-absolute top-0 start-100 translate-middle badge rounded-circle d-flex align-items-center justify-content-center"
                                            style={{ fontSize: '9px', width: '18px', height: '18px', fontWeight: 600, background: '#d4af37', color: '#0a0a0a' }}
                                        >
                                            {cartCount}
                                        </span>
                                    )}
                                </div>
                                <span className="icon-label" style={{ fontSize: '8px', color: 'rgba(255,255,255,0.25)', letterSpacing: '1px', marginTop: '2px', transition: 'all 0.3s ease' }}>CART</span>
                            </div>

                            {isMenuOpen
                                ? <X size={28} className="text-warning d-block d-lg-none ms-2" style={{ cursor: 'pointer' }} onClick={() => handleToggleMenu(false)} />
                                : <Menu size={28} className="text-white d-block d-lg-none ms-2" style={{ cursor: 'pointer' }} onClick={() => handleToggleMenu(true)} />
                            }
                        </div>
                    )}

                    {isAdmin && (
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexShrink: 0 }}>
                            <div className="position-relative notifications-container d-flex flex-column align-items-center gap-0" style={{ cursor: 'pointer' }}>
                                <Bell
                                    size={22}
                                    className={unreadCount > 0 ? "text-warning" : "text-secondary"}
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    style={{ transition: 'color 0.2s' }}
                                />
                                <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.25)', letterSpacing: '1px', marginTop: '2px' }}>NOTIFY</span>
                                {unreadCount > 0 && (
                                    <span
                                        className="position-absolute top-0 start-100 translate-middle badge rounded-circle d-flex align-items-center justify-content-center"
                                        onClick={() => setShowNotifications(!showNotifications)}
                                        style={{ fontSize: '9px', width: '18px', height: '18px', fontWeight: 700, background: '#d4af37', color: '#0a0a0a' }}
                                    >
                                        {unreadCount}
                                    </span>
                                )}

                                {showNotifications && (
                                    <div className="notif-dropdown" style={{
                                        position: 'absolute', top: '45px', right: '0', width: '370px',
                                        background: 'linear-gradient(180deg, #141010 0%, #0f0c09 100%)',
                                        border: '1px solid rgba(201,168,76,0.2)', borderRadius: '8px',
                                        boxShadow: '0 12px 40px rgba(0,0,0,0.9), 0 0 0 1px rgba(201,168,76,0.05)', zIndex: 1000,
                                        maxHeight: '420px', overflowY: 'auto', animation: 'notifSlideIn 0.25s ease-out'
                                    }}>
                                        <div className="d-flex justify-content-between align-items-center" style={{ padding: '16px 18px', borderBottom: '1px solid rgba(201,168,76,0.12)' }}>
                                            <div className="d-flex align-items-center gap-2">
                                                <Bell size={14} style={{ color: '#c9a84c' }} />
                                                <span style={{ fontSize: '11px', letterSpacing: '2px', color: '#c9a84c', fontWeight: 700, textTransform: 'uppercase' }}>Messages</span>
                                                {unreadCount > 0 && (
                                                    <span style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '10px', padding: '1px 8px', fontSize: '10px', color: '#c9a84c', fontWeight: 700 }}>{unreadCount}</span>
                                                )}
                                            </div>
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        setNotifLoading('admin-all');
                                                        try {
                                                            const unreads = notifications.filter(x => !x.isRead);
                                                            await Promise.all(unreads.map(n => axios.put(`${API_URL}/api/contact/notifications/${n._id}/read`)));
                                                            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                                                        } catch (err) {
                                                            console.error('Error marking all notifications as read', err);
                                                        } finally {
                                                            setNotifLoading(null);
                                                        }
                                                    }}
                                                    disabled={notifLoading === 'admin-all'}
                                                    className="d-flex align-items-center gap-1"
                                                    style={{ fontSize: '10px', color: 'rgba(201,168,76,0.6)', background: 'none', border: 'none', cursor: notifLoading === 'admin-all' ? 'not-allowed' : 'pointer', transition: 'color 0.2s', padding: '2px 6px', borderRadius: '4px' }}
                                                    onMouseEnter={e => e.currentTarget.style.color = '#c9a84c'}
                                                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(201,168,76,0.6)'}
                                                >
                                                    {notifLoading === 'admin-all' && <Loader2 size={10} style={{ animation: 'spin 1s linear infinite' }} />}
                                                    {notifLoading === 'admin-all' ? 'Marking...' : 'Mark all read'}
                                                </button>
                                            )}
                                        </div>
                                        <div className="d-flex flex-column">
                                            {notifications.length === 0 ? (
                                                <div className="d-flex flex-column align-items-center justify-content-center" style={{ padding: '40px 20px' }}>
                                                    <Bell size={28} style={{ color: 'rgba(201,168,76,0.15)', marginBottom: '10px' }} />
                                                    <span style={{ color: 'rgba(201,168,76,0.35)', fontSize: '12px', letterSpacing: '1px' }}>No messages yet</span>
                                                </div>
                                            ) : (
                                                notifications.map((n, idx) => (
                                                    <div
                                                        key={n._id}
                                                        onClick={() => {
                                                            setSelectedAdminNotif(n);
                                                            if (!n.isRead) handleMarkAsRead(n._id);
                                                        }}
                                                        className="position-relative notif-item"
                                                        style={{
                                                            padding: '14px 18px',
                                                            borderBottom: idx < notifications.length - 1 ? '1px solid rgba(61,48,32,0.4)' : 'none',
                                                            background: n.isRead ? 'transparent' : 'rgba(201,168,76,0.04)',
                                                            cursor: 'pointer',
                                                            transition: 'background 0.3s ease',
                                                            borderLeft: n.isRead ? '2px solid transparent' : '2px solid #c9a84c'
                                                        }}
                                                        onMouseEnter={e => { if (!n.isRead) e.currentTarget.style.background = 'rgba(201,168,76,0.08)'; }}
                                                        onMouseLeave={e => { if (!n.isRead) e.currentTarget.style.background = 'rgba(201,168,76,0.04)'; }}
                                                    >
                                                        {!n.isRead && (
                                                            <div style={{ position: 'absolute', top: '18px', right: '16px', width: '7px', height: '7px', borderRadius: '50%', background: '#c9a84c', boxShadow: '0 0 8px rgba(201,168,76,0.5)' }} />
                                                        )}
                                                        <div style={{ fontSize: '12px', fontWeight: 700, color: n.isRead ? 'rgba(255,255,255,0.5)' : '#fff', marginBottom: '2px', lineHeight: 1.3 }}>
                                                            {n.name} <span style={{ color: 'rgba(255,255,255,0.25)', fontWeight: 400, fontSize: '10px' }}>({n.email})</span>
                                                        </div>
                                                        <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(201,168,76,0.6)', marginBottom: '4px' }}>
                                                            {n.subject}
                                                        </div>
                                                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {n.message}
                                                        </div>
                                                        <div className="d-flex align-items-center gap-1 mt-1" style={{ fontSize: '10px', color: 'rgba(201,168,76,0.4)' }}>
                                                            <Clock size={9} />
                                                            {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {isMenuOpen
                                ? <X size={28} className="text-warning d-block d-lg-none ms-2" style={{ cursor: 'pointer' }} onClick={() => handleToggleMenu(false)} />
                                : <Menu size={28} className="text-white d-block d-lg-none ms-2" style={{ cursor: 'pointer' }} onClick={() => handleToggleMenu(true)} />
                            }
                        </div>
                    )}
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div
                        className="d-lg-none overflow-hidden position-absolute"
                        style={{
                            top: '100%', left: 0, right: 0, zIndex: 1200,
                            background: 'rgba(10,10,10,0.98)',
                            backdropFilter: 'blur(20px)',
                            borderTop: '1px solid #3d3020',
                            boxShadow: '0 10px 20px rgba(0,0,0,0.8)',
                            maxHeight: 'calc(100vh - 100px)',
                            overflowY: 'auto',
                        }}
                    >
                        <ul className="list-unstyled mb-0 py-2">
                            {links.map((link) => {
                                const isActive = location.pathname === link.path && link.path !== '/';
                                const isHome = link.path === '/' && location.pathname === '/';
                                const active = isActive || isHome;
                                return (
                                    <li key={link.label}>
                                        <div className="px-4 py-3 border-bottom d-flex justify-content-between align-items-center" 
                                            style={{ borderColor: '#2a2015', cursor: 'pointer' }}
                                            onClick={() => { handleToggleMenu(false); navigate(link.path); }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,175,55,0.05)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <span className={`fw-semibold ${active ? 'text-warning' : 'text-white'}`} 
                                                style={{ letterSpacing: '1.5px', fontSize: '16px' }}>
                                                {link.label}
                                            </span>
                                            {active && (
                                                <span style={{ 
                                                    width: '6px', 
                                                    height: '6px', 
                                                    borderRadius: '50%', 
                                                    background: '#d4af37',
                                                    boxShadow: '0 0 15px rgba(212,175,55,0.6)'
                                                }}></span>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
            </nav>

            {/* Announcement Bar - Below Navbar */}
            <div className="py-2 border-bottom announcement-bar" style={{
                borderColor: '#3d3020',
                background: 'linear-gradient(90deg, #1a1400 0%, #2d1f00 50%, #1a1400 100%)',
                position: 'fixed',
                top: '60px',
                left: '0',
                right: '0',
                width: '100%',
                zIndex: 999,
                overflow: 'hidden'
            }}>
                <div className="position-absolute top-0 start-0 w-100 h-100" style={{
                    background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.05), transparent)',
                    animation: 'shimmer 3s infinite'
                }}></div>
                <style>{`
                    @keyframes shimmer {
                        0% { transform: translateX(-100%); }
                        100% { transform: translateX(100%); }
                    }
                    @keyframes scrollAnnouncement {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                `}</style>
                
                {/* Auto-scrolling messages - Single line */}
                <div className="container-fluid px-3 position-relative" style={{ zIndex: 1, overflow: 'hidden' }}>
                    <div 
                        className="d-flex gap-5 text-uppercase text-warning"
                        style={{ 
                            fontSize: '11px', 
                            letterSpacing: '2px', 
                            animation: 'scrollAnnouncement 25s linear infinite',
                            whiteSpace: 'nowrap',
                            width: 'max-content'
                        }}
                    >
                        <span className="d-flex align-items-center gap-2">
                            Free Shipping Nationwide
                        </span>
                        <span className="d-flex align-items-center gap-2">
                            30 Day Returns
                        </span>
                        <span className="d-flex align-items-center gap-2">
                            Premium Packaging
                        </span>
                        <span className="d-flex align-items-center gap-2">
                            Secure Checkout
                        </span>
                        <span className="d-flex align-items-center gap-2">
                            Free Shipping Nationwide
                        </span>
                        <span className="d-flex align-items-center gap-2">
                            30 Day Returns
                        </span>
                        <span className="d-flex align-items-center gap-2">
                            Premium Packaging
                        </span>
                        <span className="d-flex align-items-center gap-2">
                            Secure Checkout
                        </span>
                    </div>
                </div>
            </div>

            {/* Customer Notification Detail Modal */}
            {selectedNotif && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
                    zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: 'notifModalFadeIn 0.2s ease-out'
                }} onClick={() => setSelectedNotif(null)}>
                    <div
                        style={{
                            background: 'linear-gradient(180deg, #1a1510 0%, #121010 100%)',
                            border: '1px solid rgba(201,168,76,0.25)', borderRadius: '12px',
                            width: '90%', maxWidth: '440px', maxHeight: '85vh', overflowY: 'auto',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.9), 0 0 0 1px rgba(201,168,76,0.08)',
                            animation: 'notifModalSlideIn 0.25s ease-out'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(201,168,76,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <p style={{ color: '#c9a84c', fontSize: '9px', letterSpacing: '3px', margin: '0 0 6px', textTransform: 'uppercase', fontWeight: 700 }}>Notification</p>
                                <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>{selectedNotif.title}</h3>
                            </div>
                            <button
                                onClick={() => setSelectedNotif(null)}
                                style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, marginLeft: '12px', transition: 'all 0.2s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.2)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.1)'; }}
                            >
                                <X size={16} style={{ color: '#c9a84c' }} />
                            </button>
                        </div>
                        <div style={{ padding: '20px 24px' }}>
                            {selectedNotif.productImage && (
                                <img src={selectedNotif.productImage} alt="" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(201,168,76,0.15)', marginBottom: '16px' }} />
                            )}
                            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', lineHeight: 1.8, margin: '0 0 16px' }}>{selectedNotif.message}</p>
                            {selectedNotif.productPrice && (
                                <div style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.12)', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#a09080', fontSize: '12px' }}>Price</span>
                                    <span style={{ color: '#c9a84c', fontSize: '16px', fontWeight: 700 }}>Rs. {Number(selectedNotif.productPrice).toLocaleString()}</span>
                                </div>
                            )}
                            <div className="d-flex align-items-center gap-1 mb-3" style={{ fontSize: '11px', color: 'rgba(201,168,76,0.4)' }}>
                                <Clock size={11} />
                                {new Date(selectedNotif.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </div>
                            {selectedNotif.type === 'product' && (
                                <button
                                    onClick={() => { setSelectedNotif(null); navigate('/shop'); }}
                                    style={{
                                        width: '100%', padding: '12px', background: '#c9a84c', color: '#0a0a0a',
                                        border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 700,
                                        letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#d4b756'}
                                    onMouseLeave={e => e.currentTarget.style.background = '#c9a84c'}
                                >
                                    View on Shop
                                </button>
                            )}
                            {selectedNotif.productId && selectedNotif.type === 'product' && (
                                <button
                                    onClick={() => { setSelectedNotif(null); navigate(`/product/${selectedNotif.productId}`); }}
                                    style={{
                                        width: '100%', padding: '11px', background: 'transparent', color: '#c9a84c',
                                        border: '1px solid rgba(201,168,76,0.3)', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                                        letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer', marginTop: '8px',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#c9a84c'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)'; }}
                                >
                                    View Product
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Admin Notification Detail Modal */}
            {selectedAdminNotif && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
                    zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: 'notifModalFadeIn 0.2s ease-out'
                }} onClick={() => setSelectedAdminNotif(null)}>
                    <div
                        style={{
                            background: 'linear-gradient(180deg, #1a1510 0%, #121010 100%)',
                            border: '1px solid rgba(201,168,76,0.25)', borderRadius: '12px',
                            width: '90%', maxWidth: '440px', maxHeight: '85vh', overflowY: 'auto',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.9), 0 0 0 1px rgba(201,168,76,0.08)',
                            animation: 'notifModalSlideIn 0.25s ease-out'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(201,168,76,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <p style={{ color: '#c9a84c', fontSize: '9px', letterSpacing: '3px', margin: '0 0 6px', textTransform: 'uppercase', fontWeight: 700 }}>Message</p>
                                <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>{selectedAdminNotif.subject}</h3>
                                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', margin: '4px 0 0' }}>From: {selectedAdminNotif.name} ({selectedAdminNotif.email})</p>
                            </div>
                            <button
                                onClick={() => setSelectedAdminNotif(null)}
                                style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, marginLeft: '12px', transition: 'all 0.2s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.2)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.1)'; }}
                            >
                                <X size={16} style={{ color: '#c9a84c' }} />
                            </button>
                        </div>
                        <div style={{ padding: '20px 24px' }}>
                            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', lineHeight: 1.8, margin: '0 0 16px', whiteSpace: 'pre-wrap' }}>{selectedAdminNotif.message}</p>
                            <div className="d-flex align-items-center gap-1" style={{ fontSize: '11px', color: 'rgba(201,168,76,0.4)' }}>
                                <Clock size={11} />
                                {new Date(selectedAdminNotif.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(201,168,76,0.1)' }}>
                            <button
                                onClick={() => setSelectedAdminNotif(null)}
                                style={{
                                    width: '100%', padding: '11px', background: 'rgba(201,168,76,0.1)',
                                    border: '1px solid rgba(201,168,76,0.2)', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                                    letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer', color: '#c9a84c',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.15)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.1)'; }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                    @keyframes notifModalFadeIn {
                        0% { opacity: 0; }
                        100% { opacity: 1; }
                    }
                    @keyframes notifModalSlideIn {
                        0% { opacity: 0; transform: scale(0.95) translateY(10px); }
                        100% { opacity: 1; transform: scale(1) translateY(0); }
                    }
                `}</style>
        </>
    );
}