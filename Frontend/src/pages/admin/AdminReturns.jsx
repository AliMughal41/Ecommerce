import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2, Plus, Eye, Trash2, X, Clock, CheckCircle, XCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import API_URL from '../../config';

const GOLD = '#c9a84c';

export default function AdminReturns() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [returns, setReturns] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(null);

  const token = localStorage.getItem('adminToken');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      const [returnsRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/api/returns?${params.toString()}`, config),
        axios.get(`${API_URL}/api/returns/stats`, config),
      ]);
      if (returnsRes.data.success) setReturns(returnsRes.data.returns);
      if (statsRes.data.success) setStats(statsRes.data.stats);
    } catch (error) {
      console.error('Error fetching returns:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleStatusUpdate = async (id, status) => {
    setUpdateLoading(id);
    try {
      await axios.put(`${API_URL}/api/returns/${id}/status`, { status, note: `Status changed to ${status}` }, config);
      fetchData();
      setSelectedReturn(null);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdateLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this return?')) return;
    try {
      await axios.delete(`${API_URL}/api/returns/${id}`, config);
      fetchData();
    } catch (error) {
      console.error('Error deleting return:', error);
    }
  };

  const statusColor = (s) => {
    const map = { Pending: '#f39c12', Approved: '#27ae60', Rejected: '#e74c3c', Refunded: '#3498db', Completed: '#1abc9c' };
    return map[s] || '#8a7a6a';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a' }}>
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="admin-main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header */}
        <div style={{ height: '60px', background: '#0d0a06', borderBottom: '1px solid #2a1f10', display: 'flex', alignItems: 'center', padding: '0 24px', gap: '16px', flexShrink: 0 }}>
          <button onClick={() => setSidebarOpen(s => !s)} className="admin-hamburger" style={{ background: 'transparent', border: 'none', color: '#8a7a6a', cursor: 'pointer', padding: '4px' }}>
            <RefreshCw size={20} />
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 700, margin: 0 }}>Returns Management</h1>
              <p style={{ color: '#8a7a6a', fontSize: '13px', margin: '4px 0 0' }}>Manage product returns and refunds</p>
            </div>
            <button onClick={() => navigate('/admin-create-return')}
              style={{ background: GOLD, color: '#0a0a0a', border: 'none', borderRadius: '6px', padding: '10px 20px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={16} /> Create Return
            </button>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px', marginBottom: '24px' }}>
              {[
                { label: 'Total Returns', value: stats.total, color: GOLD },
                { label: 'Pending', value: stats.pending, color: '#f39c12' },
                { label: 'Approved', value: stats.approved, color: '#27ae60' },
                { label: 'Rejected', value: stats.rejected, color: '#e74c3c' },
                { label: 'Refunded', value: stats.refunded, color: '#3498db' },
                { label: 'Total Refund', value: `Rs. ${stats.totalRefundAmount.toLocaleString()}`, color: '#e74c3c' },
              ].map((s, i) => (
                <div key={i} style={{ background: '#0f0c09', border: '1px solid #2a1f10', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ color: '#8a7a6a', fontSize: '11px', letterSpacing: '1px', marginBottom: '6px' }}>{s.label}</div>
                  <div style={{ color: s.color, fontSize: '20px', fontWeight: 700 }}>{s.value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Filters */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {['', 'Pending', 'Approved', 'Rejected', 'Refunded', 'Completed'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                style={{ padding: '6px 16px', fontSize: '12px', fontWeight: 600, borderRadius: '4px', border: `1px solid ${statusFilter === s ? GOLD : '#3d3020'}`, background: statusFilter === s ? GOLD : 'transparent', color: statusFilter === s ? '#0a0a0a' : '#8a7a6a', cursor: 'pointer' }}>
                {s || 'All'}
              </button>
            ))}
          </div>

          {/* Returns Table */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px' }}><Loader2 size={24} style={{ color: GOLD, animation: 'spin 1s linear infinite' }} /></div>
          ) : returns.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#8a7a6a', fontSize: '14px' }}>No returns found.</div>
          ) : (
            <div style={{ background: '#0f0c09', border: '1px solid #2a1f10', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Return #', 'Order #', 'Customer', 'Items', 'Refund', 'Status', 'Date', 'Actions'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '12px 14px', color: '#8a7a6a', fontSize: '11px', letterSpacing: '1px', borderBottom: '1px solid #2a1f10', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {returns.map(r => (
                      <tr key={r._id}>
                        <td style={{ padding: '10px 14px', color: GOLD, fontSize: '12px', fontWeight: 600, borderBottom: '1px solid #1a1410', whiteSpace: 'nowrap' }}>{r.returnNumber}</td>
                        <td style={{ padding: '10px 14px', color: '#fff', fontSize: '12px', borderBottom: '1px solid #1a1410' }}>{r.orderNumber}</td>
                        <td style={{ padding: '10px 14px', color: '#ccc', fontSize: '12px', borderBottom: '1px solid #1a1410' }}>{r.customerName}</td>
                        <td style={{ padding: '10px 14px', color: '#ccc', fontSize: '12px', borderBottom: '1px solid #1a1410' }}>{r.items?.length} item(s)</td>
                        <td style={{ padding: '10px 14px', color: '#e74c3c', fontSize: '12px', fontWeight: 600, borderBottom: '1px solid #1a1410' }}>Rs. {r.totalRefund?.toLocaleString()}</td>
                        <td style={{ padding: '10px 14px', borderBottom: '1px solid #1a1410' }}>
                          <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, background: `${statusColor(r.status)}20`, color: statusColor(r.status) }}>{r.status}</span>
                        </td>
                        <td style={{ padding: '10px 14px', color: '#8a7a6a', fontSize: '11px', borderBottom: '1px solid #1a1410', whiteSpace: 'nowrap' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: '10px 14px', borderBottom: '1px solid #1a1410' }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={() => setSelectedReturn(r)} style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid #3d3020', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}>
                              <Eye size={13} style={{ color: GOLD }} />
                            </button>
                            <button onClick={() => handleDelete(r._id)} style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid #3d3020', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}>
                              <Trash2 size={13} style={{ color: '#e74c3c' }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Return Detail Modal */}
          {selectedReturn && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => setSelectedReturn(null)}>
              <div style={{ background: '#0f0c09', border: '1px solid #3d3020', borderRadius: '8px', width: '90%', maxWidth: '550px', maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid #2a1f10' }}>
                  <div>
                    <div style={{ color: GOLD, fontSize: '11px', letterSpacing: '2px', marginBottom: '4px' }}>RETURN DETAIL</div>
                    <div style={{ color: '#fff', fontSize: '16px', fontWeight: 700 }}>{selectedReturn.returnNumber}</div>
                  </div>
                  <button onClick={() => setSelectedReturn(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={18} style={{ color: '#8a7a6a' }} /></button>
                </div>
                <div style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ padding: '10px', background: '#141010', borderRadius: '6px' }}>
                      <div style={{ color: '#8a7a6a', fontSize: '10px', letterSpacing: '1px', marginBottom: '4px' }}>ORDER</div>
                      <div style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>{selectedReturn.orderNumber}</div>
                    </div>
                    <div style={{ padding: '10px', background: '#141010', borderRadius: '6px' }}>
                      <div style={{ color: '#8a7a6a', fontSize: '10px', letterSpacing: '1px', marginBottom: '4px' }}>STATUS</div>
                      <div style={{ color: statusColor(selectedReturn.status), fontSize: '13px', fontWeight: 700 }}>{selectedReturn.status}</div>
                    </div>
                    <div style={{ padding: '10px', background: '#141010', borderRadius: '6px' }}>
                      <div style={{ color: '#8a7a6a', fontSize: '10px', letterSpacing: '1px', marginBottom: '4px' }}>CUSTOMER</div>
                      <div style={{ color: '#fff', fontSize: '13px' }}>{selectedReturn.customerName}</div>
                    </div>
                    <div style={{ padding: '10px', background: '#141010', borderRadius: '6px' }}>
                      <div style={{ color: '#8a7a6a', fontSize: '10px', letterSpacing: '1px', marginBottom: '4px' }}>PHONE</div>
                      <div style={{ color: '#fff', fontSize: '13px' }}>{selectedReturn.customerPhone || 'N/A'}</div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ color: '#8a7a6a', fontSize: '10px', letterSpacing: '1px', marginBottom: '8px' }}>RETURN ITEMS</div>
                    {selectedReturn.items?.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', background: '#141010', borderRadius: '4px', marginBottom: '6px' }}>
                        {item.image && <img src={item.image} alt="" style={{ width: '36px', height: '36px', borderRadius: '4px', objectFit: 'cover' }} />}
                        <div style={{ flex: 1 }}>
                          <div style={{ color: '#fff', fontSize: '12px', fontWeight: 600 }}>{item.productName}</div>
                          <div style={{ color: '#8a7a6a', fontSize: '11px' }}>Qty: {item.quantity} × Rs. {item.productPrice.toLocaleString()}</div>
                        </div>
                        <div style={{ color: GOLD, fontSize: '12px', fontWeight: 700 }}>Rs. {(item.productPrice * item.quantity).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ background: '#141010', borderRadius: '6px', padding: '12px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#8a7a6a', fontSize: '12px' }}>Product Value</span>
                      <span style={{ color: '#fff', fontSize: '12px' }}>Rs. {selectedReturn.totalProductValue?.toLocaleString()}</span>
                    </div>
                    {selectedReturn.deliveryCharges > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ color: '#8a7a6a', fontSize: '12px' }}>Delivery Charges</span>
                        <span style={{ color: '#fff', fontSize: '12px' }}>Rs. {selectedReturn.deliveryCharges?.toLocaleString()}</span>
                      </div>
                    )}
                    {selectedReturn.packingCharges > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ color: '#8a7a6a', fontSize: '12px' }}>Packing Charges</span>
                        <span style={{ color: '#fff', fontSize: '12px' }}>Rs. {selectedReturn.packingCharges?.toLocaleString()}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #2a1f10', paddingTop: '8px', marginTop: '4px' }}>
                      <span style={{ color: '#fff', fontSize: '13px', fontWeight: 700 }}>Total Refund</span>
                      <span style={{ color: '#e74c3c', fontSize: '14px', fontWeight: 700 }}>Rs. {selectedReturn.totalRefund?.toLocaleString()}</span>
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ color: '#8a7a6a', fontSize: '10px', letterSpacing: '1px', marginBottom: '6px' }}>REASON</div>
                    <div style={{ color: '#fff', fontSize: '13px', background: '#141010', padding: '10px', borderRadius: '6px' }}>{selectedReturn.reason}</div>
                  </div>

                  {selectedReturn.status === 'Pending' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleStatusUpdate(selectedReturn._id, 'Approved')} disabled={updateLoading === selectedReturn._id}
                        style={{ flex: 1, padding: '10px', background: '#27ae60', border: 'none', borderRadius: '4px', color: '#fff', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        {updateLoading === selectedReturn._id ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle size={14} />} Approve
                      </button>
                      <button onClick={() => handleStatusUpdate(selectedReturn._id, 'Rejected')} disabled={updateLoading === selectedReturn._id}
                        style={{ flex: 1, padding: '10px', background: '#e74c3c', border: 'none', borderRadius: '4px', color: '#fff', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        {updateLoading === selectedReturn._id ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <XCircle size={14} />} Reject
                      </button>
                    </div>
                  )}

                  {selectedReturn.status === 'Approved' && (
                    <button onClick={() => handleStatusUpdate(selectedReturn._id, 'Refunded')} disabled={updateLoading === selectedReturn._id}
                      style={{ width: '100%', padding: '10px', background: '#3498db', border: 'none', borderRadius: '4px', color: '#fff', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      {updateLoading === selectedReturn._id ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={14} />} Mark as Refunded
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
