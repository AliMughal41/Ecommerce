import React, { createContext, useContext, useState, useCallback } from 'react';

const AlertContext = createContext({
  showAlert: () => {},
  removeAlert: () => {},
});

export const useAlert = () => useContext(AlertContext);

export default function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);

  const showAlert = useCallback(({ type = 'info', message = '', duration = 3500 }) => {
    const id = Date.now() + Math.random();
    setAlerts(prev => [...prev, { id, type, message }]);
    if (duration > 0) {
      setTimeout(() => {
        setAlerts(prev => prev.filter(a => a.id !== id));
      }, duration);
    }
  }, []);

  const removeAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, removeAlert }}>
      {children}
      {/* Alert Container */}
      <div style={{
        position: 'fixed',
        top: '90px',
        right: '20px',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '420px',
        width: 'calc(100vw - 40px)',
      }}>
        {alerts.map(alert => (
          <AlertItem key={alert.id} alert={alert} onRemove={removeAlert} />
        ))}
      </div>
    </AlertContext.Provider>
  );
}

function AlertItem({ alert, onRemove }) {
  const { id, type, message } = alert;

  const config = {
    success: {
      bg: 'linear-gradient(135deg, #0d260d 0%, #1a3a1a 100%)',
      border: '#4caf50',
      icon: '✓',
      iconBg: '#4caf50',
    },
    error: {
      bg: 'linear-gradient(135deg, #2d0d0d 0%, #3a1a1a 100%)',
      border: '#ef4444',
      icon: '✕',
      iconBg: '#ef4444',
    },
    warning: {
      bg: 'linear-gradient(135deg, #2d240d 0%, #3a2e1a 100%)',
      border: '#f59e0b',
      icon: '!',
      iconBg: '#f59e0b',
    },
    info: {
      bg: 'linear-gradient(135deg, #0d1a2d 0%, #1a2a3a 100%)',
      border: '#3b82f6',
      icon: 'i',
      iconBg: '#3b82f6',
    },
  };

  const c = config[type] || config.info;

  return (
    <div
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: '12px',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)`,
        animation: 'alertSlideIn 0.35s cubic-bezier(0.16,1,0.3,1)',
        cursor: 'pointer',
      }}
      onClick={() => onRemove(id)}
    >
      {/* Icon Circle */}
      <div style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: c.iconBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontSize: type === 'info' ? '14px' : '14px',
        fontWeight: 700,
        color: '#fff',
      }}>
        {c.icon}
      </div>

      {/* Message */}
      <div style={{ flex: 1 }}>
        <div style={{
          color: '#ffffff',
          fontSize: '14px',
          fontWeight: 500,
          lineHeight: 1.4,
          letterSpacing: '0.2px',
        }}>
          {message}
        </div>
      </div>

      {/* Close */}
      <div style={{
        color: 'rgba(255,255,255,0.4)',
        fontSize: '18px',
        cursor: 'pointer',
        padding: '4px',
        lineHeight: 1,
        flexShrink: 0,
      }}
        onClick={(e) => { e.stopPropagation(); onRemove(id); }}
      >
        ×
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes alertSlideIn {
          from { opacity: 0; transform: translateX(40px) scale(0.95); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
