import React, { useState, useEffect } from 'react';

import axios from 'axios';
import { useAlert } from '../../context/AlertContext';
import {
    Package, Tag, Plus, X, Trash2, Search,
    ChevronLeft, ChevronRight, AlertTriangle,
    Pencil, Menu, Bell, ChevronDown
} from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import Pagination from '../../components/Pagination';
import API_URL from '../../config';

const inputStyle = {
    width: '100%', background: '#1a1410', border: '1px solid #3d3020',
    borderRadius: '3px', color: '#fff', fontSize: '13px',
    padding: '9px 12px', outline: 'none'
};
const labelStyle = { fontSize: '12px', color: '#a09080', marginBottom: '5px', display: 'block' };

export default function AdminCategories() {
    const { showAlert } = useAlert();
    const [categories, setCategories] = useState([]);
    const [superCategories, setSuperCategories] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(8);
    const [loading, setLoading] = useState(false);

    // Modals
    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [form, setForm] = useState({ name: '', description: '', image: '', status: 'Active', superCategory: '' });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const [catRes, scRes] = await Promise.all([
                axios.get(`${API_URL}/api/categories`),
                axios.get(`${API_URL}/api/super-categories`),
            ]);
            if (catRes.data.success) setCategories(catRes.data.categories);
            if (scRes.data.success) setSuperCategories(scRes.data.superCategories);
        } catch (error) {
            console.error('Error fetching categories:', error);
            showAlert({ type: 'error', message: 'Failed to fetch categories' });
        } finally {
            setLoading(false);
        }
    };

    const filtered = categories.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.description?.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleFormChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleAdd = async () => {
        if (!form.name.trim()) {
            showAlert({ type: 'warning', message: 'Category name is required' });
            return;
        }
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const config = { 
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            };
            const { data } = await axios.post(`${API_URL}/api/categories`, form, config);
            if (data.success) {
                setCategories([data.category, ...categories]);
                setShowAdd(false);
                setForm({ name: '', description: '', image: '', status: 'Active', superCategory: '' });
            }
        } catch (error) {
            showAlert({ type: 'error', message: error.response?.data?.message || 'Error adding category' });
        } finally {
            setLoading(false);
        }
    };

    const handleEditOpen = (category) => {
        setSelectedCategory(category);
        setForm({
            name: category.name,
            description: category.description || '',
            image: category.image || '',
            status: category.status || 'Active',
            superCategory: category.superCategory?._id || ''
        });
        setShowEdit(true);
    };

    const handleEditSave = async () => {
        if (!form.name.trim()) {
            showAlert({ type: 'warning', message: 'Category name is required' });
            return;
        }
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const config = { 
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            };
            const { data } = await axios.put(
                `${API_URL}/api/categories/${selectedCategory._id}`, 
                form, 
                config
            );
            if (data.success) {
                setCategories(categories.map(c => 
                    c._id === selectedCategory._id ? data.category : c
                ));
                setShowEdit(false);
            }
        } catch (error) {
            showAlert({ type: 'error', message: error.response?.data?.message || 'Error updating category' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteOpen = (category) => {
        setSelectedCategory(category);
        setShowDelete(true);
    };

    const handleDeleteConfirm = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const config = { 
                headers: { 
                    'Authorization': `Bearer ${token}`
                }
            };
            const { data } = await axios.delete(
                `${API_URL}/api/categories/${selectedCategory._id}`, 
                config
            );
            if (data.success) {
                setCategories(categories.filter(c => c._id !== selectedCategory._id));
                setShowDelete(false);
            }
        } catch (error) {
            showAlert({ type: 'error', message: error.response?.data?.message || 'Error deleting category' });
        } finally {
            setLoading(false);
        }
    };

    const statusColor = (status) => status === 'Active' ? '#4caf50' : '#e74c3c';

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

            {/* ── SIDEBAR ── */}
            <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* ── MAIN ── */}
            <div className="admin-main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

                {/* Top Bar */}
                <div style={{ height: '60px', background: '#0d0a06', borderBottom: '1px solid #2a1f10', display: 'flex', alignItems: 'center', padding: '0 24px', gap: '16px', flexShrink: 0 }}>
                    <button onClick={() => setSidebarOpen(s => !s)} className="admin-hamburger"
                        style={{ background: 'transparent', border: 'none', color: '#8a7a6a', cursor: 'pointer', padding: '4px' }}>
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
                        <input placeholder="Search categories..." 
                            value={search} onChange={e => setSearch(e.target.value)}
                            style={{ ...inputStyle, paddingLeft: '32px', width: '180px', height: '34px', fontSize: '12px' }} />
                    </div>

                    <div style={{ position: 'relative', cursor: 'pointer' }}>
                        <Bell size={18} style={{ color: '#8a7a6a' }} />
                        <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#c9a84c', color: '#0a0a0a', borderRadius: '50%', fontSize: '9px', fontWeight: 700, width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
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

                {/* Page Content */}
                <div style={{ flex: 1, padding: '28px 28px', overflowY: 'auto' }}>

                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <div>
                            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '0.5px' }}>Categories</h1>
                            <div style={{ fontSize: '12px', color: '#8a7a6a', marginTop: '4px' }}>
                                <span style={{ cursor: 'pointer', color: '#c9a84c' }}>Dashboard</span>
                                <span style={{ margin: '0 6px', color: '#3d3020' }}>›</span>
                                <span>Categories</span>
                            </div>
                        </div>
                        <button
                            onClick={() => { setForm({ name: '', description: '', image: '', status: 'Active' }); setShowAdd(true); }}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#c9a84c', color: '#0a0a0a', border: 'none', borderRadius: '4px', padding: '10px 18px', fontWeight: 700, fontSize: '13px', letterSpacing: '0.5px', cursor: 'pointer', transition: 'background 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#d4b050'}
                            onMouseLeave={e => e.currentTarget.style.background = '#c9a84c'}>
                            <Plus size={16} /> Add New Category
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="admin-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                        {[
                            { icon: Tag, label: 'Total Categories', value: categories.length, color: '#c9a84c' },
                            { icon: Tag, label: 'Active Categories', value: categories.filter(c => c.status === 'Active').length, color: '#4caf50' },
                            { icon: Tag, label: 'Inactive Categories', value: categories.filter(c => c.status === 'Inactive').length, color: '#e74c3c' },
                            { icon: Package, label: 'Total Products', value: categories.reduce((sum, c) => sum + (c.productCount || 0), 0), color: '#5b8ee6' },
                        ].map((stat, i) => (
                            <div key={i} style={{ background: '#0f0c09', border: '1px solid #2a1f10', borderRadius: '6px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <div style={{ width: '46px', height: '46px', borderRadius: '6px', border: `1px solid ${stat.color}30`, background: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <stat.icon size={22} style={{ color: stat.color }} strokeWidth={1.4} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '11px', color: '#8a7a6a', letterSpacing: '0.5px', marginBottom: '2px' }}>{stat.label}</div>
                                    <div style={{ fontSize: '22px', fontWeight: 700, color: '#fff', lineHeight: 1 }}>{stat.value}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Table Card */}
                    <div style={{ background: '#0f0c09', border: '1px solid #2a1f10', borderRadius: '6px', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderBottom: '1px solid #2a1f10', flexWrap: 'wrap' }}>
                            <div style={{ position: 'relative', flex: '1', minWidth: '180px' }}>
                                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
                                <input placeholder="Search categories..."
                                    value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                                    style={{ ...inputStyle, paddingLeft: '32px', height: '36px', fontSize: '12px' }} />
                            </div>
                            <span style={{ fontSize: '12px', color: '#8a7a6a' }}>
                                Total: {filtered.length} categories
                            </span>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #2a1f10' }}>
                                        {['#', 'Name', 'Description', 'Products', 'Status', 'Created', 'Actions'].map(h => (
                                            <th key={h} style={{ padding: '12px 16px', fontSize: '12px', color: '#8a7a6a', fontWeight: 600, letterSpacing: '0.5px', textAlign: h === 'Actions' ? 'center' : 'left', whiteSpace: 'nowrap' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginated.map((cat, i) => (
                                        <tr key={cat._id} style={{ borderBottom: '1px solid #1a1410', transition: 'background 0.15s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <td style={{ padding: '12px 16px', fontSize: '13px', color: '#8a7a6a' }}>{(currentPage - 1) * ITEMS_PER_PAGE + i + 1}</td>
                                            <td style={{ padding: '12px 16px', fontSize: '13px', color: '#fff', fontWeight: 500 }}>{cat.name}</td>
                                            <td style={{ padding: '12px 16px', fontSize: '13px', color: '#a09080' }}>{cat.description || 'No description'}</td>
                                            <td style={{ padding: '12px 16px', fontSize: '13px', color: '#c9a84c', fontWeight: 600 }}>{cat.productCount || 0}</td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <span style={{ background: `${statusColor(cat.status)}20`, color: statusColor(cat.status), border: `1px solid ${statusColor(cat.status)}40`, borderRadius: '20px', padding: '3px 12px', fontSize: '11px', fontWeight: 600 }}>{cat.status}</span>
                                            </td>
                                            <td style={{ padding: '12px 16px', fontSize: '12px', color: '#8a7a6a' }}>
                                                {new Date(cat.createdAt).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                    <button onClick={() => handleEditOpen(cat)}
                                                        style={{ width: '30px', height: '30px', background: 'transparent', border: '1px solid #3d3020', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color 0.15s' }}
                                                        onMouseEnter={e => e.currentTarget.style.borderColor = '#c9a84c'}
                                                        onMouseLeave={e => e.currentTarget.style.borderColor = '#3d3020'}>
                                                        <Pencil size={13} style={{ color: '#c9a84c' }} />
                                                    </button>
                                                    <button onClick={() => handleDeleteOpen(cat)}
                                                        style={{ width: '30px', height: '30px', background: 'transparent', border: '1px solid #3d3020', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color 0.15s' }}
                                                        onMouseEnter={e => e.currentTarget.style.borderColor = '#e74c3c'}
                                                        onMouseLeave={e => e.currentTarget.style.borderColor = '#3d3020'}>
                                                        <Trash2 size={13} style={{ color: '#e74c3c' }} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
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

            {/* ── ADD MODAL ── */}
            {showAdd && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
                    onClick={e => { if (e.target === e.currentTarget) setShowAdd(false); }}>
                    <div style={{ background: '#0f0c09', border: '1px solid #3d3020', borderRadius: '6px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #2a1f10' }}>
                            <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>Add New Category</div>
                            <button onClick={() => setShowAdd(false)} style={{ background: 'transparent', border: 'none', color: '#8a7a6a', cursor: 'pointer' }}><X size={18} /></button>
                        </div>
                        <div style={{ padding: '24px' }}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={labelStyle}>Category Name <span style={{ color: '#c9a84c' }}>*</span></label>
                                <input name="name" value={form.name} onChange={handleFormChange} placeholder="Enter category name" style={inputStyle}
                                    onFocus={e => e.target.style.borderColor = '#c9a84c'} onBlur={e => e.target.style.borderColor = '#3d3020'} />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={labelStyle}>Description</label>
                                <textarea name="description" value={form.description} onChange={handleFormChange} placeholder="Enter category description" rows={3}
                                    style={{ ...inputStyle, resize: 'vertical' }}
                                    onFocus={e => e.target.style.borderColor = '#c9a84c'} onBlur={e => e.target.style.borderColor = '#3d3020'} />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={labelStyle}>Status</label>
                                <select name="status" value={form.status} onChange={handleFormChange} style={{ ...inputStyle, cursor: 'pointer' }}>
                                    <option style={{ background: '#1a1410' }}>Active</option>
                                    <option style={{ background: '#1a1410' }}>Inactive</option>
                                </select>
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={labelStyle}>Super Category</label>
                                <select name="superCategory" value={form.superCategory} onChange={handleFormChange} style={{ ...inputStyle, cursor: 'pointer' }}>
                                    <option value="" style={{ background: '#1a1410' }}>None</option>
                                    {superCategories.map(sc => (
                                        <option key={sc._id} value={sc._id} style={{ background: '#1a1410' }}>{sc.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                                <button onClick={() => setShowAdd(false)}
                                    style={{ padding: '9px 20px', background: 'transparent', border: '1px solid #3d3020', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                                    Cancel
                                </button>
                                <button onClick={handleAdd} disabled={loading}
                                    style={{ padding: '9px 20px', background: '#c9a84c', border: 'none', color: '#0a0a0a', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 700, opacity: loading ? 0.7 : 1 }}>
                                    {loading ? 'Saving...' : 'Save Category'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── EDIT MODAL ── */}
            {showEdit && selectedCategory && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
                    onClick={e => { if (e.target === e.currentTarget) setShowEdit(false); }}>
                    <div style={{ background: '#0f0c09', border: '1px solid #3d3020', borderRadius: '6px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #2a1f10' }}>
                            <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>Edit Category</div>
                            <button onClick={() => setShowEdit(false)} style={{ background: 'transparent', border: 'none', color: '#8a7a6a', cursor: 'pointer' }}><X size={18} /></button>
                        </div>
                        <div style={{ padding: '24px' }}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={labelStyle}>Category Name <span style={{ color: '#c9a84c' }}>*</span></label>
                                <input name="name" value={form.name} onChange={handleFormChange} placeholder="Enter category name" style={inputStyle}
                                    onFocus={e => e.target.style.borderColor = '#c9a84c'} onBlur={e => e.target.style.borderColor = '#3d3020'} />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={labelStyle}>Description</label>
                                <textarea name="description" value={form.description} onChange={handleFormChange} placeholder="Enter category description" rows={3}
                                    style={{ ...inputStyle, resize: 'vertical' }}
                                    onFocus={e => e.target.style.borderColor = '#c9a84c'} onBlur={e => e.target.style.borderColor = '#3d3020'} />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={labelStyle}>Status</label>
                                <select name="status" value={form.status} onChange={handleFormChange} style={{ ...inputStyle, cursor: 'pointer' }}>
                                    <option style={{ background: '#1a1410' }}>Active</option>
                                    <option style={{ background: '#1a1410' }}>Inactive</option>
                                </select>
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={labelStyle}>Super Category</label>
                                <select name="superCategory" value={form.superCategory} onChange={handleFormChange} style={{ ...inputStyle, cursor: 'pointer' }}>
                                    <option value="" style={{ background: '#1a1410' }}>None</option>
                                    {superCategories.map(sc => (
                                        <option key={sc._id} value={sc._id} style={{ background: '#1a1410' }}>{sc.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                                <button onClick={() => setShowEdit(false)}
                                    style={{ padding: '9px 20px', background: 'transparent', border: '1px solid #3d3020', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                                    Cancel
                                </button>
                                <button onClick={handleEditSave} disabled={loading}
                                    style={{ padding: '9px 20px', background: '#c9a84c', border: 'none', color: '#0a0a0a', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 700, opacity: loading ? 0.7 : 1 }}>
                                    {loading ? 'Updating...' : 'Update Category'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── DELETE MODAL ── */}
            {showDelete && selectedCategory && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
                    onClick={e => { if (e.target === e.currentTarget) setShowDelete(false); }}>
                    <div style={{ background: '#0f0c09', border: '1px solid #3d3020', borderRadius: '6px', width: '100%', maxWidth: '420px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #2a1f10' }}>
                            <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>Delete Category</div>
                            <button onClick={() => setShowDelete(false)} style={{ background: 'transparent', border: 'none', color: '#8a7a6a', cursor: 'pointer' }}><X size={18} /></button>
                        </div>
                        <div style={{ padding: '32px 24px', textAlign: 'center' }}>
                            <div style={{ width: '72px', height: '72px', borderRadius: '50%', border: '2px solid #e74c3c40', background: '#e74c3c15', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                <AlertTriangle size={32} style={{ color: '#e74c3c' }} strokeWidth={1.4} />
                            </div>
                            <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>Are you sure you want to delete this category?</div>
                            <div style={{ fontSize: '13px', color: '#8a7a6a', marginBottom: '8px' }}>Category: <span style={{ color: '#c9a84c' }}>{selectedCategory.name}</span></div>
                            <div style={{ fontSize: '12px', color: '#e74c3c', marginBottom: '28px' }}>This action cannot be undone.</div>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                <button onClick={() => setShowDelete(false)}
                                    style={{ padding: '10px 28px', background: 'transparent', border: '1px solid #3d3020', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                                    Cancel
                                </button>
                                <button onClick={handleDeleteConfirm} disabled={loading}
                                    style={{ padding: '10px 28px', background: '#e74c3c', border: 'none', color: '#fff', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 700, opacity: loading ? 0.7 : 1 }}>
                                    {loading ? 'Deleting...' : 'Delete Category'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}