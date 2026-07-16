import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Loader2, Eye, Trash2, RotateCcw, Search, PackageCheck,
  DollarSign, Hash, TrendingUp, MapPin, CreditCard, X, AlertTriangle
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import AdminSidebar from '../../components/AdminSidebar';
import Pagination from '../../components/Pagination';
import API_URL from '../../config';

const GOLD = '#c9a84c';
const COLORS = ['#c9a84c', '#e74c3c', '#27ae60', '#3498db', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22'];

export default function AdminDeliveredOrders() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [resettingAll, setResettingAll] = useState(false);
  const [resettingRevenue, setResettingRevenue] = useState(false);
  const [confirmResetAll, setConfirmResetAll] = useState(false);
  const [confirmResetRevenue, setConfirmResetRevenue] = useState(false);
  const [lastResetDate, setLastResetDate] = useState(null);

  const token = localStorage.getItem('adminToken');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/delivered-orders?page=${currentPage}&limit=${itemsPerPage}&search=${search}`, config);
      if (data.success) {
        setOrders(data.orders);
        setTotalPages(data.pages);
      }
    } catch (error) {
      console.error('Error fetching delivered orders:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, search]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/delivered-orders/stats`, config);
      if (data.success) setStats(data.stats);
    } catch (error) {
      console.error('Error fetching delivered stats:', error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const fetchLastReset = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/delivered-orders/last-reset`, config);
      if (data.success) setLastResetDate(data.resetAt);
    } catch (error) {
      console.error('Error fetching last reset:', error);
    }
  }, []);

  useEffect(() => { fetchLastReset(); }, [fetchLastReset]);

  const deleteDeliveredOrder = async (id) => {
    setDeletingId(id);
    try {
      await axios.delete(`${API_URL}/api/delivered-orders/${id}`, config);
      setOrders(prev => prev.filter(o => o._id !== id));
      setSelectedOrder(null);
      fetchStats();
    } catch (error) {
      console.error('Delete delivered order error:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleResetAll = async () => {
    setResettingAll(true);
    try {
      const { data } = await axios.post(`${API_URL}/api/delivered-orders/reset-all`, {}, config);
      if (data.success) {
        setConfirmResetAll(false);
        setOrders([]);
        setStats(null);
        fetchOrders();
        fetchStats();
      }
    } catch (error) {
      console.error('Reset all error:', error);
    } finally {
      setResettingAll(false);
    }
  };

  const handleResetRevenue = async () => {
    setResettingRevenue(true);
    try {
      const { data } = await axios.post(`${API_URL}/api/delivered-orders/reset-revenue`, {}, config);
      if (data.success) {
        setConfirmResetRevenue(false);
        fetchStats();
        fetchLastReset();
      }
    } catch (error) {
      console.error('Reset revenue error:', error);
    } finally {
      setResettingRevenue(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a' }}>
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="admin-main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header */}
        <div style={{ height: '60px', background: '#0d0a06', borderBottom: '1px solid #2a1f10', display: 'flex', alignItems: 'center', padding: '0 24px', gap: '16px', flexShrink: 0 }}>
          <button onClick={() => setSidebarOpen(s => !s)} className="admin-hamburger" style={{ background: 'transparent', border: 'none', color: '#8a7a6a', cursor: 'pointer', padding: '4px' }}>
            <PackageCheck size={20} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', border: '1.5px solid #c9a84c', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <img src="/images/logo.png" alt="VELNORA" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: '14px', letterSpacing: '2px', color: '#c9a84c' }}>VELNORA</span>
          </div>
          <div style={{ flex: 1 }} />
          <button onClick={() => navigate('/admin-dashboard')} style={{ background: 'transparent', border: '1px solid #3d3020', color: '#8a7a6a', padding: '6px 14px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>Dashboard</button>
        </div>

        <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Page Title */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: 700, margin: '0 0 4px' }}>Delivered Orders</h1>
                <p style={{ color: '#8a7a6a', fontSize: '12px', margin: 0 }}>Permanent delivery records — separate from admin orders</p>
                {lastResetDate && (
                  <p style={{ color: '#f39c12', fontSize: '11px', margin: '4px 0 0' }}>
                    Revenue baseline set: {new Date(lastResetDate).toLocaleString()} — analytics count from this date onward
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button onClick={() => setConfirmResetRevenue(true)} style={{ background: 'rgba(243,156,18,0.1)', border: '1px solid #f39c1230', color: '#f39c12', padding: '8px 16px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <RotateCcw size={12} /> Reset Revenue
                </button>
                <button onClick={() => setConfirmResetAll(true)} style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid #e74c3c30', color: '#e74c3c', padding: '8px 16px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={12} /> Reset All Data
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            {!statsLoading && stats && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                <div style={{ background: '#0f0c09', border: '1px solid #2a1f10', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(201,168,76,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><DollarSign size={18} color={GOLD} /></div>
                    <span style={{ color: '#8a7a6a', fontSize: '11px', letterSpacing: '1px' }}>TOTAL REVENUE</span>
                  </div>
                  <div style={{ color: GOLD, fontSize: '22px', fontWeight: 700 }}>Rs. {(stats.summary?.totalRevenue || 0).toLocaleString()}</div>
                  <div style={{ color: '#8a7a6a', fontSize: '11px', marginTop: '4px' }}>From {stats.summary?.totalOrders || 0} delivered orders</div>
                </div>
                <div style={{ background: '#0f0c09', border: '1px solid #2a1f10', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(39,174,96,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PackageCheck size={18} color="#27ae60" /></div>
                    <span style={{ color: '#8a7a6a', fontSize: '11px', letterSpacing: '1px' }}>DELIVERED ORDERS</span>
                  </div>
                  <div style={{ color: '#27ae60', fontSize: '22px', fontWeight: 700 }}>{stats.summary?.totalOrders || 0}</div>
                  <div style={{ color: '#8a7a6a', fontSize: '11px', marginTop: '4px' }}>{stats.summary?.totalItems || 0} total items delivered</div>
                </div>
                <div style={{ background: '#0f0c09', border: '1px solid #2a1f10', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(52,152,219,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><TrendingUp size={18} color="#3498db" /></div>
                    <span style={{ color: '#8a7a6a', fontSize: '11px', letterSpacing: '1px' }}>AVG ORDER VALUE</span>
                  </div>
                  <div style={{ color: '#3498db', fontSize: '22px', fontWeight: 700 }}>Rs. {Math.round(stats.summary?.avgOrder || 0).toLocaleString()}</div>
                  <div style={{ color: '#8a7a6a', fontSize: '11px', marginTop: '4px' }}>Average per delivered order</div>
                </div>
              </div>
            )}

            {/* Charts Row */}
            {!statsLoading && stats && stats.cityStats && stats.cityStats.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: '#0f0c09', border: '1px solid #2a1f10', borderRadius: '8px', padding: '20px' }}>
                  <h3 style={{ color: '#fff', fontSize: '14px', fontWeight: 700, margin: '0 0 12px' }}>Revenue by City</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={stats.cityStats.map(c => ({ name: c._id || 'Unknown', revenue: c.revenue, orders: c.count }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a1f10" />
                      <XAxis dataKey="name" tick={{ fill: '#8a7a6a', fontSize: 10 }} />
                      <YAxis tick={{ fill: '#8a7a6a', fontSize: 10 }} tickFormatter={v => `Rs.${(v/1000).toFixed(0)}k`} />
                      <Tooltip contentStyle={{ background: '#1a1410', border: '1px solid #3d3020', borderRadius: '6px', color: '#fff', fontSize: '12px' }} formatter={(v, name) => [name === 'revenue' ? `Rs. ${v.toLocaleString()}` : v, name === 'revenue' ? 'Revenue' : 'Orders']} />
                      <Bar dataKey="revenue" fill={GOLD} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <p style={{ color: '#8a7a6a', fontSize: '11px', marginTop: '8px', lineHeight: '1.5' }}>
                    This chart shows total revenue collected from delivered orders grouped by customer city. Taller bars indicate cities with higher sales. Use this to identify your top-performing delivery locations and plan logistics accordingly.
                  </p>
                </div>
                <div style={{ background: '#0f0c09', border: '1px solid #2a1f10', borderRadius: '8px', padding: '20px' }}>
                  <h3 style={{ color: '#fff', fontSize: '14px', fontWeight: 700, margin: '0 0 12px' }}>Payment Method Distribution</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={(stats.paymentStats || []).map(p => ({ name: p._id || 'cod', value: p.count }))} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value">
                        {(stats.paymentStats || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#1a1410', border: '1px solid #3d3020', borderRadius: '6px', color: '#fff', fontSize: '12px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <p style={{ color: '#8a7a6a', fontSize: '11px', marginTop: '8px', lineHeight: '1.5' }}>
                    Breakdown of payment methods used across all delivered orders. Shows the proportion of Cash on Delivery (COD) versus WhatsApp payments. A larger slice means more customers prefer that method.
                  </p>
                </div>
              </div>
            )}

            {/* Monthly Trend */}
            {!statsLoading && stats && stats.monthlyStats && stats.monthlyStats.length > 0 && (
              <div style={{ background: '#0f0c09', border: '1px solid #2a1f10', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
                <h3 style={{ color: '#fff', fontSize: '14px', fontWeight: 700, margin: '0 0 12px' }}>Monthly Delivery Trend</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={[...stats.monthlyStats].reverse().map(m => ({ month: m._id, orders: m.count, revenue: m.revenue }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a1f10" />
                    <XAxis dataKey="month" tick={{ fill: '#8a7a6a', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#8a7a6a', fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: '#1a1410', border: '1px solid #3d3020', borderRadius: '6px', color: '#fff', fontSize: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Line type="monotone" dataKey="orders" stroke={GOLD} strokeWidth={2} dot={{ fill: GOLD, r: 3 }} name="Orders" />
                  </LineChart>
                </ResponsiveContainer>
                <p style={{ color: '#8a7a6a', fontSize: '11px', marginTop: '8px', lineHeight: '1.5' }}>
                  Tracks the number of orders successfully delivered each month over time. An upward trend indicates growing delivery performance. Use this to forecast future delivery volumes and plan resources.
                </p>
              </div>
            )}

            {/* Search */}
            <div style={{ background: '#0f0c09', border: '1px solid #2a1f10', borderRadius: '8px', padding: '14px 18px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Search size={16} color={GOLD} />
                <input type="text" placeholder="Search by order number, customer name, phone, email, or city..." value={search} onChange={handleSearch} style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', fontSize: '13px', outline: 'none' }} />
                {search && <button onClick={() => { setSearch(''); setCurrentPage(1); }} style={{ background: 'transparent', border: 'none', color: '#8a7a6a', cursor: 'pointer' }}><X size={14} /></button>}
              </div>
            </div>

            {/* Orders Table */}
            <div style={{ background: '#0f0c09', border: '1px solid #2a1f10', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Order #', 'Customer', 'Phone', 'Items', 'Total', 'Payment', 'City', 'Delivered On', 'Actions'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '12px 12px', color: '#8a7a6a', fontSize: '10px', letterSpacing: '1px', borderBottom: '1px solid #2a1f10', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>
                        <Loader2 size={24} style={{ color: GOLD, animation: 'spin 1s linear infinite' }} />
                      </td></tr>
                    ) : orders.length === 0 ? (
                      <tr><td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#8a7a6a', fontSize: '13px' }}>No delivered orders found.</td></tr>
                    ) : (
                      orders.map((o, i) => (
                        <tr key={o._id} style={{ borderBottom: '1px solid #1a1410' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#141010'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ padding: '10px 12px', color: GOLD, fontSize: '12px', fontWeight: 600 }}>{o.originalOrderNumber}</td>
                          <td style={{ padding: '10px 12px', color: '#fff', fontSize: '12px' }}>{o.customer?.fullName}</td>
                          <td style={{ padding: '10px 12px', color: '#ccc', fontSize: '12px' }}>{o.customer?.phone}</td>
                          <td style={{ padding: '10px 12px', color: '#ccc', fontSize: '12px' }}>{o.items?.length}</td>
                          <td style={{ padding: '10px 12px', color: GOLD, fontSize: '13px', fontWeight: 700 }}>Rs. {(o.total || 0).toLocaleString()}</td>
                          <td style={{ padding: '10px 12px', color: '#ccc', fontSize: '11px', textTransform: 'capitalize' }}>{o.customer?.paymentMethod === 'cod' ? 'COD' : 'WhatsApp'}</td>
                          <td style={{ padding: '10px 12px', color: '#8a7a6a', fontSize: '12px' }}>{o.customer?.city}</td>
                          <td style={{ padding: '10px 12px', color: '#8a7a6a', fontSize: '11px', whiteSpace: 'nowrap' }}>{o.deliveredAt ? new Date(o.deliveredAt).toLocaleDateString() : 'N/A'}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button onClick={() => setSelectedOrder(o)} style={{ background: 'transparent', border: '1px solid #3d3020', color: '#8a7a6a', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                                <Eye size={12} /> View
                              </button>
                              <button onClick={() => deleteDeliveredOrder(o._id)} disabled={deletingId === o._id}
                                style={{ background: 'transparent', border: '1px solid #e74c3c30', color: deletingId === o._id ? '#666' : '#e74c3c', padding: '4px 8px', borderRadius: '4px', cursor: deletingId === o._id ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                                {deletingId === o._id ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={12} />} Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div style={{ padding: '0 14px' }}>
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} itemsPerPage={itemsPerPage} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setSelectedOrder(null)}>
          <div style={{ background: '#0f0c09', border: '1px solid #3d3020', borderRadius: '8px', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', padding: '24px', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedOrder(null)} style={{ position: 'absolute', top: '12px', right: '12px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={18} /></button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <PackageCheck size={20} color="#27ae60" />
              <h3 style={{ color: GOLD, fontSize: '16px', fontWeight: 700, margin: 0 }}>Delivered Order: {selectedOrder.originalOrderNumber}</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <div style={{ color: '#8a7a6a', fontSize: '10px', letterSpacing: '1px', marginBottom: '6px' }}>CUSTOMER</div>
                <div style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>{selectedOrder.customer?.fullName}</div>
                <div style={{ color: '#ccc', fontSize: '12px' }}>{selectedOrder.customer?.phone}</div>
                <div style={{ color: '#ccc', fontSize: '12px' }}>{selectedOrder.customer?.email}</div>
              </div>
              <div>
                <div style={{ color: '#8a7a6a', fontSize: '10px', letterSpacing: '1px', marginBottom: '6px' }}>ADDRESS</div>
                <div style={{ color: '#ccc', fontSize: '12px' }}>{selectedOrder.customer?.address1}</div>
                <div style={{ color: '#ccc', fontSize: '12px' }}>{selectedOrder.customer?.city}, {selectedOrder.customer?.province}</div>
                <div style={{ color: '#ccc', fontSize: '12px' }}>{selectedOrder.customer?.country}</div>
              </div>
            </div>
            <div style={{ borderTop: '1px solid #2a1f10', paddingTop: '16px', marginBottom: '16px' }}>
              <div style={{ color: '#8a7a6a', fontSize: '10px', letterSpacing: '1px', marginBottom: '8px' }}>ITEMS</div>
              {selectedOrder.items?.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1a1410' }}>
                  <div>
                    <span style={{ color: '#fff', fontSize: '12px' }}>{item.name}</span>
                    <span style={{ color: '#8a7a6a', fontSize: '11px', marginLeft: '8px' }}>x{item.quantity}</span>
                  </div>
                  <span style={{ color: GOLD, fontSize: '12px', fontWeight: 600 }}>Rs. {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div style={{ background: '#141010', borderRadius: '6px', padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8a7a6a', fontSize: '12px', marginBottom: '4px' }}><span>Subtotal</span><span>Rs. {(selectedOrder.subtotal || 0).toLocaleString()}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8a7a6a', fontSize: '12px', marginBottom: '8px' }}><span>Shipping</span><span>Rs. {(selectedOrder.shippingFee || 0).toLocaleString()}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: GOLD, fontSize: '15px', fontWeight: 700, borderTop: '1px solid #2a1f10', paddingTop: '8px' }}><span>Total</span><span>Rs. {(selectedOrder.total || 0).toLocaleString()}</span></div>
            </div>
            {selectedOrder.trackingId && (
              <div style={{ marginTop: '12px', background: 'rgba(39,174,96,0.06)', border: '1px solid rgba(39,174,96,0.15)', borderRadius: '6px', padding: '10px' }}>
                <span style={{ color: '#27ae60', fontSize: '10px', letterSpacing: '1px' }}>TRACKING ID: </span>
                <span style={{ color: '#fff', fontSize: '12px', fontWeight: 600 }}>{selectedOrder.trackingId}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirm Reset All Modal */}
      {confirmResetAll && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setConfirmResetAll(false)}>
          <div style={{ background: '#0f0c09', border: '1px solid #e74c3c30', borderRadius: '8px', width: '100%', maxWidth: '440px', padding: '28px', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <AlertTriangle size={22} color="#e74c3c" />
              <h3 style={{ color: '#e74c3c', fontSize: '16px', fontWeight: 700, margin: 0 }}>Reset ALL Data</h3>
            </div>
            <p style={{ color: '#ccc', fontSize: '13px', lineHeight: '1.6', margin: '0 0 16px' }}>
              This will permanently delete <strong>all orders</strong>, <strong>all delivered orders</strong>, <strong>all analytics events</strong>, <strong>all returns</strong>, and <strong>all notifications</strong>. Product stock will reset to 99. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmResetAll(false)} style={{ background: 'transparent', border: '1px solid #3d3020', color: '#8a7a6a', padding: '8px 18px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleResetAll} disabled={resettingAll} style={{ background: '#e74c3c', border: 'none', color: '#fff', padding: '8px 18px', borderRadius: '4px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {resettingAll ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                {resettingAll ? 'Resetting...' : 'Yes, Reset Everything'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Reset Revenue Modal */}
      {confirmResetRevenue && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setConfirmResetRevenue(false)}>
          <div style={{ background: '#0f0c09', border: '1px solid #f39c1230', borderRadius: '8px', width: '100%', maxWidth: '440px', padding: '28px', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <RotateCcw size={22} color="#f39c12" />
              <h3 style={{ color: '#f39c12', fontSize: '16px', fontWeight: 700, margin: 0 }}>Reset Revenue</h3>
            </div>
            <p style={{ color: '#ccc', fontSize: '13px', lineHeight: '1.6', margin: '0 0 16px' }}>
              This will set a new revenue tracking baseline. All <strong>existing orders are preserved</strong> but analytics will only count data created after this reset. Delivered orders and products are not affected.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmResetRevenue(false)} style={{ background: 'transparent', border: '1px solid #3d3020', color: '#8a7a6a', padding: '8px 18px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleResetRevenue} disabled={resettingRevenue} style={{ background: '#f39c12', border: 'none', color: '#0a0a0a', padding: '8px 18px', borderRadius: '4px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {resettingRevenue ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                {resettingRevenue ? 'Resetting...' : 'Yes, Reset Revenue'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
