import { useState, useEffect } from 'react';
import { User, Mail, Phone, Edit2, Save, Loader2, Camera } from 'lucide-react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useAlert } from '../../context/AlertContext';

export default function Profile() {
  const { customer, updateProfile } = useCustomerAuth();
  const { showAlert } = useAlert();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        email: customer.email || '',
        phone: customer.phone || '',
      });
    }
  }, [customer]);

  const getInitials = () => {
    const first = customer?.firstName?.[0] || '';
    const last = customer?.lastName?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile(formData);
      showAlert({ type: 'success', message: 'Profile updated successfully.' });
      setIsEditing(false);
    } catch (err) {
      showAlert({ type: 'error', message: err.message || 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (customer) {
      setFormData({
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        email: customer.email || '',
        phone: customer.phone || '',
      });
    }
    setIsEditing(false);
  };

  const styles = {
    card: {
      background: 'rgba(15,15,15,0.95)',
      border: '1px solid #3d3020',
      borderRadius: '12px',
      padding: '30px',
      maxWidth: '700px',
      margin: '0 auto',
      color: '#e0e0e0',
      fontFamily: "'Inter', sans-serif",
    },
    avatarContainer: {
      position: 'relative',
      width: '80px',
      height: '80px',
      margin: '0 auto 24px',
    },
    avatar: {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      border: '2px solid #c9a84c',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(201,168,76,0.1)',
      fontSize: '28px',
      fontWeight: 600,
      color: '#c9a84c',
    },
    cameraBtn: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: '28px',
      height: '28px',
      borderRadius: '50%',
      background: '#c9a84c',
      border: '2px solid #0f0f0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: '#0a0a0a',
    },
    heading: {
      textAlign: 'center',
      fontSize: '22px',
      fontWeight: 600,
      color: '#ffffff',
      marginBottom: '4px',
    },
    subtitle: {
      textAlign: 'center',
      fontSize: '14px',
      color: '#888',
      marginBottom: '28px',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '20px',
    },
    field: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    },
    label: {
      fontSize: '13px',
      fontWeight: 500,
      color: '#c9a84c',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },
    icon: {
      width: '14px',
      height: '14px',
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
    inputDisabled: {
      background: '#0e0e0e',
      border: '1px solid #2a2010',
      borderRadius: '8px',
      padding: '10px 12px',
      fontSize: '16px',
      color: '#999',
      width: '100%',
      boxSizing: 'border-box',
      cursor: 'default',
    },
    btnRow: {
      display: 'flex',
      justifyContent: 'center',
      gap: '12px',
      marginTop: '28px',
    },
    editBtn: {
      background: 'transparent',
      border: '1px solid #c9a84c',
      color: '#c9a84c',
      borderRadius: '8px',
      padding: '10px 20px',
      fontSize: '14px',
      fontWeight: 500,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      transition: 'background 0.2s',
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
  };

  const inputFocusHandler = (e) => {
    e.target.style.borderColor = '#c9a84c';
  };
  const inputBlurHandler = (e) => {
    e.target.style.borderColor = '#3d3020';
  };

  const fieldConfig = [
    { name: 'firstName', label: 'First Name', icon: <User style={styles.icon} />, placeholder: 'Enter first name' },
    { name: 'lastName', label: 'Last Name', icon: <User style={styles.icon} />, placeholder: 'Enter last name' },
    { name: 'email', label: 'Email', icon: <Mail style={styles.icon} />, placeholder: 'Enter email address' },
    { name: 'phone', label: 'Phone', icon: <Phone style={styles.icon} />, placeholder: 'Enter phone number' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', padding: '40px 16px' }}>
      <style>{`
        @media (max-width: 540px) {
          .profile-grid { grid-template-columns: 1fr !important; }
        }
        .profile-input:focus {
          border-color: #c9a84c !important;
          box-shadow: 0 0 0 1px rgba(201,168,76,0.15);
        }
        .profile-edit-btn:hover { background: rgba(201,168,76,0.1); }
        .profile-save-btn:hover { opacity: 0.85; }
        .profile-cancel-btn:hover { background: rgba(255,255,255,0.05); }
      `}</style>

      <div style={styles.card}>
        <div style={styles.avatarContainer}>
          <div style={styles.avatar}>
            {customer?.photo ? (
              <img
                src={customer.photo}
                alt="Profile"
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              getInitials()
            )}
          </div>
          {isEditing && (
            <div style={styles.cameraBtn} title="Change photo">
              <Camera size={14} />
            </div>
          )}
        </div>

        <h2 style={styles.heading}>My Profile</h2>
        <p style={styles.subtitle}>Manage your personal information</p>

        <div className="profile-grid" style={styles.grid}>
          {fieldConfig.map((field) => (
            <div key={field.name} style={styles.field}>
              <label style={styles.label}>
                {field.icon}
                {field.label}
              </label>
              {isEditing ? (
                <input
                  className="profile-input"
                  type={field.name === 'email' ? 'email' : field.name === 'phone' ? 'tel' : 'text'}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  style={styles.input}
                  onFocus={inputFocusHandler}
                  onBlur={inputBlurHandler}
                />
              ) : (
                <div style={styles.inputDisabled}>
                  {formData[field.name] || '—'}
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={styles.btnRow}>
          {!isEditing ? (
            <button
              className="profile-edit-btn"
              style={styles.editBtn}
              onClick={() => setIsEditing(true)}
            >
              <Edit2 size={16} />
              Edit Profile
            </button>
          ) : (
            <>
              <button
                className="profile-save-btn"
                style={{
                  ...styles.saveBtn,
                  opacity: loading ? 0.6 : 1,
                }}
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                className="profile-cancel-btn"
                style={styles.cancelBtn}
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
