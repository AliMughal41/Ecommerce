import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useAlert } from '../context/AlertContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const CustomerRegister = () => {
  const navigate = useNavigate();
  const { register } = useCustomerAuth();
  const { showAlert } = useAlert();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState('');

  const inputStyle = (fieldName) => ({
    backgroundColor: 'rgba(20,20,20,0.8)',
    border: `1px solid ${focusedField === fieldName ? '#c9a84c' : '#3d3020'}`,
    color: '#ffffff',
    borderRadius: '10px',
    fontSize: '16px',
    padding: '14px 16px',
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.3s ease',
  });

  const labelStyle = {
    color: '#c9a84c',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '8px',
    display: 'block',
  };

  const passwordContainerStyle = {
    position: 'relative',
  };

  const passwordToggleStyle = {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: '#888',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.firstName.trim()) {
      setError('First name is required');
      return;
    }

    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return;
    }

    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!formData.password) {
      setError('Password is required');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phoneNumber.trim() || '',
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      navigate('/login');
    } catch (err) {
      showAlert({ type: 'error', message: err.message || 'Registration failed. Please try again.' });
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
          backgroundColor: '#0a0a0a',
          paddingTop: '130px',
          paddingBottom: '60px',
        }}
      >
        <div className="container">
          <div
            className="mx-auto"
            style={{
              maxWidth: '500px',
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
                <h1
                  style={{
                    color: '#c9a84c',
                    fontSize: '28px',
                    fontWeight: '700',
                    letterSpacing: '2px',
                    marginBottom: '8px',
                  }}
                >
                  CREATE ACCOUNT
                </h1>
                <p
                  style={{
                    color: '#888',
                    fontSize: '14px',
                    margin: 0,
                  }}
                >
                  Join LadieBags for exclusive access
                </p>
              </div>

              {error && (
                <div
                  style={{
                    backgroundColor: 'rgba(220,53,69,0.15)',
                    border: '1px solid rgba(220,53,69,0.3)',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    marginBottom: '20px',
                  }}
                >
                  <p
                    style={{
                      color: '#dc3545',
                      fontSize: '14px',
                      margin: 0,
                    }}
                  >
                    {error}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-6 mb-3">
                    <label style={labelStyle}>First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('firstName')}
                      onBlur={() => setFocusedField('')}
                      placeholder="First name"
                      style={inputStyle('firstName')}
                    />
                  </div>
                  <div className="col-6 mb-3">
                    <label style={labelStyle}>Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('lastName')}
                      onBlur={() => setFocusedField('')}
                      placeholder="Last name"
                      style={inputStyle('lastName')}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label style={labelStyle}>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField('')}
                    placeholder="your@email.com"
                    style={inputStyle('email')}
                  />
                </div>

                <div className="mb-3">
                  <label style={labelStyle}>Phone Number (Optional)</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('phoneNumber')}
                    onBlur={() => setFocusedField('')}
                    placeholder="+1 (555) 000-0000"
                    style={inputStyle('phoneNumber')}
                  />
                </div>

                <div className="mb-3">
                  <label style={labelStyle}>Password *</label>
                  <div style={passwordContainerStyle}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField('')}
                      placeholder="Min. 6 characters"
                      style={inputStyle('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={passwordToggleStyle}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <label style={labelStyle}>Confirm Password *</label>
                  <div style={passwordContainerStyle}>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('confirmPassword')}
                      onBlur={() => setFocusedField('')}
                      placeholder="Re-enter password"
                      style={inputStyle('confirmPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={passwordToggleStyle}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    backgroundColor: loading ? '#a0853a' : '#c9a84c',
                    color: '#0a0a0a',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '16px',
                    fontSize: '16px',
                    fontWeight: '600',
                    letterSpacing: '1px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    opacity: loading ? 0.8 : 1,
                  }}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>

              <div className="text-center mt-4">
                <p
                  style={{
                    color: '#888',
                    fontSize: '14px',
                    margin: 0,
                  }}
                >
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    style={{
                      color: '#c9a84c',
                      textDecoration: 'none',
                      fontWeight: '500',
                    }}
                  >
                    Login
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CustomerRegister;
