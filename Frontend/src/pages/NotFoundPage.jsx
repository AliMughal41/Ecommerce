import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: '100vh', background: '#0a0a0a',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Inter', sans-serif", padding: '20px', textAlign: 'center'
        }}>
            {/* 404 Number */}
            <div style={{
                fontSize: 'clamp(80px, 15vw, 160px)', fontWeight: 900,
                background: 'linear-gradient(135deg, #c9a84c 0%, #8a6a2a 50%, #c9a84c 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                lineHeight: 1, marginBottom: '12px', letterSpacing: '-4px',
                filter: 'drop-shadow(0 0 40px rgba(201,168,76,0.15))'
            }}>
                404
            </div>

            {/* Divider */}
            <div style={{
                width: '80px', height: '2px',
                background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)',
                marginBottom: '24px'
            }} />

            {/* Title */}
            <h1 style={{
                fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 700,
                color: '#fff', margin: '0 0 10px', letterSpacing: '1px'
            }}>
                Page Not Found
            </h1>

            {/* Description */}
            <p style={{
                fontSize: '14px', color: '#8a7a6a', maxWidth: '400px',
                lineHeight: 1.7, margin: '0 0 36px'
            }}>
                The page you're looking for doesn't exist or has been moved. Let's get you back on track.
            </p>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        padding: '12px 24px', background: 'transparent',
                        border: '1px solid #3d3020', color: '#fff', borderRadius: '6px',
                        cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: '8px',
                        transition: 'all 0.2s', letterSpacing: '0.5px'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#c9a84c'; e.currentTarget.style.color = '#c9a84c'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#3d3020'; e.currentTarget.style.color = '#fff'; }}
                >
                    <ArrowLeft size={16} />
                    Go Back
                </button>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        padding: '12px 24px', background: '#c9a84c',
                        border: 'none', color: '#0a0a0a', borderRadius: '6px',
                        cursor: 'pointer', fontSize: '13px', fontWeight: 700,
                        display: 'flex', alignItems: 'center', gap: '8px',
                        transition: 'all 0.2s', letterSpacing: '0.5px'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#d4b756'}
                    onMouseLeave={e => e.currentTarget.style.background = '#c9a84c'}
                >
                    <Home size={16} />
                    Back to Home
                </button>
            </div>

            {/* Footer text */}
            <p style={{
                fontSize: '11px', color: '#5a4a3a', marginTop: '60px',
                letterSpacing: '2px', textTransform: 'uppercase'
            }}>
                VELNORA &mdash; Premium Collections
            </p>
        </div>
    );
}
