import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useAlert } from '../context/AlertContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const CustomerRegister = () => {
  const navigate = useNavigate();
  const { register, verifyRegistration } = useCustomerAuth();
  const { showAlert } = useAlert();
  const [step, setStep] = useState('form');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState('');
  const [resendTimer, setResendTimer] = useState(120);

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
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.firstName.trim()) { setError('First name is required'); return; }
    if (!formData.lastName.trim()) { setError('Last name is required'); return; }
    if (!formData.email.trim()) { setError('Email is required'); return; }
    if (!validateEmail(formData.email)) { setError('Please enter a valid email address'); return; }
    if (!formData.password) { setError('Password is required'); return; }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }

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
      setStep('otp');
      startResendTimer();
    } catch (err) {
      showAlert({ type: 'error', message: err.message || 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      const newOtp = pasted.split('').concat(Array(6).fill('')).slice(0, 6);
      setOtp(newOtp);
      const nextFocus = Math.min(pasted.length, 5);
      otpRefs.current[nextFocus]?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      await verifyRegistration(formData.email.trim().toLowerCase(), otpString);
      showAlert({ type: 'success', message: 'Account created successfully! Welcome to Velnora.' });
      navigate('/');
    } catch (err) {
      showAlert({ type: 'error', message: err.message || 'Verification failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const startResendTimer = () => {
    setResendTimer(120);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendOtp = async () => {
    try {
      await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phoneNumber.trim() || '',
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      showAlert({ type: 'success', message: 'OTP resent to your email.' });
      setOtp(['', '', '', '', '', '']);
      startResendTimer();
    } catch (err) {
      showAlert({ type: 'error', message: err.message || 'Failed to resend OTP.' });
    }
  };

  const otpInputStyle = {
    backgroundColor: 'rgba(20,20,20,0.8)',
    border: '1px solid #3d3020',
    color: '#ffffff',
    borderRadius: '10px',
    fontSize: '24px',
    fontWeight: '700',
    width: '52px',
    height: '56px',
    textAlign: 'center',
    outline: 'none',
    transition: 'border-color 0.3s ease',
    caretColor: '#c9a84c',
  };

  return (
    <>
      <Navbar />
      <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', paddingTop: '96px', paddingBottom: '60px' }}>
        <div className="container">
          <div className="mx-auto" style={{ maxWidth: '500px' }}>
            <div style={{ background: 'rgba(15,15,15,0.95)', border: '1px solid #3d3020', borderRadius: '16px', padding: '40px' }}>

              {step === 'form' ? (
                <>
                  <div className="text-center mb-4">
                    <h1 style={{ color: '#c9a84c', fontSize: '28px', fontWeight: '700', letterSpacing: '2px', marginBottom: '8px' }}>CREATE ACCOUNT</h1>
                    <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>Join Velnora for exclusive access</p>
                  </div>

                  {error && (
                    <div style={{ backgroundColor: 'rgba(220,53,69,0.15)', border: '1px solid rgba(220,53,69,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px' }}>
                      <p style={{ color: '#dc3545', fontSize: '14px', margin: 0 }}>{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleFormSubmit}>
                    <div className="row">
                      <div className="col-6 mb-3">
                        <label style={labelStyle}>First Name *</label>
                        <input type="text" name="firstName" value={formData.firstName} onChange={handleChange}
                          onFocus={() => setFocusedField('firstName')} onBlur={() => setFocusedField('')}
                          placeholder="First name" style={inputStyle('firstName')} />
                      </div>
                      <div className="col-6 mb-3">
                        <label style={labelStyle}>Last Name *</label>
                        <input type="text" name="lastName" value={formData.lastName} onChange={handleChange}
                          onFocus={() => setFocusedField('lastName')} onBlur={() => setFocusedField('')}
                          placeholder="Last name" style={inputStyle('lastName')} />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label style={labelStyle}>Email Address *</label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange}
                        onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField('')}
                        placeholder="your@email.com" style={inputStyle('email')} />
                    </div>

                    <div className="mb-3">
                      <label style={labelStyle}>Phone Number (Optional)</label>
                      <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange}
                        onFocus={() => setFocusedField('phoneNumber')} onBlur={() => setFocusedField('')}
                        placeholder="+92 300 0000000" style={inputStyle('phoneNumber')} />
                    </div>

                    <div className="mb-3">
                      <label style={labelStyle}>Password *</label>
                      <div style={passwordContainerStyle}>
                        <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password}
                          onChange={handleChange} onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField('')}
                          placeholder="Min. 6 characters" style={inputStyle('password')} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} style={passwordToggleStyle}>
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label style={labelStyle}>Confirm Password *</label>
                      <div style={passwordContainerStyle}>
                        <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword}
                          onChange={handleChange} onFocus={() => setFocusedField('confirmPassword')} onBlur={() => setFocusedField('')}
                          placeholder="Re-enter password" style={inputStyle('confirmPassword')} />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={passwordToggleStyle}>
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <button type="submit" disabled={loading} style={{
                      width: '100%', backgroundColor: loading ? '#a0853a' : '#c9a84c', color: '#0a0a0a',
                      border: 'none', borderRadius: '10px', padding: '16px', fontSize: '16px', fontWeight: '600',
                      letterSpacing: '1px', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease',
                      opacity: loading ? 0.8 : 1,
                    }}>
                      {loading ? 'Sending OTP...' : 'Verify Email'}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <div className="text-center mb-4">
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(201,168,76,0.1)', border: '2px solid #c9a84c', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                      <Mail size={28} color="#c9a84c" />
                    </div>
                    <h1 style={{ color: '#c9a84c', fontSize: '24px', fontWeight: '700', letterSpacing: '2px', marginBottom: '8px' }}>VERIFY YOUR EMAIL</h1>
                    <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>
                      We sent a 6-digit code to<br />
                      <span style={{ color: '#c9a84c', fontWeight: '600' }}>{formData.email}</span>
                    </p>
                  </div>

                  {error && (
                    <div style={{ backgroundColor: 'rgba(220,53,69,0.15)', border: '1px solid rgba(220,53,69,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px' }}>
                      <p style={{ color: '#dc3545', fontSize: '14px', margin: 0 }}>{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleVerifyOtp}>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '24px' }}>
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => (otpRefs.current[index] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          onPaste={handleOtpPaste}
                          onFocus={(e) => { e.target.style.borderColor = '#c9a84c'; }}
                          onBlur={(e) => { e.target.style.borderColor = '#3d3020'; }}
                          style={otpInputStyle}
                        />
                      ))}
                    </div>

                    <button type="submit" disabled={loading} style={{
                      width: '100%', backgroundColor: loading ? '#a0853a' : '#c9a84c', color: '#0a0a0a',
                      border: 'none', borderRadius: '10px', padding: '16px', fontSize: '16px', fontWeight: '600',
                      letterSpacing: '1px', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease',
                      opacity: loading ? 0.8 : 1, marginBottom: '16px',
                    }}>
                      {loading ? 'Verifying...' : 'Create Account'}
                    </button>
                  </form>

                  <div className="text-center">
                    {resendTimer > 0 ? (
                    <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>
                      Resend OTP in <span style={{ color: '#c9a84c', fontWeight: '600' }}>{Math.floor(resendTimer / 60)}:{String(resendTimer % 60).padStart(2, '0')}</span>
                    </p>
                    ) : (
                      <button onClick={handleResendOtp} style={{
                        background: 'none', border: 'none', color: '#c9a84c', fontSize: '14px',
                        fontWeight: '600', cursor: 'pointer', textDecoration: 'underline', padding: 0,
                      }}>
                        Resend OTP
                      </button>
                    )}
                  </div>

                  <div className="text-center mt-4">
                    <button onClick={() => { setStep('form'); setOtp(['', '', '', '', '', '']); setError(''); }} style={{
                      background: 'none', border: 'none', color: '#888', fontSize: '13px',
                      cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px',
                    }}>
                      <ArrowLeft size={14} /> Back to registration
                    </button>
                  </div>
                </>
              )}

              <div className="text-center mt-4">
                <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>
                  Already have an account?{' '}
                  <Link to="/login" style={{ color: '#c9a84c', textDecoration: 'none', fontWeight: '500' }}>Login</Link>
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
