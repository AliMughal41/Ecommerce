import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Package, Search, Clock, CheckCircle, Truck, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import API_URL from '../config';

const TrackOrder = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const getStatusIcon = (status) => {
    const s = status.toLowerCase();
    if (s.includes('delivered')) return <CheckCircle size={18} />;
    if (s.includes('shipped') || s.includes('transit')) return <Truck size={18} />;
    if (s.includes('processing') || s.includes('confirmed')) return <Package size={18} />;
    return <Clock size={18} />;
  };

  const getStatusColor = (status) => {
    const s = status.toLowerCase();
    if (s.includes('delivered')) return '#4caf50';
    if (s.includes('cancelled') || s.includes('failed')) return '#f44336';
    return '#c9a84c';
  };

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;

    setLoading(true);
    setResult(null);
    setNotFound(false);

    try {
      const params = { orderNumber: orderNumber.trim() };
      if (email.trim()) params.email = email.trim();

      const res = await axios.get(`${API_URL}/api/customer-orders/track`, { params });
      setResult(res.data.order || res.data);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setNotFound(true);
      } else {
        setNotFound(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#e0e0e0' }}>
      <Navbar />

      <main
        style={{
          padding: '130px 20px 60px',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div style={{ width: '100%', maxWidth: '600px' }}>
          <div
            style={{
              textAlign: 'center',
              marginBottom: '30px',
            }}
          >
            <Package size={40} color="#c9a84c" style={{ marginBottom: '12px' }} />
            <h1
              style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#c9a84c',
                letterSpacing: '2px',
                margin: 0,
              }}
            >
              TRACK YOUR ORDER
            </h1>
          </div>

          <div
            style={{
              background: 'rgba(15,15,15,0.95)',
              border: '1px solid #3d3020',
              borderRadius: '12px',
              padding: '30px',
            }}
          >
            <form onSubmit={handleTrack}>
              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    color: '#999',
                    marginBottom: '6px',
                    letterSpacing: '0.5px',
                  }}
                >
                  Order Number *
                </label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="e.g. ORD-12345"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: '#111',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#c9a84c')}
                  onBlur={(e) => (e.target.style.borderColor = '#333')}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    color: '#999',
                    marginBottom: '6px',
                    letterSpacing: '0.5px',
                  }}
                >
                  Email <span style={{ color: '#666' }}>(optional)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="For additional verification"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: '#111',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#c9a84c')}
                  onBlur={(e) => (e.target.style.borderColor = '#333')}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !orderNumber.trim()}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: loading || !orderNumber.trim() ? '#6b5a2e' : '#c9a84c',
                  color: loading || !orderNumber.trim() ? '#aaa' : '#0a0a0a',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 700,
                  cursor: loading || !orderNumber.trim() ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  letterSpacing: '1px',
                  transition: 'background 0.2s, color 0.2s',
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    Tracking...
                  </>
                ) : (
                  <>
                    <Search size={18} />
                    TRACK ORDER
                  </>
                )}
              </button>
            </form>
          </div>

          {loading && (
            <div
              style={{
                textAlign: 'center',
                padding: '40px',
                color: '#999',
              }}
            >
              <Loader2
                size={32}
                color="#c9a84c"
                style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }}
              />
              <p>Searching for your order...</p>
            </div>
          )}

          {!loading && notFound && (
            <div
              style={{
                background: 'rgba(15,15,15,0.95)',
                border: '1px solid #3d3020',
                borderRadius: '12px',
                padding: '40px 30px',
                textAlign: 'center',
                marginTop: '24px',
              }}
            >
              <AlertCircle size={40} color="#f44336" style={{ marginBottom: '12px' }} />
              <h3 style={{ color: '#f44336', fontSize: '18px', margin: '0 0 8px' }}>
                Order Not Found
              </h3>
              <p style={{ color: '#777', fontSize: '14px', margin: 0 }}>
                No order matches the information provided. Please check and try again.
              </p>
            </div>
          )}

          {!loading && !result && !notFound && (
            <div
              style={{
                textAlign: 'center',
                padding: '50px 30px',
                color: '#555',
              }}
            >
              <Package size={48} style={{ marginBottom: '16px', opacity: 0.4 }} />
              <p style={{ fontSize: '16px', margin: 0 }}>
                Enter your order number to track
              </p>
            </div>
          )}

          {!loading && result && (
            <div
              style={{
                background: 'rgba(15,15,15,0.95)',
                border: '1px solid #3d3020',
                borderRadius: '12px',
                padding: '30px',
                marginTop: '24px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '24px',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <p style={{ color: '#777', fontSize: '12px', margin: '0 0 4px', letterSpacing: '1px' }}>
                    ORDER NUMBER
                  </p>
                  <p style={{ color: '#c9a84c', fontSize: '20px', fontWeight: 700, margin: 0 }}>
                    {result.orderNumber}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: '#777', fontSize: '12px', margin: '0 0 4px', letterSpacing: '1px' }}>
                    STATUS
                  </p>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: 600,
                      background: `${getStatusColor(result.currentStatus || result.status)}15`,
                      color: getStatusColor(result.currentStatus || result.status),
                      border: `1px solid ${getStatusColor(result.currentStatus || result.status)}30`,
                    }}
                  >
                    {getStatusIcon(result.currentStatus || result.status)}
                    {getStatusLabel(result.currentStatus || result.status)}
                  </span>
                </div>
              </div>

              {result.total != null && (
                <div
                  style={{
                    padding: '14px 16px',
                    background: '#111',
                    borderRadius: '8px',
                    marginBottom: '24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ color: '#999', fontSize: '14px' }}>Total Amount</span>
                  <span style={{ color: '#c9a84c', fontSize: '18px', fontWeight: 700 }}>
                    ${Number(result.total).toFixed(2)}
                  </span>
                </div>
              )}

              {result.statusHistory && result.statusHistory.length > 0 && (
                <div>
                  <h3
                    style={{
                      color: '#999',
                      fontSize: '12px',
                      letterSpacing: '1px',
                      margin: '0 0 20px',
                    }}
                  >
                    TRACKING TIMELINE
                  </h3>

                  <div style={{ position: 'relative', paddingLeft: '28px' }}>
                    <div
                      style={{
                        position: 'absolute',
                        left: '8px',
                        top: '6px',
                        bottom: '6px',
                        width: '2px',
                        background: '#333',
                      }}
                    />

                    {result.statusHistory.map((entry, index) => {
                      const isLast = index === result.statusHistory.length - 1;
                      const color = getStatusColor(entry.status);

                      return (
                        <div
                          key={index}
                          style={{
                            position: 'relative',
                            marginBottom: index < result.statusHistory.length - 1 ? '24px' : '0',
                          }}
                        >
                          <div
                            style={{
                              position: 'absolute',
                              left: '-24px',
                              top: '2px',
                              width: '14px',
                              height: '14px',
                              borderRadius: '50%',
                              background: isLast ? color : '#222',
                              border: `2px solid ${color}`,
                              zIndex: 1,
                            }}
                          />

                          <div>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '4px',
                              }}
                            >
                              <span
                                style={{
                                  color: isLast ? '#fff' : '#bbb',
                                  fontSize: '14px',
                                  fontWeight: isLast ? 600 : 400,
                                }}
                              >
                                {getStatusLabel(entry.status)}
                              </span>
                              {isLast && (
                                <span
                                  style={{
                                    fontSize: '10px',
                                    background: `${color}20`,
                                    color: color,
                                    padding: '2px 8px',
                                    borderRadius: '10px',
                                    fontWeight: 600,
                                  }}
                                >
                                  CURRENT
                                </span>
                              )}
                            </div>
                            <p
                              style={{
                                color: '#666',
                                fontSize: '12px',
                                margin: 0,
                              }}
                            >
                              {entry.timestamp
                                ? new Date(entry.timestamp).toLocaleString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : ''}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default TrackOrder;
