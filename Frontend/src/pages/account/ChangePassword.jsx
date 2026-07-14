import { useState } from 'react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useAlert } from '../../context/AlertContext';
import { Lock, Eye, EyeOff, Loader2, Shield } from 'lucide-react';

const ChangePassword = () => {
  const { changePassword } = useCustomerAuth();
  const { showAlert } = useAlert();

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const toggleShow = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      showAlert({ type: 'success', message: 'Password changed successfully!' });
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showAlert({ type: 'error', message: err.message || 'Failed to change password.' });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (hasError) => ({
    width: '100%',
    padding: '12px 16px 12px 44px',
    background: '#0d0d0d',
    border: `1px solid ${hasError ? '#c94c4c' : '#3d3020'}`,
    borderRadius: '8px',
    color: '#fff',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box',
  });

  const iconBtnStyle = {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: 0,
  };

  const errorTextStyle = {
    color: '#c94c4c',
    fontSize: '13px',
    marginTop: '6px',
    paddingLeft: '4px',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          background: 'rgba(15,15,15,0.95)',
          border: '1px solid #3d3020',
          borderRadius: '12px',
          padding: '30px',
          width: '100%',
          maxWidth: '440px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(201,168,76,0.1)',
              border: '1px solid #3d3020',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <Shield size={24} color="#c9a84c" />
          </div>
          <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: 600, margin: '0 0 8px' }}>
            Change Password
          </h1>
          <p style={{ color: '#777', fontSize: '14px', margin: 0 }}>
            Ensure your account remains secure
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Current Password */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#aaa', fontSize: '13px', marginBottom: '8px', fontWeight: 500 }}>
              Current Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#555" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type={showPasswords.current ? 'text' : 'password'}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Enter current password"
                style={inputStyle(errors.currentPassword)}
                onFocus={(e) => {
                  if (!errors.currentPassword) e.target.style.borderColor = '#c9a84c';
                }}
                onBlur={(e) => {
                  if (!errors.currentPassword) e.target.style.borderColor = '#3d3020';
                }}
              />
              <button type="button" onClick={() => toggleShow('current')} style={iconBtnStyle}>
                {showPasswords.current ? <EyeOff size={16} color="#777" /> : <Eye size={16} color="#777" />}
              </button>
            </div>
            {errors.currentPassword && <p style={errorTextStyle}>{errors.currentPassword}</p>}
          </div>

          {/* New Password */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#aaa', fontSize: '13px', marginBottom: '8px', fontWeight: 500 }}>
              New Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#555" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type={showPasswords.new ? 'text' : 'password'}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter new password"
                style={inputStyle(errors.newPassword)}
                onFocus={(e) => {
                  if (!errors.newPassword) e.target.style.borderColor = '#c9a84c';
                }}
                onBlur={(e) => {
                  if (!errors.newPassword) e.target.style.borderColor = '#3d3020';
                }}
              />
              <button type="button" onClick={() => toggleShow('new')} style={iconBtnStyle}>
                {showPasswords.new ? <EyeOff size={16} color="#777" /> : <Eye size={16} color="#777" />}
              </button>
            </div>
            {errors.newPassword && <p style={errorTextStyle}>{errors.newPassword}</p>}
          </div>

          {/* Confirm New Password */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', color: '#aaa', fontSize: '13px', marginBottom: '8px', fontWeight: 500 }}>
              Confirm New Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#555" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                style={inputStyle(errors.confirmPassword)}
                onFocus={(e) => {
                  if (!errors.confirmPassword) e.target.style.borderColor = '#c9a84c';
                }}
                onBlur={(e) => {
                  if (!errors.confirmPassword) e.target.style.borderColor = '#3d3020';
                }}
              />
              <button type="button" onClick={() => toggleShow('confirm')} style={iconBtnStyle}>
                {showPasswords.confirm ? <EyeOff size={16} color="#777" /> : <Eye size={16} color="#777" />}
              </button>
            </div>
            {errors.confirmPassword && <p style={errorTextStyle}>{errors.confirmPassword}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? 'rgba(201,168,76,0.5)' : '#c9a84c',
              border: 'none',
              borderRadius: '8px',
              color: loading ? '#666' : '#0a0a0a',
              fontSize: '15px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background 0.2s ease',
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                Changing Password...
              </>
            ) : (
              'Update Password'
            )}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ChangePassword;
