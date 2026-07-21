import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useAlert } from '../context/AlertContext';

const CustomerLogin = () => {
  const navigate = useNavigate();
  const { login, customer, googleLogin } = useCustomerAuth();
  const { showAlert } = useAlert();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (customer) {
      navigate('/');
    }
  }, [customer, navigate]);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password, rememberMe);
      showAlert({ type: 'success', message: 'Login successful! Redirecting...' });
      setTimeout(() => navigate('/'), 1000);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div
        style={{
          minHeight: '100vh',
          background: '#0a0a0a',
          paddingTop: '96px',
          paddingBottom: '60px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        <div className="container">
          <div
            className="mx-auto"
            style={{
              maxWidth: '450px',
              width: '100%',
            }}
          >
            <div
              style={{
                background: 'rgba(15,15,15,0.95)',
                border: '1px solid #3d3020',
                borderRadius: '16px',
                padding: '40px',
              }}
            >
              <div className="text-center mb-4">
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'rgba(201,168,76,0.1)',
                    border: '1px solid #c9a84c',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                  }}
                >
                  <LogIn size={28} color="#c9a84c" />
                </div>
                <h2
                  style={{
                    color: '#c9a84c',
                    fontSize: '24px',
                    fontWeight: 700,
                    letterSpacing: '3px',
                    marginBottom: '8px',
                  }}
                >
                  WELCOME BACK
                </h2>
                <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>
                  Sign in to your account
                </p>
              </div>

              {error && (
                <div
                  style={{
                    background: 'rgba(220,53,69,0.1)',
                    border: '1px solid #dc3545',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    marginBottom: '20px',
                    color: '#dc3545',
                    fontSize: '13px',
                  }}
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label
                    style={{ color: '#aaa', fontSize: '13px', marginBottom: '6px', display: 'block' }}
                  >
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail
                      size={18}
                      style={{
                        position: 'absolute',
                        left: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#666',
                      }}
                    />
                    <input
                      type="email"
                      className="form-control"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      style={{
                        background: '#111',
                        border: '1px solid #333',
                        color: '#eee',
                        paddingLeft: '44px',
                        height: '48px',
                        borderRadius: '10px',
                        fontSize: '16px',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#c9a84c')}
                      onBlur={(e) => (e.target.style.borderColor = '#333')}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label
                    style={{ color: '#aaa', fontSize: '13px', marginBottom: '6px', display: 'block' }}
                  >
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock
                      size={18}
                      style={{
                        position: 'absolute',
                        left: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#666',
                      }}
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      style={{
                        background: '#111',
                        border: '1px solid #333',
                        color: '#eee',
                        paddingLeft: '44px',
                        paddingRight: '44px',
                        height: '48px',
                        borderRadius: '10px',
                        fontSize: '16px',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#c9a84c')}
                      onBlur={(e) => (e.target.style.borderColor = '#333')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {showPassword ? (
                        <EyeOff size={18} color="#666" />
                      ) : (
                        <Eye size={18} color="#666" />
                      )}
                    </button>
                  </div>
                </div>

                <div
                  className="d-flex justify-content-between align-items-center mb-4"
                  style={{ flexWrap: 'wrap', gap: '8px' }}
                >
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#aaa',
                      fontSize: '13px',
                      cursor: 'pointer',
                      margin: 0,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={loading}
                      style={{
                        accentColor: '#c9a84c',
                        width: '16px',
                        height: '16px',
                      }}
                    />
                    Remember Me
                  </label>
                  <Link
                    to="/forgot-password"
                    style={{
                      color: '#c9a84c',
                      fontSize: '13px',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => (e.target.style.textDecoration = 'underline')}
                    onMouseLeave={(e) => (e.target.style.textDecoration = 'none')}
                  >
                    Forgot Password?
                  </Link>
                </div>

                <button
                  type="submit"
                  className="btn w-100"
                  disabled={loading}
                  style={{
                    background: loading
                      ? 'rgba(201,168,76,0.4)'
                      : 'linear-gradient(135deg, #c9a84c, #b08d3a)',
                    border: 'none',
                    color: loading ? '#aaa' : '#0a0a0a',
                    fontWeight: 700,
                    fontSize: '15px',
                    height: '48px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    letterSpacing: '1px',
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      <LogIn size={18} />
                      Sign In
                    </>
                  )}
                </button>
              </form>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '24px 0' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#333' }} />
                <span style={{ color: '#666', fontSize: '13px', whiteSpace: 'nowrap' }}>OR</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#333' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <GoogleLogin
                  onSuccess={async (credentialResponse) => {
                    try {
                      await googleLogin(credentialResponse.credential);
                      showAlert({ type: 'success', message: 'Login successful! Redirecting...' });
                      setTimeout(() => navigate('/'), 1000);
                    } catch (err) {
                      setError(err.message || 'Google sign-in failed.');
                    }
                  }}
                  onError={() => {
                    setError('Google sign-in was cancelled or failed.');
                  }}
                  size="large"
                  width="100%"
                  theme="outline"
                  text="signin_with"
                  shape="rectangular"
                />
              </div>

              <div className="text-center mt-4">
                <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    style={{
                      color: '#c9a84c',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => (e.target.style.textDecoration = 'underline')}
                    onMouseLeave={(e) => (e.target.style.textDecoration = 'none')}
                  >
                    Register
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 576px) {
          .container {
            padding-left: 16px;
            padding-right: 16px;
          }
        }
      `}</style>

      <Footer />
    </>
  );
};

export default CustomerLogin;
