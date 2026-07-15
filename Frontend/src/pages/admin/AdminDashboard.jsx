import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Package, ShoppingCart, Users, Star, TrendingUp, DollarSign,
  Clock, Truck, CheckCircle, XCircle, Eye, Loader2, LayoutDashboard,
  ArrowUpRight, RefreshCw
} from 'lucide-react';
import API_URL from '../../config';
import AdminSidebar from '../../components/AdminSidebar';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    products: 0, categories: 0, orders: 0, customers: 0, reviews: 0, subscribers: 0,
    totalRevenue: 0, pendingOrders: 0, processingOrders: 0, shippedOrders: 0,
    deliveredOrders: 0, cancelledOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [productsRes, categoriesRes, ordersRes, customersRes, reviewsRes, subscribersRes] = await Promise.allSettled([
        axios.get(`${API_URL}/api/products`, config),
        axios.get(`${API_URL}/api/categories`, config),
        axios.get(`${API_URL}/api/orders`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/customers`, config),
        axios.get(`${API_URL}/api/reviews`, config),
        axios.get(`${API_URL}/api/contact/subscribers`, config),
      ]);

      const products = productsRes.status === 'fulfilled' ? (productsRes.value.data.products || []) : [];
      const categories = categoriesRes.status === 'fulfilled' ? (categoriesRes.value.data.categories || []) : [];
      const orders = ordersRes.status === 'fulfilled' ? (ordersRes.value.data.orders || []) : [];
      const customers = customersRes.status === 'fulfilled' ? (customersRes.value.data.customers || []) : [];
      const reviews = reviewsRes.status === 'fulfilled' ? (reviewsRes.value.data.reviews || []) : [];
      const subscribers = subscribersRes.status === 'fulfilled' ? (subscribersRes.value.data.subscribers || []) : [];

      const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
      const pendingOrders = orders.filter(o => o.status === 'Pending').length;
      const processingOrders = orders.filter(o => o.status === 'Processing').length;
      const shippedOrders = orders.filter(o => o.status === 'Shipped').length;
      const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;
      const cancelledOrders = orders.filter(o => o.status === 'Cancelled').length;

      setStats({
        products: products.length, categories: categories.length, orders: orders.length,
        customers: customers.length, reviews: reviews.length, subscribers: subscribers.length,
        totalRevenue, pendingOrders, processingOrders, shippedOrders, deliveredOrders, cancelledOrders
      });

      const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRecentOrders(sortedOrders.slice(0, 5));

      const lowStock = products.filter(p => p.stock > 0 && p.stock <= 10).sort((a, b) => a.stock - b.stock);
      setLowStockProducts(lowStock.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Revenue', value: `Rs. ${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: '#4caf50', bg: 'rgba(76,175,80,0.1)' },
    { label: 'Total Orders', value: stats.orders, icon: ShoppingCart, color: '#c9a84c', bg: 'rgba(201,168,76,0.1)' },
    { label: 'Products', value: stats.products, icon: Package, color: '#2196f3', bg: 'rgba(33,150,243,0.1)' },
    { label: 'Customers', value: stats.customers, icon: Users, color: '#9c27b0', bg: 'rgba(156,39,176,0.1)' },
    { label: 'Reviews', value: stats.reviews, icon: Star, color: '#ff9800', bg: 'rgba(255,152,0,0.1)' },
    { label: 'Subscribers', value: stats.subscribers, icon: TrendingUp, color: '#00bcd4', bg: 'rgba(0,188,212,0.1)' },
  ];

  const orderStats = [
    { label: 'Pending', value: stats.pendingOrders, color: '#ff9800', bg: 'rgba(255,152,0,0.1)' },
    { label: 'Processing', value: stats.processingOrders, color: '#2196f3', bg: 'rgba(33,150,243,0.1)' },
    { label: 'Shipped', value: stats.shippedOrders, color: '#9c27b0', bg: 'rgba(156,39,176,0.1)' },
    { label: 'Delivered', value: stats.deliveredOrders, color: '#4caf50', bg: 'rgba(76,175,80,0.1)' },
    { label: 'Cancelled', value: stats.cancelledOrders, color: '#f44336', bg: 'rgba(244,67,54,0.1)' },
  ];

  const statusColor = (s) => {
    switch (s) {
      case 'Pending': return '#ff9800';
      case 'Processing': return '#2196f3';
      case 'Shipped': return '#9c27b0';
      case 'Delivered': return '#4caf50';
      case 'Cancelled': return '#f44336';
      default: return '#8a7a6a';
    }
  };

  const quickActions = [
    { label: 'Add Product', path: '/adminproducts', icon: Package, color: '#c9a84c' },
    { label: 'View Orders', path: '/admin-orders', icon: ShoppingCart, color: '#2196f3' },
    { label: 'Categories', path: '/admin-categories', icon: TrendingUp, color: '#4caf50' },
    { label: 'Customers', path: '/admin-customers', icon: Users, color: '#9c27b0' },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a' }}>
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="admin-main-content" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <Loader2 size={36} style={{ color: '#c9a84c', animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ color: '#8a7a6a', fontSize: '13px', marginTop: '12px' }}>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="admin-main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Bar */}
        <div style={{ height: '60px', background: '#0d0a06', borderBottom: '1px solid #2a1f10', display: 'flex', alignItems: 'center', padding: '0 24px', gap: '16px', flexShrink: 0 }}>
          <button onClick={() => setSidebarOpen(s => !s)} className="admin-hamburger" style={{ background: 'transparent', border: 'none', color: '#8a7a6a', cursor: 'pointer', padding: '4px' }}>
            <span style={{ fontSize: '20px' }}>☰</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', border: '1.5px solid #c9a84c', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <img src="/images/logo.png" alt="VELNORA" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: '14px', letterSpacing: '2px', color: '#c9a84c' }}>VELNORA</span>
          </div>
          <div style={{ flex: 1 }} />
          <button onClick={fetchDashboard} style={{ background: 'transparent', border: '1px solid #2a1f10', color: '#8a7a6a', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#c9a84c'; e.currentTarget.style.color = '#c9a84c'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a1f10'; e.currentTarget.style.color = '#8a7a6a'; }}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', overflow: 'auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', margin: 0 }}>Dashboard</h1>
            <p style={{ fontSize: '13px', color: '#8a7a6a', margin: '4px 0 0' }}>Welcome back! Here's your store overview.</p>
          </div>

          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
            {statCards.map((card, i) => (
              <div key={i} style={{ background: '#0d0a06', border: '1px solid #2a1f10', borderRadius: '8px', padding: '16px', transition: 'border-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = card.color}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#2a1f10'}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <card.icon size={18} style={{ color: card.color }} />
                  </div>
                </div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>{card.value}</div>
                <div style={{ fontSize: '11px', color: '#8a7a6a', marginTop: '2px', letterSpacing: '0.5px' }}>{card.label}</div>
              </div>
            ))}
          </div>

          {/* Order Status + Quick Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            {/* Order Status */}
            <div style={{ background: '#0d0a06', border: '1px solid #2a1f10', borderRadius: '8px', padding: '18px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', margin: '0 0 14px', letterSpacing: '0.5px' }}>Order Status</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {orderStats.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '6px', background: item.bg }}>
                    <span style={{ fontSize: '12px', color: item.color, fontWeight: 500 }}>{item.label}</span>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ background: '#0d0a06', border: '1px solid #2a1f10', borderRadius: '8px', padding: '18px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', margin: '0 0 14px', letterSpacing: '0.5px' }}>Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {quickActions.map((action, i) => (
                  <div key={i} onClick={() => navigate(action.path)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '6px', border: '1px solid #2a1f10', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = action.color; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a1f10'; e.currentTarget.style.background = 'transparent'; }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <action.icon size={16} style={{ color: action.color }} />
                      <span style={{ fontSize: '13px', color: '#fff', fontWeight: 500 }}>{action.label}</span>
                    </div>
                    <ArrowUpRight size={14} style={{ color: '#8a7a6a' }} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Orders + Low Stock */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Recent Orders */}
            <div style={{ background: '#0d0a06', border: '1px solid #2a1f10', borderRadius: '8px', padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '0.5px' }}>Recent Orders</h3>
                <span onClick={() => navigate('/admin-orders')} style={{ fontSize: '11px', color: '#c9a84c', cursor: 'pointer', fontWeight: 600 }}>View All →</span>
              </div>
              {recentOrders.length === 0 ? (
                <p style={{ fontSize: '12px', color: '#8a7a6a', textAlign: 'center', padding: '20px 0' }}>No orders yet</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {recentOrders.map((order, i) => (
                    <div key={order._id || i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '6px', border: '1px solid #1f1a14' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: '#fff', fontWeight: 500 }}>{order.customer?.name || order.customer?.email || 'Guest'}</div>
                        <div style={{ fontSize: '10px', color: '#8a7a6a' }}>{new Date(order.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#c9a84c' }}>Rs. {(order.total || 0).toLocaleString()}</div>
                        <span style={{ fontSize: '9px', fontWeight: 600, color: statusColor(order.status), letterSpacing: '0.5px' }}>{order.status?.toUpperCase()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Low Stock */}
            <div style={{ background: '#0d0a06', border: '1px solid #2a1f10', borderRadius: '8px', padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '0.5px' }}>Low Stock Alert</h3>
                <span onClick={() => navigate('/adminproducts')} style={{ fontSize: '11px', color: '#c9a84c', cursor: 'pointer', fontWeight: 600 }}>View All →</span>
              </div>
              {lowStockProducts.length === 0 ? (
                <p style={{ fontSize: '12px', color: '#8a7a6a', textAlign: 'center', padding: '20px 0' }}>All products well stocked</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {lowStockProducts.map((product, i) => (
                    <div key={product._id || i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '6px', border: '1px solid #1f1a14' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '6px', overflow: 'hidden', background: '#1a1410', flexShrink: 0 }}>
                          <img src={product.mainImage || product.images?.[0]?.url || ''} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#fff', fontWeight: 500 }}>{product.name}</div>
                          <div style={{ fontSize: '10px', color: '#8a7a6a' }}>{product.category}</div>
                        </div>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: product.stock <= 3 ? '#f44336' : '#ff9800', background: product.stock <= 3 ? 'rgba(244,67,54,0.1)' : 'rgba(255,152,0,0.1)', padding: '3px 8px', borderRadius: '4px' }}>
                        {product.stock} left
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
