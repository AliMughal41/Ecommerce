import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import HomePage from './pages/HomePage'
import ShopPage from './pages/ShopPage'
import BagsPage from './pages/BagsPage'
import JewelleryPage from './pages/JewelleryPage'
import CollectionsPage from './pages/CollectionsPage'
import NewArrivalsPage from './pages/NewArrivalsPage'
import BrandsPage from './pages/BrandsPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/Checkoutpage'
import ProductDetailPage from './pages/ProductDetailPage'

import WishlistPage from './pages/Wishlistpage'
import Adminproducts from './pages/admin/Adminproducts.jsx'
import AdminLogin from './pages/admin/AdminLogin.jsx'
import AdminCategories from './pages/admin/AdminCategories'
import AdminRegister from './pages/admin/AdminRegister.jsx'
import AdminVerifyOtp from './pages/admin/AdminVerifyOtp.jsx'
import AdminOrders from './pages/admin/AdminOrders.jsx'
import AdminCustomers from './pages/admin/AdminCustomers.jsx'
import AdminReviews from './pages/admin/AdminReviews.jsx'
import AdminSuperCategories from './pages/admin/AdminSuperCategories.jsx'
import AdminProfile from './pages/admin/AdminProfile.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

import CustomerAuthProvider from './context/CustomerAuthContext'
import AlertProvider from './context/AlertContext'
import CustomerLogin from './pages/CustomerLogin'
import CustomerRegister from './pages/CustomerRegister'
import ForgotPassword from './pages/ForgotPassword'
import MyAccount from './pages/MyAccount'
import Profile from './pages/account/Profile'
import MyOrders from './pages/account/MyOrders'
import OrderDetails from './pages/account/OrderDetails'
import Addresses from './pages/account/Addresses'
import ChangePassword from './pages/account/ChangePassword'
import TrackOrder from './pages/TrackOrder'

import FloatingWhatsApp from './components/FloatingWhatsApp'

import { Navigate } from 'react-router-dom'
import axios from 'axios'
import './App.css'
import API_URL from './config'

const ProtectedRoute = ({ children }) => {
  const [valid, setValid] = useState(null);
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    if (!token) { setValid(false); return; }
    axios.get(`${API_URL}/api/auth/verify-token`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => { if (res.data.success) setValid(true); else { localStorage.removeItem('adminToken'); setValid(false); }})
    .catch(() => { localStorage.removeItem('adminToken'); setValid(false); });
  }, [token]);

  if (valid === null) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0a0a0a', color: '#c9a84c', fontSize: '14px' }}>Verifying access...</div>;
  if (!valid) return <Navigate to="/admin-secret-login" replace />;
  return children;
};

function App() {
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('thriftora_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load wishlist from localStorage', e);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('thriftora_wishlist', JSON.stringify(wishlist));
      window.dispatchEvent(new Event('wishlist-updated'));
    } catch (e) {
      console.error('Failed to save wishlist to localStorage', e);
    }
  }, [wishlist]);

  const removeFromWishlist = (id) => setWishlist(w => w.filter(x => (x._id || x.id) !== id));

  const addToBag = (item) => {
    const cartItem = {
      id: item._id || item.id,
      name: item.name,
      condition: item.condition || '9/10',
      size: item.size || null,
      color: item.color || null,
      category: item.category,
      price: item.salePrice || item.price || 0,
      img: item.mainImage || item.images?.[0]?.url || '',
      qty: 1,
      stock: item.stock,
    };
    const existingCart = JSON.parse(localStorage.getItem('thriftora_cart') || '[]');
    const existingItem = existingCart.find(i => i.id === cartItem.id);
    if (existingItem) {
      if (cartItem.stock && existingItem.qty >= cartItem.stock) return;
      existingItem.qty += 1;
    } else {
      existingCart.push(cartItem);
    }
    localStorage.setItem('thriftora_cart', JSON.stringify(existingCart));
    window.dispatchEvent(new Event('cart-updated'));
  };

  return (
    <CustomerAuthProvider>
    <AlertProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ShopPage wishlist={wishlist} setWishlist={setWishlist} />} />
        <Route path="/shop" element={<ShopPage wishlist={wishlist} setWishlist={setWishlist} />} />
        <Route path="/bags" element={<BagsPage wishlist={wishlist} setWishlist={setWishlist} />} />
        <Route path="/jewellery" element={<JewelleryPage wishlist={wishlist} setWishlist={setWishlist} />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/collections" element={<CollectionsPage />} />
        <Route path="/new-arrivals" element={<NewArrivalsPage wishlist={wishlist} setWishlist={setWishlist} />} />
        <Route path="/brands" element={<BrandsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/admin-categories" element={
          <ProtectedRoute>
            <AdminCategories />
          </ProtectedRoute>
        } />
        <Route path="/admin-super-categories" element={
          <ProtectedRoute>
            <AdminSuperCategories />
          </ProtectedRoute>
        } />
        <Route path="/admin-profile" element={
          <ProtectedRoute>
            <AdminProfile />
          </ProtectedRoute>
        } />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/product/:id" element={<ProductDetailPage wishlist={wishlist} setWishlist={setWishlist} />} />
        <Route path="/admin-secret-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin-register" element={<AdminRegister />} />
        <Route path="/admin-verify-otp" element={<AdminVerifyOtp />} />
        <Route path="/admin-orders" element={
          <ProtectedRoute>
            <AdminOrders />
          </ProtectedRoute>
        } />
        <Route path="/admin-customers" element={
          <ProtectedRoute>
            <AdminCustomers />
          </ProtectedRoute>
        } />
        <Route path="/admin-reviews" element={
          <ProtectedRoute>
            <AdminReviews />
          </ProtectedRoute>
        } />
        <Route path="/adminproducts" element={
          <ProtectedRoute>
            <Adminproducts />
          </ProtectedRoute>
        } />
        <Route path="/wishlist" element={
          <WishlistPage
            wishlistItems={wishlist}
            onRemove={removeFromWishlist}
            onAddToBag={addToBag}
          />}
        />

        {/* Customer Auth */}
        <Route path="/login" element={<CustomerLogin />} />
        <Route path="/register" element={<CustomerRegister />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* My Account */}
        <Route path="/account" element={<MyAccount />}>
          <Route index element={<div />} />
          <Route path="profile" element={<Profile />} />
          <Route path="orders" element={<MyOrders />} />
          <Route path="orders/:id" element={<OrderDetails />} />
          <Route path="addresses" element={<Addresses />} />
          <Route path="change-password" element={<ChangePassword />} />
        </Route>

        {/* Order Tracking (public) */}
        <Route path="/track-order" element={<TrackOrder />} />

        {/* 404 Catch-all */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <FloatingWhatsApp />
    </BrowserRouter>
    </AlertProvider>
    </CustomerAuthProvider>
  )
}

export default App
