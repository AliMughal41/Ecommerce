import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Package,
  MapPin,
  Lock,
  LogOut,
  ShoppingBag,
  CreditCard,
  ChevronRight,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCustomerAuth } from '../context/CustomerAuthContext';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/account' },
  { label: 'My Profile', icon: User, path: '/account/profile' },
  { label: 'My Orders', icon: Package, path: '/account/orders' },
  { label: 'Saved Addresses', icon: MapPin, path: '/account/addresses' },
  { label: 'Change Password', icon: Lock, path: '/account/change-password' },
];

const quickActions = [
  {
    label: 'Browse Products',
    icon: ShoppingBag,
    path: '/products',
    color: '#c9a84c',
  },
  {
    label: 'View Orders',
    icon: Package,
    path: '/account/orders',
    color: '#c9a84c',
  },
  {
    label: 'Payment Methods',
    icon: CreditCard,
    path: '/account/profile',
    color: '#c9a84c',
  },
  {
    label: 'Addresses',
    icon: MapPin,
    path: '/account/addresses',
    color: '#c9a84c',
  },
];

const Sidebar = ({ customer, isActive, onLogout }) => {
  const navigate = useNavigate();

  return (
    <div
      className="admin-sidebar"
      style={{
        background: 'rgba(15,15,15,0.95)',
        border: '1px solid #3d3020',
        borderRadius: '12px',
        padding: '20px',
        position: 'sticky',
        top: '130px',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          paddingBottom: '20px',
          marginBottom: '20px',
          borderBottom: '1px solid rgba(201,168,76,0.15)',
        }}
      >
        <div
          style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            background: 'rgba(201,168,76,0.12)',
            border: '2px solid #c9a84c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
          }}
        >
          <User size={32} color="#c9a84c" />
        </div>
        <h5
          style={{
            color: '#c9a84c',
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '1.1rem',
            fontWeight: 600,
            margin: 0,
          }}
        >
          {customer?.name || 'My Account'}
        </h5>
        <small style={{ color: '#888', fontSize: '0.78rem' }}>
          {customer?.email || ''}
        </small>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: active ? '#c9a84c' : '#ccc',
                background: active
                  ? 'rgba(201,168,76,0.1)'
                  : 'transparent',
                transition: 'all 0.2s ease',
                fontSize: '0.92rem',
                fontWeight: active ? 600 : 400,
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background =
                    'rgba(201,168,76,0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <Icon size={18} />
              <span className="sidebar-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div
        style={{
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid rgba(201,168,76,0.15)',
        }}
      >
        <button
          onClick={onLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 16px',
            borderRadius: '8px',
            border: 'none',
            background: 'transparent',
            color: '#ef4444',
            fontSize: '0.92rem',
            fontWeight: 500,
            cursor: 'pointer',
            width: '100%',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <LogOut size={18} />
          <span className="sidebar-label">Logout</span>
        </button>
      </div>
    </div>
  );
};

