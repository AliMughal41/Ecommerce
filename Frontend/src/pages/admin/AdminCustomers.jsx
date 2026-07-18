import React, { useEffect, useState } from 'react';
import { Users, Mail, Phone, Trash2, Search, Loader2, X, ShieldCheck, UserX, Bell, Snowflake, ShieldOff, Menu } from 'lucide-react';
import axios from 'axios';
import AdminSidebar from '../../components/AdminSidebar';
import Pagination from '../../components/Pagination';
import API_URL from '../../config';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('customers');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [sendNotifModal, setSendNotifModal] = useState(null);
  const [notifForm, setNotifForm] = useState({ title: '', message: '' });
  const [sendingNotif, setSendingNotif] = useState(false);
  const [freezingId, setFreezingId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/customers`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
      });
      if (data.success) {
        setCustomers(data.customers || []);
        setSubscribers(data.subscribers || []);
      }
    } catch (error) {
      console.error('Error fetching customers', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await axios.delete(`${API_URL}/api/customers/${deleteConfirm.id}?type=${deleteConfirm.type}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
      });
      if (deleteConfirm.type === 'subscriber') {
        setSubscribers(prev => prev.filter(s => s._id !== deleteConfirm.id));
      } else {
        setCustomers(prev => prev.filter(c => c._id !== deleteConfirm.id));
      }
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleFreeze = async (customerId) => {
    setFreezingId(customerId);
    try {
      const { data } = await axios.put(`${API_URL}/api/customers/${customerId}/freeze`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
      });
      if (data.success) {
        setCustomers(prev => prev.map(c => c._id === customerId ? { ...c, frozen: data.frozen } : c));
      }
    } catch (error) {
      console.error('Error toggling freeze', error);
    } finally {
      setFreezingId(null);
    }
  };

  const filteredCustomers = customers.filter(c => {
    const term = searchTerm.toLowerCase();
    return (c.firstName?.toLowerCase().includes(term) ||
      c.lastName?.toLowerCase().includes(term) ||
      c.email?.toLowerCase().includes(term) ||
      c.phone?.includes(term));
  });

  const filteredSubscribers = subscribers.filter(s => {
    const term = searchTerm.toLowerCase();
    return s.email?.toLowerCase().includes(term);
  });

  const totalCustomerPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const totalSubscriberPages = Math.ceil(filteredSubscribers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const paginatedSubscribers = filteredSubscribers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const currentTotalPages = activeTab === 'customers' ? totalCustomerPages : totalSubscriberPages;

  const styles = {
    card: {
      background: 'rgba(15,15,15,0.95)',
      border: '1px solid #3d3020',
      borderRadius: '8px',
    },
    header: {
      background: '#1a1410',
      borderBottom: '1px solid #3d3020',
      padding: '14px',
    },
    th: {
      padding: '10px 14px',
      fontSize: '10px',
      fontWeight: 600,
      color: '#8a7a6a',
      letterSpacing: '1px',
      textTransform: 'uppercase',
      textAlign: 'left',
      borderBottom: '1px solid #3d3020',
    },
    td: {
      padding: '12px 14px',
      fontSize: '13px',
      borderBottom: '1px solid #1f1f1f',
    },
    tab: (active) => ({
      padding: '8px 18px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: 600,
      cursor: 'pointer',
      border: `1px solid ${active ? '#c9a84c' : '#3d3020'}`,
      background: active ? 'rgba(201,168,76,0.1)' : 'transparent',
      color: active ? '#c9a84c' : '#8a7a6a',
      transition: 'all 0.2s',
    }),
  };

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
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', border: '1.5px solid #c9a84c', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <img src="/images/logo.png" alt="VELNORA" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: '14px', letterSpacing: '2px', color: '#c9a84c' }}>VELNORA</span>
          </div>
          <div style={{ flex: 1 }} />
          <Bell size={18} style={{ color: '#8a7a6a', cursor: 'pointer' }} />
        </div>

        <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold text-uppercase mb-0" style={{ fontSize: 'clamp(20px, 3vw, 28px)', letterSpacing: '3px', fontFamily: "'Playfair Display','Times New Roman',serif" }}>
              Customers
            </h2>
            <p className="text-secondary mb-0" style={{ fontSize: '13px' }}>Dashboard &gt; Customers</p>
          </div>
          <div className="d-flex align-items-center gap-3">
            <span style={{ fontSize: '12px', color: '#8a7a6a' }}>
              {customers.length} Users | {subscribers.length} Subscribers
            </span>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-lg-2 col-md-3">
            <div style={{ ...styles.card, padding: '14px 0' }}>
              <div className="px-3 pb-3">
                <div className="d-flex align-items-center gap-2 text-secondary" style={{ fontSize: '12px' }}>
                  <Search size={14} />
                  <span>Search</span>
                </div>
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Name, email, phone..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: '6px 10px', background: '#1a1a1a', border: '1px solid #3d3020', borderRadius: '3px', color: '#fff', fontSize: '12px', outline: 'none' }}
                  />
                </div>
              </div>
              <div className="px-3 py-2" style={{ borderTop: '1px solid #3d3020' }}>
                <div className="d-flex justify-content-between align-items-center py-1">
                  <span style={{ fontSize: '12px', color: '#8a7a6a' }}>Registered Users</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#c9a84c' }}>{customers.length}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center py-1">
                  <span style={{ fontSize: '12px', color: '#8a7a6a' }}>Frozen</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#6495ed' }}>{customers.filter(c => c.frozen).length}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center py-1">
                  <span style={{ fontSize: '12px', color: '#8a7a6a' }}>Subscribers</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#c9a84c' }}>{subscribers.length}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center py-1">
                  <span style={{ fontSize: '12px', color: '#8a7a6a' }}>Total</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>{customers.length + subscribers.length}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-10 col-md-9">
            <div style={{ ...styles.card, overflow: 'hidden' }}>
              <div className="d-flex align-items-center gap-3 px-3 py-3" style={{ borderBottom: '1px solid #3d3020' }}>
                <button style={styles.tab(activeTab === 'customers')} onClick={() => { setActiveTab('customers'); setSearchTerm(''); setCurrentPage(1); }}>
                  <Users size={13} className="me-1" /> Registered Users ({customers.length})
                </button>
                <button style={styles.tab(activeTab === 'subscribers')} onClick={() => { setActiveTab('subscribers'); setSearchTerm(''); setCurrentPage(1); }}>
                  <Mail size={13} className="me-1" /> Subscribers ({subscribers.length})
                </button>
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <Loader2 size={32} color="#c9a84c" style={{ animation: 'spin 1s linear infinite' }} />
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              ) : activeTab === 'customers' ? (
                <>
                <div className="table-responsive">
                  <table className="table table-dark table-borderless" style={{ marginBottom: 0 }}>
                    <thead>
                      <tr>
                        <th style={styles.th}>#</th>
                        <th style={styles.th}>Name</th>
                        <th style={styles.th}>Email</th>
                        <th style={styles.th}>Phone</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Joined</th>
                        <th style={styles.th}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedCustomers.length > 0 ? paginatedCustomers.map((c, i) => (
                        <tr key={c._id} style={{ transition: 'background 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#1a1410'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <td style={styles.td}>{(currentPage - 1) * itemsPerPage + i + 1}</td>
                          <td style={styles.td}>
                            <div className="d-flex align-items-center gap-2">
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(201,168,76,0.12)', border: '1px solid #3d3020', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#c9a84c', fontWeight: 600, flexShrink: 0 }}>
                                {c.firstName?.[0]}{c.lastName?.[0]}
                              </div>
                              <span style={{ fontWeight: 500 }}>{c.firstName} {c.lastName}</span>
                            </div>
                          </td>
                          <td style={styles.td}>{c.email || '—'}</td>
                          <td style={styles.td}>{c.phone || '—'}</td>
                          <td style={styles.td}>
                            {c.frozen ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(100,149,237,0.1)', border: '1px solid rgba(100,149,237,0.3)', borderRadius: '4px', padding: '3px 8px', fontSize: '10px', color: '#6495ed', fontWeight: 600, letterSpacing: '0.5px' }}>
                                <Snowflake size={10} /> Frozen
                              </span>
                            ) : (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(46,204,113,0.1)', border: '1px solid rgba(46,204,113,0.3)', borderRadius: '4px', padding: '3px 8px', fontSize: '10px', color: '#2ecc71', fontWeight: 600, letterSpacing: '0.5px' }}>
                                <ShieldCheck size={10} /> Active
                              </span>
                            )}
                          </td>
                          <td style={{ ...styles.td, color: '#8a7a6a', fontSize: '12px' }}>
                            {new Date(c.createdAt).toLocaleDateString()}
                          </td>
                          <td style={styles.td}>
                            <div className="d-flex gap-2">
                              <button
                                style={{
                                  background: c.frozen ? 'rgba(46,204,113,0.1)' : 'rgba(100,149,237,0.1)',
                                  border: `1px solid ${c.frozen ? 'rgba(46,204,113,0.3)' : 'rgba(100,149,237,0.3)'}`,
                                  color: c.frozen ? '#2ecc71' : '#6495ed',
                                  borderRadius: '4px', padding: '4px 8px', fontSize: '11px',
                                  cursor: freezingId === c._id ? 'not-allowed' : 'pointer',
                                  display: 'flex', alignItems: 'center', gap: '4px',
                                  opacity: freezingId === c._id ? 0.6 : 1, transition: 'all 0.2s'
                                }}
                                onClick={() => handleFreeze(c._id)}
                              >
                                {freezingId === c._id ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : c.frozen ? <ShieldOff size={12} /> : <Snowflake size={12} />}
                                {freezingId === c._id ? '...' : c.frozen ? 'Unfreeze' : 'Freeze'}
                              </button>
                              <button style={{ background: 'transparent', border: '1px solid rgba(244,67,54,0.3)', color: '#f44336', borderRadius: '4px', padding: '4px 8px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                onClick={() => setDeleteConfirm({ id: c._id, name: `${c.firstName} ${c.lastName}`, type: 'customer' })}>
                                <Trash2 size={12} /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan="7" className="text-center py-4" style={{ color: '#8a7a6a', fontSize: '13px' }}>No users found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div style={{ padding: '0 14px' }}>
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalCustomerPages}
                      onPageChange={setCurrentPage}
                      itemsPerPage={itemsPerPage}
                      onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
                    />
                  </div>
                </>
              ) : (
                <>
                <div className="table-responsive">
                  <table className="table table-dark table-borderless" style={{ marginBottom: 0 }}>
                    <thead>
                      <tr>
                        <th style={styles.th}>#</th>
                        <th style={styles.th}>Email</th>
                        <th style={styles.th}>Subscribed</th>
                        <th style={styles.th}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedSubscribers.length > 0 ? paginatedSubscribers.map((s, i) => (
                        <tr key={s._id} style={{ transition: 'background 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#1a1410'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <td style={styles.td}>{(currentPage - 1) * itemsPerPage + i + 1}</td>
                          <td style={styles.td}>{s.email}</td>
                          <td style={{ ...styles.td, color: '#8a7a6a', fontSize: '12px' }}>
                            {new Date(s.subscribedAt || s.createdAt).toLocaleDateString()}
                          </td>
                          <td style={styles.td}>
                            <button style={{ background: 'transparent', border: '1px solid rgba(244,67,54,0.3)', color: '#f44336', borderRadius: '4px', padding: '4px 8px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                              onClick={() => setDeleteConfirm({ id: s._id, name: s.email, type: 'subscriber' })}>
                              <Trash2 size={12} /> Delete
                            </button>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan="4" className="text-center py-4" style={{ color: '#8a7a6a', fontSize: '13px' }}>No subscribers found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div style={{ padding: '0 14px' }}>
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalSubscriberPages}
                      onPageChange={setCurrentPage}
                      itemsPerPage={itemsPerPage}
                      onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        </div>

      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}
          onClick={() => setDeleteConfirm(null)}>
          <div style={{ background: '#1a1a1a', border: '1px solid #3d3020', borderRadius: '12px', padding: '32px', maxWidth: '420px', width: '100%' }}
            onClick={e => e.stopPropagation()}>
            <div className="d-flex align-items-center gap-3 mb-3">
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(244,67,54,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserX size={20} color="#f44336" />
              </div>
              <h3 style={{ fontSize: '18px', color: '#fff', margin: 0 }}>Delete {deleteConfirm.type === 'subscriber' ? 'Subscriber' : 'User'}</h3>
            </div>
            <p style={{ fontSize: '14px', color: '#999', marginBottom: '24px', lineHeight: 1.6 }}>
              Are you sure you want to permanently delete <strong style={{ color: '#fff' }}>{deleteConfirm.name}</strong>? They will no longer receive notifications and will need to create a new account.
            </p>
            <div className="d-flex gap-3" style={{ justifyContent: 'flex-end' }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ background: 'transparent', border: '1px solid #444', color: '#999', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
              <button onClick={handleDelete} disabled={deleting} style={{ background: '#f44336', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '8px', cursor: deleting ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: 600, opacity: deleting ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                {deleting ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Deleting...</> : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}
