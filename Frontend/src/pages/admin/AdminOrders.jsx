// AdminOrders.jsx
import React, { useEffect, useState } from 'react';
import {
  Search,
  Eye,
  X,
  Loader2,
  Menu,
  Bell,
  Download,
  Clock,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Trash2,
  Calendar,
  ArrowRight,
  ListOrdered,
  MapPin,
  CreditCard,
  User,
  FileDown
} from 'lucide-react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import AdminSidebar from '../../components/AdminSidebar';
import Pagination from '../../components/Pagination';
import API_URL from '../../config';

const statusColors = {
  'Delivered': '#4CAF50',
  'Shipped': '#FF9800',
  'Pending': '#F44336',
  'Processing': '#2196F3',
  'Cancelled': '#9E9E9E'
};

const statusBgColors = {
  'Delivered': 'rgba(76, 175, 80, 0.15)',
  'Shipped': 'rgba(255, 152, 0, 0.15)',
  'Pending': 'rgba(244, 67, 54, 0.15)',
  'Processing': 'rgba(33, 150, 243, 0.15)',
  'Cancelled': 'rgba(158, 158, 158, 0.15)'
};

const GOLD = '#c9a84c';

const STATUS_FLOW = ['Pending', 'Processing', 'Shipped', 'Delivered'];

const STATUS_CARDS = [
  { key: 'Total', label: 'Total Orders', icon: ListOrdered, color: GOLD },
  { key: 'Pending', label: 'Pending', icon: Clock, color: '#F44336' },
  { key: 'Processing', label: 'Processing', icon: Package, color: '#2196F3' },
  { key: 'Shipped', label: 'Shipped', icon: Truck, color: '#FF9800' },
  { key: 'Delivered', label: 'Delivered', icon: CheckCircle2, color: '#4CAF50' },
  { key: 'Cancelled', label: 'Cancelled', icon: XCircle, color: '#9E9E9E' }
];

