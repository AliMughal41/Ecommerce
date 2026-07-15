import React, { useEffect, useState } from 'react';
import { Star, Plus, Pencil, Trash2, X, Loader2, GripVertical, ToggleLeft, ToggleRight, Menu, Bell } from 'lucide-react';
import axios from 'axios';
import AdminSidebar from '../../components/AdminSidebar';
import Pagination from '../../components/Pagination';
import API_URL from '../../config';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editReview, setEditReview] = useState(null);
  const [form, setForm] = useState({ author: '', text: '', rating: 5, location: '', sortOrder: 0 });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  const token = localStorage.getItem('adminToken');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/reviews/all`, { headers });
      if (data.success) setReviews(data.reviews);
    } catch (error) {
      console.error('Error fetching reviews', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const openAdd = () => {
    setEditReview(null);
    setForm({ author: '', text: '', rating: 5, location: '', sortOrder: reviews.length });
    setShowForm(true);
  };

  const openEdit = (r) => {
    setEditReview(r);
    setForm({ author: r.author, text: r.text, rating: r.rating || 5, location: r.location || '', sortOrder: r.sortOrder || 0 });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.author.trim() || !form.text.trim()) return;
    if (form.author.length > 100 || form.text.length > 1000 || form.location.length > 100) return;
    setSaving(true);
    try {
      if (editReview) {
        const { data } = await axios.put(`${API_URL}/api/reviews/${editReview._id}`, form, { headers });
        setReviews(prev => prev.map(r => r._id === editReview._id ? data.review : r));
      } else {
        const { data } = await axios.post(`${API_URL}/api/reviews`, form, { headers });
        setReviews(prev => [...prev, data.review]);
      }
      setShowForm(false);
      setEditReview(null);
    } catch (error) {
      console.error('Error saving review', error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    setTogglingId(id);
    try {
      const { data } = await axios.put(`${API_URL}/api/reviews/${id}/toggle`, {}, { headers });
      setReviews(prev => prev.map(r => r._id === id ? data.review : r));
    } catch (error) {
      console.error('Error toggling review', error);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await axios.delete(`${API_URL}/api/reviews/${deleteConfirm._id}`, { headers });
      setReviews(prev => prev.filter(r => r._id !== deleteConfirm._id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting review', error);
    } finally {
      setDeleting(false);
    }
  };

  const totalReviewPages = Math.ceil(reviews.length / itemsPerPage);
  const paginatedReviews = reviews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const styles = {
    card: { background: 'rgba(15,15,15,0.95)', border: '1px solid #3d3020', borderRadius: '8px' },
    input: { width: '100%', padding: '8px 12px', background: '#1a1a1a', border: '1px solid #3d3020', borderRadius: '4px', color: '#fff', fontSize: '13px', outline: 'none' },
    btn: { padding: '8px 16px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' },
  };

  const activeCount = reviews.filter(r => r.isActive).length;

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
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
            <div>
              <h2 className="fw-bold text-uppercase mb-0" style={{ fontSize: 'clamp(20px, 3vw, 28px)', letterSpacing: '3px', fontFamily: "'Playfair Display','Times New Roman',serif" }}>
                Reviews
              </h2>
              <p className="text-secondary mb-0" style={{ fontSize: '13px' }}>Dashboard &gt; Reviews</p>
            </div>
            <div className="d-flex align-items-center gap-3">
              <span style={{ fontSize: '12px', color: '#8a7a6a' }}>{reviews.length} Total | {activeCount} Active</span>
              <button onClick={openAdd} style={{ ...styles.btn, background: '#c9a84c', color: '#0a0a0a' }}>
                <Plus size={14} /> Add Review
              </button>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-lg-2 col-md-3">
              <div style={{ ...styles.card, padding: '14px 0' }}>
                <div className="px-3 pb-3">
                  <div className="d-flex align-items-center gap-2 text-secondary" style={{ fontSize: '12px' }}>
                    <Star size={14} />
                    <span>Reviews Info</span>
                  </div>
                </div>
                <div className="px-3 py-2" style={{ borderTop: '1px solid #3d3020' }}>
                  <div className="d-flex justify-content-between align-items-center py-1">
                    <span style={{ fontSize: '12px', color: '#8a7a6a' }}>Total</span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#c9a84c' }}>{reviews.length}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center py-1">
                    <span style={{ fontSize: '12px', color: '#8a7a6a' }}>Active</span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#4caf50' }}>{activeCount}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center py-1">
                    <span style={{ fontSize: '12px', color: '#8a7a6a' }}>Hidden</span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#f44336' }}>{reviews.length - activeCount}</span>
                  </div>
                </div>
                <div className="px-3 py-2 mt-2" style={{ borderTop: '1px solid #3d3020' }}>
                  <div style={{ fontSize: '11px', color: '#666', lineHeight: 1.5 }}>
                    Home page pe sirf 3 reviews dikhenge. Sort order se control karein kaun dikhega.
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-10 col-md-9">
              <div style={{ ...styles.card, overflow: 'hidden' }}>
                {loading ? (
                  <div className="text-center py-5">
                    <Loader2 size={32} color="#c9a84c" style={{ animation: 'spin 1s linear infinite' }} />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-5">
                    <Star size={48} style={{ color: '#3d3020' }} />
                    <p className="mt-3" style={{ color: '#8a7a6a', fontSize: '14px' }}>No reviews yet. Click "Add Review" to create one.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-dark table-borderless" style={{ marginBottom: 0 }}>
                      <thead>
                        <tr>
                          <th style={{ padding: '10px 14px', fontSize: '10px', fontWeight: 600, color: '#8a7a6a', letterSpacing: '1px', textTransform: 'uppercase', textAlign: 'left', borderBottom: '1px solid #3d3020' }}>#</th>
                          <th style={{ padding: '10px 14px', fontSize: '10px', fontWeight: 600, color: '#8a7a6a', letterSpacing: '1px', textTransform: 'uppercase', textAlign: 'left', borderBottom: '1px solid #3d3020' }}>Author</th>
                          <th style={{ padding: '10px 14px', fontSize: '10px', fontWeight: 600, color: '#8a7a6a', letterSpacing: '1px', textTransform: 'uppercase', textAlign: 'left', borderBottom: '1px solid #3d3020' }}>Review</th>
                          <th style={{ padding: '10px 14px', fontSize: '10px', fontWeight: 600, color: '#8a7a6a', letterSpacing: '1px', textTransform: 'uppercase', textAlign: 'left', borderBottom: '1px solid #3d3020' }}>Rating</th>
                          <th style={{ padding: '10px 14px', fontSize: '10px', fontWeight: 600, color: '#8a7a6a', letterSpacing: '1px', textTransform: 'uppercase', textAlign: 'left', borderBottom: '1px solid #3d3020' }}>Order</th>
                          <th style={{ padding: '10px 14px', fontSize: '10px', fontWeight: 600, color: '#8a7a6a', letterSpacing: '1px', textTransform: 'uppercase', textAlign: 'left', borderBottom: '1px solid #3d3020' }}>Status</th>
                          <th style={{ padding: '10px 14px', fontSize: '10px', fontWeight: 600, color: '#8a7a6a', letterSpacing: '1px', textTransform: 'uppercase', textAlign: 'left', borderBottom: '1px solid #3d3020' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedReviews.map((r, i) => (
                          <tr key={r._id} style={{ transition: 'background 0.2s', opacity: r.isActive ? 1 : 0.5 }}
                            onMouseEnter={e => e.currentTarget.style.background = '#1a1410'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <td style={{ padding: '12px 14px', fontSize: '13px', borderBottom: '1px solid #1f1f1f' }}>{(currentPage - 1) * itemsPerPage + i + 1}</td>
                            <td style={{ padding: '12px 14px', fontSize: '13px', borderBottom: '1px solid #1f1f1f', fontWeight: 500 }}>{r.author}</td>
                            <td style={{ padding: '12px 14px', fontSize: '13px', borderBottom: '1px solid #1f1f1f', maxWidth: '300px' }}>
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                {r.text}
                              </span>
                            </td>
                            <td style={{ padding: '12px 14px', borderBottom: '1px solid #1f1f1f' }}>
                              <div className="d-flex gap-1">
                                {[1,2,3,4,5].map(s => <Star key={s} size={12} fill={s <= r.rating ? '#d4af37' : '#333'} color="#d4af37" />)}
                              </div>
                            </td>
                            <td style={{ padding: '12px 14px', fontSize: '13px', borderBottom: '1px solid #1f1f1f', color: '#8a7a6a' }}>{r.sortOrder || 0}</td>
                            <td style={{ padding: '12px 14px', borderBottom: '1px solid #1f1f1f' }}>
                              <button onClick={() => handleToggle(r._id)} disabled={togglingId === r._id} style={{ background: 'transparent', border: 'none', cursor: togglingId === r._id ? 'not-allowed' : 'pointer', color: r.isActive ? '#4caf50' : '#666' }}>
                                {togglingId === r._id ? <Loader2 size={22} style={{ animation: 'spin 1s linear infinite' }} /> : r.isActive ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                              </button>
                            </td>
                            <td style={{ padding: '12px 14px', borderBottom: '1px solid #1f1f1f' }}>
                              <div className="d-flex gap-2">
                                <button onClick={() => openEdit(r)} style={{ background: 'transparent', border: '1px solid #c9a84c', color: '#c9a84c', borderRadius: '4px', padding: '4px 8px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Pencil size={11} /> Edit
                                </button>
                                <button onClick={() => setDeleteConfirm(r)} style={{ background: 'transparent', border: '1px solid rgba(244,67,54,0.3)', color: '#f44336', borderRadius: '4px', padding: '4px 8px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Trash2 size={11} /> Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <div style={{ padding: '0 14px' }}>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalReviewPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}
          onClick={() => { setShowForm(false); setEditReview(null); }}>
          <div style={{ background: '#1a1a1a', border: '1px solid #3d3020', borderRadius: '12px', padding: '28px', maxWidth: '520px', width: '100%' }}
            onClick={e => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 style={{ fontSize: '18px', color: '#fff', margin: 0 }}>{editReview ? 'Edit Review' : 'Add Review'}</h3>
              <button onClick={() => { setShowForm(false); setEditReview(null); }} style={{ background: 'transparent', border: 'none', color: '#8a7a6a', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div className="d-flex flex-column gap-3">
              <div>
                <label style={{ fontSize: '12px', color: '#8a7a6a', marginBottom: '4px', display: 'block' }}>Author Name *</label>
                <input style={styles.input} placeholder="e.g. Aisha Khan" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#8a7a6a', marginBottom: '4px', display: 'block' }}>Review Text *</label>
                <textarea style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }} placeholder="Customer review text..." value={form.text} onChange={e => setForm({ ...form, text: e.target.value })} />
              </div>
              <div className="row g-3">
                <div className="col-6">
                  <label style={{ fontSize: '12px', color: '#8a7a6a', marginBottom: '4px', display: 'block' }}>Rating</label>
                  <div className="d-flex gap-2 align-items-center">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={20} style={{ cursor: 'pointer' }}
                        fill={s <= form.rating ? '#d4af37' : '#333'} color="#d4af37"
                        onClick={() => setForm({ ...form, rating: s })} />
                    ))}
                    <span style={{ fontSize: '12px', color: '#8a7a6a', marginLeft: '4px' }}>{form.rating}/5</span>
                  </div>
                </div>
                <div className="col-6">
                  <label style={{ fontSize: '12px', color: '#8a7a6a', marginBottom: '4px', display: 'block' }}>Sort Order</label>
                  <input type="number" style={styles.input} value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#8a7a6a', marginBottom: '4px', display: 'block' }}>Location / Badge</label>
                <input style={styles.input} placeholder="e.g. Karachi (optional)" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
              </div>
            </div>
            <div className="d-flex gap-3 mt-4" style={{ justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowForm(false); setEditReview(null); }} style={{ ...styles.btn, background: 'transparent', border: '1px solid #444', color: '#999' }}>Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.author.trim() || !form.text.trim()} style={{ ...styles.btn, background: '#c9a84c', color: '#0a0a0a', opacity: saving ? 0.7 : 1 }}>
                {saving ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : editReview ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}
          onClick={() => setDeleteConfirm(null)}>
          <div style={{ background: '#1a1a1a', border: '1px solid #3d3020', borderRadius: '12px', padding: '28px', maxWidth: '420px', width: '100%' }}
            onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', color: '#fff', margin: '0 0 12px' }}>Delete Review</h3>
            <p style={{ fontSize: '14px', color: '#999', marginBottom: '20px' }}>
              Are you sure you want to delete <strong style={{ color: '#fff' }}>{deleteConfirm.author}</strong>'s review?
            </p>
            <div className="d-flex gap-3" style={{ justifyContent: 'flex-end' }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ ...styles.btn, background: 'transparent', border: '1px solid #444', color: '#999' }}>Cancel</button>
              <button onClick={handleDelete} disabled={deleting} style={{ ...styles.btn, background: '#f44336', color: '#fff', opacity: deleting ? 0.7 : 1 }}>
                {deleting ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Deleting...</> : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
