import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAlert } from '../../context/AlertContext';
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  CreditCard,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import API_URL from '../../config';

const API_BASE = `${API_URL}`;

const cancelableStatuses = ['Pending', 'Confirmed', 'Processing', 'Packed'];
const statusColors = {
  Pending: { bg: 'rgba(255,193,7,0.15)', text: '#ffc107', border: 'rgba(255,193,7,0.3)' },
  Confirmed: { bg: 'rgba(33,150,243,0.15)', text: '#2196f3', border: 'rgba(33,150,243,0.3)' },
  Processing: { bg: 'rgba(156,39,176,0.15)', text: '#9c27b0', border: 'rgba(156,39,176,0.3)' },
  Packed: { bg: 'rgba(0,188,212,0.15)', text: '#00bcd4', border: 'rgba(0,188,212,0.3)' },
  Shipped: { bg: 'rgba(255,152,0,0.15)', text: '#ff9800', border: 'rgba(255,152,0,0.3)' },
  OutForDelivery: { bg: 'rgba(255,87,34,0.15)', text: '#ff5722', border: 'rgba(255,87,34,0.3)' },
  Delivered: { bg: 'rgba(76,175,80,0.15)', text: '#4caf50', border: 'rgba(76,175,80,0.3)' },
  Cancelled: { bg: 'rgba(244,67,54,0.15)', text: '#f44336', border: 'rgba(244,67,54,0.3)' },
  Returned: { bg: 'rgba(158,158,158,0.15)', text: '#9e9e9e', border: 'rgba(158,158,158,0.3)' },
  Refunded: { bg: 'rgba(158,158,158,0.15)', text: '#9e9e9e', border: 'rgba(158,158,158,0.3)' },
};

const trackingIcons = {
  Pending: Clock,
  Confirmed: CheckCircle,
  Processing: Package,
  Packed: Package,
  Shipped: Truck,
  OutForDelivery: Truck,
  Delivered: CheckCircle,
  Cancelled: XCircle,
  Returned: XCircle,
  Refunded: XCircle,
};

