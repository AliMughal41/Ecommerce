import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  TrendingUp, TrendingDown, ShoppingCart, Package, Users, DollarSign,
  Clock, AlertTriangle, Loader2, ArrowUpRight, ArrowDownRight,
  BarChart3, Eye, RefreshCw
} from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import API_URL from '../../config';

const GOLD = '#c9a84c';
const GOLD_LIGHT = '#d4b756';
const COLORS = ['#c9a84c', '#e74c3c', '#27ae60', '#3498db', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22'];

const cardStyle = {
  background: '#0f0c09', border: '1px solid #2a1f10', borderRadius: '8px', padding: '20px',
  transition: 'border-color 0.2s, transform 0.2s',
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [salesChart, setSalesChart] = useState([]);
  const [categorySales, setCategorySales] = useState([]);
  const [chartPeriod, setChartPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);

  const token = localStorage.getItem('adminToken');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const fetchDashboard = useCallback(async () => {
    try {
      const [dashRes, salesRes, catRes] = await Promise.all([
        axios.get(`${API_URL}/api/analytics/dashboard`, config),
        axios.get(`${API_URL}/api/analytics/sales-chart?period=${chartPeriod}`, config),
        axios.get(`${API_URL}/api/analytics/category-sales?days=30`, config),
      ]);
      if (dashRes.data.success) setStats(dashRes.data.stats);
      if (salesRes.data.success) setSalesChart(salesRes.data.sales.map(s => ({ date: s._id, revenue: s.revenue, orders: s.orders })));
      if (catRes.data.success) setCategorySales(catRes.data.sales.map(s => ({ name: s._id || 'Unknown', revenue: s.revenue, count: s.count })));
    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
      setChartLoading(false);
    }
  }, [chartPeriod]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const handlePeriodChange = (p) => {
    setChartPeriod(p);
    setChartLoading(true);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a' }}>
        <AdminSidebar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 size={32} style={{ color: GOLD, animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const { revenue, orders, products, customers, bestSellers, recentOrders, lowStockProducts, topCustomers, returns } = stats;

  const statCards = [
    { label: 'Total Revenue', value: `Rs. ${revenue.total.toLocaleString()}`, icon: DollarSign, color: '#c9a84c', sub: `${revenue.monthGrowth >= 0 ? '+' : ''}${revenue.monthGrowth}% vs last month` },
    { label: 'Today\'s Revenue', value: `Rs. ${revenue.today.toLocaleString()}`, icon: TrendingUp, color: '#27ae60', sub: `Avg: Rs. ${revenue.avgOrderValue.toLocaleString()}/order` },
    { label: 'Total Orders', value: orders.total, icon: ShoppingCart, color: '#3498db', sub: `${orders.today} today, ${orders.thisWeek} this week` },
    { label: 'Total Customers', value: customers.total, icon: Users, color: '#9b59b6', sub: `${customers.today} new today` },
    { label: 'Total Products', value: products.total, icon: Package, color: '#e67e22', sub: `${products.lowStock} low stock` },
    { label: 'Pending Orders', value: orders.statusCounts?.Pending || 0, icon: Clock, color: '#f39c12', sub: `${orders.statusCounts?.Processing || 0} processing` },
    { label: 'Returns', value: returns.total, icon: RefreshCw, color: '#e74c3c', sub: `${returns.pending} pending` },
    { label: 'Out of Stock', value: products.outOfStock, icon: AlertTriangle, color: '#e74c3c', sub: 'Products unavailable' },
  ];

  const orderStatusData = Object.entries(orders.statusCounts || {}).map(([name, value]) => ({ name, value }));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a' }}>
      <AdminSidebar />
      <div style={{ flex: 1, padding: '24px', overflowY: 'auto', marginLeft: '260px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 700, margin: 0 }}>Dashboard</h1>
              <p style={{ color: '#8a7a6a', fontSize: '13px', margin: '4px 0 0' }}>Welcome back. Here's your store overview.</p>
            </div>
            <button onClick={() => { setLoading(true); fetchDashboard(); }}
              style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '6px', padding: '8px 16px', color: GOLD, fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {statCards.map((c, i) => (
              <div key={i} style={cardStyle}
                onMouseEnter={e => { e.currentTarget.style.borderColor = c.color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a1f10'; e.currentTarget.style.transform = 'none'; }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ color: '#8a7a6a', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>{c.label}</div>
                    <div style={{ color: '#fff', fontSize: '22px', fontWeight: 700 }}>{c.value}</div>
                  </div>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: `${c.color}15`, border: `1px solid ${c.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <c.icon size={20} style={{ color: c.color }} />
                  </div>
                </div>
                <div style={{ color: c.color, fontSize: '11px' }}>{c.sub}</div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '24px' }}>
            {/* Sales Trend Chart */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: 700, margin: 0 }}>Sales Trend</h3>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[{ label: '7D', value: '7d' }, { label: '30D', value: '30d' }, { label: '12M', value: '12m' }].map(p => (
                    <button key={p.value} onClick={() => handlePeriodChange(p.value)}
                      style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 600, borderRadius: '4px', border: `1px solid ${chartPeriod === p.value ? GOLD : '#3d3020'}`, background: chartPeriod === p.value ? GOLD : 'transparent', color: chartPeriod === p.value ? '#0a0a0a' : '#8a7a6a', cursor: 'pointer' }}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              {chartLoading ? (
                <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Loader2 size={20} style={{ color: GOLD, animation: 'spin 1s linear infinite' }} />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={salesChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a1f10" />
                    <XAxis dataKey="date" tick={{ fill: '#8a7a6a', fontSize: 10 }} tickFormatter={v => v.slice(5)} />
                    <YAxis tick={{ fill: '#8a7a6a', fontSize: 10 }} tickFormatter={v => `Rs.${(v/1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ background: '#1a1410', border: '1px solid #3d3020', borderRadius: '6px', color: '#fff', fontSize: '12px' }} formatter={(v) => [`Rs. ${v.toLocaleString()}`, 'Revenue']} />
                    <Line type="monotone" dataKey="revenue" stroke={GOLD} strokeWidth={2} dot={false} activeDot={{ r: 5, fill: GOLD }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Order Status Pie */}
            <div style={cardStyle}>
              <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: 700, margin: '0 0 16px' }}>Order Status</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                    {orderStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1a1410', border: '1px solid #3d3020', borderRadius: '6px', color: '#fff', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#8a7a6a' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Second Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            {/* Category Sales Bar */}
            <div style={cardStyle}>
              <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: 700, margin: '0 0 16px' }}>Category Sales (30 Days)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={categorySales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a1f10" />
                  <XAxis dataKey="name" tick={{ fill: '#8a7a6a', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#8a7a6a', fontSize: 10 }} tickFormatter={v => `Rs.${(v/1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ background: '#1a1410', border: '1px solid #3d3020', borderRadius: '6px', color: '#fff', fontSize: '12px' }} formatter={(v) => [`Rs. ${v.toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill={GOLD} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top Products Bar */}
            <div style={cardStyle}>
              <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: 700, margin: '0 0 16px' }}>Best Sellers</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={bestSellers.slice(0, 5).map(p => ({ name: p.name?.slice(0, 20) || 'Unknown', sold: p.totalSold }))} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a1f10" />
                  <XAxis type="number" tick={{ fill: '#8a7a6a', fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fill: '#8a7a6a', fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: '#1a1410', border: '1px solid #3d3020', borderRadius: '6px', color: '#fff', fontSize: '12px' }} />
                  <Bar dataKey="sold" fill={GOLD} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tables Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            {/* Recent Orders */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: 700, margin: 0 }}>Recent Orders</h3>
                <button onClick={() => navigate('/admin-orders')} style={{ background: 'none', border: 'none', color: GOLD, fontSize: '11px', cursor: 'pointer' }}>View All →</button>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Order', 'Customer', 'Amount', 'Status'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '8px 10px', color: '#8a7a6a', fontSize: '11px', letterSpacing: '1px', borderBottom: '1px solid #2a1f10', fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((o, i) => (
                      <tr key={o._id || i}>
                        <td style={{ padding: '8px 10px', color: '#fff', fontSize: '12px', borderBottom: '1px solid #1a1410' }}>{o.orderNumber}</td>
                        <td style={{ padding: '8px 10px', color: '#ccc', fontSize: '12px', borderBottom: '1px solid #1a1410' }}>{o.customer?.fullName}</td>
                        <td style={{ padding: '8px 10px', color: GOLD, fontSize: '12px', fontWeight: 600, borderBottom: '1px solid #1a1410' }}>Rs. {o.total?.toLocaleString()}</td>
                        <td style={{ padding: '8px 10px', borderBottom: '1px solid #1a1410' }}>
                          <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.5px',
                            background: o.status === 'Delivered' ? '#27ae6020' : o.status === 'Cancelled' ? '#e74c3c20' : o.status === 'Shipped' ? '#3498db20' : '#f39c1220',
                            color: o.status === 'Delivered' ? '#27ae60' : o.status === 'Cancelled' ? '#e74c3c' : o.status === 'Shipped' ? '#3498db' : '#f39c12',
                          }}>{o.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Customers */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: 700, margin: 0 }}>Top Customers</h3>
                <button onClick={() => navigate('/admin-customers')} style={{ background: 'none', border: 'none', color: GOLD, fontSize: '11px', cursor: 'pointer' }}>View All →</button>
              </div>
              {topCustomers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#8a7a6a', fontSize: '12px' }}>No registered customers with orders yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {topCustomers.map((c, i) => (
                    <div key={c._id || i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: '#141010', borderRadius: '6px', border: '1px solid #2a1f10' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `${COLORS[i % COLORS.length]}20`, border: `1px solid ${COLORS[i % COLORS.length]}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS[i % COLORS.length], fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: '#fff', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                        <div style={{ color: '#8a7a6a', fontSize: '10px' }}>{c.orderCount} orders</div>
                      </div>
                      <div style={{ color: GOLD, fontSize: '13px', fontWeight: 700, flexShrink: 0 }}>Rs. {c.totalSpent?.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Low Stock */}
          {lowStockProducts.length > 0 && (
            <div style={{ ...cardStyle, marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <AlertTriangle size={16} style={{ color: '#f39c12' }} />
                <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: 700, margin: 0 }}>Low Stock Alert</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                {lowStockProducts.map(p => (
                  <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: '#141010', borderRadius: '6px', border: '1px solid #2a1f10' }}>
                    <img src={p.mainImage} alt="" style={{ width: '36px', height: '36px', borderRadius: '4px', objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#fff', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                      <div style={{ color: '#f39c12', fontSize: '11px', fontWeight: 700 }}>{p.stock} left</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Responsive CSS */}
          <style>{`
            @media (max-width: 1200px) {
              .dash-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
            }
            @media (max-width: 768px) {
              div[style*="grid-template-columns: repeat(4"] { grid-template-columns: repeat(2, 1fr) !important; }
              div[style*="grid-template-columns: 2fr 1fr"] { grid-template-columns: 1fr !important; }
              div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
            }
            @media (max-width: 576px) {
              div[style*="grid-template-columns: repeat(4"] { grid-template-columns: 1fr !important; }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}
