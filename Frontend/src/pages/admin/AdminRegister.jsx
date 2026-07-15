import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import API_URL from '../../config';

export default function AdminRegister() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.username || !form.email || !form.password || !form.confirmPassword) {
      return setError('Please fill in all fields.');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }
    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match.');
    }

    setLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/api/auth/register`, {
        username: form.username,
        email: form.email,
        password: form.password,
      });
      if (data.success) {
        // Navigate to OTP page, passing email via state
        navigate('/admin-verify-otp', { state: { email: form.email } });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', background: '#141010', border: '1px solid #3d3020',
    borderRadius: '4px', padding: '11px 14px', color: '#fff', fontSize: '14px',
    outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box',
  };

  return (
       <div className="bg-black text-white" style={{ fontFamily: "'Inter', sans-serif", paddingTop: '96px' }}>

    <div style={{
      display: 'flex', minHeight: '100vh', background: '#0a0a0a', color: '#fff',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Segoe UI', system-ui, sans-serif", padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: '440px', background: '#0f0c09', border: '1px solid #2a1f10', borderRadius: '8px', padding: '36px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '50%', border: '2px solid #c9a84c',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px', background: 'rgba(201,168,76,0.08)'
          }}>
            <UserPlus size={22} style={{ color: '#c9a84c' }} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 4px', letterSpacing: '1px' }}>CREATE ADMIN</h2>
          <p style={{ fontSize: '12px', color: '#6a5a4a', margin: 0, letterSpacing: '1px' }}>MAX 2 ADMINS ALLOWED</p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: '#2e1a1a', border: '1px solid #e74c3c', borderRadius: '4px',
            padding: '10px 14px', marginBottom: '20px', fontSize: '13px', color: '#ff6b6b'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#8a7a6a', letterSpacing: '1px', marginBottom: '6px', textTransform: 'uppercase' }}>
              Username
            </label>
            <input
              name="username" type="text" placeholder="Enter your username"
              value={form.username} onChange={handleChange}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#c9a84c'}
              onBlur={e => e.target.style.borderColor = '#3d3020'}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#8a7a6a', letterSpacing: '1px', marginBottom: '6px', textTransform: 'uppercase' }}>
              Email Address
            </label>
            <input
              name="email" type="email" placeholder="Enter your email"
              value={form.email} onChange={handleChange}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#c9a84c'}
              onBlur={e => e.target.style.borderColor = '#3d3020'}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#8a7a6a', letterSpacing: '1px', marginBottom: '6px', textTransform: 'uppercase' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                name="password" type={showPassword ? 'text' : 'password'}
                placeholder="Min. 6 characters"
                value={form.password} onChange={handleChange}
                style={{ ...inputStyle, paddingRight: '44px' }}
                onFocus={e => e.target.style.borderColor = '#c9a84c'}
                onBlur={e => e.target.style.borderColor = '#3d3020'}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#8a7a6a', cursor: 'pointer', padding: 0 }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#8a7a6a', letterSpacing: '1px', marginBottom: '6px', textTransform: 'uppercase' }}>
              Confirm Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                name="confirmPassword" type={showConfirm ? 'text' : 'password'}
                placeholder="Re-enter password"
                value={form.confirmPassword} onChange={handleChange}
                style={{ ...inputStyle, paddingRight: '44px' }}
                onFocus={e => e.target.style.borderColor = '#c9a84c'}
                onBlur={e => e.target.style.borderColor = '#3d3020'}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#8a7a6a', cursor: 'pointer', padding: 0 }}>
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', background: loading ? '#a08030' : '#c9a84c', color: '#0a0a0a',
              border: 'none', padding: '13px', borderRadius: '4px', fontWeight: 700,
              fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '1px', transition: 'background 0.2s'
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#d4b050'; }}
            onMouseLeave={e => e.currentTarget.style.background = loading ? '#a08030' : '#c9a84c'}
          >
            {loading ? 'SENDING OTP...' : 'CREATE ACCOUNT'}
          </button>
        </form>

        {/* Info box */}
        <div style={{ marginTop: '20px', background: '#1a1410', border: '1px solid #3d3020', borderRadius: '4px', padding: '12px 14px' }}>
          <p style={{ fontSize: '12px', color: '#8a7a6a', margin: 0, lineHeight: 1.6 }}>
            📧 After clicking <strong style={{ color: '#c9a84c' }}>CREATE ACCOUNT</strong>, a 6-digit OTP will be sent to your email for verification.
          </p>
        </div>

        {/* Back to login */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <span style={{ fontSize: '13px', color: '#6a5a4a' }}>Already have an account? </span>
          <button onClick={() => navigate('/admin-secret-login')}
            style={{ background: 'transparent', border: 'none', color: '#c9a84c', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            LOGIN
          </button>
        </div>

      </div>
    </div>
    </div>
  );
}
