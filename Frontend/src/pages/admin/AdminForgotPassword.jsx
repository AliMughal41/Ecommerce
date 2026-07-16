import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, KeyRound, ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';
import axios from 'axios';
import API_URL from '../../config';

export default function AdminForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const otpRefs = useRef([]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email.'); return; }

    setLoading(true);
    try {
      const config = { headers: { 'Content-Type': 'application/json' }, withCredentials: true };
      await axios.post(`${API_URL}/api/auth/forgot-password`, { email }, config);
      setSuccess('OTP sent! Check your email.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      const newOtp = pasted.split('').concat(Array(6).fill('')).slice(0, 6);
      setOtp(newOtp);
      otpRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    const otpString = otp.join('');
    if (otpString.length !== 6) { setError('Please enter the complete 6-digit OTP.'); return; }

    setLoading(true);
    try {
      const config = { headers: { 'Content-Type': 'application/json' }, withCredentials: true };
      const { data } = await axios.post(`${API_URL}/api/auth/verify-reset-otp`, { email, otp: otpString }, config);
      setResetToken(data.resetToken);
      setSuccess('OTP verified! Create your new password.');
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (!newPassword.trim() || !confirmPassword.trim()) { setError('Please fill in both password fields.'); return; }
    if (newPassword.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      const config = { headers: { 'Content-Type': 'application/json' }, withCredentials: true };
      await axios.post(`${API_URL}/api/auth/reset-password`, { resetToken, newPassword, confirmPassword }, config);
      setSuccess('Password reset successful! Redirecting to login...');
      setTimeout(() => navigate('/admin-login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const stepIndicator = (
    <div className="d-flex justify-content-center align-items-center mb-4" style={{ gap: '8px' }}>
      {[1, 2, 3].map((s) => (
        <React.Fragment key={s}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: 700,
            background: step >= s ? 'rgba(201,168,76,0.15)' : '#1a1a1a',
            border: `1px solid ${step >= s ? '#c9a84c' : '#333'}`,
            color: step >= s ? '#c9a84c' : '#555', transition: 'all 0.3s ease',
          }}>
            {step > s ? '✓' : s}
          </div>
          {s < 3 && (
            <div style={{ width: '40px', height: '2px', background: step > s ? '#c9a84c' : '#333', borderRadius: '2px', transition: 'all 0.3s ease' }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const inputStyle = {
    width: '100%', background: '#1a1410', border: '1px solid #3d3020', borderRadius: '4px',
    color: '#fff', padding: '10px 10px 10px 36px', fontSize: '13px', outline: 'none',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a', color: '#fff', alignItems: 'center', justifyContent: 'center', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ width: '100%', maxWidth: '400px', background: '#0f0c09', border: '1px solid #2a1f10', borderRadius: '8px', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid #c9a84c', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', overflow: 'hidden' }}>
            <img src="/images/logo.png" alt="VELNORA" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, letterSpacing: '1px' }}>
            {step === 1 && 'FORGOT PASSWORD'}
            {step === 2 && 'VERIFY OTP'}
            {step === 3 && 'NEW PASSWORD'}
          </h2>
          <p style={{ fontSize: '13px', color: '#8a7a6a', marginTop: '4px' }}>
            {step === 1 && 'Enter your admin email to receive a reset code'}
            {step === 2 && 'Enter the OTP sent to your email'}
            {step === 3 && 'Create a new password for your admin account'}
          </p>
        </div>

        {stepIndicator}

        {error && (
          <div style={{ background: '#e74c3c20', border: '1px solid #e74c3c50', color: '#e74c3c', padding: '10px 14px', borderRadius: '4px', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {success && step > 1 && (
          <div style={{ background: '#27ae6020', border: '1px solid #27ae6050', color: '#27ae60', padding: '10px 14px', borderRadius: '4px', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>
            {success}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#a09080', marginBottom: '6px' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="admin@velnora.com"
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#c9a84c'}
                  onBlur={(e) => e.target.style.borderColor = '#3d3020'}
                />
              </div>
            </div>
            <button type="submit" disabled={loading}
              style={{ width: '100%', background: '#c9a84c', color: '#0a0a0a', border: 'none', padding: '12px', borderRadius: '4px', fontWeight: 700, fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background 0.2s' }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#d4b050'; }}
              onMouseLeave={(e) => e.currentTarget.style.background = '#c9a84c'}
            >
              {loading ? <><Loader2 size={16} className="spin" /> Sending OTP...</> : <><Mail size={16} /> Send OTP</>}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#a09080', marginBottom: '6px' }}>6-Digit Code</label>
              <div className="d-flex justify-content-between" style={{ gap: '10px' }}>
                {otp.map((digit, index) => (
                  <input key={index} ref={(el) => (otpRefs.current[index] = el)} type="text" inputMode="numeric" maxLength={1}
                    value={digit} onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)} onPaste={handleOtpPaste}
                    style={{
                      background: '#1a1410', border: '1px solid #3d3020', color: '#fff',
                      width: '48px', height: '56px', borderRadius: '4px', fontSize: '22px',
                      fontWeight: 700, textAlign: 'center', outline: 'none',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#c9a84c'}
                    onBlur={(e) => e.target.style.borderColor = '#3d3020'}
                  />
                ))}
              </div>
            </div>
            <button type="submit" disabled={loading}
              style={{ width: '100%', background: '#c9a84c', color: '#0a0a0a', border: 'none', padding: '12px', borderRadius: '4px', fontWeight: 700, fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background 0.2s' }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#d4b050'; }}
              onMouseLeave={(e) => e.currentTarget.style.background = '#c9a84c'}
            >
              {loading ? <><Loader2 size={16} className="spin" /> Verifying...</> : <><ShieldCheck size={16} /> Verify OTP</>}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#a09080', marginBottom: '6px' }}>New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
                <input type={showNew ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password"
                  style={{ ...inputStyle, paddingRight: '36px' }}
                  onFocus={(e) => e.target.style.borderColor = '#c9a84c'}
                  onBlur={(e) => e.target.style.borderColor = '#3d3020'}
                />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                  {showNew ? <EyeOff size={16} color="#555" /> : <Eye size={16} color="#555" />}
                </button>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#a09080', marginBottom: '6px' }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
                <input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password"
                  style={{ ...inputStyle, paddingRight: '36px' }}
                  onFocus={(e) => e.target.style.borderColor = '#c9a84c'}
                  onBlur={(e) => e.target.style.borderColor = '#3d3020'}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                  {showConfirm ? <EyeOff size={16} color="#555" /> : <Eye size={16} color="#555" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              style={{ width: '100%', background: '#c9a84c', color: '#0a0a0a', border: 'none', padding: '12px', borderRadius: '4px', fontWeight: 700, fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background 0.2s' }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#d4b050'; }}
              onMouseLeave={(e) => e.currentTarget.style.background = '#c9a84c'}
            >
              {loading ? <><Loader2 size={16} className="spin" /> Resetting...</> : <><KeyRound size={16} /> Reset Password</>}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #1a1410' }}>
          <button onClick={() => navigate('/admin-login')}
            style={{ background: 'transparent', border: 'none', color: '#c9a84c', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <ArrowLeft size={14} /> Back to Login
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}
