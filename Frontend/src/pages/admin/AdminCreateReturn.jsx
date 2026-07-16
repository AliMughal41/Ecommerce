import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2, ArrowLeft, Plus, Trash2, Search } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import API_URL from '../../config';

const GOLD = '#c9a84c';

export default function AdminCreateReturn() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderSearch, setOrderSearch] = useState('');
  const [items, setItems] = useState([]);
  const [reason, setReason] = useState('');
  const [deliveryCharges, setDeliveryCharges] = useState('');
  const [packingCharges, setPackingCharges] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const token = localStorage.getItem('adminToken');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const searchOrders = async () => {
    if (!orderSearch.trim()) return;
    try {
      const { data } = await axios.get(`${API_URL}/api/orders?search=${orderSearch}`, config);
      if (data.success) setOrders(data.orders || []);
    } catch (error) {
      console.error('Error searching orders:', error);
    }
  };

  const selectOrder = (order) => {
    setSelectedOrder(order);
    setItems(order.items.map(item => ({
      productId: item.productId,
      productName: item.name,
      productPrice: item.price,
      quantity: item.quantity,
      image: item.image || '',
      returnQty: 1,
    })));
    setOrders([]);
  };

  const updateItemQty = (idx, qty) => {
    const updated = [...items];
    updated[idx].returnQty = Math.min(Math.max(1, qty), updated[idx].quantity);
    setItems(updated);
  };

  const removeItem = (idx) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const totalProductValue = items.reduce((sum, item) => sum + (item.productPrice * item.returnQty), 0);
  const totalRefund = totalProductValue + (Number(deliveryCharges) || 0) + (Number(packingCharges) || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrder || items.length === 0 || !reason.trim()) {
      alert('Please fill in all required fields.');
      return;
    }
    try {
      const { data } = await axios.post(`${API_URL}/api/returns`, {
        orderId: selectedOrder._id,
        items: items.map(i => ({
          productId: i.productId,
          productName: i.productName,
          productPrice: i.productPrice,
          quantity: i.returnQty,
          image: i.image,
        })),
        reason,
        deliveryCharges: Number(deliveryCharges) || 0,
        packingCharges: Number(packingCharges) || 0,
      }, config);
      if (data.success) {
        navigate('/admin-returns');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create return.');
    }
  };

  const inputStyle = {
    width: '100%', background: '#141010', border: '1px solid #3d3020', borderRadius: '4px',
    color: '#fff', padding: '10px 12px', fontSize: '13px', outline: 'none',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a' }}>
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="admin-main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header */}
        <div style={{ height: '60px', background: '#0d0a06', borderBottom: '1px solid #2a1f10', display: 'flex', alignItems: 'center', padding: '0 24px', gap: '16px', flexShrink: 0 }}>
          <button onClick={() => setSidebarOpen(s => !s)} className="admin-hamburger" style={{ background: 'transparent', border: 'none', color: '#8a7a6a', cursor: 'pointer', padding: '4px' }}>
            <Plus size={20} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', border: '1.5px solid #c9a84c', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <img src="/images/logo.png" alt="VELNORA" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: '14px', letterSpacing: '2px', color: '#c9a84c' }}>VELNORA</span>
          </div>
          <div style={{ flex: 1 }} />
          <button onClick={() => navigate('/admin-returns')} style={{ background: 'transparent', border: '1px solid #3d3020', color: '#8a7a6a', padding: '6px 14px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>Returns</button>
        </div>

        <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <button onClick={() => navigate('/admin-returns')} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <ArrowLeft size={20} style={{ color: GOLD }} />
            </button>
            <div>
              <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 700, margin: 0 }}>Create Return</h1>
              <p style={{ color: '#8a7a6a', fontSize: '13px', margin: '4px 0 0' }}>Create a new product return record</p>
            </div>
          </div>

          {/* Order Search */}
          {!selectedOrder && (
            <div style={{ background: '#0f0c09', border: '1px solid #2a1f10', borderRadius: '8px', padding: '24px' }}>
              <div style={{ color: '#fff', fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>Find Order</div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8a7a6a' }} />
                  <input value={orderSearch} onChange={e => setOrderSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchOrders()}
                    placeholder="Search by order number or customer name..." style={{ ...inputStyle, paddingLeft: '36px' }}
                    onFocus={e => e.target.style.borderColor = GOLD} onBlur={e => e.target.style.borderColor = '#3d3020'} />
                </div>
                <button onClick={searchOrders} style={{ padding: '10px 20px', background: GOLD, color: '#0a0a0a', border: 'none', borderRadius: '4px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>Search</button>
              </div>
              {orders.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '300px', overflowY: 'auto' }}>
                  {orders.map(o => (
                    <div key={o._id} onClick={() => selectOrder(o)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#141010', borderRadius: '6px', border: '1px solid #2a1f10', cursor: 'pointer', transition: 'border-color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = GOLD} onMouseLeave={e => e.currentTarget.style.borderColor = '#2a1f10'}>
                      <div>
                        <div style={{ color: GOLD, fontSize: '12px', fontWeight: 600 }}>{o.orderNumber}</div>
                        <div style={{ color: '#ccc', fontSize: '12px' }}>{o.customer?.fullName} — Rs. {o.total?.toLocaleString()}</div>
                      </div>
                      <div style={{ color: '#8a7a6a', fontSize: '11px' }}>{o.items?.length} items</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Return Form */}
          {selectedOrder && (
            <form onSubmit={handleSubmit}>
              {/* Selected Order Info */}
              <div style={{ background: '#0f0c09', border: '1px solid #2a1f10', borderRadius: '8px', padding: '20px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ color: '#fff', fontSize: '14px', fontWeight: 700 }}>Selected Order</div>
                  <button type="button" onClick={() => { setSelectedOrder(null); setItems([]); }}
                    style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid #e74c3c30', borderRadius: '4px', padding: '4px 12px', color: '#e74c3c', fontSize: '11px', cursor: 'pointer' }}>Change</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div><span style={{ color: '#8a7a6a', fontSize: '11px' }}>Order: </span><span style={{ color: GOLD, fontSize: '12px', fontWeight: 600 }}>{selectedOrder.orderNumber}</span></div>
                  <div><span style={{ color: '#8a7a6a', fontSize: '11px' }}>Customer: </span><span style={{ color: '#fff', fontSize: '12px' }}>{selectedOrder.customer?.fullName}</span></div>
                  <div><span style={{ color: '#8a7a6a', fontSize: '11px' }}>Total: </span><span style={{ color: '#fff', fontSize: '12px' }}>Rs. {selectedOrder.total?.toLocaleString()}</span></div>
                </div>
              </div>

              {/* Return Items */}
              <div style={{ background: '#0f0c09', border: '1px solid #2a1f10', borderRadius: '8px', padding: '20px', marginBottom: '16px' }}>
                <div style={{ color: '#fff', fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Return Items</div>
                {items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: '#141010', borderRadius: '6px', marginBottom: '8px' }}>
                    {item.image && <img src={item.image} alt="" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />}
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#fff', fontSize: '12px', fontWeight: 600 }}>{item.productName}</div>
                      <div style={{ color: '#8a7a6a', fontSize: '11px' }}>Rs. {item.productPrice.toLocaleString()} × {item.quantity} in order</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <label style={{ color: '#8a7a6a', fontSize: '11px' }}>Return Qty:</label>
                      <input type="number" min={1} max={item.quantity} value={item.returnQty}
                        onChange={e => updateItemQty(idx, parseInt(e.target.value) || 1)}
                        style={{ width: '60px', background: '#1a1410', border: '1px solid #3d3020', borderRadius: '4px', color: '#fff', padding: '6px', textAlign: 'center', fontSize: '12px', outline: 'none' }} />
                    </div>
                    <div style={{ color: GOLD, fontSize: '12px', fontWeight: 700, minWidth: '80px', textAlign: 'right' }}>Rs. {(item.productPrice * item.returnQty).toLocaleString()}</div>
                    <button type="button" onClick={() => removeItem(idx)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                      <Trash2 size={14} style={{ color: '#e74c3c' }} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Reason & Charges */}
              <div style={{ background: '#0f0c09', border: '1px solid #2a1f10', borderRadius: '8px', padding: '20px', marginBottom: '16px' }}>
                <div style={{ color: '#fff', fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>Details</div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', color: '#8a7a6a', fontSize: '11px', letterSpacing: '1px', marginBottom: '6px' }}>RETURN REASON *</label>
                  <textarea value={reason} onChange={e => setReason(e.target.value)} required rows={3} placeholder="Why is the customer returning this product?"
                    style={{ ...inputStyle, resize: 'vertical' }} onFocus={e => e.target.style.borderColor = GOLD} onBlur={e => e.target.style.borderColor = '#3d3020'} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', color: '#8a7a6a', fontSize: '11px', letterSpacing: '1px', marginBottom: '6px' }}>DELIVERY CHARGES (Optional)</label>
                    <input type="number" min={0} value={deliveryCharges} onChange={e => setDeliveryCharges(e.target.value)} placeholder="0"
                      style={inputStyle} onFocus={e => e.target.style.borderColor = GOLD} onBlur={e => e.target.style.borderColor = '#3d3020'} />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#8a7a6a', fontSize: '11px', letterSpacing: '1px', marginBottom: '6px' }}>PACKING CHARGES (Optional)</label>
                    <input type="number" min={0} value={packingCharges} onChange={e => setPackingCharges(e.target.value)} placeholder="0"
                      style={inputStyle} onFocus={e => e.target.style.borderColor = GOLD} onBlur={e => e.target.style.borderColor = '#3d3020'} />
                  </div>
                </div>
              </div>

              {/* Summary & Submit */}
              <div style={{ background: '#0f0c09', border: '1px solid #2a1f10', borderRadius: '8px', padding: '20px', marginBottom: '16px' }}>
                <div style={{ color: '#fff', fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Summary</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#8a7a6a', fontSize: '12px' }}>Product Value</span>
                  <span style={{ color: '#fff', fontSize: '12px' }}>Rs. {totalProductValue.toLocaleString()}</span>
                </div>
                {(Number(deliveryCharges) > 0) && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#8a7a6a', fontSize: '12px' }}>Delivery Charges</span>
                    <span style={{ color: '#fff', fontSize: '12px' }}>Rs. {Number(deliveryCharges).toLocaleString()}</span>
                  </div>
                )}
                {(Number(packingCharges) > 0) && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#8a7a6a', fontSize: '12px' }}>Packing Charges</span>
                    <span style={{ color: '#fff', fontSize: '12px' }}>Rs. {Number(packingCharges).toLocaleString()}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #2a1f10', paddingTop: '10px', marginTop: '8px' }}>
                  <span style={{ color: '#fff', fontSize: '14px', fontWeight: 700 }}>Total Refund</span>
                  <span style={{ color: '#e74c3c', fontSize: '16px', fontWeight: 700 }}>Rs. {totalRefund.toLocaleString()}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => navigate('/admin-returns')}
                  style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid #3d3020', borderRadius: '4px', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={items.length === 0 || !reason.trim()}
                  style={{ flex: 2, padding: '12px', background: items.length > 0 && reason.trim() ? GOLD : '#3d3020', border: 'none', borderRadius: '4px', color: items.length > 0 && reason.trim() ? '#0a0a0a' : '#8a7a6a', fontSize: '13px', fontWeight: 700, cursor: items.length > 0 && reason.trim() ? 'pointer' : 'not-allowed' }}>
                  Create Return
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
