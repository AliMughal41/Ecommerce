import React, { useState } from 'react';
import axios from 'axios';
import { Mail } from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import API_URL from '../config';

export default function SubscribeSection({ title, subtitle, buttonText = 'SUBSCRIBE' }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { showAlert } = useAlert();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      showAlert({ type: 'warning', message: 'Please enter your email address.' });
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post(`${API_URL}/api/subscribers/subscribe`, { email: trimmedEmail });
      showAlert({ type: 'success', message: data.message || 'Subscribed successfully.' });
      setEmail('');
    } catch (error) {
      const message = error.response?.data?.message || 'Unable to subscribe right now. Please try again later.';
      showAlert({ type: 'error', message });
      console.error('Subscribe error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-5 subscribe-section" style={{ background: 'linear-gradient(90deg, #181208 0%, #2f2210 50%, #181208 100%)', borderBottom: '1px solid #2a1f10' }}>
      <div className="container-fluid px-3 px-md-5">
        <div className="row align-items-center justify-content-between g-4">
          <div className="col-lg-6 d-flex align-items-center gap-4">
            <div className="d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: '72px', height: '72px', borderRadius: '50%', border: '1px solid #b89456' }}>
              <Mail size={32} color="#b89456" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-white fw-bold mb-1" style={{ fontFamily: "'Playfair Display','Times New Roman',serif", fontSize: 'clamp(18px, 3vw, 24px)', letterSpacing: '1px' }}>
                {title}
              </h2>
              <p className="mb-0" style={{ color: '#d1c7bc', fontSize: '14px', lineHeight: 1.6 }}>
                {subtitle}
              </p>
            </div>
          </div>
          <div className="col-lg-5">
            <form onSubmit={handleSubmit} className="d-flex" style={{ border: '1px solid #3d3020', borderRadius: '4px', overflow: 'hidden' }}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control bg-transparent text-white border-0 flex-grow-1"
                style={{ fontSize: '14px', outline: 'none', boxShadow: 'none', padding: '13px 16px', borderRadius: 0 }}
              />
              <button
                type="submit"
                disabled={loading}
                className="btn fw-bold text-dark flex-shrink-0 text-uppercase"
                style={{ background: '#b89456', borderRadius: 0, fontSize: '13px', letterSpacing: '1px', padding: '0 24px', whiteSpace: 'nowrap', transition: 'background 0.2s' }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#d4a843'; }}
                onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#b89456'; }}
              >
                {loading ? 'SUBMITTING...' : buttonText}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
