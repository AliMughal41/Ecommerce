import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, KeyRound, ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useAlert } from '../context/AlertContext';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { forgotPassword, verifyResetOtp, resetPassword, customer } = useCustomerAuth();
  const { showAlert } = useAlert();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const otpRefs = useRef([]);

  useEffect(() => {
    if (customer) {
      navigate('/');
    }
  }, [customer, navigate]);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      showAlert({ type: 'success', message: 'OTP sent successfully! Check your email.' });
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

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
      const focusIndex = Math.min(pasted.length, 5);
      otpRefs.current[focusIndex]?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP.');
      return;
    }

    setLoading(true);
    try {
      const data = await verifyResetOtp(email, otpString);
      setResetToken(data.resetToken || data.token);
      showAlert({ type: 'success', message: 'OTP verified! Create your new password.' });
      setStep(3);
    } catch (err) {
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError('Please fill in both password fields.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(resetToken, newPassword, confirmPassword);
      showAlert({ type: 'success', message: 'Password reset successful! Redirecting to login...' });
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const stepIndicator = (
    <div className="d-flex justify-content-center align-items-center mb-4" style={{ gap: '8px' }}>
      {[1, 2, 3].map((s) => (
        <React.Fragment key={s}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 700,
              background: step >= s ? 'rgba(201,168,76,0.15)' : '#1a1a1a',
              border: `1px solid ${step >= s ? '#c9a84c' : '#333'}`,
              color: step >= s ? '#c9a84c' : '#555',
              transition: 'all 0.3s ease',
            }}
          >
            {step > s ? '✓' : s}
          </div>
          {s < 3 && (
            <div
              style={{
                width: '40px',
                height: '2px',
                background: step > s ? '#c9a84c' : '#333',
                borderRadius: '2px',
                transition: 'all 0.3s ease',
              }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

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
                  {step === 1 && <Mail size={28} color="#c9a84c" />}
                  {step === 2 && <ShieldCheck size={28} color="#c9a84c" />}
                  {step === 3 && <KeyRound size={28} color="#c9a84c" />}
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
                  {step === 1 && 'FORGOT PASSWORD'}
                  {step === 2 && 'VERIFY OTP'}
                  {step === 3 && 'NEW PASSWORD'}
                </h2>
                <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>
                  {step === 1 && 'Enter your email to receive a reset code'}
                  {step === 2 && 'Enter the OTP sent to your email'}
                  {step === 3 && 'Create a new password for your account'}
                </p>
              </div>

              {stepIndicator}

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

              {step === 1 && (
                <form onSubmit={handleSendOtp}>
                  <div className="mb-4">
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
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        <Mail size={18} />
                        Send OTP
                      </>
                    )}
                  </button>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleVerifyOtp}>
                  <div className="mb-4">
                    <label
                      style={{ color: '#aaa', fontSize: '13px', marginBottom: '12px', display: 'block' }}
                    >
                      6-Digit Code
                    </label>
                    <div
                      className="d-flex justify-content-between"
                      style={{ gap: '10px' }}
                    >
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
                          disabled={loading}
                          style={{
                            background: '#111',
                            border: '1px solid #333',
                            color: '#eee',
                            width: '48px',
                            height: '56px',
                            borderRadius: '10px',
                            fontSize: '22px',
                            fontWeight: 700,
                            textAlign: 'center',
                            outline: 'none',
                            transition: 'border-color 0.3s ease',
                          }}
                          onFocus={(e) => (e.target.style.borderColor = '#c9a84c')}
                          onBlur={(e) => (e.target.style.borderColor = '#333')}
                        />
                      ))}
                    </div>
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
                        Verifying...
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={18} />
                        Verify OTP
                      </>
                    )}
                  </button>
                </form>
              )}

              {step === 3 && (
                <form onSubmit={handleResetPassword}>
                  <div className="mb-3">
                    <label
                      style={{ color: '#aaa', fontSize: '13px', marginBottom: '6px', display: 'block' }}
                    >
                      New Password
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
                        type={showNewPassword ? 'text' : 'password'}
                        className="form-control"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
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
                        onClick={() => setShowNewPassword(!showNewPassword)}
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
                        {showNewPassword ? (
                          <EyeOff size={18} color="#666" />
                        ) : (
                          <Eye size={18} color="#666" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label
                      style={{ color: '#aaa', fontSize: '13px', marginBottom: '6px', display: 'block' }}
                    >
                      Confirm Password
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
                        type={showConfirmPassword ? 'text' : 'password'}
                        className="form-control"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
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
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                        {showConfirmPassword ? (
                          <EyeOff size={18} color="#666" />
                        ) : (
                          <Eye size={18} color="#666" />
                        )}
                      </button>
                    </div>
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
                        Resetting Password...
                      </>
                    ) : (
                      <>
                        <KeyRound size={18} />
                        Reset Password
                      </>
                    )}
                  </button>
                </form>
              )}

              <div className="text-center mt-4">
                <Link
                  to="/login"
                  style={{
                    color: '#c9a84c',
                    fontSize: '14px',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                  onMouseEnter={(e) => (e.target.style.textDecoration = 'underline')}
                  onMouseLeave={(e) => (e.target.style.textDecoration = 'none')}
                >
                  <ArrowLeft size={16} />
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
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

export default ForgotPassword;
