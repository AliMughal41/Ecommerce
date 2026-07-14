// AdminOrders.jsx
import React, { useEffect, useState } from 'react';
import { 
  Search, 
  ChevronDown, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Tag,
  Star,
  Image,
  Settings,
  Users,
  BarChart3,
  CheckCircle2,
  Truck,
  PackageCheck,
  X,
  Loader2
} from 'lucide-react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
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

// ─── COMPONENT ────────────────────────────────────────────────────────
export default function AdminOrders() {
  const [ordersData, setOrdersData] = useState([]);
  const [activeStatus, setActiveStatus] = useState('All Orders');
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [trackingId, setTrackingId] = useState('');
  const [fetchLoading, setFetchLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const itemsPerPage = 5;

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

  // ─── STATUS COUNTS ────────────────────────────────────────────────
  const statusCounts = {
    'All Orders': ordersData.length,
    'Pending': ordersData.filter(o => o.status === 'Pending').length,
    'Processing': ordersData.filter(o => o.status === 'Processing').length,
    'Shipped': ordersData.filter(o => o.status === 'Shipped').length,
    'Delivered': ordersData.filter(o => o.status === 'Delivered').length,
    'Cancelled': ordersData.filter(o => o.status === 'Cancelled').length,
  };

  // ─── SUMMARY STATS ────────────────────────────────────────────────
  const totalSales = ordersData.reduce((sum, o) => sum + (o.total || 0), 0);
  const deliveredOrders = ordersData.filter(o => o.status === 'Delivered').length;
  const pendingOrders = ordersData.filter(o => o.status === 'Pending').length;

  // ─── FILTER ORDERS ────────────────────────────────────────────────
  const filteredOrders = ordersData.filter(order => {
    if (activeStatus !== 'All Orders' && order.status !== activeStatus) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const customerName = order.customer?.fullName?.toLowerCase() || '';
      const email = order.customer?.email?.toLowerCase() || '';
      const orderId = order.orderNumber?.toLowerCase() || '';
      return customerName.includes(term) || orderId.includes(term) || email.includes(term);
    }
    return true;
  });

  // ─── PAGINATION ────────────────────────────────────────────────────
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // ─── SELECT/DESELECT ALL ──────────────────────────────────────────
  const toggleSelectAll = () => {
    if (selectedOrders.length === currentOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(currentOrders.map(o => o._id));
    }
  };

  const toggleSelectOrder = (id) => {
    if (selectedOrders.includes(id)) {
      setSelectedOrders(selectedOrders.filter(s => s !== id));
    } else {
      setSelectedOrders([...selectedOrders, id]);
    }
  };

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
        setIsDropdownOpen(null);
      }
    } catch (error) {
      console.error('Failed to update order status', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const openDeliveryModal = (order) => {
    setTrackingOrder(order);
    setTrackingId(order.trackingId || '');
    setIsDropdownOpen(null);
  };

  const deleteOrder = async (orderId) => {
    setDeletingId(orderId);
    try {
      const token = localStorage.getItem('adminToken');
      const { data } = await axios.delete(`${API_URL}/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setOrdersData(prev => prev.filter(order => order._id !== orderId));
        setIsDropdownOpen(null);
      }
    } catch (error) {
      console.error('Failed to delete order', error);
    } finally {
      setDeletingId(null);
    }
  };

  const deleteSelectedOrders = async () => {
    if (selectedOrders.length === 0) return;

    setBulkDeleting(true);
    try {
      const token = localStorage.getItem('adminToken');
      await Promise.all(selectedOrders.map(orderId => axios.delete(`${API_URL}/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })));
      setOrdersData(prev => prev.filter(order => !selectedOrders.includes(order._id)));
      setSelectedOrders([]);
    } catch (error) {
      console.error('Failed to delete selected orders', error);
    } finally {
      setBulkDeleting(false);
    }
  };

  // ─── RENDER STATUS BADGE ──────────────────────────────────────────
  const StatusBadge = ({ status }) => (
    <span style={{
      background: statusBgColors[status] || 'rgba(158,158,158,0.15)',
      color: statusColors[status] || '#9E9E9E',
      padding: '3px 10px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: 600,
      display: 'inline-block'
    }}>
      {status}
    </span>
  );

  // ─── SIDEBAR FILTER OPTIONS ───────────────────────────────────────
  const filterOptions = [
    { icon: User, label: 'Customers' },
    { icon: Tag, label: 'Coupons' },
    { icon: Star, label: 'Reviews' },
    { icon: Image, label: 'Banner Sliders' },
    { icon: Settings, label: 'Site Settings' },
    { icon: Users, label: 'Users' },
    { icon: BarChart3, label: 'Reports' },
  ];

  return (
       <div className="bg-black text-white" style={{ fontFamily: "'Inter', sans-serif", paddingTop: '10px' }}>

    <div style={{ 
      fontFamily: "'Segoe UI', system-ui, sans-serif", 
      background: '#0a0a0a', 
      minHeight: '100vh', 
      color: '#fff' 
    }}>
      <Navbar />

      <div className="container-fluid px-3 px-md-4 py-4" style={{ paddingTop: '130px' }}>

        {/* ── PAGE HEADER ── */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold text-uppercase mb-0" style={{ 
              fontSize: 'clamp(20px, 3vw, 28px)',
              letterSpacing: '3px',
              fontFamily: "'Playfair Display','Times New Roman',serif"
            }}>
              Orders
            </h2>
            <p className="text-secondary mb-0" style={{ fontSize: '13px' }}>
              Dashboard &gt; Orders
            </p>
          </div>
          <div className="d-flex align-items-center gap-3">
            <button className="btn d-flex align-items-center gap-2" style={{
              background: 'transparent',
              border: '1px solid #3d3020',
              color: '#c9a84c',
              padding: '6px 14px',
              borderRadius: '3px',
              fontSize: '12px'
            }}>
              <Calendar size={14} />
              Select Date Range
              <ChevronDown size={14} />
            </button>
          </div>
        </div>

        <div className="row g-4">

          {/* ── SIDEBAR ── */}
          <div className="col-lg-2 col-md-3">
            <div style={{ 
              border: '1px solid #3d3020', 
              borderRadius: '4px', 
              padding: '14px 0',
              background: '#0f0c09'
            }}>
              {/* Status Filters */}
              <div className="px-3 pb-2" style={{ borderBottom: '1px solid #3d3020' }}>
                <h6 className="text-uppercase fw-bold mb-2" style={{ 
                  fontSize: '10px', 
                  letterSpacing: '2px', 
                  color: '#8a7a6a' 
                }}>
                  Orders
                </h6>
                {Object.entries(statusCounts).map(([status, count]) => (
                  <div
                    key={status}
                    className="d-flex justify-content-between align-items-center py-1 px-2"
                    style={{
                      cursor: 'pointer',
                      borderRadius: '3px',
                      background: activeStatus === status ? 'rgba(201,168,76,0.1)' : 'transparent',
                      borderLeft: activeStatus === status ? '3px solid #c9a84c' : '3px solid transparent',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => {
                      setActiveStatus(status);
                      setCurrentPage(1);
                    }}
                    onMouseEnter={e => {
                      if (activeStatus !== status) {
                        e.currentTarget.style.background = 'rgba(201,168,76,0.05)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (activeStatus !== status) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <span style={{ fontSize: '12px', color: activeStatus === status ? '#fff' : '#8a7a6a' }}>
                      {status}
                    </span>
                    <span style={{
                      background: activeStatus === status ? '#c9a84c' : '#2a1f10',
                      color: activeStatus === status ? '#0a0a0a' : '#8a7a6a',
                      padding: '1px 8px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: 600
                    }}>
                      {count}
                    </span>
                  </div>
                ))}
              </div>

              {/* Search Order Range */}
              <div className="px-3 py-3" style={{ borderBottom: '1px solid #3d3020' }}>
                <div className="d-flex align-items-center gap-2 text-secondary" style={{ fontSize: '12px' }}>
                  <Search size={14} />
                  <span>Search order range</span>
                </div>
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Order ID or Customer"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    style={{
                      width: '100%',
                      padding: '5px 10px',
                      background: '#1a1a1a',
                      border: '1px solid #3d3020',
                      borderRadius: '3px',
                      color: '#fff',
                      fontSize: '12px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Filter Options */}
              <div className="px-3 py-3" style={{ borderBottom: '1px solid #3d3020' }}>
                <h6 className="text-uppercase fw-bold mb-2" style={{ 
                  fontSize: '10px', 
                  letterSpacing: '2px', 
                  color: '#8a7a6a' 
                }}>
                  Filter
                </h6>
                {filterOptions.map((item, i) => (
                  <div
                    key={i}
                    className="d-flex align-items-center gap-2 py-1 px-2"
                    style={{
                      cursor: 'pointer',
                      borderRadius: '3px',
                      color: '#8a7a6a',
                      fontSize: '12px',
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={e => e.currentTarget.style.color = '#8a7a6a'}
                  >
                    <item.icon size={14} />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>

              {/* User Profile */}
              <div className="px-3 py-3" style={{ borderBottom: '1px solid #3d3020' }}>
                <div className="d-flex align-items-center gap-2">
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#c9a84c',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0a0a0a',
                    fontWeight: 700,
                    fontSize: '13px'
                  }}>
                    FK
                  </div>
                  <div>
                    <div className="fw-bold" style={{ fontSize: '13px' }}>Fatima Khan</div>
                    <div className="d-flex align-items-center gap-2" style={{ fontSize: '11px', color: '#8a7a6a' }}>
                      <span>+1</span>
                      <span>•</span>
                      <span>Admin</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Logout */}
              <div className="px-3 py-3">
                <div className="d-flex align-items-center gap-2" style={{
                  cursor: 'pointer',
                  color: '#8a7a6a',
                  fontSize: '13px',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#ff4444'}
                onMouseLeave={e => e.currentTarget.style.color = '#8a7a6a'}>
                  <LogOut size={16} />
                  <span>Logout</span>
                </div>
              </div>
            </div>

            {/* ── TODAY'S SUMMARY ── */}
            <div className="mt-4" style={{
              border: '1px solid #3d3020',
              borderRadius: '4px',
              padding: '14px',
              background: '#0f0c09'
            }}>
              <h6 className="text-uppercase fw-bold mb-3" style={{
                fontSize: '10px',
                letterSpacing: '2px',
                color: '#8a7a6a'
              }}>
                Today's Summary
              </h6>
              <div className="d-flex justify-content-between align-items-center py-2" style={{ borderBottom: '1px solid #1a1a1a' }}>
                <span style={{ fontSize: '12px', color: '#8a7a6a' }}>Total Orders</span>
                <span className="fw-bold" style={{ fontSize: '13px' }}>{ordersData.length}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center py-2" style={{ borderBottom: '1px solid #1a1a1a' }}>
                <span style={{ fontSize: '12px', color: '#8a7a6a' }}>Total Sales</span>
                <span className="fw-bold" style={{ fontSize: '13px', color: '#c9a84c' }}>Rs. {totalSales.toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center py-2" style={{ borderBottom: '1px solid #1a1a1a' }}>
                <span style={{ fontSize: '12px', color: '#8a7a6a' }}>Pending Orders</span>
                <span className="fw-bold" style={{ fontSize: '13px', color: '#F44336' }}>{pendingOrders}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center py-2">
                <span style={{ fontSize: '12px', color: '#8a7a6a' }}>Delivered Orders</span>
                <span className="fw-bold" style={{ fontSize: '13px', color: '#4CAF50' }}>{deliveredOrders}</span>
              </div>
              <button className="btn w-100 mt-3 fw-bold text-uppercase" style={{
                background: 'transparent',
                border: '1px solid #c9a84c',
                color: '#c9a84c',
                padding: '5px 0',
                fontSize: '10px',
                letterSpacing: '1px',
                borderRadius: '3px'
              }}>
                View Reports
              </button>
            </div>
          </div>

          {/* ── MAIN TABLE ── */}
          <div className="col-lg-10 col-md-9">
            <div style={{
              border: '1px solid #3d3020',
              borderRadius: '4px',
              background: '#0f0c09',
              overflow: 'hidden'
            }}>
              {/* Table Header with Status Counts */}
              <div style={{
                padding: '10px 14px',
                background: '#1a1410',
                borderBottom: '1px solid #3d3020'
              }}>
                <div className="d-flex align-items-center gap-3 flex-wrap">
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === currentOrders.length && currentOrders.length > 0}
                    onChange={toggleSelectAll}
                    style={{
                      width: '15px',
                      height: '15px',
                      accentColor: '#c9a84c',
                      cursor: 'pointer'
                    }}
                  />
                  <button
                    className="btn btn-sm"
                    onClick={deleteSelectedOrders}
                    disabled={selectedOrders.length === 0 || bulkDeleting}
                    style={{
                      background: selectedOrders.length > 0 && !bulkDeleting ? '#c9a84c' : '#333',
                      border: '1px solid #3d3020',
                      color: selectedOrders.length > 0 && !bulkDeleting ? '#0a0a0a' : '#777',
                      padding: '5px 10px',
                      fontSize: '11px',
                      borderRadius: '3px',
                      cursor: selectedOrders.length > 0 && !bulkDeleting ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {bulkDeleting && <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />}
                    {bulkDeleting ? 'Deleting...' : 'Delete Selected'}
                  </button>
                  <div className="d-flex gap-3 flex-wrap" style={{ fontSize: '11px', color: '#8a7a6a' }}>
                    <span style={{ cursor: 'pointer' }} onClick={() => setActiveStatus('All Orders')}>
                      All Orders: {ordersData.length}
                    </span>
                    <span style={{ cursor: 'pointer' }} onClick={() => setActiveStatus('Pending')}>
                      Pending: {statusCounts.Pending}
                    </span>
                    <span style={{ cursor: 'pointer' }} onClick={() => setActiveStatus('Processing')}>
                      Processing: {statusCounts.Processing}
                    </span>
                    <span style={{ cursor: 'pointer' }} onClick={() => setActiveStatus('Shipped')}>
                      Shipped: {statusCounts.Shipped}
                    </span>
                    <span style={{ cursor: 'pointer' }} onClick={() => setActiveStatus('Delivered')}>
                      Delivered: {statusCounts.Delivered}
                    </span>
                    <span style={{ cursor: 'pointer' }} onClick={() => setActiveStatus('Cancelled')}>
                      Cancelled: {statusCounts.Cancelled}
                    </span>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="table-responsive">
                <table className="table table-dark table-borderless" style={{ 
                  marginBottom: 0,
                  borderCollapse: 'collapse'
                }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #3d3020' }}>
                      <th style={{ padding: '10px 6px', width: '35px' }}>
                        <input
                          type="checkbox"
                          checked={selectedOrders.length === currentOrders.length && currentOrders.length > 0}
                          onChange={toggleSelectAll}
                          style={{
                            width: '15px',
                            height: '15px',
                            accentColor: '#c9a84c',
                            cursor: 'pointer'
                          }}
                        />
                      </th>
                      <th style={{ 
                        padding: '10px 6px', 
                        fontSize: '10px', 
                        fontWeight: 600, 
                        color: '#8a7a6a',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        minWidth: '100px'
                      }}>
                        Order ID
                      </th>
                      <th style={{ 
                        padding: '10px 6px', 
                        fontSize: '10px', 
                        fontWeight: 600, 
                        color: '#8a7a6a',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        minWidth: '140px'
                      }}>
                        Customer
                      </th>
                      <th style={{ 
                        padding: '10px 6px', 
                        fontSize: '10px', 
                        fontWeight: 600, 
                        color: '#8a7a6a',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        minWidth: '100px'
                      }}>
                        Order Details
                      </th>
                      <th style={{ 
                        padding: '10px 6px', 
                        fontSize: '10px', 
                        fontWeight: 600, 
                        color: '#8a7a6a',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        minWidth: '90px'
                      }}>
                        Total
                      </th>
                      <th style={{ 
                        padding: '10px 6px', 
                        fontSize: '10px', 
                        fontWeight: 600, 
                        color: '#8a7a6a',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        minWidth: '140px'
                      }}>
                        Payment Method
                      </th>
                      <th style={{ 
                        padding: '10px 6px', 
                        fontSize: '10px', 
                        fontWeight: 600, 
                        color: '#8a7a6a',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        minWidth: '90px'
                      }}>
                        Status
                      </th>
                      <th style={{ 
                        padding: '10px 6px', 
                        fontSize: '10px', 
                        fontWeight: 600, 
                        color: '#8a7a6a',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        minWidth: '120px'
                      }}>
                        Date
                      </th>
                      <th style={{ 
                        padding: '10px 6px', 
                        fontSize: '10px', 
                        fontWeight: 600, 
                        color: '#8a7a6a',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        width: '50px'
                      }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {fetchLoading ? (
                      <tr><td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>
                        <Loader2 size={32} color="#c9a84c" style={{ animation: 'spin 1s linear infinite' }} />
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                        <p style={{ color: '#8a7a6a', marginTop: '8px', fontSize: '13px' }}>Loading orders...</p>
                      </td></tr>
                    ) : (
                    <>
                    {currentOrders.length > 0 ? (
                      currentOrders.map((order, index) => (
                        <tr 
                          key={order._id}
                          style={{ 
                            borderBottom: index < currentOrders.length - 1 ? '1px solid #1a1a1a' : 'none',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#1a1410'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '10px 6px' }}>
                            <input
                              type="checkbox"
                              checked={selectedOrders.includes(order._id)}
                              onChange={() => toggleSelectOrder(order._id)}
                              style={{
                                width: '15px',
                                height: '15px',
                                accentColor: '#c9a84c',
                                cursor: 'pointer'
                              }}
                            />
                          </td>
                          <td style={{ 
                            padding: '10px 6px', 
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#c9a84c'
                          }}>
                            {order.orderNumber}
                          </td>
                          <td style={{ padding: '10px 6px' }}>
                            <div className="fw-bold" style={{ fontSize: '12px' }}>{order.customer?.fullName}</div>
                            <div style={{ fontSize: '10px', color: '#8a7a6a' }}>{order.customer?.phone}</div>
                            <div style={{ fontSize: '10px', color: '#8a7a6a' }}>{order.customer?.email}</div>
                            <div style={{ fontSize: '10px', color: '#8a7a6a' }}>{order.customer?.address1}, {order.customer?.city}</div>
                          </td>
                          <td style={{ padding: '10px 6px', fontSize: '12px' }}>
                            +{order.items?.length || 0}
                          </td>
                          <td style={{ 
                            padding: '10px 6px', 
                            fontSize: '13px',
                            fontWeight: 700,
                            color: '#c9a84c'
                          }}>
                            Rs. {(order.total || 0).toLocaleString()}
                          </td>
                          <td style={{ padding: '10px 6px', fontSize: '11px' }}>
                            <div>{order.customer?.paymentMethod === 'cod' ? 'Cash on Delivery' : 'WhatsApp'}</div>
                            <div style={{ color: '#8a7a6a', fontSize: '10px' }}>Shipping: Rs. {order.shippingFee || 0}</div>
                            <div style={{ color: '#8a7a6a', fontSize: '10px' }}>{order.customer?.paymentMethod?.toUpperCase()}</div>
                          </td>
                          <td style={{ padding: '10px 6px' }}>
                            <StatusBadge status={order.status} />
                          </td>
                          <td style={{ padding: '10px 6px', fontSize: '11px' }}>
                            <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                            <div style={{ color: '#8a7a6a', fontSize: '10px' }}>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          </td>
                          <td style={{ padding: '10px 6px' }}>
                            <div className="d-flex flex-column align-items-end gap-2">
                              {order.status === 'Pending' && (
                                <button
                                  className="btn btn-sm"
                                  disabled={updatingId === order._id || deletingId === order._id}
                                  style={{
                                    background: '#c9a84c',
                                    color: '#0a0a0a',
                                    border: '1px solid #c9a84c',
                                    padding: '5px 8px',
                                    fontSize: '11px',
                                    borderRadius: '3px',
                                    cursor: updatingId === order._id || deletingId === order._id ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                  onClick={() => updateOrderStatus(order._id, 'Processing')}
                                >
                                  {updatingId === order._id ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                                  {updatingId === order._id ? 'Updating...' : 'Confirm'}
                                </button>
                              )}
                              {order.status === 'Processing' && (
                                <button
                                  className="btn btn-sm"
                                  disabled={updatingId === order._id || deletingId === order._id}
                                  style={{
                                    background: '#2196F3',
                                    color: '#fff',
                                    border: '1px solid #2196F3',
                                    padding: '5px 8px',
                                    fontSize: '11px',
                                    borderRadius: '3px',
                                    cursor: updatingId === order._id || deletingId === order._id ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                  onClick={() => updateOrderStatus(order._id, 'Shipped')}
                                >
                                  {updatingId === order._id ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                                  {updatingId === order._id ? 'Updating...' : 'Ship'}
                                </button>
                              )}
                              {order.status === 'Shipped' && (
                                <button
                                  className="btn btn-sm"
                                  disabled={updatingId === order._id || deletingId === order._id}
                                  style={{
                                    background: '#FF9800',
                                    color: '#0a0a0a',
                                    border: '1px solid #FF9800',
                                    padding: '5px 8px',
                                    fontSize: '11px',
                                    borderRadius: '3px',
                                    cursor: updatingId === order._id || deletingId === order._id ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                  onClick={() => openDeliveryModal(order)}
                                >
                                  {updatingId === order._id ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                                  Deliver
                                </button>
                              )}
                              <div className="position-relative">
                                <button 
                                  className="btn p-0 border-0"
                                  style={{ color: '#8a7a6a' }}
                                  onClick={() => setIsDropdownOpen(isDropdownOpen === order._id ? null : order._id)}
                                >
                                  <MoreVertical size={16} />
                                </button>
                                {isDropdownOpen === order._id && (
                                  <div style={{
                                    position: 'absolute',
                                    right: 0,
                                    top: '100%',
                                    background: '#1a1410',
                                    border: '1px solid #3d3020',
                                    borderRadius: '4px',
                                    padding: '4px 0',
                                    minWidth: '110px',
                                    zIndex: 10
                                  }}>
                                    <div style={{ padding: '5px 10px', fontSize: '11px', color: '#fff', cursor: 'pointer' }} 
                                      onMouseEnter={e => e.currentTarget.style.background = '#2a1f10'}
                                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                      onClick={() => setSelectedOrder(order)}>
                                      <Eye size={13} className="me-2" /> View
                                    </div>
                                    {order.status === 'Pending' && (
                                      <div style={{ padding: '5px 10px', fontSize: '11px', color: '#fff', cursor: updatingId === order._id || deletingId === order._id ? 'not-allowed' : 'pointer', opacity: updatingId === order._id || deletingId === order._id ? 0.5 : 1 }}
                                        onMouseEnter={e => { if (updatingId !== order._id && deletingId !== order._id) e.currentTarget.style.background = '#2a1f10'; }}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        onClick={() => { if (updatingId !== order._id && deletingId !== order._id) updateOrderStatus(order._id, 'Processing'); }}>
                                        {updatingId === order._id ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} className="me-2" /> : <CheckCircle2 size={13} className="me-2" />} {updatingId === order._id ? 'Updating...' : 'Confirm'}
                                      </div>
                                    )}
                                    {order.status === 'Processing' && (
                                      <div style={{ padding: '5px 10px', fontSize: '11px', color: '#fff', cursor: updatingId === order._id || deletingId === order._id ? 'not-allowed' : 'pointer', opacity: updatingId === order._id || deletingId === order._id ? 0.5 : 1 }}
                                        onMouseEnter={e => { if (updatingId !== order._id && deletingId !== order._id) e.currentTarget.style.background = '#2a1f10'; }}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        onClick={() => { if (updatingId !== order._id && deletingId !== order._id) updateOrderStatus(order._id, 'Shipped'); }}>
                                        {updatingId === order._id ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} className="me-2" /> : <Truck size={13} className="me-2" />} {updatingId === order._id ? 'Updating...' : 'Ship'}
                                      </div>
                                    )}
                                    {order.status === 'Shipped' && (
                                      <div style={{ padding: '5px 10px', fontSize: '11px', color: '#fff', cursor: updatingId === order._id || deletingId === order._id ? 'not-allowed' : 'pointer', opacity: updatingId === order._id || deletingId === order._id ? 0.5 : 1 }}
                                        onMouseEnter={e => { if (updatingId !== order._id && deletingId !== order._id) e.currentTarget.style.background = '#2a1f10'; }}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        onClick={() => { if (updatingId !== order._id && deletingId !== order._id) openDeliveryModal(order); }}>
                                        {updatingId === order._id ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} className="me-2" /> : <PackageCheck size={13} className="me-2" />} Deliver
                                      </div>
                                    )}
                                    <div style={{ padding: '5px 10px', fontSize: '11px', color: '#ff4444', cursor: updatingId === order._id || deletingId === order._id ? 'not-allowed' : 'pointer', opacity: updatingId === order._id || deletingId === order._id ? 0.5 : 1 }}
                                      onMouseEnter={e => { if (updatingId !== order._id && deletingId !== order._id) e.currentTarget.style.background = '#2a1f10'; }}
                                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                      onClick={() => { if (updatingId !== order._id && deletingId !== order._id) deleteOrder(order._id); }}>
                                      {deletingId === order._id ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} className="me-2" /> : <Trash2 size={13} className="me-2" />} {deletingId === order._id ? 'Deleting...' : 'Delete'}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" style={{ 
                          padding: '30px 20px', 
                          textAlign: 'center',
                          color: '#8a7a6a',
                          fontSize: '13px'
                        }}>
                          No orders found matching your filters.
                        </td>
                      </tr>
                    )}
                    </>
                    )}
                  </tbody>
                </table>
              </div>

              {/* ── PAGINATION ── */}
              <div style={{
                padding: '10px 14px',
                borderTop: '1px solid #3d3020',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '6px'
              }}>
                <div style={{ fontSize: '12px', color: '#8a7a6a' }}>
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredOrders.length)} of {filteredOrders.length} entries
                </div>
                <div className="d-flex gap-1">
                  <button
                    className="btn btn-sm"
                    style={{
                      background: 'transparent',
                      border: '1px solid #3d3020',
                      color: currentPage === 1 ? '#555' : '#fff',
                      padding: '3px 8px',
                      fontSize: '11px',
                      cursor: currentPage === 1 ? 'default' : 'pointer'
                    }}
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    <ChevronLeft size={13} />
                  </button>
                  {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={i}
                        className="btn btn-sm"
                        style={{
                          background: currentPage === pageNum ? '#c9a84c' : 'transparent',
                          border: currentPage === pageNum ? '1px solid #c9a84c' : '1px solid #3d3020',
                          color: currentPage === pageNum ? '#0a0a0a' : '#fff',
                          padding: '3px 8px',
                          fontSize: '11px',
                          cursor: 'pointer'
                        }}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {totalPages > 5 && (
                    <>
                      <span style={{ color: '#555', padding: '3px 3px', fontSize: '11px' }}>...</span>
                      <button
                        className="btn btn-sm"
                        style={{
                          background: 'transparent',
                          border: '1px solid #3d3020',
                          color: '#fff',
                          padding: '3px 8px',
                          fontSize: '11px',
                          cursor: 'pointer'
                        }}
                        onClick={() => handlePageChange(totalPages)}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                  <button
                    className="btn btn-sm"
                    style={{
                      background: 'transparent',
                      border: '1px solid #3d3020',
                      color: currentPage === totalPages || totalPages === 0 ? '#555' : '#fff',
                      padding: '3px 8px',
                      fontSize: '11px',
                      cursor: currentPage === totalPages || totalPages === 0 ? 'default' : 'pointer'
                    }}
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setSelectedOrder(null)}>
          <div style={{ background: '#0f0c09', border: '1px solid #3d3020', borderRadius: '8px', width: '100%', maxWidth: '760px', maxHeight: '90vh', overflowY: 'auto', padding: '24px', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedOrder(null)} style={{ position: 'absolute', top: '12px', right: '12px', background: 'transparent', border: 'none', color: '#fff' }}>
              <X size={18} />
            </button>
            <h4 className="fw-bold mb-3" style={{ color: '#c9a84c' }}>{selectedOrder.orderNumber}</h4>
            <div className="row g-3">
              <div className="col-md-6">
                <div style={{ color: '#8a7a6a', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Customer</div>
                <div className="fw-bold text-white">{selectedOrder.customer?.fullName}</div>
                <div style={{ color: '#d6d6d6', fontSize: '13px' }}>{selectedOrder.customer?.phone}</div>
                <div style={{ color: '#d6d6d6', fontSize: '13px' }}>{selectedOrder.customer?.email}</div>
              </div>
              <div className="col-md-6">
                <div style={{ color: '#8a7a6a', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Address</div>
                <div style={{ color: '#d6d6d6', fontSize: '13px' }}>{selectedOrder.customer?.address1}</div>
                <div style={{ color: '#d6d6d6', fontSize: '13px' }}>{selectedOrder.customer?.address2}</div>
                <div style={{ color: '#d6d6d6', fontSize: '13px' }}>{selectedOrder.customer?.city}, {selectedOrder.customer?.province}</div>
                <div style={{ color: '#d6d6d6', fontSize: '13px' }}>{selectedOrder.customer?.country} - {selectedOrder.customer?.postal}</div>
              </div>
            </div>
            <div className="mt-4" style={{ borderTop: '1px solid #3d3020', paddingTop: '16px' }}>
              <div style={{ color: '#8a7a6a', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Order Items</div>
              <div className="mt-2">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="d-flex justify-content-between align-items-center py-2" style={{ borderBottom: '1px solid #2a1f10' }}>
                    <div>
                      <div className="fw-semibold text-white">{item.name}</div>
                      <div style={{ color: '#8a7a6a', fontSize: '12px' }}>Qty: {item.quantity} • {item.category}</div>
                    </div>
                    <div style={{ color: '#c9a84c', fontWeight: 600 }}>Rs. {(item.price * item.quantity).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 d-flex flex-wrap gap-3">
              <div style={{ flex: 1, minWidth: '200px', background: '#141010', border: '1px solid #2a1f10', borderRadius: '6px', padding: '12px' }}>
                <div style={{ color: '#8a7a6a', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Payment</div>
                <div className="fw-semibold text-white">{selectedOrder.customer?.paymentMethod === 'cod' ? 'Cash on Delivery' : 'WhatsApp'}</div>
                <div style={{ color: '#8a7a6a', fontSize: '12px' }}>{selectedOrder.customer?.notes || 'No notes'}</div>
              </div>
              <div style={{ flex: 1, minWidth: '200px', background: '#141010', border: '1px solid #2a1f10', borderRadius: '6px', padding: '12px' }}>
                <div style={{ color: '#8a7a6a', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Totals</div>
                <div className="d-flex justify-content-between text-white mt-1"><span>Subtotal</span><span>Rs. {(selectedOrder.subtotal || 0).toLocaleString()}</span></div>
                <div className="d-flex justify-content-between text-white"><span>Shipping</span><span>Rs. {(selectedOrder.shippingFee || 0).toLocaleString()}</span></div>
                <div className="d-flex justify-content-between fw-bold" style={{ color: '#c9a84c' }}><span>Total</span><span>Rs. {(selectedOrder.total || 0).toLocaleString()}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {trackingOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setTrackingOrder(null)}>
          <div style={{ background: '#0f0c09', border: '1px solid #3d3020', borderRadius: '8px', width: '100%', maxWidth: '520px', padding: '24px', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setTrackingOrder(null)} style={{ position: 'absolute', top: '12px', right: '12px', background: 'transparent', border: 'none', color: '#fff' }}>
              <X size={18} />
            </button>
            <h4 className="fw-bold mb-3" style={{ color: '#c9a84c' }}>Mark Delivered</h4>
            <div style={{ color: '#8a7a6a', fontSize: '12px', marginBottom: '12px' }}>
              Enter the tracking ID for <strong>{trackingOrder.orderNumber}</strong>. This will be sent to the customer with delivery details.
            </div>
            <div className="mb-3">
              <label className="form-label" style={{ color: '#fff', fontSize: '12px' }}>Tracking ID</label>
              <input
                type="text"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder="Enter tracking ID"
                className="form-control"
                style={{ background: '#121212', border: '1px solid #3d3020', color: '#fff' }}
              />
            </div>
            <button
              className="btn btn-warning w-100"
              style={{ color: '#0a0a0a', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              onClick={() => updateOrderStatus(trackingOrder._id, 'Delivered', trackingId)}
              disabled={!trackingId.trim() || updatingId === trackingOrder?._id}
            >
              {updatingId === trackingOrder?._id && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
              {updatingId === trackingOrder?._id ? 'Confirming...' : 'Confirm Delivery'}
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
    </div>
  );
}