import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Loader2, Download, Calendar, Filter } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import API_URL from '../../config';

const GOLD = '#c9a84c';
const COLORS = ['#c9a84c', '#e74c3c', '#27ae60', '#3498db', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22'];

const tabs = [
  { id: 'orders', label: 'Orders' },
  { id: 'sales', label: 'Sales' },
  { id: 'products', label: 'Products' },
  { id: 'customers', label: 'Customers' },
  { id: 'revenue', label: 'Revenue' },
  { id: 'custom', label: 'Custom Report' },
];

const inputStyle = {
  background: '#141010', border: '1px solid #3d3020', borderRadius: '4px',
  color: '#fff', padding: '8px 12px', fontSize: '12px', outline: 'none',
};

const cardStyle = {
  background: '#0f0c09', border: '1px solid #2a1f10', borderRadius: '8px', padding: '20px',
};

const exportCSV = (headers, rows, filename) => {
  const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

export default function AdminReports() {
  const [activeTab, setActiveTab] = useState('orders');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({});

  const token = localStorage.getItem('adminToken');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const fetchTabData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'orders') {
        const { data: d } = await axios.get(`${API_URL}/api/analytics/orders-report?limit=50`, config);
        if (d.success) setData(d);
      } else if (activeTab === 'sales') {
        const [sales, cat, payment] = await Promise.all([
          axios.get(`${API_URL}/api/analytics/sales-chart?period=30d`, config),
          axios.get(`${API_URL}/api/analytics/category-sales?days=30`, config),
          axios.get(`${API_URL}/api/analytics/payment-methods`, config),
        ]);
        setData({ sales: sales.data.sales, categories: cat.data.sales, payments: payment.data.stats });
      } else if (activeTab === 'products') {
        const { data: d } = await axios.get(`${API_URL}/api/analytics/product-stats`, config);
        if (d.success) setData(d);
      } else if (activeTab === 'customers') {
        const { data: d } = await axios.get(`${API_URL}/api/analytics/customer-stats`, config);
        if (d.success) setData(d);
      } else if (activeTab === 'revenue') {
        const { data: d } = await axios.get(`${API_URL}/api/analytics/revenue-report`, config);
        if (d.success) setData(d.report);
      }
    } catch (error) {
      console.error('Report fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchTabData(); }, [fetchTabData]);

  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [customReport, setCustomReport] = useState(null);
  const [customLoading, setCustomLoading] = useState(false);

  const fetchCustomReport = async () => {
    if (!customStart || !customEnd) return;
    setCustomLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/analytics/custom-report?startDate=${customStart}&endDate=${customEnd}`, config);
      if (data.success) setCustomReport(data.report);
    } catch (error) {
      console.error('Custom report error:', error);
    } finally {
      setCustomLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a' }}>
      <AdminSidebar />
      <div style={{ flex: 1, padding: '24px', overflowY: 'auto', marginLeft: '260px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 700, margin: '0 0 20px' }}>Reports & Analytics</h1>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', flexWrap: 'wrap', borderBottom: '1px solid #2a1f10', paddingBottom: '8px' }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                style={{ padding: '8px 18px', fontSize: '12px', fontWeight: 600, borderRadius: '4px', border: 'none', background: activeTab === t.id ? GOLD : 'transparent', color: activeTab === t.id ? '#0a0a0a' : '#8a7a6a', cursor: 'pointer', transition: 'all 0.2s' }}>
                {t.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px' }}><Loader2 size={24} style={{ color: GOLD, animation: 'spin 1s linear infinite' }} /></div>
          ) : (
            <div>
              {/* ORDERS TAB */}
              {activeTab === 'orders' && data.orders && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                    <button onClick={() => exportCSV(
                      ['Order #', 'Customer', 'Phone', 'Amount', 'Payment', 'Status', 'Date'],
                      data.orders.map(o => [o.orderNumber, o.customer?.fullName, o.customer?.phone, o.total, o.customer?.paymentMethod, o.status, new Date(o.createdAt).toLocaleDateString()]),
                      'orders-report.csv'
                    )} style={{ background: 'rgba(39,174,96,0.1)', border: '1px solid #27ae6030', borderRadius: '4px', padding: '6px 14px', color: '#27ae60', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Download size={12} /> Export CSV
                    </button>
                  </div>
                  <div style={{ ...cardStyle, overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          {['Order #', 'Customer', 'Items', 'Amount', 'Payment', 'Status', 'Date'].map(h => (
                            <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: '#8a7a6a', fontSize: '11px', letterSpacing: '1px', borderBottom: '1px solid #2a1f10', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.orders.map(o => (
                          <tr key={o._id}>
                            <td style={{ padding: '8px 12px', color: GOLD, fontSize: '12px', fontWeight: 600, borderBottom: '1px solid #1a1410' }}>{o.orderNumber}</td>
                            <td style={{ padding: '8px 12px', color: '#fff', fontSize: '12px', borderBottom: '1px solid #1a1410' }}>{o.customer?.fullName}</td>
                            <td style={{ padding: '8px 12px', color: '#ccc', fontSize: '12px', borderBottom: '1px solid #1a1410' }}>{o.items?.length}</td>
                            <td style={{ padding: '8px 12px', color: GOLD, fontSize: '12px', fontWeight: 600, borderBottom: '1px solid #1a1410' }}>Rs. {o.total?.toLocaleString()}</td>
                            <td style={{ padding: '8px 12px', color: '#ccc', fontSize: '12px', textTransform: 'capitalize', borderBottom: '1px solid #1a1410' }}>{o.customer?.paymentMethod || 'cod'}</td>
                            <td style={{ padding: '8px 12px', borderBottom: '1px solid #1a1410' }}>
                              <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700,
                                background: o.status === 'Delivered' ? '#27ae6020' : o.status === 'Cancelled' ? '#e74c3c20' : '#f39c1220',
                                color: o.status === 'Delivered' ? '#27ae60' : o.status === 'Cancelled' ? '#e74c3c' : '#f39c12' }}>{o.status}</span>
                            </td>
                            <td style={{ padding: '8px 12px', color: '#8a7a6a', fontSize: '11px', borderBottom: '1px solid #1a1410', whiteSpace: 'nowrap' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SALES TAB */}
              {activeTab === 'sales' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    <div style={cardStyle}>
                      <h3 style={{ color: '#fff', fontSize: '14px', fontWeight: 700, margin: '0 0 12px' }}>Sales Trend (30 Days)</h3>
                      <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={(data.sales || []).map(s => ({ date: s._id, revenue: s.revenue }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#2a1f10" />
                          <XAxis dataKey="date" tick={{ fill: '#8a7a6a', fontSize: 10 }} tickFormatter={v => v.slice(5)} />
                          <YAxis tick={{ fill: '#8a7a6a', fontSize: 10 }} tickFormatter={v => `Rs.${(v/1000).toFixed(0)}k`} />
                          <Tooltip contentStyle={{ background: '#1a1410', border: '1px solid #3d3020', borderRadius: '6px', color: '#fff', fontSize: '12px' }} formatter={(v) => [`Rs. ${v.toLocaleString()}`, 'Revenue']} />
                          <Line type="monotone" dataKey="revenue" stroke={GOLD} strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                      <p style={{ color: '#8a7a6a', fontSize: '11px', marginTop: '10px', lineHeight: '1.5' }}>
                        Tracks daily revenue over the last 30 days. Peaks indicate high-sales days (promotions, events). Flat or declining trends may signal the need for marketing or pricing adjustments.
                      </p>
                    </div>
                    <div style={cardStyle}>
                      <h3 style={{ color: '#fff', fontSize: '14px', fontWeight: 700, margin: '0 0 12px' }}>Payment Methods</h3>
                      <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                          <Pie data={(data.payments || []).map(p => ({ name: p._id || 'cod', value: p.count }))} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value">
                            {(data.payments || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                          <Tooltip contentStyle={{ background: '#1a1410', border: '1px solid #3d3020', borderRadius: '6px', color: '#fff', fontSize: '12px' }} />
                          <Legend wrapperStyle={{ fontSize: '11px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                      <p style={{ color: '#8a7a6a', fontSize: '11px', marginTop: '10px', lineHeight: '1.5' }}>
                        Shows how customers are paying — Cash on Delivery (COD) vs WhatsApp payments. A higher COD ratio may indicate trust-building needed. Larger slices mean more orders via that method.
                      </p>
                    </div>
                  </div>
                  <div style={cardStyle}>
                    <h3 style={{ color: '#fff', fontSize: '14px', fontWeight: 700, margin: '0 0 12px' }}>Category Sales</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={(data.categories || []).map(c => ({ name: c._id || 'Unknown', revenue: c.revenue }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2a1f10" />
                        <XAxis dataKey="name" tick={{ fill: '#8a7a6a', fontSize: 10 }} />
                        <YAxis tick={{ fill: '#8a7a6a', fontSize: 10 }} tickFormatter={v => `Rs.${(v/1000).toFixed(0)}k`} />
                        <Tooltip contentStyle={{ background: '#1a1410', border: '1px solid #3d3020', borderRadius: '6px', color: '#fff', fontSize: '12px' }} formatter={(v) => [`Rs. ${v.toLocaleString()}`, 'Revenue']} />
                        <Bar dataKey="revenue" fill={GOLD} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                    <p style={{ color: '#8a7a6a', fontSize: '11px', marginTop: '10px', lineHeight: '1.5' }}>
                      Revenue breakdown by product category over the last 30 days. The tallest bar represents your top-performing category. Use this to decide which categories to promote or expand.
                    </p>
                  </div>
                </div>
              )}

              {/* PRODUCTS TAB */}
              {activeTab === 'products' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    <div style={cardStyle}>
                      <h3 style={{ color: '#fff', fontSize: '14px', fontWeight: 700, margin: '0 0 12px' }}>Products by Category</h3>
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={(data.categoryCounts || []).map(c => ({ name: c._id || 'Unknown', count: c.count }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#2a1f10" />
                          <XAxis dataKey="name" tick={{ fill: '#8a7a6a', fontSize: 10 }} />
                          <YAxis tick={{ fill: '#8a7a6a', fontSize: 10 }} />
                          <Tooltip contentStyle={{ background: '#1a1410', border: '1px solid #3d3020', borderRadius: '6px', color: '#fff', fontSize: '12px' }} />
                          <Bar dataKey="count" fill={GOLD} radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                      <p style={{ color: '#8a7a6a', fontSize: '11px', marginTop: '10px', lineHeight: '1.5' }}>
                        Number of products in each category. A tall bar means more products exist in that category. Use this to balance your inventory — too few products in one area may mean missed sales.
                      </p>
                    </div>
                    <div style={cardStyle}>
                      <h3 style={{ color: '#fff', fontSize: '14px', fontWeight: 700, margin: '0 0 12px' }}>Most Viewed Products</h3>
                      {(data.mostViewed || []).length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#8a7a6a', fontSize: '12px' }}>No view data yet. Tracking will collect data automatically.</div>
                      ) : (
                        <div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {data.mostViewed.map((p, i) => (
                            <div key={p._id || i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', background: '#141010', borderRadius: '4px' }}>
                              <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: `${COLORS[i % COLORS.length]}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS[i % COLORS.length], fontSize: '11px', fontWeight: 700 }}>{i + 1}</div>
                              <div style={{ flex: 1, color: '#fff', fontSize: '12px' }}>{p.name || 'Unknown'}</div>
                              <div style={{ color: GOLD, fontSize: '12px', fontWeight: 600 }}>{p.views} views</div>
                            </div>
                          ))}
                        </div>
                        <p style={{ color: '#8a7a6a', fontSize: '11px', marginTop: '10px', lineHeight: '1.5' }}>
                          Products ranked by how many times customers viewed their detail page. High views but low sales may indicate pricing or description issues. Consider featuring these products on your homepage.
                        </p>
                        </div>
                      )}
                    </div>
                  </div>
                  {data.unsoldProducts && data.unsoldProducts.length > 0 && (
                    <div style={cardStyle}>
                      <h3 style={{ color: '#fff', fontSize: '14px', fontWeight: 700, margin: '0 0 12px' }}>Unsold Products (30+ Days)</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                        {data.unsoldProducts.map(p => (
                          <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: '#141010', borderRadius: '4px' }}>
                            {p.mainImage && <img src={p.mainImage} alt="" style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover' }} />}
                            <div style={{ flex: 1 }}>
                              <div style={{ color: '#fff', fontSize: '11px', fontWeight: 600 }}>{p.name}</div>
                              <div style={{ color: '#8a7a6a', fontSize: '10px' }}>{p.category}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* CUSTOMERS TAB */}
              {activeTab === 'customers' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    <div style={cardStyle}>
                      <h3 style={{ color: '#fff', fontSize: '14px', fontWeight: 700, margin: '0 0 12px' }}>Top Spenders</h3>
                      {(data.topSpenders || []).length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '30px', color: '#8a7a6a', fontSize: '12px' }}>No registered customer orders yet.</div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {data.topSpenders.map((c, i) => (
                            <div key={c._id || i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: '#141010', borderRadius: '6px' }}>
                              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: `${COLORS[i % COLORS.length]}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS[i % COLORS.length], fontSize: '11px', fontWeight: 700 }}>{i + 1}</div>
                              <div style={{ flex: 1 }}>
                                <div style={{ color: '#fff', fontSize: '12px', fontWeight: 600 }}>{c.name}</div>
                                <div style={{ color: '#8a7a6a', fontSize: '10px' }}>{c.orderCount} orders</div>
                              </div>
                              <div style={{ color: GOLD, fontSize: '13px', fontWeight: 700 }}>Rs. {c.totalSpent?.toLocaleString()}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={cardStyle}>
                      <h3 style={{ color: '#fff', fontSize: '14px', fontWeight: 700, margin: '0 0 12px' }}>Sales by City</h3>
                      {(data.locationStats || []).length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '30px', color: '#8a7a6a', fontSize: '12px' }}>No location data yet.</div>
                      ) : (
                        <ResponsiveContainer width="100%" height={280}>
                          <BarChart data={data.locationStats.map(l => ({ name: l._id || 'Unknown', orders: l.count, revenue: l.revenue }))}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2a1f10" />
                            <XAxis dataKey="name" tick={{ fill: '#8a7a6a', fontSize: 10 }} />
                            <YAxis tick={{ fill: '#8a7a6a', fontSize: 10 }} />
                            <Tooltip contentStyle={{ background: '#1a1410', border: '1px solid #3d3020', borderRadius: '6px', color: '#fff', fontSize: '12px' }} />
                            <Bar dataKey="orders" fill={GOLD} radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                      <p style={{ color: '#8a7a6a', fontSize: '11px', marginTop: '10px', lineHeight: '1.5' }}>
                        Number of orders placed from each city. The tallest bar shows your most active delivery location. Use this data to optimize delivery routes, negotiate shipping rates, or plan regional promotions.
                      </p>
                    </div>
                  </div>
                  {data.inactiveCustomers && data.inactiveCustomers.length > 0 && (
                    <div style={cardStyle}>
                      <h3 style={{ color: '#fff', fontSize: '14px', fontWeight: 700, margin: '0 0 12px' }}>Customers Without Orders</h3>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr>
                              {['Name', 'Email', 'Registered'].map(h => (
                                <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: '#8a7a6a', fontSize: '11px', borderBottom: '1px solid #2a1f10' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {data.inactiveCustomers.map(c => (
                              <tr key={c._id}>
                                <td style={{ padding: '8px 12px', color: '#fff', fontSize: '12px', borderBottom: '1px solid #1a1410' }}>{c.firstName} {c.lastName}</td>
                                <td style={{ padding: '8px 12px', color: '#ccc', fontSize: '12px', borderBottom: '1px solid #1a1410' }}>{c.email}</td>
                                <td style={{ padding: '8px 12px', color: '#8a7a6a', fontSize: '11px', borderBottom: '1px solid #1a1410' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* REVENUE TAB */}
              {activeTab === 'revenue' && data.summary && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
                    {[
                      { label: 'Total Revenue', value: `Rs. ${(data.summary.totalRevenue || 0).toLocaleString()}` },
                      { label: 'Total Orders', value: data.summary.totalOrders || 0 },
                      { label: 'Avg Order', value: `Rs. ${Math.round(data.summary.avgOrder || 0).toLocaleString()}` },
                      { label: 'Highest Order', value: `Rs. ${(data.summary.maxOrder || 0).toLocaleString()}` },
                    ].map((s, i) => (
                      <div key={i} style={{ ...cardStyle, textAlign: 'center' }}>
                        <div style={{ color: '#8a7a6a', fontSize: '11px', marginBottom: '6px' }}>{s.label}</div>
                        <div style={{ color: GOLD, fontSize: '18px', fontWeight: 700 }}>{s.value}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                    <div style={cardStyle}>
                      <h3 style={{ color: '#fff', fontSize: '14px', fontWeight: 700, margin: '0 0 12px' }}>Daily Revenue</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={(data.dailyRevenue || []).map(d => ({ date: d._id, revenue: d.revenue, orders: d.orders }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#2a1f10" />
                          <XAxis dataKey="date" tick={{ fill: '#8a7a6a', fontSize: 10 }} tickFormatter={v => v.slice(5)} />
                          <YAxis tick={{ fill: '#8a7a6a', fontSize: 10 }} tickFormatter={v => `Rs.${(v/1000).toFixed(0)}k`} />
                          <Tooltip contentStyle={{ background: '#1a1410', border: '1px solid #3d3020', borderRadius: '6px', color: '#fff', fontSize: '12px' }} formatter={(v, name) => [name === 'revenue' ? `Rs. ${v.toLocaleString()}` : v, name === 'revenue' ? 'Revenue' : 'Orders']} />
                          <Legend wrapperStyle={{ fontSize: '11px' }} />
                          <Bar dataKey="revenue" fill={GOLD} radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                      <p style={{ color: '#8a7a6a', fontSize: '11px', marginTop: '10px', lineHeight: '1.5' }}>
                        Day-by-day revenue over the last 30 days (default view). Tall bars indicate high-revenue days. Compare with previous periods to spot growth trends or seasonal patterns.
                      </p>
                    </div>
                    <div style={cardStyle}>
                      <h3 style={{ color: '#fff', fontSize: '14px', fontWeight: 700, margin: '0 0 12px' }}>Revenue by Category</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie data={(data.categoryRevenue || []).map(c => ({ name: c._id || 'Other', value: c.revenue }))} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value">
                            {(data.categoryRevenue || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                          <Tooltip contentStyle={{ background: '#1a1410', border: '1px solid #3d3020', borderRadius: '6px', color: '#fff', fontSize: '12px' }} formatter={(v) => [`Rs. ${v.toLocaleString()}`, 'Revenue']} />
                          <Legend wrapperStyle={{ fontSize: '11px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                      <p style={{ color: '#8a7a6a', fontSize: '11px', marginTop: '10px', lineHeight: '1.5' }}>
                        Shows what percentage of your total revenue comes from each product category. Larger slices mean those categories contribute more to your bottom line. Focus marketing efforts on top-revenue categories.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* CUSTOM REPORT TAB */}
              {activeTab === 'custom' && (
                <div>
                  <div style={{ ...cardStyle, marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={16} style={{ color: GOLD }} />
                        <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>Select Date Range:</span>
                      </div>
                      <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} style={inputStyle} />
                      <span style={{ color: '#8a7a6a', fontSize: '12px' }}>to</span>
                      <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} style={inputStyle} />
                      <button onClick={fetchCustomReport} disabled={customLoading || !customStart || !customEnd}
                        style={{ padding: '8px 20px', background: GOLD, color: '#0a0a0a', border: 'none', borderRadius: '4px', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {customLoading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Filter size={14} />}
                        Generate Report
                      </button>
                    </div>
                  </div>

                  {customReport && (
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                        <div style={{ ...cardStyle, textAlign: 'center' }}>
                          <div style={{ color: '#8a7a6a', fontSize: '11px', marginBottom: '6px' }}>Total Revenue</div>
                          <div style={{ color: GOLD, fontSize: '18px', fontWeight: 700 }}>Rs. {(customReport.summary?.totalRevenue || 0).toLocaleString()}</div>
                        </div>
                        <div style={{ ...cardStyle, textAlign: 'center' }}>
                          <div style={{ color: '#8a7a6a', fontSize: '11px', marginBottom: '6px' }}>Total Orders</div>
                          <div style={{ color: '#fff', fontSize: '18px', fontWeight: 700 }}>{customReport.summary?.totalOrders || 0}</div>
                        </div>
                        <div style={{ ...cardStyle, textAlign: 'center' }}>
                          <div style={{ color: '#8a7a6a', fontSize: '11px', marginBottom: '6px' }}>New Customers</div>
                          <div style={{ color: '#27ae60', fontSize: '18px', fontWeight: 700 }}>{customReport.newCustomers || 0}</div>
                        </div>
                      </div>

                      {customReport.topProducts && customReport.topProducts.length > 0 && (
                        <div style={{ ...cardStyle, marginBottom: '16px' }}>
                          <h3 style={{ color: '#fff', fontSize: '14px', fontWeight: 700, margin: '0 0 12px' }}>Top Products</h3>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {customReport.topProducts.map((p, i) => (
                              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', background: '#141010', borderRadius: '4px' }}>
                                <div style={{ color: GOLD, fontSize: '12px', fontWeight: 700, minWidth: '20px' }}>{i + 1}.</div>
                                <div style={{ flex: 1, color: '#fff', fontSize: '12px' }}>{p._id}</div>
                                <div style={{ color: '#ccc', fontSize: '11px' }}>{p.sold} sold</div>
                                <div style={{ color: GOLD, fontSize: '12px', fontWeight: 600 }}>Rs. {p.revenue?.toLocaleString()}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {customReport.orderStatus && customReport.orderStatus.length > 0 && (
                        <div style={cardStyle}>
                          <h3 style={{ color: '#fff', fontSize: '14px', fontWeight: 700, margin: '0 0 12px' }}>Order Status Breakdown</h3>
                          <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={customReport.orderStatus.map(s => ({ name: s._id, count: s.count }))}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#2a1f10" />
                              <XAxis dataKey="name" tick={{ fill: '#8a7a6a', fontSize: 10 }} />
                              <YAxis tick={{ fill: '#8a7a6a', fontSize: 10 }} />
                              <Tooltip contentStyle={{ background: '#1a1410', border: '1px solid #3d3020', borderRadius: '6px', color: '#fff', fontSize: '12px' }} />
                              <Bar dataKey="count" fill={GOLD} radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
