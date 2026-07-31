import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Loader2, Filter, Eye, Users, TrendingDown, Clock,
  Monitor, Globe, MousePointerClick, ShoppingCart, PackageX, MapPin, Activity,
  FileText, FileSpreadsheet, RotateCcw
} from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import API_URL from '../../config';
import { exportToExcel, exportToPDF } from '../../utils/exporters';

const GOLD = '#c9a84c';
const COLORS = ['#c9a84c', '#e74c3c', '#27ae60', '#3498db', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#e84393', '#00cec9'];

const DAY_OPTIONS = [
  { value: '7', label: 'Last 7 Days' },
  { value: '30', label: 'Last 30 Days' },
  { value: '90', label: 'Last 90 Days' },
];

const tabs = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'behavior', label: 'Behavior', icon: Monitor },
  { id: 'products', label: 'Product Funnel', icon: ShoppingCart },
  { id: 'abandoned', label: 'Abandoned Carts', icon: PackageX },
  { id: 'location', label: 'Locations', icon: MapPin },
  { id: 'time', label: 'Time of Visit', icon: Clock },
];

const cardStyle = {
  background: '#0f0c09', border: '1px solid #2a1f10', borderRadius: '8px', padding: '20px',
};

const tooltipStyle = {
  background: '#141010', border: '1px solid #3d3020', borderRadius: '6px',
  color: '#fff', fontSize: '12px',
};

