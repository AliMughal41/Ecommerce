import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ size = 32, text = '', fullPage = false, style = {} }) {
  if (fullPage) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', gap: '12px', ...style }}>
        <Loader2 size={size} color="#c9a84c" style={{ animation: 'spin 1s linear infinite' }} />
        {text && <p style={{ color: '#8a7a6a', fontSize: '13px', margin: 0 }}>{text}</p>}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '20px', ...style }}>
      <Loader2 size={size} color="#c9a84c" style={{ animation: 'spin 1s linear infinite' }} />
      {text && <span style={{ color: '#8a7a6a', fontSize: '13px' }}>{text}</span>}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div style={{ background: '#141010', border: '1px solid #2a1f10', borderRadius: '4px' }}>
      <div style={{ height: '220px', background: 'linear-gradient(90deg, #1a1410 25%, #1f1812 50%, #1a1410 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: '4px 4px 0 0' }} />
      <div style={{ padding: '16px' }}>
        <div style={{ height: '14px', background: '#1a1410', borderRadius: '3px', marginBottom: '8px', width: '70%' }} />
        <div style={{ height: '12px', background: '#1a1410', borderRadius: '3px', marginBottom: '12px', width: '50%' }} />
        <div style={{ height: '30px', background: '#1a1410', borderRadius: '3px' }} />
      </div>
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
    </div>
  );
}

export function SkeletonRow({ count = 5 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <tr key={i} style={{ borderBottom: '1px solid #1a1410' }}>
          <td colSpan="100%" style={{ padding: '12px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '4px', background: '#1a1410', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ height: '12px', background: '#1a1410', borderRadius: '3px', marginBottom: '6px', width: '60%' }} />
                <div style={{ height: '10px', background: '#1a1410', borderRadius: '3px', width: '40%' }} />
              </div>
            </div>
          </td>
        </tr>
      ))}
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
    </>
  );
}
