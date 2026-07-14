import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, Plus, Edit2, Trash2, Star, Home, Building, Loader2, X } from 'lucide-react';
import { useAlert } from '../../context/AlertContext';
import API_URL from '../../config';

const API_BASE = `${API_URL}/api/addresses`;

const getHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('customerToken')}` },
});

const emptyForm = {
  label: 'Home',
  fullName: '',
  phone: '',
  email: '',
  address1: '',
  address2: '',
  city: '',
  province: '',
  postal: '',
  country: '',
};

const labelConfig = {
  Home: { color: '#4caf50', bg: 'rgba(76,175,80,0.1)', border: 'rgba(76,175,80,0.3)' },
  Office: { color: '#42a5f5', bg: 'rgba(66,165,245,0.1)', border: 'rgba(66,165,245,0.3)' },
  Other: { color: '#999', bg: 'rgba(153,153,153,0.1)', border: 'rgba(153,153,153,0.3)' },
};

export default function Addresses() {
  const { showAlert } = useAlert();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(API_BASE, getHeaders());
      setAddresses(data.addresses || data || []);
    } catch (err) {
      showAlert({ type: 'error', message: err.response?.data?.message || 'Failed to load addresses.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const openAddForm = () => {
    setFormData({ ...emptyForm });
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (addr) => {
    setFormData({
      label: addr.label || 'Home',
      fullName: addr.fullName || '',
      phone: addr.phone || '',
      email: addr.email || '',
      address1: addr.address1 || '',
      address2: addr.address2 || '',
      city: addr.city || '',
      province: addr.province || '',
      postal: addr.postal || '',
      country: addr.country || '',
    });
    setEditingId(addr._id);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ ...emptyForm });
  };

  const handleSubmit = async () => {
    setActionLoading(true);
    try {
      if (editingId) {
        await axios.put(`${API_BASE}/${editingId}`, formData, getHeaders());
        showAlert({ type: 'success', message: 'Address updated successfully.' });
      } else {
        await axios.post(API_BASE, formData, getHeaders());
        showAlert({ type: 'success', message: 'Address added successfully.' });
      }
      closeForm();
      fetchAddresses();
    } catch (err) {
      showAlert({ type: 'error', message: err.response?.data?.message || 'Failed to save address.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setActionLoading(true);
    try {
      await axios.delete(`${API_BASE}/${id}`, getHeaders());
      showAlert({ type: 'success', message: 'Address deleted.' });
      setDeleteConfirm(null);
      fetchAddresses();
    } catch (err) {
      showAlert({ type: 'error', message: err.response?.data?.message || 'Failed to delete address.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetDefault = async (id) => {
    setActionLoading(true);
    try {
      await axios.put(`${API_BASE}/${id}/set-default`, {}, getHeaders());
      showAlert({ type: 'success', message: 'Default address updated.' });
      fetchAddresses();
    } catch (err) {
      showAlert({ type: 'error', message: err.response?.data?.message || 'Failed to set default.' });
    } finally {
      setActionLoading(false);
    }
  };

  const styles = {
    card: {
      background: 'rgba(15,15,15,0.95)',
      border: '1px solid #3d3020',
      borderRadius: '12px',
      padding: '30px',
      color: '#e0e0e0',
      fontFamily: "'Inter', sans-serif",
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '8px',
    },
    heading: {
      fontSize: '22px',
      fontWeight: 600,
      color: '#ffffff',
      margin: 0,
    },
    subtitle: {
      fontSize: '14px',
      color: '#888',
      marginBottom: '28px',
    },
    addBtn: {
      background: '#c9a84c',
      border: 'none',
      color: '#0a0a0a',
      borderRadius: '8px',
      padding: '10px 20px',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      transition: 'opacity 0.2s',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '20px',
    },
    addressCard: {
      background: 'rgba(15,15,15,0.95)',
      border: '1px solid #3d3020',
      borderRadius: '12px',
      padding: '24px',
      color: '#e0e0e0',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      position: 'relative',
    },
    addressCardDefault: {
      border: '1px solid rgba(201,168,76,0.5)',
      background: 'rgba(15,15,15,0.98)',
    },
    cardTop: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    badges: {
      display: 'flex',
      gap: '8px',
      alignItems: 'center',
    },
    badge: {
      padding: '3px 10px',
      borderRadius: '6px',
      fontSize: '11px',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    defaultBadge: {
      background: 'rgba(201,168,76,0.15)',
      border: '1px solid rgba(201,168,76,0.3)',
      color: '#c9a84c',
      padding: '3px 10px',
      borderRadius: '6px',
      fontSize: '11px',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
    cardName: {
      fontSize: '16px',
      fontWeight: 600,
      color: '#fff',
    },
    cardPhone: {
      fontSize: '14px',
      color: '#aaa',
    },
    cardAddress: {
      fontSize: '14px',
      color: '#ccc',
      lineHeight: 1.5,
    },
    cardEmail: {
      fontSize: '13px',
      color: '#888',
    },
    cardActions: {
      display: 'flex',
      gap: '8px',
      marginTop: 'auto',
      paddingTop: '12px',
      borderTop: '1px solid #2a2010',
    },
    iconBtn: {
      background: 'transparent',
      border: '1px solid #3d3020',
      color: '#aaa',
      borderRadius: '6px',
      padding: '6px 10px',
      fontSize: '12px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      transition: 'all 0.2s',
    },
    defaultBtn: {
      background: 'transparent',
      border: '1px solid #3d3020',
      color: '#c9a84c',
      borderRadius: '6px',
      padding: '6px 10px',
      fontSize: '12px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      transition: 'all 0.2s',
    },
    overlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px',
    },
    modal: {
      background: 'rgba(15,15,15,0.98)',
      border: '1px solid #3d3020',
      borderRadius: '12px',
      padding: '30px',
      width: '100%',
      maxWidth: '600px',
      maxHeight: '90vh',
      overflowY: 'auto',
      color: '#e0e0e0',
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
    },
    modalTitle: {
      fontSize: '18px',
      fontWeight: 600,
      color: '#fff',
    },
    closeBtn: {
      background: 'transparent',
      border: 'none',
      color: '#888',
      cursor: 'pointer',
      padding: '4px',
      display: 'flex',
      transition: 'color 0.2s',
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '16px',
    },
    field: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    },
    fieldFull: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      gridColumn: '1 / -1',
    },
    label: {
      fontSize: '13px',
      fontWeight: 500,
      color: '#c9a84c',
    },
    input: {
      background: '#141414',
      border: '1px solid #3d3020',
      borderRadius: '8px',
      padding: '10px 12px',
      fontSize: '16px',
      color: '#e0e0e0',
      outline: 'none',
      transition: 'border-color 0.2s',
      width: '100%',
      boxSizing: 'border-box',
    },
    select: {
      background: '#141414',
      border: '1px solid #3d3020',
      borderRadius: '8px',
      padding: '10px 12px',
      fontSize: '16px',
      color: '#e0e0e0',
      outline: 'none',
      transition: 'border-color 0.2s',
      width: '100%',
      boxSizing: 'border-box',
      cursor: 'pointer',
    },
    btnRow: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px',
      marginTop: '24px',
    },
    saveBtn: {
      background: '#c9a84c',
      border: 'none',
      color: '#0a0a0a',
      borderRadius: '8px',
      padding: '10px 24px',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      transition: 'opacity 0.2s',
    },
    cancelBtn: {
      background: 'transparent',
      border: '1px solid #555',
      color: '#aaa',
      borderRadius: '8px',
      padding: '10px 20px',
      fontSize: '14px',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'background 0.2s',
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      color: '#666',
    },
    emptyIcon: {
      marginBottom: '16px',
      color: '#3d3020',
    },
    message: {
      textAlign: 'center',
      padding: '10px',
      borderRadius: '8px',
      fontSize: '14px',
      marginBottom: '16px',
    },
    error: {
      background: 'rgba(200,50,50,0.1)',
      border: '1px solid rgba(200,50,50,0.3)',
      color: '#ff6b6b',
    },
    success: {
      background: 'rgba(76,175,80,0.1)',
      border: '1px solid rgba(76,175,80,0.3)',
      color: '#81c784',
    },
    confirmOverlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '16px',
    },
    confirmModal: {
      background: 'rgba(15,15,15,0.98)',
      border: '1px solid #3d3020',
      borderRadius: '12px',
      padding: '30px',
      maxWidth: '400px',
      width: '100%',
      textAlign: 'center',
      color: '#e0e0e0',
    },
    confirmText: {
      fontSize: '16px',
      marginBottom: '24px',
      color: '#ccc',
    },
    confirmBtn: {
      background: '#c94c4c',
      border: 'none',
      color: '#fff',
      borderRadius: '8px',
      padding: '10px 24px',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'opacity 0.2s',
    },
    confirmCancel: {
      background: 'transparent',
      border: '1px solid #555',
      color: '#aaa',
      borderRadius: '8px',
      padding: '10px 20px',
      fontSize: '14px',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'background 0.2s',
    },
  };

  const inputFocusHandler = (e) => {
    e.target.style.borderColor = '#c9a84c';
  };
  const inputBlurHandler = (e) => {
    e.target.style.borderColor = '#3d3020';
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', padding: '40px 16px' }}>
      <style>{`
        @media (max-width: 992px) {
          .addr-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 576px) {
          .addr-grid { grid-template-columns: 1fr !important; }
          .addr-form-grid { grid-template-columns: 1fr !important; }
        }
        .addr-input:focus {
          border-color: #c9a84c !important;
          box-shadow: 0 0 0 1px rgba(201,168,76,0.15);
        }
        .addr-select:focus {
          border-color: #c9a84c !important;
          box-shadow: 0 0 0 1px rgba(201,168,76,0.15);
        }
        .addr-add-btn:hover { opacity: 0.85; }
        .addr-icon-btn:hover { background: rgba(201,168,76,0.1); color: #c9a84c; border-color: #c9a84c; }
        .addr-default-btn:hover { background: rgba(201,168,76,0.1); }
        .addr-save-btn:hover { opacity: 0.85; }
        .addr-cancel-btn:hover { background: rgba(255,255,255,0.05); }
        .addr-delete-btn:hover { opacity: 0.85; }
        .addr-confirm-cancel:hover { background: rgba(255,255,255,0.05); }
        .addr-close-btn:hover { color: #c9a84c; }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div style={styles.card}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.heading}>My Addresses</h2>
            <p style={styles.subtitle}>Manage your saved delivery addresses</p>
          </div>
          <button className="addr-add-btn" style={styles.addBtn} onClick={openAddForm}>
            <Plus size={16} />
            Add Address
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Loader2
              size={32}
              style={{ color: '#c9a84c', animation: 'spin 1s linear infinite' }}
            />
            <p style={{ color: '#888', marginTop: '12px', fontSize: '14px' }}>Loading addresses...</p>
          </div>
        ) : addresses.length === 0 ? (
          <div style={styles.emptyState}>
            <MapPin size={48} style={styles.emptyIcon} />
            <p style={{ fontSize: '16px', color: '#888', marginBottom: '8px' }}>No saved addresses</p>
            <p style={{ fontSize: '14px', color: '#666' }}>Add your first address to get started</p>
          </div>
        ) : (
          <div className="addr-grid" style={styles.grid}>
            {addresses.map((addr) => {
              const lc = labelConfig[addr.label] || labelConfig.Other;
              return (
                <div
                  key={addr._id}
                  style={{
                    ...styles.addressCard,
                    ...(addr.isDefault ? styles.addressCardDefault : {}),
                  }}
                >
                  <div style={styles.cardTop}>
                    <div style={styles.badges}>
                      <span
                        style={{
                          ...styles.badge,
                          background: lc.bg,
                          border: `1px solid ${lc.border}`,
                          color: lc.color,
                        }}
                      >
                        {addr.label === 'Office' ? <Building size={10} style={{ marginRight: 4 }} /> : addr.label === 'Home' ? <Home size={10} style={{ marginRight: 4 }} /> : null}
                        {addr.label}
                      </span>
                      {addr.isDefault && (
                        <span style={styles.defaultBadge}>
                          <Star size={10} />
                          Default
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={styles.cardName}>{addr.fullName}</div>
                  <div style={styles.cardPhone}>{addr.phone}</div>
                  <div style={styles.cardAddress}>
                    {addr.address1}
                    {addr.address2 ? `, ${addr.address2}` : ''}
                    <br />
                    {addr.city}{addr.province ? `, ${addr.province}` : ''} {addr.postal}
                    <br />
                    {addr.country}
                  </div>
                  {addr.email && <div style={styles.cardEmail}>{addr.email}</div>}

                  <div style={styles.cardActions}>
                    <button
                      className="addr-icon-btn"
                      style={styles.iconBtn}
                      onClick={() => openEditForm(addr)}
                    >
                      <Edit2 size={13} />
                      Edit
                    </button>
                    {!addr.isDefault && (
                      <button
                        className="addr-default-btn"
                        style={styles.defaultBtn}
                        onClick={() => handleSetDefault(addr._id)}
                        disabled={actionLoading}
                      >
                        <Star size={13} />
                        Set Default
                      </button>
                    )}
                    <button
                      className="addr-icon-btn"
                      style={{ ...styles.iconBtn, color: '#ff6b6b', borderColor: 'rgba(255,107,107,0.3)' }}
                      onClick={() => setDeleteConfirm(addr._id)}
                    >
                      <Trash2 size={13} />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showForm && (
        <div style={styles.overlay} onClick={closeForm}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>{editingId ? 'Edit Address' : 'Add New Address'}</h3>
              <button className="addr-close-btn" style={styles.closeBtn} onClick={closeForm}>
                <X size={20} />
              </button>
            </div>

            <div className="addr-form-grid" style={styles.formGrid}>
              <div style={styles.field}>
                <label style={styles.label}>Label</label>
                <select
                  name="label"
                  value={formData.label}
                  onChange={handleChange}
                  style={styles.select}
                  className="addr-select"
                  onFocus={inputFocusHandler}
                  onBlur={inputBlurHandler}
                >
                  <option value="Home">Home</option>
                  <option value="Office">Office</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Full Name</label>
                <input
                  className="addr-input"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Full name"
                  style={styles.input}
                  onFocus={inputFocusHandler}
                  onBlur={inputBlurHandler}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Phone</label>
                <input
                  className="addr-input"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone number"
                  style={styles.input}
                  onFocus={inputFocusHandler}
                  onBlur={inputBlurHandler}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Email</label>
                <input
                  className="addr-input"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email address"
                  style={styles.input}
                  onFocus={inputFocusHandler}
                  onBlur={inputBlurHandler}
                />
              </div>

              <div style={styles.fieldFull}>
                <label style={styles.label}>Address Line 1</label>
                <input
                  className="addr-input"
                  name="address1"
                  value={formData.address1}
                  onChange={handleChange}
                  placeholder="Street address"
                  style={styles.input}
                  onFocus={inputFocusHandler}
                  onBlur={inputBlurHandler}
                />
              </div>

              <div style={styles.fieldFull}>
                <label style={styles.label}>Address Line 2</label>
                <input
                  className="addr-input"
                  name="address2"
                  value={formData.address2}
                  onChange={handleChange}
                  placeholder="Apt, suite, floor (optional)"
                  style={styles.input}
                  onFocus={inputFocusHandler}
                  onBlur={inputBlurHandler}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>City</label>
                <input
                  className="addr-input"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  style={styles.input}
                  onFocus={inputFocusHandler}
                  onBlur={inputBlurHandler}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Province</label>
                <input
                  className="addr-input"
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  placeholder="Province / State"
                  style={styles.input}
                  onFocus={inputFocusHandler}
                  onBlur={inputBlurHandler}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Postal Code</label>
                <input
                  className="addr-input"
                  name="postal"
                  value={formData.postal}
                  onChange={handleChange}
                  placeholder="Postal / Zip code"
                  style={styles.input}
                  onFocus={inputFocusHandler}
                  onBlur={inputBlurHandler}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Country</label>
                <input
                  className="addr-input"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Country"
                  style={styles.input}
                  onFocus={inputFocusHandler}
                  onBlur={inputBlurHandler}
                />
              </div>
            </div>

            <div style={styles.btnRow}>
              <button className="addr-cancel-btn" style={styles.cancelBtn} onClick={closeForm}>
                Cancel
              </button>
              <button
                className="addr-save-btn"
                style={{ ...styles.saveBtn, opacity: actionLoading ? 0.6 : 1 }}
                onClick={handleSubmit}
                disabled={actionLoading}
              >
                {actionLoading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={16} />}
                {actionLoading ? 'Saving...' : editingId ? 'Update Address' : 'Add Address'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div style={styles.confirmOverlay} onClick={() => setDeleteConfirm(null)}>
          <div style={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <MapPin size={36} style={{ color: '#c94c4c', marginBottom: '16px' }} />
            <p style={styles.confirmText}>Are you sure you want to delete this address?</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button
                className="addr-confirm-cancel"
                style={styles.confirmCancel}
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="addr-delete-btn"
                style={{ ...styles.confirmBtn, opacity: actionLoading ? 0.6 : 1 }}
                onClick={() => handleDelete(deleteConfirm)}
                disabled={actionLoading}
              >
                {actionLoading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={14} />}
                {actionLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
