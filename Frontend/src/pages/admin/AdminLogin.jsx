import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, Mail } from 'lucide-react';
import API_URL from '../../config';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const config = { headers: { 'Content-Type': 'application/json' }, withCredentials: true };
      const { data } = await axios.post(
        `${API_URL}/api/auth/login`,
        { email, password },
        config
      );

      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        navigate('/adminproducts');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a', color: '#fff', alignItems: 'center', justifyContent: 'center', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ width: '100%', maxWidth: '400px', background: '#0f0c09', border: '1px solid #2a1f10', borderRadius: '8px', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid #c9a84c', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', overflow: 'hidden' }}>
            <img src="/images/logo.png" alt="VELNORA" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, letterSpacing: '1px' }}>ADMIN LOGIN</h2>
          <p style={{ fontSize: '13px', color: '#8a7a6a', marginTop: '4px' }}>Secure access for Velnora admin.</p>
        </div>

        {error && (
          <div style={{ background: '#e74c3c20', border: '1px solid #e74c3c50', color: '#e74c3c', padding: '10px 14px', borderRadius: '4px', fontSize: '13px', marginBottom: '20px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#a09080', marginBottom: '6px' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%', background: '#1a1410', border: '1px solid #3d3020', borderRadius: '4px', color: '#fff', padding: '10px 10px 10px 36px', fontSize: '13px', outline: 'none' }}
                onFocus={(e) => e.target.style.borderColor = '#c9a84c'}
                onBlur={(e) => e.target.style.borderColor = '#3d3020'}
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#a09080', marginBottom: '6px' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', background: '#1a1410', border: '1px solid #3d3020', borderRadius: '4px', color: '#fff', padding: '10px 10px 10px 36px', fontSize: '13px', outline: 'none' }}
                onFocus={(e) => e.target.style.borderColor = '#c9a84c'}
                onBlur={(e) => e.target.style.borderColor = '#3d3020'}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', background: '#c9a84c', color: '#0a0a0a', border: 'none', padding: '12px', borderRadius: '4px', fontWeight: 700, fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px', transition: 'background 0.2s' }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#d4b050'; }}
            onMouseLeave={(e) => e.currentTarget.style.background = '#c9a84c'}
          >
            {loading ? 'AUTHENTICATING...' : 'LOGIN'}
          </button>
        </form>

        {/* Register link */}
        <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #1a1410' }}>
          <span style={{ fontSize: '13px', color: '#6a5a4a' }}>New admin? </span>
          <button onClick={() => navigate('/admin-register')}
            style={{ background: 'transparent', border: 'none', color: '#c9a84c', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            CREATE ACCOUNT →
          </button>
        </div>

      </div>
    </div>
  );
}
