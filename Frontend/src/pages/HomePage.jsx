import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Heart, User, ShoppingBag, ChevronLeft, ChevronRight, 
  Star, Mail, ShieldCheck, Tag, Truck, Leaf, Package, Lock, 
  Play, X, Menu, Diamond, Sparkles, ArrowRight, Loader2 
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SubscribeSection from '../components/SubscribeSection';
import API_URL from '../config';

// Custom Instagram icon component
const InstagramIcon = ({ size = 24, color = '#d4af37' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={color} 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke={color} />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke={color} />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke={color} />
  </svg>
);

/* ─── DATA ──────────────────────────────────────────────────────────────── */
const favProducts = [
  { 
    name: 'Diamond Necklace Set', 
    price: 'Rs. 4,299', 
    rating: '4.9', 
    img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop' 
  },
  { 
    name: 'Designer Handbag', 
    price: 'Rs. 3,499', 
    rating: '4.8', 
    img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop' 
  },
  { 
    name: 'Gold Bracelet', 
    price: 'Rs. 2,899', 
    rating: '4.7', 
    img: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&h=400&fit=crop' 
  },
  { 
    name: 'Luxury Tote Bag', 
    price: 'Rs. 5,999', 
    rating: '4.9', 
    img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop' 
  },
];

const categories = [
  { name: 'LUXURY BAGS', img: '/images/category1.jpeg', desc: 'Premium Handbags' },
  { name: 'FINE JEWELLERY', img: '/images/category2.jpeg', desc: 'Diamond & Gold' },
];

const collections = [
  { name: 'SNEAKER VAULT', desc: 'Premium curated sneakers', img: 'https://images.unsplash.com/photo-1556906781-9a412961a28c?w=400&h=300&fit=crop' },
  { name: 'TRAVEL ESSENTIALS', desc: 'Duffle, Trolleys & Travel Bags', img: 'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=400&h=300&fit=crop' },
  { name: 'CAMPUS COLLECTION', desc: 'School & Uni Bags', img: 'https://images.unsplash.com/photo-1576053139778-7e32f2ae3cfa?w=400&h=300&fit=crop' },
  { name: 'EXECUTIVE PICKS', desc: 'Leather Bags & Office Essentials', img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=300&fit=crop' },
];

const followImages = [
  'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200&h=200&fit=crop',
];

const testimonials = [];

const whyReasons = [
  { Icon: Truck, title: 'Free Shipping', desc: 'Worldwide delivery on orders over $199' },
  { Icon: Package, title: 'Premium Packaging', desc: 'Luxury unboxing experience' },
  { Icon: Lock, title: 'Secure Payment', desc: '100% encrypted transactions' },
  { Icon: ShieldCheck, title: 'Easy Returns', desc: '30-day satisfaction guarantee' },
];

/* ─── HELPERS ────────────────────────────────────────────────────────── */
const scroll = (id, dir) => {
  const el = document.getElementById(id);
  if (el) el.scrollBy({ left: dir === 'next' ? 300 : -300, behavior: 'smooth' });
};

/* ─── COMPONENT ──────────────────────────────────────────────────────── */
export default function HomePage({ wishlist, setWishlist }) {
  const navigate = useNavigate();
  const [arrivedProducts, setArrivedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollProgress, setScrollProgress] = useState(0);
  const heroRef = useRef(null);
  const bagContainerRef = useRef(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const { data } = await axios.get(`${API_URL}/api/products`);
        if (data.success) {
          const sorted = [...data.products].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setArrivedProducts(sorted.slice(0, 9));
        }
      } catch (error) {
        console.error('Error fetching products', error);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoadingReviews(true);
      try {
        const { data } = await axios.get(`${API_URL}/api/reviews`);
        if (data.success) setReviews(data.reviews.slice(0, 3));
      } catch (error) {
        console.error('Error fetching reviews', error);
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchReviews();
  }, []);

  // Mouse parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Scroll progress
  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -rect.top / rect.height));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleWishlist = (product) => {
    if (!wishlist || !setWishlist) return;
    const isInWishlist = wishlist.some(w => w.id === product.id);
    if (isInWishlist) {
      setWishlist(w => w.filter(x => x.id !== product.id));
    } else {
      setWishlist(w => [...w, product]);
    }
  };

  const isWishlisted = (id) => wishlist?.some(w => w.id === id);

  // Calculate parallax transform
  const parallaxX = mousePosition.x * 20;
  const parallaxY = mousePosition.y * 15;
  const parallaxRotateY = mousePosition.x * 2;
  const parallaxRotateX = -mousePosition.y * 1.5;

  // Scroll transform
  const scrollScale = 1 + scrollProgress * 0.08;
  const scrollTranslateY = scrollProgress * -80;
  const scrollGlow = 0.15 + scrollProgress * 0.15;

  return (
   <div className="bg-black text-white" style={{ fontFamily: "'Inter', sans-serif", paddingTop: '96px' }}>
      
      {/* ─── CUSTOM CURSOR ────────────────────────────────────────── */}
      <style>{`
        * { cursor: default !important; }
        .custom-cursor {
          pointer-events: none;
          position: fixed;
          z-index: 99999;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid #d4af37;
          background: radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%);
          transform: translate(-50%, -50%);
          transition: width 0.3s, height 0.3s, background 0.3s;
          mix-blend-mode: difference;
        }
        .custom-cursor.expanded {
          width: 60px;
          height: 60px;
          background: radial-gradient(circle, rgba(212,175,55,0.25) 0%, transparent 70%);
        }
        .custom-cursor.view {
          width: 80px;
          height: 80px;
          background: radial-gradient(circle, rgba(212,175,55,0.3) 0%, transparent 70%);
        }
        .custom-cursor.view::after {
          content: 'VIEW';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 2px;
          color: #d4af37;
        }
        .custom-cursor.rotate {
          transform: translate(-50%, -50%) rotate(45deg);
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes floatAccessory {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-15px) rotate(3deg); }
          66% { transform: translateY(10px) rotate(-2deg); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes ringPulse {
          0%, 100% { opacity: 0.4; transform: scale(0.95); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes shine {
          0% { left: -100%; opacity: 0; }
          10% { opacity: 0.6; }
          20% { opacity: 0.8; }
          30% { opacity: 0.6; }
          40% { left: 200%; opacity: 0; }
          100% { left: 200%; opacity: 0; }
        }
        @keyframes scrollIndicator {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        @keyframes textReveal {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .shimmer-text {
          background: linear-gradient(90deg, #d4af37 0%, #fff 25%, #d4af37 50%, #fff 75%, #d4af37 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s linear infinite;
        }
        .glass-card {
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(18px);
          border: 1px solid rgba(212,175,55,0.1);
        }
        .gold-border-hover:hover {
          border-color: rgba(212,175,55,0.6);
          box-shadow: 0 0 30px rgba(212,175,55,0.1);
        }
        .category-card {
          transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .category-card:hover {
          transform: scale(1.03);
          box-shadow: 0 20px 60px rgba(212,175,55,0.15);
        }
        .category-card .overlay {
          transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .category-card:hover .overlay {
          background: rgba(0,0,0,0.7);
        }
        .category-card .text-slide {
          transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
          transform: translateY(20px);
          opacity: 0;
        }
        .category-card:hover .text-slide {
          transform: translateY(0);
          opacity: 1;
        }
        .product-card {
          transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
          background: rgba(255,255,255,0.02);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(212,175,55,0.08);
        }
        .product-card:hover {
          transform: translateY(-12px) scale(1.02);
          box-shadow: 0 30px 60px rgba(0,0,0,0.5);
          border-color: rgba(212,175,55,0.3);
        }
        .product-card .product-image {
          transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .product-card:hover .product-image {
          transform: scale(1.08) rotate(-2deg);
        }
        .product-card .wishlist-btn {
          opacity: 0;
          transition: all 0.3s ease;
        }
        .product-card:hover .wishlist-btn {
          opacity: 1;
        }
        .product-card .quick-view {
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.4s ease;
        }
        .product-card:hover .quick-view {
          opacity: 1;
          transform: translateY(0);
        }
        .review-card {
          transition: all 0.4s ease;
        }
        .review-card:hover {
          transform: translateY(-8px);
          border-color: rgba(212,175,55,0.4);
          box-shadow: 0 20px 40px rgba(212,175,55,0.08);
        }
        .text-reveal {
          animation: textReveal 0.8s ease forwards;
        }
        .text-reveal-delay-1 { animation-delay: 0.1s; opacity: 0; }
        .text-reveal-delay-2 { animation-delay: 0.3s; opacity: 0; }
        .text-reveal-delay-3 { animation-delay: 0.5s; opacity: 0; }
        .text-reveal-delay-4 { animation-delay: 0.7s; opacity: 0; }
        .text-reveal-delay-5 { animation-delay: 0.9s; opacity: 0; }
        .noise-texture {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
          background-repeat: repeat;
          background-size: 256px 256px;
          opacity: 0.03;
          mix-blend-mode: overlay;
        }
        .shine-overlay {
          position: absolute;
          top: 0;
          left: -100%;
          width: 200%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(212,175,55,0.15), rgba(255,255,255,0.08), rgba(212,175,55,0.15), transparent);
          transform: skewX(-25deg);
          animation: shine 8s ease-in-out infinite;
          pointer-events: none;
          mix-blend-mode: screen;
        }
        @media (max-width: 768px) {
          .custom-cursor { display: none; }
          * { cursor: auto !important; }
        }
      `}</style>

      {/* ─── CUSTOM CURSOR ELEMENT ────────────────────────────────── */}
      <div className="custom-cursor" id="customCursor"></div>

     

      {/* ─── NAVBAR ────────────────────────────────────────────────── */}
      <Navbar wishlistCount={wishlist?.length || 0} />

      {/* ─── {/* ─── HERO SECTION ────────────────────────────────────────────── */}
<section 
  ref={heroRef} 
  className="position-relative overflow-hidden hero-section" 
 style={{ 
  height: '100vh', 
  minHeight: '600px', 
  maxWidth: '1920px',
  margin: '0 auto',
  background: '#0a0a0a',
  position: 'relative'
}}
>
 {/* ── Background Image ── */}
<div className="position-absolute top-0 start-0 w-100 h-100" style={{ zIndex: 0 }}>
  <img 
    src="/images/hero.png" 
    alt="Hero Background" 
    className="w-100 h-100"
    style={{ 
      objectFit: 'cover', 
      objectPosition: '70% center',
      opacity: 1,
      filter: 'brightness(1) contrast(1.05) saturate(1.1)'
    }}
  />
  <div 
    className="position-absolute top-0 start-0 w-100 h-100"
    style={{ 
      background: 'linear-gradient(to right, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.7) 25%, rgba(10,10,10,0.2) 50%, transparent 70%)'
    }}
  ></div>
</div>

  {/* ── Hero Content Container ── */}
  <div className="container-fluid px-4 px-md-5 h-100 position-relative" style={{ maxWidth: '1600px', zIndex: 2 }}>
    <div className="row h-100 align-items-center">
      
      {/* ── LEFT CONTENT ── */}
      <div className="col-lg-6 d-flex flex-column justify-content-center" style={{ paddingTop: '20px' }}>
        <div className="mb-3">
          <span className="text-uppercase" style={{ color: '#d4af37', fontSize: '14px', letterSpacing: '4px', fontFamily: "'Inter', sans-serif", fontWeight: '500' }}>
            TIMELESS BEAUTY, MODERN YOU
          </span>
        </div>
        
        <h1 className="fw-bold mb-2" style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(48px, 7vw, 84px)',
          lineHeight: '1',
          letterSpacing: '0.5px',
          color: '#fff'
        }}>
          <span className="d-block">Elegance</span>
          <span className="d-block" style={{ color: '#d4af37' }}>Redefined</span>
        </h1>
        
        <p className="mb-4" style={{
          fontSize: 'clamp(15px, 1.1vw, 18px)',
          color: 'rgba(255,255,255,0.7)',
          maxWidth: '520px',
          lineHeight: '1.8',
          fontFamily: "'Inter', sans-serif"
        }}>
          Discover handpicked collections of premium bags & jewellery that reflect your unique shine.
        </p>
        
        <div>
          <button className="btn px-5 py-3 fw-bold text-uppercase" style={{
            background: '#d4af37',
            color: '#000',
            border: 'none',
            fontSize: '14px',
            letterSpacing: '2px',
            fontFamily: "'Inter', sans-serif",
            transition: 'all 0.3s ease'
          }} onMouseEnter={e => {
            e.currentTarget.style.background = '#c9a030';
            e.currentTarget.style.transform = 'scale(1.02)';
          }} onMouseLeave={e => {
            e.currentTarget.style.background = '#d4af37';
            e.currentTarget.style.transform = 'scale(1)';
          }} onClick={() => navigate('/shop')}>
            SHOP NOW
          </button>
        </div>
        
        {/* Features Bar */}
        <div className="d-flex gap-5 mt-4 pt-3" style={{ borderTop: '1px solid rgba(212,175,55,0.15)' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#d4af37', letterSpacing: '1px', fontWeight: '600' }}>PREMIUM</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', letterSpacing: '0.5px' }}>QUALITY</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#d4af37', letterSpacing: '1px', fontWeight: '600' }}>SECURE</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', letterSpacing: '0.5px' }}>PAYMENT</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#d4af37', letterSpacing: '1px', fontWeight: '600' }}>WORLDWIDE</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', letterSpacing: '0.5px' }}>DELIVERY</div>
          </div>
        </div>
      </div>
      
      {/* ── RIGHT SIDE: Empty for image to show ── */}
      <div className="col-lg-6 d-none d-lg-block"></div>
    </div>
  </div>
</section>

      {/* ─── SHOP BY CATEGORY ──────────────────────────────────────────── */}
      <section className="py-5" style={{ paddingTop: '140px', paddingBottom: '120px', background: '#0a0a0a', borderBottom: '1px solid rgba(212,175,55,0.05)' }}>
        <div className="container-fluid px-1 px-md-2" style={{ maxWidth: '1600px' }}>
          <div className="text-center mb-5">
            <h2 className="display-4 fw-bold text-uppercase" style={{ 
              fontFamily: "'Cormorant Garamond', serif",
              letterSpacing: '2px',
              color: '#fff'
            }}>
              Shop by Category
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '20px', fontFamily: "'Inter', sans-serif" }}>
              Discover our curated collections
            </p>
            <div className="mx-auto mt-3" style={{ width: '60px', height: '2px', background: '#d4af37' }}></div>
          </div>
          
          <div className="row g-4">
            {categories.map((cat, i) => (
              <div key={i} className="col-lg-6">
                <div className="category-card category-card-mobile position-relative overflow-hidden rounded-4" style={{ 
                  height: '550px', 
                  cursor: 'pointer',
                  background: i === 0 ? '#1a1510' : '#0d0d0d'
                }}>
                  <img 
                    src={cat.img} 
                    alt={cat.name} 
                    className="w-100 h-100 object-fit-cover"
                    style={{ transition: 'transform 0.8s cubic-bezier(0.23, 1, 0.32, 1)' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  />
                  <div className="overlay position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
                    <h3 className="display-5 fw-bold text-white text-center" style={{ fontFamily: "'Cormorant Garamond', serif", letterSpacing: '2px' }}>
                      {cat.name}
                    </h3>
                    <p className="text-center text-slide" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '18px' }}>{cat.desc}</p>
                    <button className="btn text-uppercase fw-bold px-5 py-3 mt-3 text-slide" style={{
                      background: 'transparent',
                      color: '#d4af37',
                      border: '2px solid #d4af37',
                      fontSize: '14px',
                      letterSpacing: '2px',
                      transition: 'all 0.4s ease'
                    }} onMouseEnter={e => {
                      e.currentTarget.style.background = '#d4af37';
                      e.currentTarget.style.color = '#000';
                    }} onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#d4af37';
                    }} onClick={() => navigate('/shop')}>
                      Explore Collection
                      <ArrowRight size={16} className="ms-2" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── JUST ARRIVED ────────────────────────────────────────────────── */}
      <section className="py-5" style={{ paddingTop: '100px', paddingBottom: '100px', background: '#0a0a0a', borderBottom: '1px solid rgba(212,175,55,0.05)' }}>
        <div className="container-fluid px-1 px-md-2" style={{ maxWidth: '1600px' }}>
          <div className="text-center mb-5">
            <h2 className="display-4 fw-bold text-uppercase" style={{ 
              fontFamily: "'Cormorant Garamond', serif",
              letterSpacing: '2px',
              color: '#fff'
            }}>
              New Arrivals
            </h2>
            <div className="mx-auto mt-3" style={{ width: '60px', height: '2px', background: '#d4af37' }}></div>
          </div>

          {loadingProducts ? (
            <div className="d-flex gap-4 overflow-auto" style={{ padding: '20px 0', overflowX: 'auto' }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex-shrink-0" style={{ minWidth: '260px' }}>
                  <div style={{ height: '260px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(212,175,55,0.08)' }} />
                  <div className="p-4">
                    <div style={{ height: '18px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '8px', width: '70%' }} />
                    <div style={{ height: '14px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '12px', width: '50%' }} />
                    <div style={{ height: '22px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', width: '40%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : arrivedProducts.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-secondary" style={{ fontSize: '15px' }}>No products available right now.</p>
            </div>
          ) : (
            <div className="position-relative px-4">
              <button
                className="position-absolute top-50 translate-middle-y d-flex align-items-center justify-content-center border-0"
                style={{ left: '-8px', zIndex: 10, width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(212,175,55,0.1)', backdropFilter: 'blur(12px)', border: '1px solid rgba(212,175,55,0.2)', color: '#d4af37', cursor: 'pointer', transition: 'all 0.3s ease' }}
                onClick={() => scroll('arrived', 'prev')}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.2)'; e.currentTarget.style.transform = 'scale(1.1)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.1)'; e.currentTarget.style.transform = 'scale(1)' }}
              >
                <ChevronLeft size={20} />
              </button>
              
              <div id="arrived" className="d-flex gap-4 overflow-auto scroll-section" style={{ scrollBehavior: 'smooth', scrollbarWidth: 'none', msOverflowStyle: 'none', padding: '20px 0' }}>
                {arrivedProducts.map((p) => (
                  <div key={p.id} className="product-card flex-shrink-0 overflow-hidden rounded-4" style={{ width: '260px', cursor: 'pointer' }} onClick={() => navigate('/shop')}>
                    <div className="position-relative" style={{ height: '260px', background: 'rgba(255,255,255,0.02)', overflow: 'hidden' }}>
                      <img src={p.mainImage} alt={p.name} className="product-image w-100 h-100 object-fit-contain p-3" />
                      <button
                        className="wishlist-btn position-absolute top-0 end-0 m-3 border-0 p-2 rounded-circle"
                        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', cursor: 'pointer', transition: 'all 0.3s ease' }}
                        onClick={(e) => { e.stopPropagation(); toggleWishlist(p); }}
                      >
                        <Heart
                          size={18}
                          fill={isWishlisted(p.id) ? '#d4af37' : 'none'}
                          color={isWishlisted(p.id) ? '#d4af37' : '#ffffff'}
                        />
                      </button>
                      {p.isNew && (
                        <div className="position-absolute top-0 start-0 m-3 px-3 py-1"
                          style={{ background: '#d4af37', fontSize: '10px', fontWeight: 700, letterSpacing: '1px', color: '#000', borderRadius: '20px' }}>
                          NEW
                        </div>
                      )}
                      <div className="quick-view position-absolute bottom-0 start-0 w-100 p-4 text-center" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
                        <span style={{ color: '#d4af37', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase' }}>Quick View</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="fw-semibold text-white mb-1" style={{ fontSize: '18px', fontFamily: "'Inter', sans-serif" }}>{p.name}</div>
                      <div className="text-secondary mb-2" style={{ fontSize: '14px' }}>{p.category}</div>
                      <div className="d-flex align-items-center gap-3 mb-2">
                        <span className="fw-bold" style={{ color: '#d4af37', fontSize: '20px', fontFamily: "'Inter', sans-serif" }}>Rs. {p.salePrice ? p.salePrice.toLocaleString() : p.price.toLocaleString()}</span>
                        {p.salePrice && <span className="text-decoration-line-through" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>Rs. {p.price.toLocaleString()}</span>}
                      </div>
                      <div className="d-flex gap-1">
                        {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} fill={s <= Math.round(p.rating || 4) ? '#d4af37' : 'rgba(255,255,255,0.1)'} color="#d4af37" />)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button
                className="position-absolute top-50 translate-middle-y d-flex align-items-center justify-content-center border-0"
                style={{ right: '-8px', zIndex: 10, width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(212,175,55,0.1)', backdropFilter: 'blur(12px)', border: '1px solid rgba(212,175,55,0.2)', color: '#d4af37', cursor: 'pointer', transition: 'all 0.3s ease' }}
                onClick={() => scroll('arrived', 'next')}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.2)'; e.currentTarget.style.transform = 'scale(1.1)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.1)'; e.currentTarget.style.transform = 'scale(1)' }}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ─── WHY CHOOSE VELNORA ────────────────────────────────────────── */}
      <section className="py-5" style={{ paddingTop: '100px', paddingBottom: '100px', background: '#050505', borderBottom: '1px solid rgba(212,175,55,0.05)' }}>
        <div className="container-fluid px-1 px-md-2" style={{ maxWidth: '1600px' }}>
          <div className="text-center mb-5">
            <h2 className="display-4 fw-bold text-uppercase" style={{ 
              fontFamily: "'Cormorant Garamond', serif",
              letterSpacing: '2px',
              color: '#fff'
            }}>
              Why Choose Velnora
            </h2>
            <div className="mx-auto mt-3" style={{ width: '60px', height: '2px', background: '#d4af37' }}></div>
          </div>
          
          <div className="row g-4">
            {whyReasons.map((r, i) => (
              <div key={i} className="col-lg-3 col-md-6">
                <div className="glass-card p-4 text-center rounded-4 h-100 gold-border-hover" style={{ transition: 'all 0.4s ease' }}>
                  <div className="d-flex align-items-center justify-content-center mb-3">
                    <div className="rounded-circle p-3" style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.1)' }}>
                      <r.Icon size={32} color="#d4af37" strokeWidth={1.5} />
                    </div>
                  </div>
                  <h4 className="fw-semibold mb-2" style={{ fontFamily: "'Inter', sans-serif", color: '#fff' }}>{r.title}</h4>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', fontFamily: "'Inter', sans-serif" }}>{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CUSTOMER FAVORITES ────────────────────────────────────────── */}
      <section className="py-5" style={{ paddingTop: '100px', paddingBottom: '100px', background: '#0a0a0a', borderBottom: '1px solid rgba(212,175,55,0.05)' }}>
        <div className="container-fluid px-1 px-md-2" style={{ maxWidth: '1600px' }}>
          <div className="text-center mb-5">
            <h2 className="display-4 fw-bold text-uppercase" style={{ 
              fontFamily: "'Cormorant Garamond', serif",
              letterSpacing: '2px',
              color: '#fff'
            }}>
              Best Sellers
            </h2>
            <div className="mx-auto mt-3" style={{ width: '60px', height: '2px', background: '#d4af37' }}></div>
          </div>
          
          <div className="position-relative px-4">
            <button
              className="position-absolute top-50 translate-middle-y d-flex align-items-center justify-content-center border-0"
              style={{ left: '-8px', zIndex: 10, width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(212,175,55,0.1)', backdropFilter: 'blur(12px)', border: '1px solid rgba(212,175,55,0.2)', color: '#d4af37', cursor: 'pointer', transition: 'all 0.3s ease' }}
              onClick={() => scroll('favorites', 'prev')}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.2)'; e.currentTarget.style.transform = 'scale(1.1)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.1)'; e.currentTarget.style.transform = 'scale(1)' }}
            >
              <ChevronLeft size={20} />
            </button>
            
            <div id="favorites" className="d-flex gap-4 overflow-auto scroll-section" style={{ scrollBehavior: 'smooth', scrollbarWidth: 'none', msOverflowStyle: 'none', padding: '20px 0' }}>
              {favProducts.map((p, i) => (
                <div key={i} className="product-card flex-shrink-0 overflow-hidden rounded-4" style={{ width: '300px', cursor: 'pointer' }} onClick={() => navigate('/shop')}>
                  <div className="position-relative" style={{ height: '300px', background: 'rgba(255,255,255,0.02)', overflow: 'hidden' }}>
                    <img src={p.img} alt={p.name} className="product-image w-100 h-100 object-fit-cover" />
                    <div className="quick-view position-absolute bottom-0 start-0 w-100 p-4 text-center" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
                      <span style={{ color: '#d4af37', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase' }}>Quick View</span>
                    </div>
                  </div>
                  <div className="p-4 text-center">
                    <div className="fw-semibold text-white mb-1" style={{ fontSize: '18px', fontFamily: "'Inter', sans-serif" }}>{p.name}</div>
                    <div className="mb-2" style={{ color: '#d4af37', fontSize: '20px', fontFamily: "'Inter', sans-serif" }}>{p.price}</div>
                    <div className="d-flex justify-content-center gap-1">
                      {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} fill="#d4af37" color="#d4af37" />)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button
              className="position-absolute top-50 translate-middle-y d-flex align-items-center justify-content-center border-0"
              style={{ right: '-8px', zIndex: 10, width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(212,175,55,0.1)', backdropFilter: 'blur(12px)', border: '1px solid rgba(212,175,55,0.2)', color: '#d4af37', cursor: 'pointer', transition: 'all 0.3s ease' }}
              onClick={() => scroll('favorites', 'next')}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.2)'; e.currentTarget.style.transform = 'scale(1.1)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.1)'; e.currentTarget.style.transform = 'scale(1)' }}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* ─── CUSTOMER REVIEWS ───────────────────────────────────────────── */}
      <section className="py-5" style={{ paddingTop: '100px', paddingBottom: '100px', background: '#050505', borderBottom: '1px solid rgba(212,175,55,0.05)' }}>
        <div className="container-fluid px-1 px-md-2" style={{ maxWidth: '1600px' }}>
          <div className="text-center mb-5">
            <h2 className="display-4 fw-bold text-uppercase" style={{ 
              fontFamily: "'Cormorant Garamond', serif",
              letterSpacing: '2px',
              color: '#fff'
            }}>
              What Our Customers Say
            </h2>
            <div className="mx-auto mt-3" style={{ width: '60px', height: '2px', background: '#d4af37' }}></div>
          </div>
          
          <div className="row g-4">
            {loadingReviews ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="col-lg-4">
                  <div className="glass-card p-5 rounded-4 h-100" style={{ border: '1px solid rgba(212,175,55,0.05)' }}>
                    <div className="d-flex gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map(s => (
                        <div key={s} style={{ width: '18px', height: '18px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)' }} />
                      ))}
                    </div>
                    <div style={{ height: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '10px', width: '100%' }} />
                    <div style={{ height: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '10px', width: '90%' }} />
                    <div style={{ height: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '20px', width: '75%' }} />
                    <div className="d-flex align-items-center gap-3">
                      <div className="rounded-circle" style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.05)' }} />
                      <div>
                        <div style={{ height: '14px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '6px', width: '100px' }} />
                        <div style={{ height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', width: '80px' }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (reviews.length > 0 ? reviews : [
              { text: 'The quality exceeded my expectations. Truly luxury at its finest.', author: 'Aisha Khan', rating: 5 },
              { text: 'Velora pieces make me feel like royalty. The craftsmanship is unmatched.', author: 'Fatima Ahmed', rating: 5 },
              { text: 'From packaging to product, every detail is perfection.', author: 'Sara Malik', rating: 5 },
            ]).map((t, i) => (
              <div key={t._id || i} className="col-lg-4">
                <div className="review-card glass-card p-5 rounded-4 h-100" style={{ border: '1px solid rgba(212,175,55,0.05)' }}>
                  <div className="d-flex gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={18} fill={s <= (t.rating || 5) ? '#d4af37' : 'rgba(255,255,255,0.1)'} color="#d4af37" />)}
                  </div>
                  <p className="fst-italic mb-3" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '18px', lineHeight: '1.8', fontFamily: "'Inter', sans-serif" }}>"{t.text}"</p>
                  <div className="d-flex align-items-center gap-3">
                    <div className="rounded-circle" style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #d4af37, #b8942f)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold', color: '#000' }}>
                      {t.author?.charAt(0) || '?'}
                    </div>
                    <div>
                      <div className="fw-semibold" style={{ fontFamily: "'Inter', sans-serif", color: '#fff' }}>{t.author}</div>
                      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', letterSpacing: '1px' }}>
                        {t.location || 'Verified Buyer'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── INSTAGRAM GALLERY ──────────────────────────────────────────── */}
      <section className="py-5" style={{ paddingTop: '100px', paddingBottom: '100px', background: '#0a0a0a', borderBottom: '1px solid rgba(212,175,55,0.05)' }}>
        <div className="container-fluid px-1 px-md-2" style={{ maxWidth: '1600px' }}>
          <div className="text-center mb-5">
            <h2 className="display-4 fw-bold text-uppercase" style={{ 
              fontFamily: "'Cormorant Garamond', serif",
              letterSpacing: '2px',
              color: '#fff'
            }}>
              Follow @velnora
            </h2>
            <div className="mx-auto mt-3" style={{ width: '60px', height: '2px', background: '#d4af37' }}></div>
          </div>
          
          <div className="row g-3">
            {followImages.map((img, i) => (
              <div key={i} className="col-lg-2 col-md-3 col-6">
                <div className="position-relative overflow-hidden rounded-3" style={{ aspectRatio: '1', cursor: 'pointer' }}>
                  <img src={img} alt={`Post ${i + 1}`} className="w-100 h-100 object-fit-cover" style={{ transition: 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)' }} />
                  <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ 
                    background: 'rgba(0,0,0,0.5)',
                    opacity: 0,
                    transition: 'opacity 0.4s ease'
                  }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0'}>
                    <InstagramIcon size={32} color="#d4af37" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── NEWSLETTER ────────────────────────────────────────────────── */}
      <SubscribeSection
        title="Join the Velora Collection"
        subtitle="Be the first to discover new arrivals, exclusive offers, and luxury drops."
        buttonText="Subscribe"
      />

      <Footer />
    </div>
  );
}