const DashboardView = ({ customer }) => {
  return (
    <div>
      <div
        style={{
          background: 'rgba(15,15,15,0.95)',
          border: '1px solid #3d3020',
          borderRadius: '12px',
          padding: '32px',
          marginBottom: '24px',
        }}
      >
        <h3
          style={{
            color: '#c9a84c',
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 600,
            fontSize: '1.6rem',
            marginBottom: '8px',
          }}
        >
          Welcome back, {customer?.name || 'Customer'}!
        </h3>
        <p style={{ color: '#aaa', margin: 0, fontSize: '0.92rem' }}>
          Manage your orders, profile, and account settings from this
          dashboard.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            background: 'rgba(15,15,15,0.95)',
            border: '1px solid #3d3020',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <Package size={28} color="#c9a84c" style={{ marginBottom: '10px' }} />
          <h5
            style={{
              color: '#fff',
              fontSize: '1.5rem',
              fontWeight: 700,
              margin: '0 0 4px',
            }}
          >
            {customer?.totalOrders ?? 0}
          </h5>
          <small style={{ color: '#888', fontSize: '0.82rem' }}>
            Total Orders
          </small>
        </div>
        <div
          style={{
            background: 'rgba(15,15,15,0.95)',
            border: '1px solid #3d3020',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <MapPin size={28} color="#c9a84c" style={{ marginBottom: '10px' }} />
          <h5
            style={{
              color: '#fff',
              fontSize: '1.5rem',
              fontWeight: 700,
              margin: '0 0 4px',
            }}
          >
            {customer?.addresses?.length ?? 0}
          </h5>
          <small style={{ color: '#888', fontSize: '0.82rem' }}>
            Saved Addresses
          </small>
        </div>
        <div
          style={{
            background: 'rgba(15,15,15,0.95)',
            border: '1px solid #3d3020',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <CreditCard size={28} color="#c9a84c" style={{ marginBottom: '10px' }} />
          <h5
            style={{
              color: '#fff',
              fontSize: '1.5rem',
              fontWeight: 700,
              margin: '0 0 4px',
            }}
          >
            {customer?.phone ? '1' : '0'}
          </h5>
          <small style={{ color: '#888', fontSize: '0.82rem' }}>
            Contact Info
          </small>
        </div>
      </div>

      <h4
        style={{
          color: '#c9a84c',
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 600,
          fontSize: '1.25rem',
          marginBottom: '16px',
        }}
      >
        Quick Actions
      </h4>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px',
        }}
      >
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.path + action.label}
              to={action.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '18px 20px',
                background: 'rgba(15,15,15,0.95)',
                border: '1px solid #3d3020',
                borderRadius: '12px',
                textDecoration: 'none',
                color: '#ddd',
                transition: 'all 0.25s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#3d3020';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: 'rgba(201,168,76,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={20} color={action.color} />
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: '0.92rem',
                    marginBottom: '2px',
                  }}
                >
                  {action.label}
                </div>
              </div>
              <ChevronRight
                size={16}
                color="#666"
                style={{ marginLeft: 'auto' }}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
};

const MyAccount = () => {
  const { customer, loading, logout } = useCustomerAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 991);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (customer === null && !loading) {
      const timer = setTimeout(() => {
        navigate('/login', { replace: true });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [customer, loading, navigate]);

  const isActive = (path) => {
    if (path === '/account') {
      return location.pathname === '/account';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const showDefault = location.pathname === '/account';

  return (
    <div
      style={{
        background: '#0a0a0a',
        minHeight: '100vh',
        color: '#fff',
      }}
    >
      <Navbar />

      <div
        style={{ paddingTop: '96px', paddingBottom: '60px' }}
        className="container"
      >
        {isMobile && (
          <div
            style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '12px',
              marginBottom: '20px',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
            }}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    background: active
                      ? 'rgba(201,168,76,0.1)'
                      : 'rgba(15,15,15,0.95)',
                    border: `1px solid ${
                      active ? 'rgba(201,168,76,0.4)' : '#3d3020'
                    }`,
                    color: active ? '#c9a84c' : '#aaa',
                    fontSize: '0.68rem',
                    fontWeight: active ? 600 : 400,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid #3d3020',
                background: 'rgba(15,15,15,0.95)',
                color: '#ef4444',
                fontSize: '0.68rem',
                fontWeight: 500,
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.2s ease',
              }}
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        )}

        <div className="row">
          {!isMobile && (
            <div className="col-lg-3 mb-4">
              <Sidebar
                customer={customer}
                isActive={isActive}
                onLogout={handleLogout}
              />
            </div>
          )}

          <div className={isMobile ? 'col-12' : 'col-lg-9'}>
            <div
              style={{
                background: 'rgba(15,15,15,0.95)',
                border: '1px solid #3d3020',
                borderRadius: '12px',
                padding: '24px',
              }}
            >
              {showDefault ? (
                <DashboardView customer={customer} />
              ) : (
                <Outlet />
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 991px) {
          .admin-sidebar {
            display: none !important;
          }
          .sidebar-label {
            display: none;
          }
        }
        @media (max-width: 991px) {
          div::-webkit-scrollbar {
            display: none;
          }
        }
      `}</style>

      <Footer />
    </div>
  );
};

export default MyAccount;