// ─── COMPONENT ────────────────────────────────────────────────────────
export default function AdminOrders() {
  const [ordersData, setOrdersData] = useState([]);
  const [activeStatus, setActiveStatus] = useState('Total');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [trackingId, setTrackingId] = useState('');
  const [fetchLoading, setFetchLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      setFetchLoading(true);
      try {
        const token = localStorage.getItem('adminToken');
        const { data } = await axios.get(`${API_URL}/api/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data.success) {
          setOrdersData(data.orders || []);
        }
      } catch (error) {
        console.error('Error fetching orders', error);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // ─── STATUS COUNTS & REVENUE ────────────────────────────────────────
  const statusCounts = {
    'Total': ordersData.length,
    'Pending': ordersData.filter(o => o.status === 'Pending').length,
    'Processing': ordersData.filter(o => o.status === 'Processing').length,
    'Shipped': ordersData.filter(o => o.status === 'Shipped').length,
    'Delivered': ordersData.filter(o => o.status === 'Delivered').length,
    'Cancelled': ordersData.filter(o => o.status === 'Cancelled').length,
  };

  const statusRevenue = {
    'Total': ordersData.reduce((sum, o) => sum + (o.total || 0), 0),
    'Pending': ordersData.filter(o => o.status === 'Pending').reduce((sum, o) => sum + (o.total || 0), 0),
    'Processing': ordersData.filter(o => o.status === 'Processing').reduce((sum, o) => sum + (o.total || 0), 0),
    'Shipped': ordersData.filter(o => o.status === 'Shipped').reduce((sum, o) => sum + (o.total || 0), 0),
    'Delivered': ordersData.filter(o => o.status === 'Delivered').reduce((sum, o) => sum + (o.total || 0), 0),
    'Cancelled': ordersData.filter(o => o.status === 'Cancelled').reduce((sum, o) => sum + (o.total || 0), 0),
  };

  // ─── FILTER ORDERS ──────────────────────────────────────────────────
  const filteredOrders = ordersData.filter(order => {
    if (activeStatus !== 'Total' && order.status !== activeStatus) return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const customerName = order.customer?.fullName?.toLowerCase() || '';
      const email = order.customer?.email?.toLowerCase() || '';
      const phone = order.customer?.phone?.toLowerCase() || '';
      const orderId = order.orderNumber?.toLowerCase() || '';
      const tracking = order.trackingId?.toLowerCase() || '';
      const city = order.customer?.city?.toLowerCase() || '';
      const matches = customerName.includes(term) || email.includes(term) || phone.includes(term) ||
        orderId.includes(term) || tracking.includes(term) || city.includes(term);
      if (!matches) return false;
    }

    if (dateFrom) {
      const from = new Date(`${dateFrom}T00:00:00`);
      if (new Date(order.createdAt) < from) return false;
    }
    if (dateTo) {
      const to = new Date(`${dateTo}T23:59:59`);
      if (new Date(order.createdAt) > to) return false;
    }

    return true;
  });

  // ─── PAGINATION ────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  const selectStatus = (status) => {
    setActiveStatus(status);
    setCurrentPage(1);
  };

  // ─── STATUS UPDATE ─────────────────────────────────────────────────
  const updateOrderStatus = async (orderId, status, trackingIdValue = '') => {
    setUpdatingId(orderId);
    try {
      const payload = { status };
      if (status === 'Delivered') {
        payload.trackingId = trackingIdValue;
      }

      const token = localStorage.getItem('adminToken');
      const { data } = await axios.patch(`${API_URL}/api/orders/${orderId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setOrdersData(prev => prev.map(order => order._id === orderId ? { ...order, status, trackingId: trackingIdValue || order.trackingId } : order));
        setSelectedOrder(null);
        setTrackingOrder(null);
        setTrackingId('');
      }
    } catch (error) {
      console.error('Failed to update order status', error);
      alert('Failed to update order status. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  const openDeliveryModal = (order) => {
    setTrackingOrder(order);
    setTrackingId(order.trackingId || '');
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm('Delete this order permanently?')) return;
    setDeletingId(orderId);
    try {
      const token = localStorage.getItem('adminToken');
      const { data } = await axios.delete(`${API_URL}/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setOrdersData(prev => prev.filter(order => order._id !== orderId));
        if (selectedOrder?._id === orderId) setSelectedOrder(null);
      }
    } catch (error) {
      console.error('Failed to delete order', error);
      alert('Failed to delete order. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  // ─── EXPORT CSV ────────────────────────────────────────────────────
  const exportCSV = () => {
    if (filteredOrders.length === 0) return;
    const headers = ['Order ID', 'Customer', 'Phone', 'Email', 'City', 'Status', 'Payment', 'Subtotal', 'Shipping', 'Total', 'Tracking ID', 'Date'];
    const rows = filteredOrders.map(o => [
      o.orderNumber,
      o.customer?.fullName || '',
      o.customer?.phone || '',
      o.customer?.email || '',
      o.customer?.city || '',
      o.status,
      o.customer?.paymentMethod === 'cod' ? 'Cash on Delivery' : 'WhatsApp',
      o.subtotal || 0,
      o.shippingFee || 0,
      o.total || 0,
      o.trackingId || '',
      new Date(o.createdAt).toLocaleDateString()
    ]);
    const csv = [headers, ...rows]
      .map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `velnora-orders-${activeStatus.toLowerCase().replace(/\s+/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── RENDER STATUS BADGE ──────────────────────────────────────────
  const StatusBadge = ({ status }) => (
    <span style={{
      background: statusBgColors[status] || 'rgba(158,158,158,0.15)',
      color: statusColors[status] || '#9E9E9E',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: 600,
      display: 'inline-block',
      letterSpacing: '0.3px',
      whiteSpace: 'nowrap'
    }}>
      {status}
    </span>
  );

  const nextStep = (order) => {
    if (order.status === 'Shipped') {
      openDeliveryModal(order);
    } else if (STATUS_FLOW.includes(order.status)) {
      const idx = STATUS_FLOW.indexOf(order.status);
      updateOrderStatus(order._id, STATUS_FLOW[idx + 1]);
    }
  };

  const canCancel = ['Pending', 'Processing', 'Shipped'].includes(selectedOrder?.status);
  const nextLabel = selectedOrder?.status === 'Pending' ? 'Mark Processing'
    : selectedOrder?.status === 'Processing' ? 'Ship Order'
    : selectedOrder?.status === 'Shipped' ? 'Mark Delivered'
    : null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="admin-main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Bar */}
        <div style={{ height: '60px', background: '#0d0a06', borderBottom: '1px solid #2a1f10', display: 'flex', alignItems: 'center', padding: '0 24px', gap: '16px', flexShrink: 0 }}>
          <button onClick={() => setSidebarOpen(s => !s)} className="admin-hamburger" style={{ background: 'transparent', border: 'none', color: '#8a7a6a', cursor: 'pointer', padding: '4px' }}>
            <Menu size={20} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <img src="/images/logo.png" alt="VELNORA" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: '14px', letterSpacing: '2px', color: GOLD }}>VELNORA</span>
          </div>
          <div style={{ flex: 1 }} />
          <Bell size={18} style={{ color: '#8a7a6a', cursor: 'pointer' }} />
        </div>

        <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

            {/* ── PAGE HEADER ── */}
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap" style={{ gap: '12px' }}>
              <div>
                <h1 className="fw-bold text-uppercase mb-0" style={{
                  fontSize: 'clamp(20px, 3vw, 28px)',
                  letterSpacing: '3px',
                  fontFamily: "'Playfair Display','Times New Roman',serif",
                  color: '#fff'
                }}>
                  Orders
                </h1>
                <p className="mb-0" style={{ color: '#8a7a6a', fontSize: '13px' }}>
                  Dashboard &gt; Orders <span style={{ color: '#3d3020' }}>|</span>{' '}
                  {filteredOrders.length} order{filteredOrders.length === 1 ? '' : 's'}
                  {activeStatus !== 'Total' ? ` • ${activeStatus}` : ''}
                </p>
              </div>
              <button
                onClick={exportCSV}
                disabled={filteredOrders.length === 0}
                style={{
                  background: 'transparent',
                  border: '1px solid #3d3020',
                  color: GOLD,
                  padding: '8px 16px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: filteredOrders.length === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  opacity: filteredOrders.length === 0 ? 0.5 : 1
                }}
              >
                <Download size={14} /> Export CSV
              </button>
            </div>

            {/* ── STATS CARDS ── */}
            <div className="row g-3 mb-4">
              {STATUS_CARDS.map(card => {
                const isActive = activeStatus === card.key;
                const Icon = card.icon;
                return (
                  <div className="col-6 col-md-4 col-xl-2" key={card.key}>
                    <div
                      onClick={() => selectStatus(card.key)}
                      style={{
                        background: isActive ? 'rgba(201,168,76,0.08)' : '#0f0c09',
                        border: isActive ? `1px solid ${GOLD}` : '1px solid #2a1f10',
                        borderRadius: '10px',
                        padding: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        height: '100%'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = card.color; e.currentTarget.style.background = isActive ? 'rgba(201,168,76,0.08)' : '#141010'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = isActive ? GOLD : '#2a1f10'; e.currentTarget.style.background = isActive ? 'rgba(201,168,76,0.08)' : '#0f0c09'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <div style={{
                          width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
                          background: `${card.color}1a`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <Icon size={14} color={card.color} />
                        </div>
                        <span style={{ color: '#8a7a6a', fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>
                          {card.label}
                        </span>
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: card.color, lineHeight: 1.2 }}>
                        {statusCounts[card.key]}
                      </div>
                      <div style={{ fontSize: '10px', color: '#8a7a6a', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Rs. {statusRevenue[card.key].toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── TOOLBAR ── */}
            <div style={{
              background: '#0f0c09',
              border: '1px solid #2a1f10',
              borderRadius: '10px',
              padding: '12px 16px',
              marginBottom: '16px'
            }}>
              <div className="d-flex flex-wrap align-items-center" style={{ gap: '12px' }}>
                {/* Search */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1', minWidth: '200px' }}>
                  <Search size={15} color={GOLD} />
                  <input
                    type="text"
                    placeholder="Search by order ID, customer, phone, email, city, tracking..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: '#fff',
                      fontSize: '13px',
                      minWidth: '0'
                    }}
                  />
                  {searchTerm && (
                    <button onClick={() => { setSearchTerm(''); setCurrentPage(1); }} style={{ background: 'transparent', border: 'none', color: '#8a7a6a', cursor: 'pointer', padding: '0' }}>
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Date range */}
                <div className="d-flex align-items-center" style={{ gap: '8px' }}>
                  <Calendar size={14} color="#8a7a6a" style={{ flexShrink: 0 }} />
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
                    style={{
                      background: '#121212',
                      border: '1px solid #3d3020',
                      borderRadius: '4px',
                      color: '#fff',
                      fontSize: '11px',
                      padding: '5px 8px',
                      outline: 'none',
                      colorScheme: 'dark'
                    }}
                  />
                  <span style={{ color: '#3d3020', fontSize: '12px' }}>—</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
                    style={{
                      background: '#121212',
                      border: '1px solid #3d3020',
                      borderRadius: '4px',
                      color: '#fff',
                      fontSize: '11px',
                      padding: '5px 8px',
                      outline: 'none',
                      colorScheme: 'dark'
                    }}
                  />
                </div>

                {/* Status filter select */}
                <select
                  value={activeStatus}
                  onChange={(e) => selectStatus(e.target.value)}
                  style={{
                    background: '#121212',
                    border: '1px solid #3d3020',
                    borderRadius: '4px',
                    color: GOLD,
                    fontSize: '11px',
                    padding: '6px 10px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {STATUS_CARDS.map(card => (
                    <option key={card.key} value={card.key} style={{ background: '#121212', color: '#fff' }}>
                      {card.label}
                    </option>
                  ))}
                </select>

                {(dateFrom || dateTo) && (
                  <button
                    onClick={() => { setDateFrom(''); setDateTo(''); setCurrentPage(1); }}
                    style={{ background: 'transparent', border: '1px solid #3d3020', color: '#8a7a6a', fontSize: '11px', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Clear dates
                  </button>
                )}
              </div>
            </div>

            {/* ── TABLE ── */}
            <div style={{ background: '#0f0c09', border: '1px solid #2a1f10', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Order ID', 'Customer', 'Total', 'Status', 'Date', 'Action'].map(h => (
                        <th key={h} style={{
                          textAlign: 'left',
                          padding: '12px 16px',
                          color: '#8a7a6a',
                          fontSize: '10px',
                          letterSpacing: '1px',
                          textTransform: 'uppercase',
                          borderBottom: '1px solid #2a1f10',
                          fontWeight: 600,
                          whiteSpace: 'nowrap'
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {fetchLoading ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '50px' }}>
                          <Loader2 size={28} color={GOLD} style={{ animation: 'spin 1s linear infinite' }} />
                          <p style={{ color: '#8a7a6a', marginTop: '10px', fontSize: '13px' }}>Loading orders...</p>
                        </td>
                      </tr>
                    ) : currentOrders.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '50px', color: '#8a7a6a', fontSize: '13px' }}>
                          No orders found matching your filters.
                        </td>
                      </tr>
                    ) : (
                      currentOrders.map((order, index) => (
                        <tr
                          key={order._id}
                          style={{
                            borderBottom: index < currentOrders.length - 1 ? '1px solid #1a1410' : 'none',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#141010'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: GOLD, whiteSpace: 'nowrap' }}>
                            {order.orderNumber}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>{order.customer?.fullName}</div>
                            <div style={{ fontSize: '10px', color: '#8a7a6a' }}>{order.customer?.phone}</div>
                            <div style={{ fontSize: '10px', color: '#8a7a6a', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {order.customer?.email}
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 700, color: GOLD, whiteSpace: 'nowrap' }}>
                            Rs. {(order.total || 0).toLocaleString()}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <StatusBadge status={order.status} />
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '11px', color: '#ccc', whiteSpace: 'nowrap' }}>
                            <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                            <div style={{ color: '#8a7a6a', fontSize: '10px' }}>
                              {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              <button
                                onClick={() => setSelectedOrder(order)}
                                style={{
                                  background: 'rgba(201,168,76,0.08)',
                                  border: `1px solid ${GOLD}`,
                                  color: GOLD,
                                  padding: '5px 12px',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = GOLD; e.currentTarget.style.color = '#0a0a0a'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.08)'; e.currentTarget.style.color = GOLD; }}
                              >
                                <Eye size={12} /> View
                              </button>
                              <button
                                onClick={() => deleteOrder(order._id)}
                                disabled={deletingId === order._id}
                                style={{
                                  background: 'transparent',
                                  border: '1px solid transparent',
                                  color: deletingId === order._id ? '#666' : '#8a7a6a',
                                  padding: '5px 7px',
                                  borderRadius: '4px',
                                  cursor: deletingId === order._id ? 'not-allowed' : 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => { if (deletingId !== order._id) { e.currentTarget.style.color = '#e74c3c'; e.currentTarget.style.borderColor = '#e74c3c30'; } }}
                                onMouseLeave={e => { if (deletingId !== order._id) { e.currentTarget.style.color = '#8a7a6a'; e.currentTarget.style.borderColor = 'transparent'; } }}
                              >
                                {deletingId === order._id ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={13} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {!fetchLoading && filteredOrders.length > 0 && (
                <div style={{ padding: '0 16px' }}>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => setCurrentPage(page)}
                    itemsPerPage={itemsPerPage}
                    onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── ORDER DETAILS MODAL ── */}
      {selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setSelectedOrder(null)}>
          <div style={{
            background: '#0f0c09',
            border: '1px solid #3d3020',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '760px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            position: 'relative'
          }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedOrder(null)}
              style={{ position: 'absolute', top: '14px', right: '14px', background: 'transparent', border: 'none', color: '#8a7a6a', cursor: 'pointer', zIndex: 5 }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = '#8a7a6a'}
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '20px', paddingRight: '24px' }}>
              <div>
                <h3 className="fw-bold mb-1" style={{ color: GOLD, fontSize: '18px' }}>{selectedOrder.orderNumber}</h3>
                <div style={{ color: '#8a7a6a', fontSize: '11px' }}>
                  Placed on {new Date(selectedOrder.createdAt).toLocaleDateString()} • {new Date(selectedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <StatusBadge status={selectedOrder.status} />
            </div>

            {/* Customer + Address + Payment */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div style={{ background: '#141010', border: '1px solid #2a1f10', borderRadius: '8px', padding: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#8a7a6a', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
                  <User size={12} /> Customer
                </div>
                <div style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>{selectedOrder.customer?.fullName}</div>
                <div style={{ color: '#ccc', fontSize: '12px' }}>{selectedOrder.customer?.phone}</div>
                <div style={{ color: '#ccc', fontSize: '12px', wordBreak: 'break-word' }}>{selectedOrder.customer?.email}</div>
              </div>
              <div style={{ background: '#141010', border: '1px solid #2a1f10', borderRadius: '8px', padding: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#8a7a6a', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
                  <MapPin size={12} /> Address & Payment
                </div>
                <div style={{ color: '#ccc', fontSize: '12px', lineHeight: '1.5' }}>
                  {selectedOrder.customer?.address1}{selectedOrder.customer?.address2 ? `, ${selectedOrder.customer.address2}` : ''}
                </div>
                <div style={{ color: '#ccc', fontSize: '12px', lineHeight: '1.5' }}>
                  {selectedOrder.customer?.city}, {selectedOrder.customer?.province}
                </div>
                <div style={{ color: '#ccc', fontSize: '12px', lineHeight: '1.5' }}>
                  {selectedOrder.customer?.country}{selectedOrder.customer?.postal ? ` - ${selectedOrder.customer.postal}` : ''}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '6px', fontSize: '12px', color: GOLD, fontWeight: 600 }}>
                  <CreditCard size={12} />
                  {selectedOrder.customer?.paymentMethod === 'cod' ? 'Cash on Delivery' : 'WhatsApp'}
                </div>
              </div>
            </div>

            {/* Items */}
            <div style={{ border: '1px solid #2a1f10', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' }}>
              <div style={{ background: '#141010', padding: '10px 14px', color: '#8a7a6a', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', borderBottom: '1px solid #2a1f10', fontWeight: 600 }}>
                Order Items ({selectedOrder.items?.length || 0})
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #2a1f10' }}>
                    {['Product', 'Qty', 'Price', 'Total'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '8px 14px', color: '#8a7a6a', fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items?.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #1a1410' }}>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {item.image ? (
                            <img src={item.image} alt={item.name} style={{ width: '42px', height: '42px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0, border: '1px solid #2a1f10' }} />
                          ) : (
                            <div style={{ width: '42px', height: '42px', borderRadius: '6px', background: '#1a1410', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#555', flexShrink: 0 }}>NO IMG</div>
                          )}
                          <div>
                            <div style={{ fontSize: '12px', color: '#fff', fontWeight: 500, maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                            <div style={{ fontSize: '10px', color: '#8a7a6a' }}>{item.category}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: '12px', color: '#ccc' }}>{item.quantity}</td>
                      <td style={{ padding: '10px 14px', fontSize: '12px', color: '#ccc' }}>Rs. {(item.price || 0).toLocaleString()}</td>
                      <td style={{ padding: '10px 14px', fontSize: '12px', color: GOLD, fontWeight: 600 }}>Rs. {((item.price || 0) * item.quantity).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary + Tracking */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div style={{ background: '#141010', border: '1px solid #2a1f10', borderRadius: '8px', padding: '14px' }}>
                <div style={{ color: '#8a7a6a', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>Summary</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ccc', fontSize: '12px', marginBottom: '4px' }}>
                  <span>Subtotal</span><span>Rs. {(selectedOrder.subtotal || 0).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ccc', fontSize: '12px', marginBottom: '8px' }}>
                  <span>Shipping</span><span>Rs. {(selectedOrder.shippingFee || 0).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: GOLD, fontSize: '15px', fontWeight: 700, borderTop: '1px solid #2a1f10', paddingTop: '8px' }}>
                  <span>Total</span><span>Rs. {(selectedOrder.total || 0).toLocaleString()}</span>
                </div>
              </div>
              <div style={{ background: '#141010', border: '1px solid #2a1f10', borderRadius: '8px', padding: '14px' }}>
                <div style={{ color: '#8a7a6a', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>Notes & Tracking</div>
                <div style={{ color: '#ccc', fontSize: '12px', marginBottom: '8px' }}>{selectedOrder.customer?.notes || 'No notes from customer'}</div>
                {selectedOrder.trackingId ? (
                  <div style={{ background: 'rgba(76,175,80,0.06)', border: '1px solid rgba(76,175,80,0.2)', borderRadius: '6px', padding: '8px 10px' }}>
                    <span style={{ color: '#4CAF50', fontSize: '9px', letterSpacing: '1px', fontWeight: 700 }}>TRACKING ID: </span>
                    <span style={{ color: '#fff', fontSize: '12px', fontWeight: 600, letterSpacing: '1px' }}>{selectedOrder.trackingId}</span>
                  </div>
                ) : (
                  <div style={{ color: '#8a7a6a', fontSize: '11px' }}>No tracking ID assigned</div>
                )}
              </div>
            </div>

            {/* Status workflow hint */}
            {STATUS_FLOW.includes(selectedOrder.status) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {STATUS_FLOW.map((s, i) => {
                  const stepDone = STATUS_FLOW.indexOf(selectedOrder.status) >= i;
                  const isCurrent = selectedOrder.status === s;
                  return (
                    <React.Fragment key={s}>
                      {i > 0 && <ArrowRight size={12} color="#3d3020" />}
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        letterSpacing: '0.5px',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        background: isCurrent ? statusBgColors[s] : (stepDone ? 'rgba(201,168,76,0.1)' : 'transparent'),
                        border: `1px solid ${isCurrent ? statusColors[s] : '#2a1f10'}`,
                        color: isCurrent ? statusColors[s] : (stepDone ? GOLD : '#8a7a6a')
                      }}>
                        {s}
                      </span>
                    </React.Fragment>
                  );
                })}
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', borderTop: '1px solid #2a1f10', paddingTop: '16px' }}>
              {nextLabel && (
                <button
                  onClick={() => nextStep(selectedOrder)}
                  disabled={updatingId === selectedOrder._id}
                  style={{
                    background: GOLD,
                    border: '1px solid #c9a84c',
                    color: '#0a0a0a',
                    padding: '8px 18px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: updatingId === selectedOrder._id ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    opacity: updatingId === selectedOrder._id ? 0.6 : 1
                  }}
                >
                  {updatingId === selectedOrder._id && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                  {updatingId === selectedOrder._id ? 'Updating...' : nextLabel}
                </button>
              )}
              {canCancel && (
                <button
                  onClick={() => updateOrderStatus(selectedOrder._id, 'Cancelled')}
                  disabled={updatingId === selectedOrder._id}
                  style={{
                    background: 'transparent',
                    border: '1px solid #e74c3c',
                    color: '#e74c3c',
                    padding: '8px 18px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: updatingId === selectedOrder._id ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    opacity: updatingId === selectedOrder._id ? 0.6 : 1
                  }}
                >
                  {updatingId === selectedOrder._id && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                  {updatingId === selectedOrder._id ? 'Updating...' : 'Cancel Order'}
                </button>
              )}
              {selectedOrder.status === 'Cancelled' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#8a7a6a' }}>
                  <XCircle size={14} color="#9E9E9E" /> This order has been cancelled.
                </div>
              )}
              <button
                onClick={() => setSelectedOrder(null)}
                style={{
                  background: 'transparent',
                  border: '1px solid #3d3020',
                  color: '#8a7a6a',
                  padding: '8px 18px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  marginLeft: 'auto'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELIVERY MODAL ── */}
      {trackingOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setTrackingOrder(null)}>
          <div style={{ background: '#0f0c09', border: '1px solid #3d3020', borderRadius: '12px', width: '100%', maxWidth: '480px', padding: '24px', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setTrackingOrder(null)}
              style={{ position: 'absolute', top: '14px', right: '14px', background: 'transparent', border: 'none', color: '#8a7a6a', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = '#8a7a6a'}
            >
              <X size={18} />
            </button>
            <h4 className="fw-bold mb-3" style={{ color: GOLD }}>Mark Delivered</h4>
            <div style={{ color: '#8a7a6a', fontSize: '12px', marginBottom: '14px' }}>
              Enter the tracking ID for <strong style={{ color: '#fff' }}>{trackingOrder.orderNumber}</strong>. This will be sent to the customer with delivery details.
            </div>
            <div className="mb-3">
              <label className="form-label" style={{ color: '#fff', fontSize: '12px' }}>Tracking ID</label>
              <input
                type="text"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder="Enter tracking ID"
                autoFocus
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: '#121212',
                  border: '1px solid #3d3020',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>
            <button
              className="btn w-100"
              style={{
                background: GOLD,
                color: '#0a0a0a',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                border: 'none'
              }}
              onClick={() => updateOrderStatus(trackingOrder._id, 'Delivered', trackingId)}
              disabled={!trackingId.trim() || updatingId === trackingOrder?._id}
            >
              {updatingId === trackingOrder?._id && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
              {updatingId === trackingOrder?._id ? 'Confirming...' : 'Confirm Delivery'}
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
