import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, Tag, Layers, ShoppingCart, Users,
  Star, UserCog, LogOut, X, ChevronRight, BarChart3, RotateCcw, PlusCircle, PackageCheck
} from 'lucide-react';

const SIDEBAR_WIDTH = 260;

const sidebarLinks = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin-dashboard' },
  { icon: Package, label: 'Products', path: '/adminproducts' },
  { icon: Tag, label: 'Categories', path: '/admin-categories' },
  { icon: Layers, label: 'Super Categories', path: '/admin-super-categories' },
  { icon: ShoppingCart, label: 'Orders', path: '/admin-orders' },
  { icon: Users, label: 'Customers', path: '/admin-customers' },
  { icon: RotateCcw, label: 'Returns', path: '/admin-returns' },
  { icon: PackageCheck, label: 'Delivered Orders', path: '/admin-delivered-orders' },
  { icon: Star, label: 'Reviews', path: '/admin-reviews' },
  { icon: BarChart3, label: 'Reports & Analytics', path: '/admin-reports' },
  { icon: UserCog, label: 'Admin Profile', path: '/admin-profile' },
];

export default function AdminSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin-secret-login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Global CSS for admin layout */}
      <style>{`
        .admin-main-content {
          margin-left: ${SIDEBAR_WIDTH}px;
        }
        .admin-hamburger {
          display: none !important;
        }
        .admin-sidebar-overlay {
          display: none !important;
        }
        .admin-sidebar-close {
          display: none !important;
        }
        .admin-sidebar {
          transform: ${isOpen ? 'translateX(0)' : 'translateX(-100%)'};
        }

        @media (max-width: 768px) {
          .admin-main-content {
            margin-left: 0 !important;
          }
          .admin-hamburger {
            display: flex !important;
          }
          .admin-sidebar-overlay {
            display: block !important;
          }
          .admin-sidebar-close {
            display: flex !important;
          }
          .admin-sidebar {
            transform: ${isOpen ? 'translateX(0)' : 'translateX(-100%)'};
          }
        }
        @media (min-width: 769px) {
          .admin-sidebar {
            transform: translateX(0) !important;
          }
          .admin-sidebar-overlay {
            display: none !important;
          }
          .admin-sidebar-close {
            display: none !important;
          }
        }
      `}</style>

      {/* Overlay for mobile — only rendered when isOpen */}
      {isOpen && (
        <div
          onClick={onClose}
          className="admin-sidebar-overlay"
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            zIndex: 1040,
          }}
        />
      )}

      {/* Sidebar */}
      <div
        className="admin-sidebar"
        style={{
          position: 'fixed',
          top: 0, left: 0, bottom: 0,
          width: `${SIDEBAR_WIDTH}px`,
          height: '100vh',
          background: '#0d0a06',
          borderRight: '1px solid #2a1f10',
          overflow: 'hidden',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1050,
          transition: 'transform 0.3s ease',
        }}
      >
        {/* Logo */}
        <div style={{ padding: '28px 20px 20px', borderBottom: '1px solid #2a1f10', textAlign: 'center', position: 'relative' }}>
          <button
            onClick={onClose}
            className="admin-sidebar-close"
            style={{
              position: 'absolute', top: '12px', right: '12px',
              background: 'none', border: 'none', color: '#8a7a6a', cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={18} />
          </button>
          <div style={{ width: '50px', height: '50px', borderRadius: '50%', border: '2px solid #c9a84c', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <img src="/images/logo.png" alt="VELNORA" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div style={{ fontWeight: 800, fontSize: '16px', letterSpacing: '3px', color: '#fff' }}>VELNORA</div>
          <div style={{ fontSize: '9px', color: '#8a7a6a', letterSpacing: '1.5px', marginTop: '2px' }}>ADMIN PANEL</div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
          {sidebarLinks.map(({ icon: Icon, label, path }) => {
            const active = isActive(path);
            return (
              <div
                key={path}
                onClick={() => handleNav(path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 20px', margin: '2px 8px', borderRadius: '6px',
                  cursor: 'pointer', transition: 'all 0.2s',
                  background: active ? 'rgba(201,168,76,0.12)' : 'transparent',
                  borderLeft: active ? '3px solid #c9a84c' : '3px solid transparent',
                  color: active ? '#c9a84c' : '#8a7a6a',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon size={18} strokeWidth={active ? 2 : 1.5} />
                <span style={{ fontSize: '13px', fontWeight: active ? 600 : 500, letterSpacing: '0.5px', flex: 1 }}>{label}</span>
                {active && <ChevronRight size={14} style={{ color: '#c9a84c', opacity: 0.5 }} />}
              </div>
            );
          })}

          <div style={{ height: '1px', background: '#2a1f10', margin: '12px 20px' }} />

          <div
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 20px', margin: '2px 8px', borderRadius: '6px',
              cursor: 'pointer', transition: 'all 0.2s',
              color: '#8a7a6a',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(231,76,60,0.08)'; e.currentTarget.style.color = '#e74c3c'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8a7a6a'; }}
          >
            <LogOut size={18} strokeWidth={1.5} />
            <span style={{ fontSize: '13px', fontWeight: 500, letterSpacing: '0.5px' }}>Logout</span>
          </div>
        </nav>

        {/* Footer */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid #2a1f10', fontSize: '10px', color: '#555', textAlign: 'center', letterSpacing: '0.5px' }}>
          &copy; 2025 Velnora. All Rights Reserved.
        </div>
      </div>
    </>
  );
}
