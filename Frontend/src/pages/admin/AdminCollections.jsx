import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAlert } from '../../context/AlertContext';
import { Search, Plus, Pencil, Trash2, Loader2, X, Upload, Eye } from 'lucide-react';
import API_URL from '../../config';
import AdminSidebar from '../../components/AdminSidebar';
import Pagination from '../../components/Pagination';

const inputStyle = {
    width: '100%', background: '#1a1410', border: '1px solid #3d3020',
    borderRadius: '3px', color: '#fff', fontSize: '13px',
    padding: '9px 12px', outline: 'none'
};
const labelStyle = { fontSize: '12px', color: '#a09080', marginBottom: '5px', display: 'block' };

export default function AdminCollections() {
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const [collections, setCollections] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);

    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState({ name: '', emoji: '✨', description: '', image: '', status: 'Active' });

    useEffect(() => { fetchCollections(); }, []);

    const fetchCollections = async () => {
        setFetchLoading(true);
        try {
            const { data } = await axios.get(`${API_URL}/api/collections`);
            if (data.success) setCollections(data.collections);
        } catch (error) {
            console.error('Error fetching collections', error);
        } finally {
            setFetchLoading(false);
        }
    };

    const filtered = collections.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleFormChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => setForm(prev => ({ ...prev, image: reader.result }));
    };

    const handleAdd = async () => {
        if (!form.name.trim()) { showAlert({ type: 'warning', message: 'Collection name is required.' }); return; }
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, withCredentials: true };
            const { data } = await axios.post(`${API_URL}/api/collections`, form, config);
            if (data.success) {
                setCollections(prev => [data.collection, ...prev]);
                setShowAdd(false);
                setForm({ name: '', emoji: '✨', description: '', image: '', status: 'Active' });
                showAlert({ type: 'success', message: 'Collection created successfully.' });
            }
        } catch (error) {
            showAlert({ type: 'error', message: error.response?.data?.message || 'Error creating collection' });
        } finally {
            setLoading(false);
        }
    };

    const handleEditOpen = (c) => {
        setSelected(c);
        setForm({ name: c.name, emoji: c.emoji || '✨', description: c.description || '', image: '', status: c.status });
        setShowEdit(true);
    };

    const handleEditSave = async () => {
        if (!form.name.trim()) { showAlert({ type: 'warning', message: 'Collection name is required.' }); return; }
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, withCredentials: true };
            const payload = { name: form.name, emoji: form.emoji, description: form.description, status: form.status };
            if (form.image) payload.image = form.image;
            const { data } = await axios.put(`${API_URL}/api/collections/${selected._id}`, payload, config);
            if (data.success) {
                setCollections(prev => prev.map(c => c._id === selected._id ? data.collection : c));
                setShowEdit(false);
                showAlert({ type: 'success', message: 'Collection updated successfully.' });
            }
        } catch (error) {
            showAlert({ type: 'error', message: error.response?.data?.message || 'Error updating collection' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const config = { headers: { Authorization: `Bearer ${token}` }, withCredentials: true };
            await axios.delete(`${API_URL}/api/collections/${selected._id}`, config);
            setCollections(prev => prev.filter(c => c._id !== selected._id));
            setShowDelete(false);
            showAlert({ type: 'success', message: 'Collection deleted.' });
        } catch (error) {
            showAlert({ type: 'error', message: error.response?.data?.message || 'Error deleting collection' });
        } finally {
            setLoading(false);
        }
    };

    const emojiOptions = ['✨', '👜', '💎', '👛', '💍', '🛍️', '🎁', '👑', '💫', '🌟', '🔥', '❤️', '🖤', '🌸', '👠', '⛓️'];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a' }}>
            <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="admin-main-content" style={{ flex: 1, minWidth: 0 }}>
                {/* Header bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #1a1410', background: '#0d0a06' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="admin-hamburger"
                            style={{ width: '36px', height: '36px', background: '#1a1410', border: '1px solid #2a1f10', borderRadius: '6px', display: 'none', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#c9a84c' }}>
                            <span style={{ fontSize: '18px' }}>&#9776;</span>
                        </button>
                        <h5 style={{ color: '#c9a84c', fontWeight: 700, letterSpacing: '1px', margin: 0, fontSize: '15px' }}>COLLECTIONS</h5>
                    </div>
                    <button onClick={() => { setForm({ name: '', emoji: '✨', description: '', image: '', status: 'Active' }); setShowAdd(true); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#c9a84c', color: '#0a0a0a', border: 'none', borderRadius: '4px', padding: '0 16px', height: '36px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>
                        <Plus size={14} /> Add Collection
                    </button>
                </div>

                <div style={{ padding: '24px' }}>
                    {/* Search */}
                    <div style={{ marginBottom: '20px', maxWidth: '300px' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8a7a6a' }} />
                            <input placeholder="Search collections..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                                style={{ ...inputStyle, paddingLeft: '38px' }} />
                        </div>
                    </div>

                    {/* Table */}
                    <div style={{ background: '#0d0a06', border: '1px solid #1a1410', borderRadius: '6px', overflow: 'hidden' }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #2a1f10' }}>
                                        {['#', 'Emoji', 'Image', 'Name', 'Description', 'Status', 'Actions'].map(h => (
                                            <th key={h} style={{ padding: '12px 16px', fontSize: '12px', color: '#8a7a6a', fontWeight: 600, letterSpacing: '0.5px', textAlign: h === 'Actions' ? 'center' : 'left', whiteSpace: 'nowrap' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {fetchLoading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid #1a1410' }}>
                                                <td colSpan="7" style={{ padding: '12px 16px' }}>
                                                    <div style={{ height: '12px', background: '#1a1410', borderRadius: '3px', width: '40%' }} />
                                                </td>
                                            </tr>
                                        ))
                                    ) : paginated.length === 0 ? (
                                        <tr><td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#8a7a6a', fontSize: '13px' }}>No collections found</td></tr>
                                    ) : (
                                        paginated.map((c, i) => (
                                            <tr key={c._id} style={{ borderBottom: '1px solid #1a1410' }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#8a7a6a' }}>{(currentPage - 1) * itemsPerPage + i + 1}</td>
                                                <td style={{ padding: '12px 16px', fontSize: '22px' }}>{c.emoji}</td>
                                                <td style={{ padding: '12px 16px' }}>
                                                    {c.image ? (
                                                        <img src={c.image} alt={c.name} style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #2a1f10' }} />
                                                    ) : (
                                                        <div style={{ width: '44px', height: '44px', borderRadius: '4px', background: '#1a1410', border: '1px solid #2a1f10', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>{c.emoji}</div>
                                                    )}
                                                </td>
                                                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#fff', fontWeight: 500 }}>{c.name}</td>
                                                <td style={{ padding: '12px 16px', fontSize: '12px', color: '#a09080', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.description || '-'}</td>
                                                <td style={{ padding: '12px 16px' }}>
                                                    <span style={{ background: c.status === 'Active' ? 'rgba(46,204,113,0.1)' : 'rgba(231,76,60,0.1)', color: c.status === 'Active' ? '#2ecc71' : '#e74c3c', border: `1px solid ${c.status === 'Active' ? 'rgba(46,204,113,0.3)' : 'rgba(231,76,60,0.3)'}`, borderRadius: '20px', padding: '3px 12px', fontSize: '11px', fontWeight: 600 }}>{c.status}</span>
                                                </td>
                                                <td style={{ padding: '12px 16px' }}>
                                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                        <button onClick={() => handleEditOpen(c)}
                                                            style={{ width: '30px', height: '30px', background: 'transparent', border: '1px solid #3d3020', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                            onMouseEnter={e => e.currentTarget.style.borderColor = '#c9a84c'}
                                                            onMouseLeave={e => e.currentTarget.style.borderColor = '#3d3020'}>
                                                            <Pencil size={13} style={{ color: '#c9a84c' }} />
                                                        </button>
                                                        <button onClick={() => { setSelected(c); setShowDelete(true); }}
                                                            style={{ width: '30px', height: '30px', background: 'transparent', border: '1px solid #3d3020', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                            onMouseEnter={e => e.currentTarget.style.borderColor = '#e74c3c'}
                                                            onMouseLeave={e => e.currentTarget.style.borderColor = '#3d3020'}>
                                                            <Trash2 size={13} style={{ color: '#e74c3c' }} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div style={{ padding: '0 20px' }}>
                            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage}
                                itemsPerPage={itemsPerPage} onItemsPerPageChange={val => { setItemsPerPage(val); setCurrentPage(1); }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── MODAL OVERLAY ── */}
            {(showAdd || showEdit || showDelete) && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
                    onClick={e => { if (e.target === e.currentTarget) { setShowAdd(false); setShowEdit(false); setShowDelete(false); } }}>

                    {/* ADD / EDIT MODAL */}
                    {(showAdd || showEdit) && (
                        <div style={{ background: '#0f0c09', border: '1px solid #3d3020', borderRadius: '6px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #2a1f10' }}>
                                <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>{showAdd ? 'Add Collection' : 'Edit Collection'}</div>
                                <button onClick={() => { setShowAdd(false); setShowEdit(false); }} style={{ background: 'transparent', border: 'none', color: '#8a7a6a', cursor: 'pointer' }}><X size={18} /></button>
                            </div>
                            <div style={{ padding: '24px' }}>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={labelStyle}>Collection Name <span style={{ color: '#c9a84c' }}>*</span></label>
                                    <input name="name" value={form.name} onChange={handleFormChange} placeholder="e.g. Wedding Collection" style={inputStyle}
                                        onFocus={e => e.target.style.borderColor = '#c9a84c'} onBlur={e => e.target.style.borderColor = '#3d3020'} />
                                </div>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={labelStyle}>Emoji</label>
                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                                        {emojiOptions.map(em => (
                                            <button key={em} onClick={() => setForm({ ...form, emoji: em })}
                                                style={{ width: '36px', height: '36px', fontSize: '18px', background: form.emoji === em ? 'rgba(201,168,76,0.2)' : '#1a1410', border: `1px solid ${form.emoji === em ? '#c9a84c' : '#3d3020'}`, borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {em}
                                            </button>
                                        ))}
                                    </div>
                                    <input name="emoji" value={form.emoji} onChange={handleFormChange} placeholder="Type custom emoji" style={inputStyle} />
                                </div>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={labelStyle}>Image</label>
                                    <label style={{ display: 'block', border: '1px dashed #3d3020', borderRadius: '4px', padding: '20px', textAlign: 'center', background: '#141010', cursor: 'pointer' }}>
                                        <Upload size={24} style={{ color: '#c9a84c', marginBottom: '6px' }} />
                                        <div style={{ fontSize: '12px', color: '#8a7a6a' }}>{form.image ? 'Image selected (click to change)' : 'Click to upload image'}</div>
                                        <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                                    </label>
                                    {form.image && (
                                        <img src={form.image} alt="" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #3d3020', marginTop: '8px' }} />
                                    )}
                                    {!form.image && showEdit && selected?.image && (
                                        <img src={selected.image} alt="" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #3d3020', marginTop: '8px', opacity: 0.5 }} />
                                    )}
                                </div>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={labelStyle}>Description</label>
                                    <textarea name="description" value={form.description} onChange={handleFormChange} placeholder="Enter collection description" rows={3}
                                        style={{ ...inputStyle, resize: 'vertical' }}
                                        onFocus={e => e.target.style.borderColor = '#c9a84c'} onBlur={e => e.target.style.borderColor = '#3d3020'} />
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={labelStyle}>Status</label>
                                    <select name="status" value={form.status} onChange={handleFormChange} style={{ ...inputStyle, cursor: 'pointer' }}>
                                        <option value="Active" style={{ background: '#1a1410' }}>Active</option>
                                        <option value="Inactive" style={{ background: '#1a1410' }}>Inactive</option>
                                    </select>
                                </div>
                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                    <button onClick={() => { setShowAdd(false); setShowEdit(false); }} disabled={loading}
                                        style={{ padding: '9px 20px', background: 'transparent', border: '1px solid #3d3020', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Cancel</button>
                                    <button onClick={showAdd ? handleAdd : handleEditSave} disabled={loading}
                                        style={{ padding: '9px 20px', background: '#c9a84c', border: 'none', color: '#0a0a0a', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 700, opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {loading && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                                        {loading ? 'Saving...' : showAdd ? 'Create Collection' : 'Update Collection'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* DELETE MODAL */}
                    {showDelete && selected && (
                        <div style={{ background: '#0f0c09', border: '1px solid #3d3020', borderRadius: '6px', width: '100%', maxWidth: '400px', padding: '24px', textAlign: 'center' }}>
                            <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>Delete Collection?</div>
                            <p style={{ color: '#8a7a6a', fontSize: '13px', marginBottom: '20px' }}>Are you sure you want to delete <strong style={{ color: '#c9a84c' }}>{selected.name}</strong>? This action cannot be undone.</p>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                <button onClick={() => setShowDelete(false)} disabled={loading}
                                    style={{ padding: '9px 20px', background: 'transparent', border: '1px solid #3d3020', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Cancel</button>
                                <button onClick={handleDelete} disabled={loading}
                                    style={{ padding: '9px 20px', background: '#e74c3c', border: 'none', color: '#fff', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 700, opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    {loading && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                                    {loading ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
