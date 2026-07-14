import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Package, Eye, Loader2, ShoppingBag } from 'lucide-react';
import API_URL from '../../config';

const statusColors = {
  Pending: '#f59e0b',
  Confirmed: '#3b82f6',
  Processing: '#8b5cf6',
  Packed: '#6366f1',
  Shipped: '#06b6d4',
  'Out for Delivery': '#14b8a6',
  Delivered: '#22c55e',
  Cancelled: '#ef4444',
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('customerToken');
        const response = await axios.get(`${API_URL}/api/customer-orders/my-orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(response.data.orders || response.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={40} color="#c9a84c" className="spin" />
        <p style={{ color: '#999', marginTop: 16, fontSize: 14 }}>Loading your orders...</p>
        <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Package size={48} color="#ef4444" />
        <p style={{ color: '#ef4444', marginTop: 16, fontSize: 16 }}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: 16,
            background: '#c9a84c',
            color: '#0a0a0a',
            border: 'none',
            borderRadius: 8,
            padding: '10px 24px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', padding: '40px 20px', fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div
          style={{
            background: 'rgba(15,15,15,0.95)',
            border: '1px solid #3d3020',
            borderRadius: 12,
            padding: 30,
          }}
        >
          <h1
            style={{
              color: '#c9a84c',
              fontSize: 26,
              fontWeight: 700,
              margin: '0 0 28px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <ShoppingBag size={26} />
            My Orders
          </h1>

          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <Package size={56} color="#555" />
              <p style={{ color: '#888', fontSize: 18, marginTop: 16 }}>No orders yet</p>
              <p style={{ color: '#555', fontSize: 14, marginTop: 8 }}>
                When you place an order, it will appear here.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="orders-table-wrap" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                  <thead>
                    <tr>
                      {['Order Number', 'Date', 'Items', 'Total', 'Status', ''].map((h) => (
                        <th
                          key={h}
                          style={{
                            textAlign: 'left',
                            padding: '12px 14px',
                            color: '#c9a84c',
                            fontWeight: 600,
                            fontSize: 13,
                            borderBottom: '1px solid #3d3020',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr
                        key={order._id || order.id}
                        style={{ borderBottom: '1px solid #1f1f1f' }}
                      >
                        <td style={{ padding: '14px', color: '#e0e0e0', fontSize: 14, fontWeight: 500 }}>
                          #{order.orderNumber || order._id?.slice(-8)}
                        </td>
                        <td style={{ padding: '14px', color: '#999', fontSize: 14 }}>
                          {formatDate(order.createdAt || order.date)}
                        </td>
                        <td style={{ padding: '14px', color: '#999', fontSize: 14 }}>
                          {order.items?.length ?? order.itemCount ?? 0}
                        </td>
                        <td style={{ padding: '14px', color: '#e0e0e0', fontSize: 14, fontWeight: 600 }}>
                          ${(order.totalAmount ?? order.total ?? 0).toFixed(2)}
                        </td>
                        <td style={{ padding: '14px' }}>
                          <StatusBadge status={order.status} />
                        </td>
                        <td style={{ padding: '14px', textAlign: 'right' }}>
                          <button
                            onClick={() => navigate(`/account/orders/${order._id || order.id}`)}
                            style={{
                              background: 'transparent',
                              border: '1px solid #c9a84c',
                              color: '#c9a84c',
                              borderRadius: 8,
                              padding: '7px 16px',
                              cursor: 'pointer',
                              fontSize: 13,
                              fontWeight: 500,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              transition: 'all .2s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#c9a84c';
                              e.currentTarget.style.color = '#0a0a0a';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = '#c9a84c';
                            }}
                          >
                            <Eye size={14} />
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile stacked cards */}
              <div className="orders-mobile-cards" style={{ display: 'none' }}>
                {orders.map((order) => (
                  <div
                    key={order._id || order.id}
                    style={{
                      background: 'rgba(20,20,20,0.95)',
                      border: '1px solid #3d3020',
                      borderRadius: 10,
                      padding: 18,
                      marginBottom: 14,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ color: '#e0e0e0', fontWeight: 600, fontSize: 15 }}>
                        #{order.orderNumber || order._id?.slice(-8)}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                      <span style={{ color: '#999', fontSize: 13 }}>Date: {formatDate(order.createdAt || order.date)}</span>
                      <span style={{ color: '#999', fontSize: 13 }}>
                        Items: {order.items?.length ?? order.itemCount ?? 0}
                      </span>
                      <span style={{ color: '#e0e0e0', fontSize: 15, fontWeight: 600 }}>
                        ${(order.totalAmount ?? order.total ?? 0).toFixed(2)}
                      </span>
                    </div>
                    <button
                      onClick={() => navigate(`/account/orders/${order._id || order.id}`)}
                      style={{
                        width: '100%',
                        background: 'transparent',
                        border: '1px solid #c9a84c',
                        color: '#c9a84c',
                        borderRadius: 8,
                        padding: '10px 0',
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                      }}
                    >
                      <Eye size={14} />
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .orders-table-wrap { display: none !important; }
          .orders-mobile-cards { display: block !important; }
        }
      `}</style>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const bg = statusColors[status] || '#555';
  return (
    <span
      style={{
        background: bg,
        color: '#fff',
        fontSize: 12,
        fontWeight: 600,
        padding: '4px 12px',
        borderRadius: 9999,
        whiteSpace: 'nowrap',
        textTransform: 'capitalize',
      }}
    >
      {status}
    </span>
  );
};

export default MyOrders;
