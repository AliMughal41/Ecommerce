import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAlert } from '../../context/AlertContext';
import {
    Search, Menu, Bell,
    ChevronDown, Plus, Edit, Trash2, Loader2
} from 'lucide-react';
import API_URL from '../../config';
import AdminSidebar from '../../components/AdminSidebar';
import Pagination from '../../components/Pagination';

const inputStyle = {
    width: '100%', background: '#1a1410', border: '1px solid #3d3020',
    borderRadius: '3px', color: '#fff', fontSize: '13px',
    padding: '9px 12px', outline: 'none'
};
const labelStyle = { fontSize: '12px', color: '#a09080', marginBottom: '5px', display: 'block' };

export default function AdminSuperCategories() {
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const [superCategories, setSuperCategories] = useState([]);
    const [categories, setCategories] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activePage, setActivePage] = useState('super-categories');
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [loading, setLoading] = useState(false);

    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState({ name: '', description: '', status: 'Active' });

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const [scRes, catRes] = await Promise.all([
                axios.get(`${API_URL}/api/super-categories`),
                axios.get(`${API_URL}/api/categories`),
            ]);
            if (scRes.data.success) setSuperCategories(scRes.data.superCategories);
            if (catRes.data.success) setCategories(catRes.data.categories);
        } catch (error) {
            console.error('Error fetching data', error);
        } finally {
            setLoading(false);
        }
    };

    const filtered = superCategories.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.description?.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleAdd = async () => {
        if (!form.name.trim()) {
            showAlert({ type: 'warning', message: 'Super category name is required' });
            return;
        }
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const { data } = await axios.post(`${API_URL}/api/super-categories`, form, {
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setSuperCategories([data.superCategory, ...superCategories]);
                setShowAdd(false);
                setForm({ name: '', description: '', status: 'Active' });
                showAlert({ type: 'success', message: 'Super category created' });
            }
        } catch (error) {
            showAlert({ type: 'error', message: error.response?.data?.message || 'Error adding' });
        } finally {
            setLoading(false);
        }
    };

    const handleEditSave = async () => {
        if (!form.name.trim()) {
            showAlert({ type: 'warning', message: 'Super category name is required' });
            return;
        }
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const { data } = await axios.put(`${API_URL}/api/super-categories/${selected._id}`, form, {
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setSuperCategories(superCategories.map(s => s._id === selected._id ? data.superCategory : s));
                setShowEdit(false);
                showAlert({ type: 'success', message: 'Super category updated' });
            }
        } catch (error) {
            showAlert({ type: 'error', message: error.response?.data?.message || 'Error updating' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteConfirm = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const { data } = await axios.delete(`${API_URL}/api/super-categories/${selected._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setSuperCategories(superCategories.filter(s => s._id !== selected._id));
                setShowDelete(false);
                showAlert({ type: 'success', message: 'Super category deleted' });
            }
        } catch (error) {
            showAlert({ type: 'error', message: error.response?.data?.message || 'Error deleting' });
        } finally {
            setLoading(false);
        }
    };

    const categoryCount = (scId) => categories.filter(c => c.superCategory?._id === scId).length;

    const modalStyle = {
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: 1000, padding: '20px'
    };

    const cardStyle = {
        background: '#1a1a1a', border: '1px solid #3d3020', borderRadius: '10px',
        padding: '28px', maxWidth: '480px', width: '100%'
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

            <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* MAIN */}
            <div className="admin-main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <div style={{ height: '60px', background: '#0d0a06', borderBottom: '1px solid #2a1f10', display: 'flex', alignItems: 'center', padding: '0 24px', gap: '16px', flexShrink: 0 }}>
                    <button onClick={() => setSidebarOpen(s => !s)} className="admin-hamburger" style={{ background: 'transparent', border: 'none', color: '#8a7a6a', cursor: 'pointer', padding: '4px' }}>
                        <Menu size={20} />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', border: '1.5px solid #c9a84c', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            <img src="/images/logo.png" alt="VELNORA" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '14px', letterSpacing: '2px', color: '#c9a84c' }}>VELNORA</span>
                    </div>
                    <div style={{ flex: 1 }} />
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <Search size={15} style={{ position: 'absolute', left: '10px', color: '#555' }} />
                        <input placeholder="Search super categories..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            style={{ ...inputStyle, paddingLeft: '32px', width: '180px', height: '34px', fontSize: '12px' }} />
                    </div>
                    <div style={{ position: 'relative', cursor: 'pointer' }}>
                        <Bell size={18} style={{ color: '#8a7a6a' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '4px 12px', borderRadius: '4px', border: '1px solid #2a1f10' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #c9a84c, #8b6914)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px' }}>A</div>
                        <div>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff', lineHeight: 1.2 }}>Admin</div>
                            <div style={{ fontSize: '10px', color: '#8a7a6a' }}>Super Admin</div>
                        </div>
                        <ChevronDown size={13} style={{ color: '#8a7a6a' }} />
                    </div>
                </div>

                <div style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <div>
                            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '0.5px' }}>Super Categories</h1>
                            <div style={{ fontSize: '12px', color: '#8a7a6a', marginTop: '4px' }}>
                                <span style={{ cursor: 'pointer', color: '#c9a84c' }} onClick={() => navigate('/admin-super-categories')}>Dashboard</span>
                                <span style={{ margin: '0 6px', color: '#3d3020' }}>&rsaquo;</span>
                                <span>Super Categories</span>
                            </div>
                        </div>
                        <button
                            onClick={() => { setForm({ name: '', description: '', status: 'Active' }); setShowAdd(true); }}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#c9a84c', color: '#0a0a0a', border: 'none', borderRadius: '4px', padding: '10px 18px', fontWeight: 700, fontSize: '13px', letterSpacing: '0.5px', cursor: 'pointer' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#d4b050'}
                            onMouseLeave={e => e.currentTarget.style.background = '#c9a84c'}>
                            <Plus size={16} /> Add Super Category
                        </button>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                        {[
                            { label: 'Total Super Categories', value: superCategories.length, color: '#c9a84c' },
                            { label: 'Active', value: superCategories.filter(s => s.status === 'Active').length, color: '#4caf50' },
                            { label: 'Categories Linked', value: categories.filter(c => c.superCategory).length, color: '#5b8ee6' },
                        ].map((stat, i) => (
                            <div key={i} style={{ background: '#0f0c09', border: '1px solid #2a1f10', borderRadius: '6px', padding: '18px 20px' }}>
                                <div style={{ fontSize: '11px', color: '#8a7a6a', letterSpacing: '0.5px', marginBottom: '2px' }}>{stat.label}</div>
                                <div style={{ fontSize: '22px', fontWeight: 700, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                            </div>
                        ))}
                    </div>

                    {/* Table */}
                    <div style={{ background: '#0f0c09', border: '1px solid #2a1f10', borderRadius: '6px', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderBottom: '1px solid #2a1f10', flexWrap: 'wrap' }}>
                            <div style={{ position: 'relative', flex: '1', minWidth: '180px' }}>
                                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
                                <input placeholder="Search super categories..."
                                    value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                                    style={{ ...inputStyle, paddingLeft: '32px', height: '36px', fontSize: '12px' }} />
                            </div>
                            <span style={{ fontSize: '12px', color: '#8a7a6a' }}>Total: {filtered.length}</span>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #2a1f10' }}>
                                        {['#', 'Name', 'Description', 'Categories', 'Status', 'Created', 'Actions'].map(h => (
                                            <th key={h} style={{ padding: '12px 16px', fontSize: '12px', color: '#8a7a6a', fontWeight: 600, letterSpacing: '0.5px', textAlign: h === 'Actions' ? 'center' : 'left', whiteSpace: 'nowrap' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginated.map((sc, i) => (
                                        <tr key={sc._id} style={{ borderBottom: '1px solid #1a1410', transition: 'background 0.15s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,0.04)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <td style={{ padding: '12px 16px', fontSize: '13px', color: '#8a7a6a' }}>{(currentPage - 1) * itemsPerPage + i + 1}</td>
                                            <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#c9a84c' }}>{sc.name}</td>
                                            <td style={{ padding: '12px 16px', fontSize: '12px', color: '#8a7a6a', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sc.description || '—'}</td>
                                            <td style={{ padding: '12px 16px', fontSize: '12px', color: '#5b8ee6', fontWeight: 600 }}>{categoryCount(sc._id)}</td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '3px', fontWeight: 600, background: sc.status === 'Active' ? 'rgba(76,175,80,0.12)' : 'rgba(231,76,60,0.12)', color: sc.status === 'Active' ? '#4caf50' : '#e74c3c', border: `1px solid ${sc.status === 'Active' ? 'rgba(76,175,80,0.3)' : 'rgba(231,76,60,0.3)'}` }}>
                                                    {sc.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 16px', fontSize: '12px', color: '#8a7a6a' }}>{new Date(sc.createdAt).toLocaleDateString()}</td>
                                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                                    <button
                                                        onClick={() => { setSelected(sc); setForm({ name: sc.name, description: sc.description || '', status: sc.status }); setShowEdit(true); }}
                                                        style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', color: '#c9a84c', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                                                        <Edit size={12} /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => { setSelected(sc); setShowDelete(true); }}
                                                        style={{ background: 'rgba(244,67,54,0.1)', border: '1px solid rgba(244,67,54,0.3)', color: '#f44336', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                                                        <Trash2 size={12} /> Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {paginated.length === 0 && (
                                        <tr><td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#8a7a6a', fontSize: '13px' }}>No super categories found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div style={{ padding: '0 20px' }}>
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                itemsPerPage={itemsPerPage}
                                onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ADD Modal */}
            {showAdd && (
                <div style={modalStyle} onClick={() => setShowAdd(false)}>
                    <div style={cardStyle} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#c9a84c', margin: 0 }}>Add Super Category</h3>
                            <button onClick={() => setShowAdd(false)} style={{ background: 'transparent', border: 'none', color: '#8a7a6a', cursor: 'pointer' }}><Trash2 size={18} /></button>
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>Name *</label>
                            <input name="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} placeholder="e.g. Bags, Jewellery" />
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>Description</label>
                            <textarea name="description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Short description..." />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={labelStyle}>Status</label>
                            <select name="status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={inputStyle}>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                        <button onClick={handleAdd} disabled={loading}
                            style={{ width: '100%', padding: '10px', background: '#c9a84c', color: '#0a0a0a', border: 'none', borderRadius: '4px', fontWeight: 700, fontSize: '13px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                            {loading ? 'Saving...' : 'Create Super Category'}
                        </button>
                    </div>
                </div>
            )}

            {/* EDIT Modal */}
            {showEdit && (
                <div style={modalStyle} onClick={() => setShowEdit(false)}>
                    <div style={cardStyle} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#c9a84c', margin: 0 }}>Edit Super Category</h3>
                            <button onClick={() => setShowEdit(false)} style={{ background: 'transparent', border: 'none', color: '#8a7a6a', cursor: 'pointer' }}><Trash2 size={18} /></button>
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>Name *</label>
                            <input name="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>Description</label>
                            <textarea name="description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={labelStyle}>Status</label>
                            <select name="status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={inputStyle}>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                        <button onClick={handleEditSave} disabled={loading}
                            style={{ width: '100%', padding: '10px', background: '#c9a84c', color: '#0a0a0a', border: 'none', borderRadius: '4px', fontWeight: 700, fontSize: '13px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            )}

            {/* DELETE Modal */}
            {showDelete && (
                <div style={modalStyle} onClick={() => setShowDelete(false)}>
                    <div style={cardStyle} onClick={e => e.stopPropagation()}>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f44336', margin: '0 0 12px' }}>Delete Super Category</h3>
                        <p style={{ fontSize: '13px', color: '#8a7a6a', marginBottom: '20px', lineHeight: 1.6 }}>
                            Are you sure you want to delete <strong style={{ color: '#fff' }}>{selected?.name}</strong>? This cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowDelete(false)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #3d3020', color: '#8a7a6a', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
                            <button onClick={handleDeleteConfirm} disabled={loading}
                                style={{ padding: '8px 16px', background: '#f44336', border: 'none', color: '#fff', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 600, opacity: loading ? 0.7 : 1 }}>
                                {loading ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
