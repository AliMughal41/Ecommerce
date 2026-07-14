import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import API_URL from '../../config';

export default function AdminVerifyOtp() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  // Redirect if no email in state
  useEffect(() => {
    if (!email) navigate('/admin-register');
  }, [email, navigate]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleInput = (e, index) => {
    const val = e.target.value.replace(/\D/g, ''); // digits only
    if (!val) return;
    const newOtp = [...otp];
    newOtp[index] = val[val.length - 1]; // take last digit if multiple pasted
    setOtp(newOtp);
    // Move to next box
    if (index < 5 && val) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];
      if (otp[index]) {
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    pasted.split('').forEach((char, i) => { newOtp[i] = char; });
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length < 6) return setError('Please enter all 6 digits.');
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/api/auth/verify-otp`, { email, otp: otpString });
      if (data.success) {
        setSuccess('Email verified! Redirecting to login...');
        setTimeout(() => navigate('/admin-secret-login'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    try {
      await axios.post(`${API_URL}/api/auth/register`, { email, resend: true });
      setCountdown(60); // 60 seconds cooldown
    } catch (err) {
      setError('Could not resend OTP. Please try registering again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={{
      display: 'flex', minHeight: '100vh', background: '#0a0a0a', color: '#fff',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Segoe UI', system-ui, sans-serif", padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: '420px', background: '#0f0c09', border: '1px solid #2a1f10', borderRadius: '8px', padding: '36px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '50%', border: '2px solid #c9a84c',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px', background: 'rgba(201,168,76,0.08)'
          }}>
            <MailCheck size={22} style={{ color: '#c9a84c' }} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px', letterSpacing: '1px' }}>VERIFY YOUR EMAIL</h2>
          <p style={{ fontSize: '13px', color: '#8a7a6a', margin: 0, lineHeight: 1.6 }}>
            We sent a 6-digit OTP to<br />
            <strong style={{ color: '#c9a84c' }}>{email}</strong>
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: '#2e1a1a', border: '1px solid #e74c3c', borderRadius: '4px', padding: '10px 14px', marginBottom: '20px', fontSize: '13px', color: '#ff6b6b' }}>
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div style={{ background: '#1a2e1a', border: '1px solid #4caf50', borderRadius: '4px', padding: '10px 14px', marginBottom: '20px', fontSize: '13px', color: '#66bb6a' }}>
            ✓ {success}
          </div>
        )}

        {/* OTP Boxes */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '28px' }} onPaste={handlePaste}>
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={el => inputRefs.current[idx] = el}
              type="text" inputMode="numeric" maxLength={1}
              value={digit}
              onChange={e => handleInput(e, idx)}
              onKeyDown={e => handleKeyDown(e, idx)}
              style={{
                width: '48px', height: '56px', textAlign: 'center',
                fontSize: '22px', fontWeight: 700, fontFamily: 'monospace',
                background: digit ? '#1a1410' : '#141010',
                border: `2px solid ${digit ? '#c9a84c' : '#3d3020'}`,
                borderRadius: '6px', color: '#c9a84c', outline: 'none',
                transition: 'border-color 0.2s, background 0.2s',
              }}
              onFocus={e => { e.target.style.borderColor = '#c9a84c'; e.target.style.boxShadow = '0 0 0 2px rgba(201,168,76,0.15)'; }}
              onBlur={e => { e.target.style.borderColor = digit ? '#c9a84c' : '#3d3020'; e.target.style.boxShadow = 'none'; }}
            />
          ))}
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerify} disabled={loading || !!success}
          style={{
            width: '100%', background: loading ? '#a08030' : '#c9a84c', color: '#0a0a0a',
            border: 'none', padding: '13px', borderRadius: '4px', fontWeight: 700,
            fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer',
            letterSpacing: '1px', marginBottom: '16px', transition: 'background 0.2s'
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#d4b050'; }}
          onMouseLeave={e => e.currentTarget.style.background = loading ? '#a08030' : '#c9a84c'}
        >
          {loading ? 'VERIFYING...' : 'VERIFY OTP'}
        </button>

        {/* Resend */}
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '13px', color: '#6a5a4a' }}>Didn't receive the code? </span>
          {countdown > 0 ? (
            <span style={{ fontSize: '13px', color: '#8a7a6a' }}>Resend in {countdown}s</span>
          ) : (
            <button onClick={handleResend} disabled={resending}
              style={{ background: 'transparent', border: 'none', color: '#c9a84c', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              {resending ? 'Sending...' : 'RESEND OTP'}
            </button>
          )}
        </div>

        {/* Back link */}
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button onClick={() => navigate('/admin-register')}
            style={{ background: 'transparent', border: 'none', color: '#6a5a4a', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}>
            ← Back to registration
          </button>
        </div>

      </div>
    </div>
  );
}