const exportCSV = (headers, rows, filename) => {
  const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

export default function AdminAnalytics() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [days, setDays] = useState('30');
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [data, setData] = useState({});
  const [previewImage, setPreviewImage] = useState(null);

  const token = localStorage.getItem('adminToken');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const endpoints = {
        overview: `${API_URL}/api/analytics/traffic?days=${days}`,
        behavior: `${API_URL}/api/analytics/devices?days=${days}`,
        products: `${API_URL}/api/analytics/product-funnel?days=${days}`,
        abandoned: `${API_URL}/api/analytics/abandoned-carts?days=${days}`,
        location: `${API_URL}/api/analytics/locations?days=${days}`,
        time: `${API_URL}/api/analytics/hours?days=${days}`,
      };
      const [primary, sources, funnel, events] = await Promise.all([
        axios.get(endpoints[activeTab], config),
        axios.get(`${API_URL}/api/analytics/sources?days=${days}`, config),
        axios.get(`${API_URL}/api/analytics/funnel?days=${days}`, config),
        axios.get(`${API_URL}/api/analytics/event-overview?days=${days}`, config),
      ]);
      const result = {
        primary: primary.data,
        sources: sources.data,
        funnel: funnel.data.funnel,
        events: events.data.events,
      };
      if (activeTab === 'overview') {
        const traffic = primary.data;
        const visitorsMap = {};
        (traffic.uniqueDaily || []).forEach(d => { visitorsMap[d._id] = d.visitors; });
        const viewsMap = {};
        (traffic.daily || []).forEach(d => { viewsMap[d._id] = d.views; });
        const allDates = [...new Set([...Object.keys(visitorsMap), ...Object.keys(viewsMap)])].sort();
        result.chartData = allDates.map(date => ({
          date,
          views: viewsMap[date] || 0,
          visitors: visitorsMap[date] || 0,
        }));
        result.mostVisitedPages = traffic.mostVisitedPages || [];
      }
      setData(result);
    } catch (error) {
      console.error('Analytics fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, days]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const renderOverview = () => {
    const stats = data.primary?.stats || {};
    const statCards = [
      { icon: Eye, label: 'Total Page Views', value: (stats.totalPageViews || 0).toLocaleString(), sub: 'last ' + days + ' days' },
      { icon: Users, label: 'Unique Visitors', value: (stats.uniqueVisitors || 0).toLocaleString(), sub: 'based on sessions' },
      { icon: TrendingDown, label: 'Bounce Rate', value: `${stats.bounceRate || 0}%`, sub: `${stats.bouncedSessions || 0} bounced sessions` },
      { icon: Clock, label: 'Avg Session', value: `${formatDuration(stats.avgSessionSec)}`, sub: 'time on site' },
    ];
    const funnel = data.funnel || {};
    return (
      <>
        <div className="row g-3 mb-4">
          {statCards.map((c, i) => (
            <div className="col-6 col-xl-3" key={i}>
              <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(201,168,76,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <c.icon size={18} color={GOLD} />
                  </div>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>{c.value}</div>
                    <div style={{ fontSize: '11px', color: '#8a7a6a', letterSpacing: '0.5px' }}>{c.label}</div>
                  </div>
                </div>
                <div style={{ fontSize: '10px', color: '#555', marginTop: '8px' }}>{c.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="row g-3 mb-4">
          <div className="col-12 col-lg-8">
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>Visits vs Unique Visitors</div>
                <div className="d-flex align-items-center gap-3" style={{ fontSize: '11px', color: '#8a7a6a' }}>
                  <span><span style={{ color: GOLD }}>●</span> Views</span>
                  <span><span style={{ color: '#3498db' }}>●</span> Visitors</span>
                </div>
              </div>
              <div style={{ height: '280px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.chartData || []}>
                    <CartesianGrid stroke="#2a1f10" strokeDasharray="3 3" />
                    <XAxis dataKey="date" stroke="#8a7a6a" fontSize={10} tickFormatter={(v) => v.slice(5)} />
                    <YAxis stroke="#8a7a6a" fontSize={10} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Line type="monotone" dataKey="views" stroke={GOLD} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="visitors" stroke="#3498db" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-4">
            <div style={cardStyle}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>Conversion Funnel</div>
              {[
                { label: 'Product Views', value: funnel.productViews || 0 },
                { label: 'Add to Cart', value: funnel.cartAdds || 0 },
                { label: 'Checkout Started', value: funnel.checkoutStarts || 0 },
                { label: 'Purchases', value: funnel.purchases || 0 },
              ].map((f, i) => (
                <div key={i} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', color: '#8a7a6a' }}>{f.label}</span>
                    <span style={{ fontSize: '12px', color: '#fff', fontWeight: 600 }}>{f.value.toLocaleString()}</span>
                  </div>
                  <div style={{ height: '6px', background: '#1a1410', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(100, (f.value / Math.max(1, (funnel.productViews || 1))) * 100)}%`, background: GOLD, borderRadius: '3px' }} />
                  </div>
                </div>
              ))}
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #2a1f10' }}>
                <div style={{ fontSize: '11px', color: '#8a7a6a' }}>Overall Conversion Rate</div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: GOLD }}>{funnel.overallConversion || 0}%</div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-3">
          <div className="col-12 col-lg-7">
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>Most Visited Pages</div>
                <button onClick={() => exportCSV(['Page', 'Views'], (data.mostVisitedPages || []).map(p => [p._id, p.views]), 'most-visited-pages.csv')} style={{ background: 'transparent', border: '1px solid #3d3020', color: '#8a7a6a', padding: '5px 10px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}>Export CSV</button>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #2a1f10', color: '#8a7a6a', fontSize: '10px', textAlign: 'left', letterSpacing: '1px' }}>
                      <th style={{ padding: '8px' }}>#</th>
                      <th style={{ padding: '8px' }}>PAGE</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>VIEWS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.mostVisitedPages || []).map((p, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #1a1410' }}>
                        <td style={{ padding: '8px', color: '#555' }}>{i + 1}</td>
                        <td style={{ padding: '8px', color: '#fff' }}>{p._id}</td>
                        <td style={{ padding: '8px', textAlign: 'right', color: GOLD, fontWeight: 600 }}>{p.views.toLocaleString()}</td>
                      </tr>
                    ))}
                    {(data.mostVisitedPages || []).length === 0 && (
                      <tr><td colSpan={3} style={{ padding: '20px', textAlign: 'center', color: '#555' }}>No page view data yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-5">
            <div style={cardStyle}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '12px' }}>Event Breakdown</div>
              {(data.events || []).map((e, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1a1410' }}>
                  <span style={{ fontSize: '12px', color: '#8a7a6a' }}>{e._id.replace(/_/g, ' ')}</span>
                  <span style={{ fontSize: '12px', color: '#fff', fontWeight: 600 }}>{e.count.toLocaleString()}</span>
                </div>
              ))}
              {(data.events || []).length === 0 && (
                <div style={{ padding: '20px', textAlign: 'center', color: '#555', fontSize: '12px' }}>No events recorded yet.</div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderBehavior = () => {
    const devices = (data.primary?.devices || []).map(d => ({ name: d._id, value: d.visitors }));
    const browsers = (data.primary?.browsers || []).map(d => ({ name: d._id, value: d.visitors }));
    const os = (data.primary?.os || []).map(d => ({ name: d._id, value: d.visitors }));
    const sources = (data.sources?.sources || []).map(d => ({ name: d._id, value: d.visitors }));
    const charts = [
      { title: 'Device Types', data: devices },
      { title: 'Browsers', data: browsers },
      { title: 'Operating Systems', data: os },
      { title: 'Traffic Sources', data: sources },
    ];
    return (
      <>
        <div className="row g-3 mb-4">
          {charts.map((chart, i) => (
            <div className="col-12 col-md-6 col-xl-3" key={i}>
              <div style={cardStyle}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '12px' }}>{chart.title}</div>
                {chart.data.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#555', fontSize: '12px', padding: '30px 0' }}>No data yet.</div>
                ) : (
                  <>
                    <div style={{ height: '160px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={chart.data} dataKey="value" nameKey="name" innerRadius={40} outerRadius={65} paddingAngle={2}>
                            {chart.data.map((_, j) => <Cell key={j} fill={COLORS[j % COLORS.length]} />)}
                          </Pie>
                          <Tooltip contentStyle={tooltipStyle} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ marginTop: '8px', maxHeight: '140px', overflowY: 'auto' }}>
                      {chart.data.slice(0, 6).map((d, j) => (
                        <div key={j} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '11px' }}>
                          <span style={{ color: '#8a7a6a' }}><span style={{ color: COLORS[j % COLORS.length] }}>●</span> {d.name}</span>
                          <span style={{ color: '#fff', fontWeight: 600 }}>{d.value.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="row g-3">
          <div className="col-12">
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>Traffic Sources — Visitors</div>
                <button onClick={() => exportCSV(['Source', 'Visitors', 'Page Views'], (data.sources?.sources || []).map(s => [s._id, s.visitors, s.pageViews]), 'traffic-sources.csv')} style={{ background: 'transparent', border: '1px solid #3d3020', color: '#8a7a6a', padding: '5px 10px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}>Export CSV</button>
              </div>
              <div style={{ height: '260px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={(data.sources?.sources || []).map(s => ({ name: s._id, visitors: s.visitors }))}>
                    <CartesianGrid stroke="#2a1f10" strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke="#8a7a6a" fontSize={11} />
                    <YAxis stroke="#8a7a6a" fontSize={11} />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                    <Bar dataKey="visitors" fill={GOLD} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ marginTop: '16px', fontSize: '12px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>Top Referring Sites</div>
              {(data.sources?.referrers || []).map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #1a1410', fontSize: '12px' }}>
                  <span style={{ color: '#8a7a6a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{r._id}</span>
                  <span style={{ color: '#fff', fontWeight: 600 }}>{r.visitors.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderProducts = () => {
    const products = data.primary?.products || [];
    return (
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>Product Performance Funnel</div>
            <div style={{ fontSize: '11px', color: '#8a7a6a', marginTop: '4px' }}>Views → Cart → Purchase conversion per product</div>
          </div>
          <button onClick={() => exportCSV(['Product', 'Views', 'Cart Adds', 'Purchases', 'Abandoned Sessions', 'View→Cart %', 'Cart→Purchase %', 'Conversion %'], products.map(p => [p.name, p.views, p.cartAdds, p.purchases, p.abandonedSessions, p.viewToCartRate, p.cartToPurchaseRate, p.conversionRate]), 'product-funnel.csv')} style={{ background: 'transparent', border: '1px solid #3d3020', color: '#8a7a6a', padding: '5px 10px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}>Export CSV</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '800px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2a1f10', color: '#8a7a6a', fontSize: '10px', textAlign: 'left', letterSpacing: '1px' }}>
                <th style={{ padding: '10px 8px' }}>PRODUCT</th>
                <th style={{ padding: '10px 8px', textAlign: 'center' }}>VIEWS</th>
                <th style={{ padding: '10px 8px', textAlign: 'center' }}>CART</th>
                <th style={{ padding: '10px 8px', textAlign: 'center' }}>PURCHASES</th>
                <th style={{ padding: '10px 8px', textAlign: 'center' }}>ABANDONED</th>
                <th style={{ padding: '10px 8px', textAlign: 'center' }}>VIEW→CART</th>
                <th style={{ padding: '10px 8px', textAlign: 'center' }}>CART→PURCHASE</th>
                <th style={{ padding: '10px 8px', textAlign: 'center' }}>CONVERSION</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #1a1410' }}>
                  <td style={{ padding: '10px 8px', maxWidth: '220px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {p.image ? (
                        <img src={p.image} alt={p.name} onClick={() => setPreviewImage(p.image)} title="Click to enlarge"
                          style={{ width: '34px', height: '34px', borderRadius: '4px', objectFit: 'cover', flexShrink: 0, border: '1px solid #3d3020', cursor: 'zoom-in' }} />
                      ) : (
                        <div style={{ width: '34px', height: '34px', borderRadius: '4px', background: '#1a1410', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#555', flexShrink: 0 }}>NO IMG</div>
                      )}
                      <span onClick={() => p.image && setPreviewImage(p.image)} title={p.name}
                        style={{ color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: p.image ? 'zoom-in' : 'default' }}>{p.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', color: '#fff' }}>{p.views.toLocaleString()}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', color: '#f39c12' }}>{p.cartAdds.toLocaleString()}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', color: '#27ae60' }}>{p.purchases.toLocaleString()}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', color: '#e74c3c' }}>{p.abandonedSessions.toLocaleString()}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', color: '#8a7a6a' }}>{p.viewToCartRate}%</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', color: '#8a7a6a' }}>{p.cartToPurchaseRate}%</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', color: GOLD, fontWeight: 700 }}>{p.conversionRate}%</td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={8} style={{ padding: '30px', textAlign: 'center', color: '#555' }}>No product analytics yet. Browse the store to start collecting data.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderAbandoned = () => {
    const abandoned = data.primary?.abandoned || [];
    const stats = data.primary || {};
    const statCards = [
      { label: 'Abandoned Carts', value: (stats.abandonedSessions || 0).toLocaleString(), color: '#e74c3c' },
      { label: 'Total Cart Sessions', value: (stats.totalSessions || 0).toLocaleString(), color: '#fff' },
      { label: 'Abandoned Rate', value: `${stats.abandonedRate || 0}%`, color: GOLD },
    ];
    return (
      <>
        <div className="row g-3 mb-4">
          {statCards.map((s, i) => (
            <div className="col-4" key={i}>
              <div style={cardStyle}>
                <div style={{ fontSize: '22px', fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '11px', color: '#8a7a6a', letterSpacing: '0.5px' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '12px' }}>Sessions with abandoned carts</div>
          {abandoned.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#555', fontSize: '12px' }}>No abandoned carts in this period.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #2a1f10', color: '#8a7a6a', fontSize: '10px', textAlign: 'left', letterSpacing: '1px' }}>
                    <th style={{ padding: '8px' }}>SESSION</th>
                    <th style={{ padding: '8px' }}>ITEMS ADDED</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>LAST ADD</th>
                  </tr>
                </thead>
                <tbody>
                  {abandoned.slice(0, 30).map((a, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #1a1410' }}>
                      <td style={{ padding: '8px', color: '#555', fontSize: '11px' }}>{a.sessionId}</td>
                      <td style={{ padding: '8px', color: '#fff' }}>
                        {(a.items || []).map((it, j) => (
                          <span key={j} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#1a1410', border: '1px solid #3d3020', borderRadius: '3px', padding: '2px 8px 2px 2px', marginRight: '4px', marginBottom: '2px', fontSize: '10px', color: '#c9a84c' }}>
                            {it.image ? (
                              <img src={it.image} alt={it.name} onClick={() => setPreviewImage(it.image)} title="Click to enlarge"
                                style={{ width: '20px', height: '20px', borderRadius: '2px', objectFit: 'cover', cursor: 'zoom-in' }} />
                            ) : null}
                            {it.name || it.productId}
                          </span>
                        ))}
                      </td>
                      <td style={{ padding: '8px', textAlign: 'right', color: '#8a7a6a', fontSize: '11px' }}>
                        {a.lastAdd ? new Date(a.lastAdd).toLocaleString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </>
    );
  };

  const renderLocation = () => {
    const countries = (data.primary?.countries || []).map(d => ({ name: d._id, visitors: d.visitors }));
    const cities = data.primary?.cities || [];
    return (
      <div className="row g-3">
        <div className="col-12 col-lg-5">
          <div style={cardStyle}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '12px' }}>Visitors by Country</div>
            {countries.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#555', fontSize: '12px' }}>No location data yet.</div>
            ) : (
              <>
                <div style={{ height: '260px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={countries} dataKey="visitors" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                        {countries.map((_, j) => <Cell key={j} fill={COLORS[j % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ marginTop: '8px', maxHeight: '160px', overflowY: 'auto' }}>
                  {countries.slice(0, 8).map((d, j) => (
                    <div key={j} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '11px' }}>
                      <span style={{ color: '#8a7a6a' }}><span style={{ color: COLORS[j % COLORS.length] }}>●</span> {d.name}</span>
                      <span style={{ color: '#fff', fontWeight: 600 }}>{d.visitors.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        <div className="col-12 col-lg-7">
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>Top Cities</div>
              <button onClick={() => exportCSV(['City', 'Country', 'Visitors'], cities.map(c => [c._id, c.country, c.visitors]), 'cities.csv')} style={{ background: 'transparent', border: '1px solid #3d3020', color: '#8a7a6a', padding: '5px 10px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}>Export CSV</button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #2a1f10', color: '#8a7a6a', fontSize: '10px', textAlign: 'left', letterSpacing: '1px' }}>
                  <th style={{ padding: '8px' }}>#</th>
                  <th style={{ padding: '8px' }}>CITY</th>
                  <th style={{ padding: '8px' }}>COUNTRY</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>VISITORS</th>
                </tr>
              </thead>
              <tbody>
                {cities.map((c, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #1a1410' }}>
                    <td style={{ padding: '8px', color: '#555' }}>{i + 1}</td>
                    <td style={{ padding: '8px', color: '#fff' }}>{c._id}</td>
                    <td style={{ padding: '8px', color: '#8a7a6a' }}>{c.country || '-'}</td>
                    <td style={{ padding: '8px', textAlign: 'right', color: GOLD, fontWeight: 600 }}>{c.visitors.toLocaleString()}</td>
                  </tr>
                ))}
                {cities.length === 0 && (
                  <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#555' }}>No city data yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderTime = () => {
    const hours = data.primary?.hours || [];
    const daysOfWeek = data.primary?.daysOfWeek || [];
    const peakHour = hours.length ? hours.reduce((a, b) => a.views > b.views ? a : b) : null;
    const peakDay = daysOfWeek.length ? daysOfWeek[0] : null;
    return (
      <div className="row g-3">
        <div className="col-12 col-lg-8">
          <div style={cardStyle}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '12px' }}>Visits by Hour of Day</div>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hours}>
                  <CartesianGrid stroke="#2a1f10" strokeDasharray="3 3" />
                  <XAxis dataKey="label" stroke="#8a7a6a" fontSize={10} interval={2} />
                  <YAxis stroke="#8a7a6a" fontSize={11} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="views" fill={GOLD} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-4">
          <div style={cardStyle}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '12px' }}>Busiest Day of Week</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {daysOfWeek.map((d, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', color: '#8a7a6a' }}>{d.day}</span>
                    <span style={{ fontSize: '11px', color: '#fff', fontWeight: 600 }}>{d.views.toLocaleString()}</span>
                  </div>
                  <div style={{ height: '5px', background: '#1a1410', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(100, (d.views / Math.max(1, daysOfWeek[0]?.views || 1)) * 100)}%`, background: GOLD, borderRadius: '3px' }} />
                  </div>
                </div>
              ))}
              {daysOfWeek.length === 0 && <div style={{ textAlign: 'center', color: '#555', fontSize: '12px', padding: '20px 0' }}>No data yet.</div>}
            </div>
            {peakHour && (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #2a1f10' }}>
                <div style={{ fontSize: '11px', color: '#8a7a6a' }}>Peak Hour</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: GOLD }}>{peakHour.label} <span style={{ fontSize: '12px', color: '#8a7a6a' }}>— {peakHour.views.toLocaleString()} views</span></div>
                {peakDay && (
                  <>
                    <div style={{ fontSize: '11px', color: '#8a7a6a', marginTop: '10px' }}>Peak Day</div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: GOLD }}>{peakDay.day} <span style={{ fontSize: '12px', color: '#8a7a6a' }}>— {peakDay.views.toLocaleString()} views</span></div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const formatDuration = (sec) => {
    if (!sec) return '0s';
    if (sec < 60) return `${sec}s`;
    if (sec < 3600) return `${Math.floor(sec / 60)}m ${sec % 60}s`;
    return `${Math.floor(sec / 3600)}h ${Math.floor((sec % 3600) / 60)}m`;
  };

  const exportBtnStyle = {
    display: 'flex', alignItems: 'center', gap: '6px',
    background: 'transparent', border: '1px solid #3d3020',
    color: '#8a7a6a', padding: '7px 14px', borderRadius: '4px',
    fontSize: '11px', fontWeight: 600, cursor: 'pointer',
    letterSpacing: '0.5px', transition: 'all 0.2s',
  };

  const buildExportData = () => {
    const stats = data.primary?.stats || {};
    const funnel = data.funnel || {};
    const mvp = data.mostVisitedPages || [];
    const sources = data.sources?.sources || [];
    const referrers = data.sources?.referrers || [];
    const events = data.events || [];
    const chartData = data.chartData || [];

    if (activeTab === 'overview') {
      return {
        excelFile: 'velnora-traffic-overview.xlsx',
        sheets: [
          { name: 'Daily Traffic', headers: ['Date', 'Page Views', 'Unique Visitors'], rows: chartData.map(d => [d.date, d.views, d.visitors]), widths: [12, 12, 12] },
          { name: 'Most Visited Pages', headers: ['#', 'Page', 'Views'], rows: mvp.map((p, i) => [i + 1, p._id, p.views]), widths: [5, 50, 10] },
          { name: 'Event Breakdown', headers: ['Event', 'Count'], rows: events.map(e => [e._id, e.count]), widths: [25, 10] },
          { name: 'Conversion Funnel', headers: ['Stage', 'Count'], rows: [['Product Views', funnel.productViews || 0], ['Add to Cart', funnel.cartAdds || 0], ['Checkout Started', funnel.checkoutStarts || 0], ['Purchases', funnel.purchases || 0]], widths: [20, 10] },
        ],
        pdfFile: 'velnora-traffic-overview.pdf',
        pdfTitle: 'VELNORA — Traffic Overview',
        pdfSubtitle: `Last ${days} days`,
        summary: [
          { label: 'Total Page Views', value: (stats.totalPageViews || 0).toLocaleString() },
          { label: 'Unique Visitors', value: (stats.uniqueVisitors || 0).toLocaleString() },
          { label: 'Bounce Rate', value: `${stats.bounceRate || 0}%` },
          { label: 'Avg Session', value: formatDuration(stats.avgSessionSec) },
        ],
        sections: [
          { title: 'Most Visited Pages', head: ['#', 'Page', 'Views'], body: mvp.map((p, i) => [i + 1, p._id, p.views.toLocaleString()]) },
          { title: 'Conversion Funnel', head: ['Stage', 'Count'], body: [['Product Views', (funnel.productViews || 0).toLocaleString()], ['Add to Cart', (funnel.cartAdds || 0).toLocaleString()], ['Checkout Started', (funnel.checkoutStarts || 0).toLocaleString()], ['Purchases', (funnel.purchases || 0).toLocaleString()]] },
        ],
      };
    }

    if (activeTab === 'behavior') {
      const devices = data.primary?.devices || [];
      const browsers = data.primary?.browsers || [];
      const os = data.primary?.os || [];
      return {
        excelFile: 'velnora-behavior.xlsx',
        sheets: [
          { name: 'Devices', headers: ['Device', 'Visitors'], rows: devices.map(d => [d._id, d.visitors]), widths: [15, 12] },
          { name: 'Browsers', headers: ['Browser', 'Visitors'], rows: browsers.map(d => [d._id, d.visitors]), widths: [15, 12] },
          { name: 'Operating Systems', headers: ['OS', 'Visitors'], rows: os.map(d => [d._id, d.visitors]), widths: [15, 12] },
          { name: 'Traffic Sources', headers: ['Source', 'Visitors', 'Page Views'], rows: sources.map(s => [s._id, s.visitors, s.pageViews || 0]), widths: [18, 12, 12] },
          { name: 'Referrers', headers: ['Referrer', 'Visitors'], rows: referrers.map(r => [r._id, r.visitors]), widths: [40, 12] },
        ],
        pdfFile: 'velnora-behavior.pdf',
        pdfTitle: 'VELNORA — User Behavior',
        pdfSubtitle: `Last ${days} days`,
        summary: [
          { label: 'Top Device', value: devices[0] ? `${devices[0]._id} (${devices[0].visitors})` : '—' },
          { label: 'Top Browser', value: browsers[0] ? `${browsers[0]._id} (${browsers[0].visitors})` : '—' },
          { label: 'Top OS', value: os[0] ? `${os[0]._id} (${os[0].visitors})` : '—' },
          { label: 'Top Source', value: sources[0] ? `${sources[0]._id} (${sources[0].visitors})` : '—' },
        ],
        sections: [
          { title: 'Device Types', head: ['Device', 'Visitors'], body: devices.map(d => [d._id, d.visitors.toLocaleString()]) },
          { title: 'Browsers', head: ['Browser', 'Visitors'], body: browsers.map(d => [d._id, d.visitors.toLocaleString()]) },
          { title: 'Operating Systems', head: ['OS', 'Visitors'], body: os.map(d => [d._id, d.visitors.toLocaleString()]) },
          { title: 'Traffic Sources', head: ['Source', 'Visitors', 'Page Views'], body: sources.map(s => [s._id, s.visitors.toLocaleString(), (s.pageViews || 0).toLocaleString()]) },
        ],
      };
    }

    if (activeTab === 'products') {
      const products = data.primary?.products || [];
      const rows = products.map(p => [p.name, p.views, p.cartAdds, p.purchases, p.abandonedSessions, `${p.viewToCartRate}%`, `${p.cartToPurchaseRate}%`, `${p.conversionRate}%`]);
      return {
        excelFile: 'velnora-product-funnel.xlsx',
        sheets: [{ name: 'Product Funnel', headers: ['Product', 'Views', 'Cart Adds', 'Purchases', 'Abandoned Sessions', 'View→Cart %', 'Cart→Purchase %', 'Conversion %'], rows, widths: [30, 10, 10, 10, 14, 12, 14, 12] }],
        pdfFile: 'velnora-product-funnel.pdf',
        pdfTitle: 'VELNORA — Product Funnel',
        pdfSubtitle: `Last ${days} days`,
        summary: [
          { label: 'Products Tracked', value: products.length },
          { label: 'Total Views', value: products.reduce((a, p) => a + p.views, 0).toLocaleString() },
          { label: 'Total Purchases', value: products.reduce((a, p) => a + p.purchases, 0).toLocaleString() },
          { label: 'Best Product', value: products[0] ? products[0].name : '—' },
        ],
        sections: [
          { title: 'Product Performance', head: ['Product', 'Views', 'Carts', 'Purchases', 'Abandoned', 'View→Cart', 'Cart→Purchase', 'Conversion'], body: rows },
        ],
      };
    }

    if (activeTab === 'abandoned') {
      const abandoned = data.primary?.abandoned || [];
      const rows = abandoned.map(a => [a.sessionId, (a.items || []).map(it => it.name || it.productId).join(', '), a.lastAdd ? new Date(a.lastAdd).toLocaleString() : '-']);
      return {
        excelFile: 'velnora-abandoned-carts.xlsx',
        sheets: [{ name: 'Abandoned Carts', headers: ['Session', 'Items Added', 'Last Add'], rows, widths: [28, 50, 20] }],
        pdfFile: 'velnora-abandoned-carts.pdf',
        pdfTitle: 'VELNORA — Abandoned Carts',
        pdfSubtitle: `Last ${days} days`,
        summary: [
          { label: 'Abandoned Carts', value: (data.primary?.abandonedSessions || 0).toLocaleString() },
          { label: 'Total Cart Sessions', value: (data.primary?.totalSessions || 0).toLocaleString() },
          { label: 'Abandoned Rate', value: `${data.primary?.abandonedRate || 0}%` },
        ],
        sections: [
          { title: 'Sessions with Abandoned Carts', head: ['Session', 'Items Added', 'Last Add'], body: rows.slice(0, 50) },
        ],
      };
    }

    if (activeTab === 'location') {
      const countries = data.primary?.countries || [];
      const cities = data.primary?.cities || [];
      return {
        excelFile: 'velnora-locations.xlsx',
        sheets: [
          { name: 'Countries', headers: ['Country', 'Visitors'], rows: countries.map(c => [c._id, c.visitors]), widths: [20, 12] },
          { name: 'Cities', headers: ['City', 'Country', 'Visitors'], rows: cities.map(c => [c._id, c.country || '-', c.visitors]), widths: [20, 20, 12] },
        ],
        pdfFile: 'velnora-locations.pdf',
        pdfTitle: 'VELNORA — Visitor Locations',
        pdfSubtitle: `Last ${days} days`,
        summary: [
          { label: 'Top Country', value: countries[0] ? `${countries[0]._id} (${countries[0].visitors})` : '—' },
          { label: 'Top City', value: cities[0] ? `${cities[0]._id} (${cities[0].visitors})` : '—' },
        ],
        sections: [
          { title: 'Countries', head: ['Country', 'Visitors'], body: countries.map(c => [c._id, c.visitors.toLocaleString()]) },
          { title: 'Top Cities', head: ['City', 'Country', 'Visitors'], body: cities.map(c => [c._id, c.country || '-', c.visitors.toLocaleString()]) },
        ],
      };
    }

    if (activeTab === 'time') {
      const hours = data.primary?.hours || [];
      const daysOfWeek = data.primary?.daysOfWeek || [];
      const peakHour = hours.reduce((a, b) => a.views > b.views ? a : b, { label: '-', views: 0 });
      const peakDay = daysOfWeek[0] || { day: '-', views: 0 };
      return {
        excelFile: 'velnora-time-of-visit.xlsx',
        sheets: [
          { name: 'By Hour', headers: ['Hour', 'Page Views'], rows: hours.map(h => [h.label, h.views]), widths: [10, 12] },
          { name: 'By Day', headers: ['Day', 'Page Views'], rows: daysOfWeek.map(d => [d.day, d.views]), widths: [15, 12] },
        ],
        pdfFile: 'velnora-time-of-visit.pdf',
        pdfTitle: 'VELNORA — Time of Visit',
        pdfSubtitle: `Last ${days} days`,
        summary: [
          { label: 'Peak Hour', value: `${peakHour.label} (${peakHour.views.toLocaleString()})` },
          { label: 'Peak Day', value: `${peakDay.day} (${(peakDay.views || 0).toLocaleString()})` },
        ],
        sections: [
          { title: 'Visits by Hour', head: ['Hour', 'Page Views'], body: hours.map(h => [h.label, h.views.toLocaleString()]) },
          { title: 'Visits by Day of Week', head: ['Day', 'Page Views'], body: daysOfWeek.map(d => [d.day, d.views.toLocaleString()]) },
        ],
      };
    }

    return null;
  };

  const handleExcelExport = () => {
    const exp = buildExportData();
    if (!exp) return;
    exportToExcel(exp.excelFile, exp.sheets);
  };

  const handlePdfExport = () => {
    const exp = buildExportData();
    if (!exp) return;
    exportToPDF(exp.pdfFile, exp.pdfTitle, exp.pdfSubtitle, exp.summary, exp.sections);
  };

  const handleResetTraffic = async () => {
    if (!window.confirm('Reset ALL traffic analytics?\n\nThis will permanently delete all page views, sessions, product views, cart data and abandoned cart history. All numbers will go back to 0 and tracking will start fresh.\n\nThis cannot be undone.')) return;
    setResetting(true);
    try {
      const { data: res } = await axios.post(`${API_URL}/api/analytics/reset-traffic`, {}, config);
      if (res.success) {
        setData({});
        fetchData();
        window.alert(`Traffic analytics reset successfully.\n\nDeleted: ${res.deleted?.events || 0} events, ${res.deleted?.sessions || 0} sessions. Tracking has restarted from zero.`);
      }
    } catch (error) {
      console.error('Reset traffic error:', error);
      window.alert('Failed to reset traffic analytics. Please try again.');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a' }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="admin-main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ height: '60px', background: '#0d0a06', borderBottom: '1px solid #2a1f10', display: 'flex', alignItems: 'center', padding: '0 24px', gap: '16px', flexShrink: 0 }}>
          <button onClick={() => setSidebarOpen(s => !s)} className="admin-hamburger" style={{ background: 'transparent', border: 'none', color: '#8a7a6a', cursor: 'pointer', padding: '4px' }}>
            <Filter size={20} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <img src="/images/logo.png" alt="VELNORA" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: '14px', letterSpacing: '2px', color: '#c9a84c' }}>VELNORA</span>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {DAY_OPTIONS.map(d => (
              <button key={d.value} onClick={() => setDays(d.value)}
                style={{
                  background: days === d.value ? 'rgba(201,168,76,0.15)' : 'transparent',
                  border: days === d.value ? '1px solid #c9a84c' : '1px solid #3d3020',
                  color: days === d.value ? GOLD : '#8a7a6a',
                  padding: '6px 12px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer',
                }}>
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <MousePointerClick size={18} color={GOLD} />
              <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: 700, margin: 0 }}>Traffic & Behavior Analytics</h2>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {tabs.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: activeTab === t.id ? 'rgba(201,168,76,0.15)' : 'transparent',
                    border: activeTab === t.id ? '1px solid #c9a84c' : '1px solid #3d3020',
                    color: activeTab === t.id ? GOLD : '#8a7a6a',
                    padding: '8px 16px', borderRadius: '5px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                    letterSpacing: '0.5px',
                  }}>
                  <t.icon size={14} />
                  {t.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <button onClick={handleExcelExport} style={exportBtnStyle}
                onMouseEnter={e => { e.currentTarget.style.color = '#27ae60'; e.currentTarget.style.borderColor = '#27ae60'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#8a7a6a'; e.currentTarget.style.borderColor = '#3d3020'; }}>
                <FileSpreadsheet size={13} /> Export Excel
              </button>
              <button onClick={handlePdfExport} style={exportBtnStyle}
                onMouseEnter={e => { e.currentTarget.style.color = '#e74c3c'; e.currentTarget.style.borderColor = '#e74c3c'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#8a7a6a'; e.currentTarget.style.borderColor = '#3d3020'; }}>
                <FileText size={13} /> Export PDF
              </button>
              <div style={{ width: '1px', background: '#3d3020' }} />
              <button onClick={handleResetTraffic} disabled={resetting}
                style={{
                  ...exportBtnStyle,
                  background: resetting ? 'transparent' : 'rgba(231,76,60,0.08)',
                  borderColor: '#e74c3c',
                  color: resetting ? '#555' : '#e74c3c',
                  cursor: resetting ? 'not-allowed' : 'pointer',
                  border: '1px solid #e74c3c',
                }}>
                <RotateCcw size={13} style={{ animation: resetting ? 'spin 1s linear infinite' : 'none' }} /> {resetting ? 'Resetting...' : 'Reset Traffic Analytics'}
              </button>
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '12px' }}>
                <Loader2 size={28} color={GOLD} style={{ animation: 'spin 1s linear infinite' }} />
                <div style={{ color: '#8a7a6a', fontSize: '13px' }}>Loading analytics...</div>
              </div>
            ) : (
              <>
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'behavior' && renderBehavior()}
                {activeTab === 'products' && renderProducts()}
                {activeTab === 'abandoned' && renderAbandoned()}
                {activeTab === 'location' && renderLocation()}
                {activeTab === 'time' && renderTime()}
              </>
            )}
          </div>
        </div>
      </div>

      {previewImage && (
        <div onClick={() => setPreviewImage(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.88)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}>
          <div style={{ position: 'relative', maxWidth: '92vw', maxHeight: '92vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img src={previewImage} alt="Product preview" style={{ maxWidth: '92vw', maxHeight: '88vh', borderRadius: '6px', border: '1px solid #3d3020', objectFit: 'contain' }} />
            <span style={{ marginTop: '10px', color: '#8a7a6a', fontSize: '11px' }}>Click anywhere to close</span>
          </div>
        </div>
      )}
    </div>
  );
}