const statusSteps = ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'OutForDelivery', 'Delivered'];

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
}

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnForm, setReturnForm] = useState({ type: 'return', reason: '', description: '' });
  const [submittingReturn, setSubmittingReturn] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('customerToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`${API_BASE}/api/customer-orders/my-orders/${id}`, {
        headers: getAuthHeaders(),
      });
      setOrder(res.data.order || res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    try {
      setCancelling(true);
      await axios.put(
        `${API_BASE}/api/customer-orders/my-orders/${id}/cancel`,
        {},
        { headers: getAuthHeaders() }
      );
      setShowCancelDialog(false);
      showAlert({ type: 'success', message: 'Order has been cancelled successfully.' });
      fetchOrder();
    } catch (err) {
      showAlert({ type: 'error', message: err.response?.data?.message || 'Failed to cancel order.' });
    } finally {
      setCancelling(false);
    }
  };

  const handleReturnRefund = async () => {
    if (!returnForm.reason.trim()) return;
    try {
      setSubmittingReturn(true);
      await axios.post(
        `${API_BASE}/api/customer-orders/my-orders/${id}/return-refund`,
        returnForm,
        { headers: getAuthHeaders() }
      );
      setShowReturnModal(false);
      setReturnForm({ type: 'return', reason: '', description: '' });
      showAlert({ type: 'success', message: 'Your return/refund request has been submitted successfully.' });
      fetchOrder();
    } catch (err) {
      showAlert({ type: 'error', message: err.response?.data?.message || 'Failed to submit request.' });
    } finally {
      setSubmittingReturn(false);
    }
  };

  const cardStyle = {
    background: 'rgba(15,15,15,0.95)',
    border: '1px solid #3d3020',
    borderRadius: '12px',
    padding: '24px',
  };

  const labelStyle = {
    fontSize: '12px',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '6px',
  };

  const valueStyle = {
    fontSize: '15px',
    color: '#e0e0e0',
    lineHeight: '1.5',
  };

  const sectionTitle = {
    fontSize: '13px',
    color: '#c9a84c',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    marginBottom: '16px',
    fontWeight: '600',
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={40} color="#c9a84c" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <AlertTriangle size={48} color="#f44336" style={{ marginBottom: '16px' }} />
        <p style={{ color: '#e0e0e0', fontSize: '16px', marginBottom: '24px', textAlign: 'center' }}>{error}</p>
        <button
          onClick={() => navigate('/account/orders')}
          style={{ background: 'transparent', border: '1px solid #c9a84c', color: '#c9a84c', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}
        >
          Back to Orders
        </button>
      </div>
    );
  }

  if (!order) return null;

  const status = order.status || order.orderStatus || 'Pending';
  const sc = statusColors[status] || statusColors.Pending;
  const canCancel = cancelableStatuses.includes(status);
  const canReturnRefund = status === 'Delivered';
  const items = order.items || order.orderItems || [];
  const summary = order.summary || order.orderSummary || {};
  const shipping = order.shippingAddress || order.shipping || {};
  const customer = order.customer || order.customerInfo || {};
  const tracking = order.statusHistory || order.timeline || [];
  const currentStepIndex = statusSteps.indexOf(status);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#e0e0e0', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .order-detail-page input:focus, .order-detail-page textarea:focus {
          outline: none;
          border-color: #c9a84c !important;
        }
        .order-detail-page ::-webkit-scrollbar { width: 6px; }
        .order-detail-page ::-webkit-scrollbar-track { background: #111; }
        .order-detail-page ::-webkit-scrollbar-thumb { background: #3d3020; border-radius: 3px; }
        @media (max-width: 768px) {
          .order-detail-grid { grid-template-columns: 1fr !important; }
          .order-detail-summary { flex-direction: column !important; }
        }
      `}</style>

      <div className="order-detail-page" style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <button
            onClick={() => navigate('/account/orders')}
            style={{ background: 'transparent', border: 'none', color: '#c9a84c', cursor: 'pointer', display: 'flex', padding: '8px' }}
          >
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#fff', margin: 0 }}>Order Details</h1>
            <p style={{ fontSize: '13px', color: '#888', margin: '4px 0 0' }}>
              Order #{order.orderNumber || order._id?.slice(-8)?.toUpperCase() || id}
            </p>
          </div>
        </div>

        {/* Status Banner */}
        <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Package size={20} color="#c9a84c" />
            <span style={{ fontSize: '15px', color: '#ccc' }}>
              Placed on <strong style={{ color: '#fff' }}>{formatDate(order.createdAt || order.orderDate)}</strong>
            </span>
          </div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600',
            background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`,
          }}>
            {status}
          </span>
        </div>

        {/* Action Buttons */}
        {(canCancel || canReturnRefund) && (
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
            {canCancel && (
              <button
                onClick={() => setShowCancelDialog(true)}
                style={{
                  background: 'transparent', border: '1px solid #f44336', color: '#f44336',
                  padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px',
                  fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.target.style.background = 'rgba(244,67,54,0.1)'; }}
                onMouseLeave={(e) => { e.target.style.background = 'transparent'; }}
              >
                <XCircle size={16} /> Cancel Order
              </button>
            )}
            {canReturnRefund && (
              <button
                onClick={() => setShowReturnModal(true)}
                style={{
                  background: 'transparent', border: '1px solid #c9a84c', color: '#c9a84c',
                  padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px',
                  fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.target.style.background = 'rgba(201,168,76,0.1)'; }}
                onMouseLeave={(e) => { e.target.style.background = 'transparent'; }}
              >
                <AlertTriangle size={16} /> Return / Refund
              </button>
            )}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="order-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Order Items */}
            <div style={cardStyle}>
              <h3 style={sectionTitle}>Order Items</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {items.map((item, idx) => (
                  <div key={item._id || idx} style={{ display: 'flex', gap: '16px', paddingBottom: idx < items.length - 1 ? '16px' : 0, borderBottom: idx < items.length - 1 ? '1px solid #222' : 'none' }}>
                    <div style={{ width: '72px', height: '72px', borderRadius: '8px', overflow: 'hidden', background: '#1a1a1a', flexShrink: 0, border: '1px solid #333' }}>
                      {item.image || item.productImage ? (
                        <img src={item.image || item.productImage} alt={item.name || item.productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Package size={24} color="#555" />
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '14px', color: '#fff', margin: 0, fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.name || item.productName || 'Product'}
                      </p>
                      <div style={{ display: 'flex', gap: '12px', marginTop: '4px', flexWrap: 'wrap' }}>
                        {item.size && <span style={{ fontSize: '12px', color: '#888' }}>Size: {item.size}</span>}
                        {item.color && (
                          <span style={{ fontSize: '12px', color: '#888', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            Color: {item.color}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                        <span style={{ fontSize: '12px', color: '#888' }}>Qty: {item.quantity}</span>
                        <span style={{ fontSize: '14px', color: '#c9a84c', fontWeight: '600' }}>{formatCurrency(item.price * (item.quantity || 1))}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tracking Timeline */}
            {tracking.length > 0 && (
              <div style={cardStyle}>
                <h3 style={sectionTitle}>Order Tracking</h3>
                <div style={{ position: 'relative', paddingLeft: '28px' }}>
                  {/* Vertical line */}
                  <div style={{ position: 'absolute', left: '8px', top: '8px', bottom: '8px', width: '2px', background: '#333' }} />

                  {tracking.map((step, idx) => {
                    const stepStatus = step.status || step.orderStatus || 'Pending';
                    const IconComp = trackingIcons[stepStatus] || Clock;
                    const stepColor = statusColors[stepStatus] || statusColors.Pending;
                    const isLast = idx === tracking.length - 1;

                    return (
                      <div key={step._id || idx} style={{ position: 'relative', paddingBottom: idx < tracking.length - 1 ? '24px' : '0' }}>
                        <div style={{
                          position: 'absolute', left: '-28px', top: '2px',
                          width: '18px', height: '18px', borderRadius: '50%',
                          background: isLast ? stepColor.bg : '#1a1a1a',
                          border: `2px solid ${isLast ? stepColor.text : '#444'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          zIndex: 1,
                        }}>
                          <IconComp size={10} color={isLast ? stepColor.text : '#666'} />
                        </div>
                        <div>
                          <p style={{ fontSize: '14px', color: isLast ? '#fff' : '#999', margin: 0, fontWeight: isLast ? '600' : '400' }}>
                            {stepStatus}
                          </p>
                          <p style={{ fontSize: '12px', color: '#666', margin: '2px 0 0' }}>
                            {formatDate(step.date || step.timestamp || step.createdAt)}
                          </p>
                          {step.note && <p style={{ fontSize: '12px', color: '#888', margin: '4px 0 0', fontStyle: 'italic' }}>{step.note}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Order Summary */}
            <div style={cardStyle}>
              <h3 style={sectionTitle}>Order Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', color: '#999' }}>Subtotal</span>
                  <span style={{ fontSize: '14px', color: '#e0e0e0' }}>{formatCurrency(summary.subtotal || order.subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', color: '#999' }}>Shipping</span>
                  <span style={{ fontSize: '14px', color: '#e0e0e0' }}>
                    {(summary.shipping || order.shippingCost) === 0 ? 'Free' : formatCurrency(summary.shipping || order.shippingCost)}
                  </span>
                </div>
                {summary.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '14px', color: '#999' }}>Discount</span>
                    <span style={{ fontSize: '14px', color: '#4caf50' }}>-{formatCurrency(summary.discount)}</span>
                  </div>
                )}
                {summary.tax > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '14px', color: '#999' }}>Tax</span>
                    <span style={{ fontSize: '14px', color: '#e0e0e0' }}>{formatCurrency(summary.tax)}</span>
                  </div>
                )}
                <div style={{ borderTop: '1px solid #333', paddingTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '15px', color: '#fff', fontWeight: '600' }}>Total</span>
                  <span style={{ fontSize: '18px', color: '#c9a84c', fontWeight: '700' }}>{formatCurrency(summary.total || order.totalAmount || order.total)}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div style={cardStyle}>
              <h3 style={sectionTitle}>Payment Method</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CreditCard size={18} color="#c9a84c" />
                <span style={{ fontSize: '14px', color: '#e0e0e0' }}>{order.paymentMethod || order.payment?.method || 'N/A'}</span>
              </div>
              {order.paymentStatus && (
                <span style={{ display: 'inline-block', marginTop: '8px', fontSize: '12px', color: order.paymentStatus === 'Paid' ? '#4caf50' : '#ffc107', background: order.paymentStatus === 'Paid' ? 'rgba(76,175,80,0.1)' : 'rgba(255,193,7,0.1)', padding: '4px 10px', borderRadius: '12px' }}>
                  {order.paymentStatus}
                </span>
              )}
            </div>

            {/* Customer Info */}
            <div style={cardStyle}>
              <h3 style={sectionTitle}>Customer Information</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <p style={labelStyle}>Name</p>
                  <p style={valueStyle}>{customer.name || order.customerName || 'N/A'}</p>
                </div>
                <div>
                  <p style={labelStyle}>Phone</p>
                  <p style={valueStyle}>{customer.phone || order.phone || 'N/A'}</p>
                </div>
                <div>
                  <p style={labelStyle}>Email</p>
                  <p style={{ ...valueStyle, wordBreak: 'break-all' }}>{customer.email || order.email || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div style={cardStyle}>
              <h3 style={sectionTitle}>Shipping Address</h3>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <MapPin size={18} color="#c9a84c" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  {typeof shipping === 'string' ? (
                    <p style={valueStyle}>{shipping}</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <p style={{ fontSize: '14px', color: '#e0e0e0', margin: 0 }}>{shipping.fullName || shipping.name || customer.name || ''}</p>
                      <p style={{ fontSize: '13px', color: '#999', margin: 0 }}>{shipping.address || shipping.street || ''}</p>
                      {(shipping.city || shipping.state) && (
                        <p style={{ fontSize: '13px', color: '#999', margin: 0 }}>
                          {[shipping.city, shipping.state, shipping.zipCode || shipping.postalCode].filter(Boolean).join(', ')}
                        </p>
                      )}
                      {shipping.country && <p style={{ fontSize: '13px', color: '#999', margin: 0 }}>{shipping.country}</p>}
                      {shipping.phone && <p style={{ fontSize: '13px', color: '#999', margin: '4px 0 0' }}>Phone: {shipping.phone}</p>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      {showCancelDialog && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowCancelDialog(false); }}
        >
          <div style={{ background: '#1a1a1a', border: '1px solid #3d3020', borderRadius: '12px', padding: '32px', maxWidth: '420px', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(244,67,54,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={20} color="#f44336" />
              </div>
              <h3 style={{ fontSize: '18px', color: '#fff', margin: 0 }}>Cancel Order</h3>
            </div>
            <p style={{ fontSize: '14px', color: '#999', marginBottom: '24px', lineHeight: '1.6' }}>
              Are you sure you want to cancel this order? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowCancelDialog(false)}
                style={{ background: 'transparent', border: '1px solid #444', color: '#999', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                style={{
                  background: '#f44336', border: 'none', color: '#fff', padding: '10px 20px',
                  borderRadius: '8px', cursor: cancelling ? 'not-allowed' : 'pointer', fontSize: '14px',
                  fontWeight: '600', opacity: cancelling ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '8px',
                }}
              >
                {cancelling ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Cancelling...</> : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return / Refund Modal */}
      {showReturnModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowReturnModal(false); }}
        >
          <div style={{ background: '#1a1a1a', border: '1px solid #3d3020', borderRadius: '12px', padding: '32px', maxWidth: '480px', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(201,168,76,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={20} color="#c9a84c" />
              </div>
              <h3 style={{ fontSize: '18px', color: '#fff', margin: 0 }}>Request Return / Refund</h3>
            </div>

            {/* Type Selector */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ ...labelStyle, display: 'block', marginBottom: '8px' }}>Request Type</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['return', 'refund'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setReturnForm((f) => ({ ...f, type }))}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '8px', fontSize: '14px',
                      textTransform: 'capitalize', cursor: 'pointer', fontWeight: '500',
                      background: returnForm.type === type ? 'rgba(201,168,76,0.15)' : 'transparent',
                      border: `1px solid ${returnForm.type === type ? '#c9a84c' : '#333'}`,
                      color: returnForm.type === type ? '#c9a84c' : '#888',
                      transition: 'all 0.2s',
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Reason */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ ...labelStyle, display: 'block', marginBottom: '8px' }}>Reason *</label>
              <input
                type="text"
                value={returnForm.reason}
                onChange={(e) => setReturnForm((f) => ({ ...f, reason: e.target.value }))}
                placeholder="e.g. Wrong size, damaged item..."
                style={{
                  width: '100%', padding: '12px 16px', background: '#0f0f0f', border: '1px solid #333',
                  borderRadius: '8px', color: '#e0e0e0', fontSize: '14px', boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Description */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ ...labelStyle, display: 'block', marginBottom: '8px' }}>Description</label>
              <textarea
                value={returnForm.description}
                onChange={(e) => setReturnForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Provide additional details..."
                rows={4}
                style={{
                  width: '100%', padding: '12px 16px', background: '#0f0f0f', border: '1px solid #333',
                  borderRadius: '8px', color: '#e0e0e0', fontSize: '14px', resize: 'vertical',
                  boxSizing: 'border-box', fontFamily: 'inherit',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowReturnModal(false)}
                style={{ background: 'transparent', border: '1px solid #444', color: '#999', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleReturnRefund}
                disabled={submittingReturn || !returnForm.reason.trim()}
                style={{
                  background: '#c9a84c', border: 'none', color: '#0a0a0a', padding: '10px 24px',
                  borderRadius: '8px', cursor: submittingReturn || !returnForm.reason.trim() ? 'not-allowed' : 'pointer',
                  fontSize: '14px', fontWeight: '600',
                  opacity: submittingReturn || !returnForm.reason.trim() ? 0.6 : 1,
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}
              >
                {submittingReturn ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Submitting...</> : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
