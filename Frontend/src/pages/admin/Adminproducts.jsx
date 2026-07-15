import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import imageCompression from 'browser-image-compression';
import { useAlert } from '../../context/AlertContext';
import {
    LayoutDashboard, Package, Tag, ShoppingCart, Users, Ticket,
    Star, Image, Settings, UserCog, BarChart2, LogOut, Menu, X,
    Search, Bell, ChevronDown, Eye, Pencil, Trash2, Plus,
    Upload, AlertTriangle, Filter, ChevronLeft, ChevronRight, Loader2
} from 'lucide-react';
import API_URL from '../../config';
import AdminSidebar from '../../components/AdminSidebar';
import Pagination from '../../components/Pagination';

/* ─── INITIAL DATA ──────────────────────────────────────────────────── */
const initialProducts = [];

const emptyForm = { name: '', category: '', price: '', salePrice: '', stock: '', description: '', status: 'Active', images: [] };

/* ─── MODAL STYLES ──────────────────────────────────────────────────── */
const inputStyle = {
    width: '100%', background: '#1a1410', border: '1px solid #3d3020',
    borderRadius: '3px', color: '#fff', fontSize: '13px',
    padding: '9px 12px', outline: 'none'
};
const labelStyle = { fontSize: '12px', color: '#a09080', marginBottom: '5px', display: 'block' };

/* ─── COMPONENT ─────────────────────────────────────────────────────── */
export default function AdminProducts() {
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const [products, setProducts] = useState(initialProducts);
    const [categories, setCategories] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activePage, setActivePage] = useState('products');
    const [search, setSearch] = useState('');
    const [filterCat, setFilterCat] = useState('All Categories');
    const [filterStatus, setFilterStatus] = useState('Status');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    // Modals
    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        setFetchLoading(true);
        try {
            const { data } = await axios.get(`${API_URL}/api/products`);
            if (data.success) {
                setProducts(data.products);
            }
        } catch (error) {
            console.error('Error fetching products', error);
        } finally {
            setFetchLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/api/categories`);
            if (data.success) {
                setCategories(data.categories);
            }
        } catch (error) {
            console.error('Error fetching categories', error);
        }
    };

    /* ── Filter & paginate ── */
    const filtered = products.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchCat = filterCat === 'All Categories' || p.category === filterCat;
        const matchStatus = filterStatus === 'Status' || p.status === filterStatus;
        return matchSearch && matchCat && matchStatus;
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    /* ── Stats ── */
    const totalStock = products.reduce((s, p) => s + p.stock, 0);
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= 10).length;

    /* ── Handlers ── */
    const handleFormChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleAdd = async () => {
        if (!form.name.trim()) { showAlert({ type: 'warning', message: 'Product name is required.' }); return; }
        if (!form.category.trim()) { showAlert({ type: 'warning', message: 'Category is required.' }); return; }
        if (!form.price || Number(form.price) <= 0) { showAlert({ type: 'warning', message: 'Price must be greater than 0.' }); return; }
        if (form.stock === '' || Number(form.stock) < 0) { showAlert({ type: 'warning', message: 'Stock cannot be negative.' }); return; }
        if (!form.images || form.images.length === 0) { showAlert({ type: 'warning', message: 'Please upload at least one image.' }); return; }
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, withCredentials: true };
            
            const payload = { ...form, price: Number(form.price), stock: Number(form.stock) };
            if (form.salePrice) payload.salePrice = Number(form.salePrice);
            
            const { data } = await axios.post(`${API_URL}/api/products`, payload, config);
            if (data.success) {
                setProducts(p => [data.product, ...p]);
                setShowAdd(false);
                setForm(emptyForm);
            }
        } catch (error) {
            console.error('Error adding product', error);
            showAlert({ type: 'error', message: error.response?.data?.message || 'Error adding product' });
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1024,
            useWebWorker: true
        };

        const compressedImages = [];
        for (const file of files) {
            try {
                const compressedFile = await imageCompression(file, options);
                const reader = new FileReader();
                reader.readAsDataURL(compressedFile);
                reader.onloadend = () => {
                    setForm(prev => ({ ...prev, images: [...prev.images, reader.result] }));
                };
            } catch (error) {
                console.error('Error compressing image', error);
            }
        }
    };

    const handleEditOpen = (p) => {
        setSelectedProduct(p);
        // Initialize form with existing product data
        // existingImages: list of Cloudinary URLs already saved
        setForm({
            name: p.name,
            category: p.category,
            price: p.price,
            salePrice: p.salePrice || '',
            stock: p.stock,
            description: p.description,
            status: p.status,
            images: [], // new images to add (base64)
            existingImages: p.images || [], // already saved Cloudinary images
        });
        setShowEdit(true);
    };
    const handleEditSave = async () => {
        if (!form.name.trim()) { showAlert({ type: 'warning', message: 'Product name is required.' }); return; }
        if (!form.category.trim()) { showAlert({ type: 'warning', message: 'Category is required.' }); return; }
        if (!form.price || Number(form.price) <= 0) { showAlert({ type: 'warning', message: 'Price must be greater than 0.' }); return; }
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, withCredentials: true };
            const payload = {
                name: form.name,
                category: form.category,
                price: Number(form.price),
                salePrice: form.salePrice ? Number(form.salePrice) : null,
                stock: Number(form.stock),
                description: form.description,
                status: form.status,
                images: form.images, // new base64 images to upload
                existingImages: form.existingImages, // keep these cloudinary images
            };
            const { data } = await axios.put(`${API_URL}/api/products/${selectedProduct._id}`, payload, config);
            if (data.success) {
                setProducts(prev => prev.map(p => p._id === selectedProduct._id ? data.product : p));
                setShowEdit(false);
            }
        } catch (error) {
            console.error('Error updating product', error);
            showAlert({ type: 'error', message: error.response?.data?.message || 'Error updating product' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteOpen = (p) => { setSelectedProduct(p); setShowDelete(true); };
    const handleDeleteConfirm = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const config = { headers: { Authorization: `Bearer ${token}` }, withCredentials: true };
            const { data } = await axios.delete(`${API_URL}/api/products/${selectedProduct._id}`, config);
            if (data.success) {
                setProducts(p => p.filter(x => x._id !== selectedProduct._id));
                setShowDelete(false);
                setSelectedProduct(null);
            }
        } catch (error) {
            console.error('Error deleting product', error);
            showAlert({ type: 'error', message: error.response?.data?.message || 'Error deleting product' });
        } finally {
            setLoading(false);
        }
    };

    const statusColor = (s) => s === 'Active' ? '#4caf50' : s === 'Low Stock' ? '#ff9800' : '#e74c3c';

    return (
           <div className="bg-black text-white" style={{ fontFamily: "'Inter', sans-serif", paddingTop: '10px' }}>

        <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

            <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* ── MAIN ── */}
            <div className="admin-main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

                {/* Top Bar */}
                <div style={{ height: '60px', background: '#0d0a06', borderBottom: '1px solid #2a1f10', display: 'flex', alignItems: 'center', padding: '0 24px', gap: '16px', flexShrink: 0 }}>
                    <button onClick={() => setSidebarOpen(s => !s)} className="admin-hamburger"
                        style={{ background: 'transparent', border: 'none', color: '#8a7a6a', cursor: 'pointer', padding: '4px' }}>
                        <Menu size={20} />
                    </button>

                    {/* Logo text in topbar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', border: '1.5px solid #c9a84c', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            <img src="/images/logo.png" alt="VELNORA" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '14px', letterSpacing: '2px', color: '#c9a84c' }}>VELNORA</span>
                    </div>

                    <div style={{ flex: 1 }} />

                    {/* Search */}
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <Search size={15} style={{ position: 'absolute', left: '10px', color: '#555' }} />
                        <input placeholder="Search..." style={{ ...inputStyle, paddingLeft: '32px', width: '180px', height: '34px', fontSize: '12px' }} />
                    </div>

                    {/* Bell */}
                    <div style={{ position: 'relative', cursor: 'pointer' }}>
                        <Bell size={18} style={{ color: '#8a7a6a' }} />
                        <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#c9a84c', color: '#0a0a0a', borderRadius: '50%', fontSize: '9px', fontWeight: 700, width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
                    </div>

                    {/* Admin user */}
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
                            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '0.5px' }}>Products</h1>
                            <div style={{ fontSize: '12px', color: '#8a7a6a', marginTop: '4px' }}>
                                <span style={{ cursor: 'pointer', color: '#c9a84c' }}>Dashboard</span>
                                <span style={{ margin: '0 6px', color: '#3d3020' }}>›</span>
                                <span>Products</span>
                            </div>
                        </div>
                        <button
                            onClick={() => { setForm(emptyForm); setShowAdd(true); }}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#c9a84c', color: '#0a0a0a', border: 'none', borderRadius: '4px', padding: '10px 18px', fontWeight: 700, fontSize: '13px', letterSpacing: '0.5px', cursor: 'pointer', transition: 'background 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#d4b050'}
                            onMouseLeave={e => e.currentTarget.style.background = '#c9a84c'}>
                            <Plus size={16} /> Add New Product
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <style>{`
                        .admin-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
                        @media (max-width: 768px) { .admin-stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; } }
                    `}</style>
                    <div className="admin-stats-grid">
                        {[
                            { icon: Package, label: 'Total Products', value: products.length, color: '#c9a84c' },
                           { 
    icon: Tag, 
    label: 'Categories', 
    value: categories.length, 
    color: '#5b8ee6',
    path: 'categories',
    onClick: () => navigate('/admin-categories')
},
                            { icon: Package, label: 'Total Stock', value: totalStock.toLocaleString(), color: '#4caf50' },
                            { icon: AlertTriangle, label: 'Low Stock', value: lowStock, color: '#e74c3c' },
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

                        {/* Search + Filter Row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderBottom: '1px solid #2a1f10', flexWrap: 'wrap' }}>
                            <div style={{ position: 'relative', flex: '1', minWidth: '180px' }}>
                                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
                                <input placeholder="Search products..."
                                    value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                                    style={{ ...inputStyle, paddingLeft: '32px', height: '36px', fontSize: '12px' }} />
                            </div>
                            <select value={filterCat} onChange={e => { setFilterCat(e.target.value); setCurrentPage(1); }}
                                style={{ ...inputStyle, width: 'auto', height: '36px', fontSize: '12px', cursor: 'pointer' }}>
                                <option>All Categories</option>
                                {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                            </select>
                            <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                                style={{ ...inputStyle, width: 'auto', height: '36px', fontSize: '12px', cursor: 'pointer' }}>
                                {['Status', 'Active', 'Low Stock', 'Out of Stock'].map(s => <option key={s}>{s}</option>)}
                            </select>
                            <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#c9a84c', color: '#0a0a0a', border: 'none', borderRadius: '4px', padding: '0 16px', height: '36px', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}>
                                <Filter size={13} /> Filter
                            </button>
                        </div>

                        {/* Table */}
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #2a1f10' }}>
                                        {['#', 'Image', 'Product Name', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                                            <th key={h} style={{ padding: '12px 16px', fontSize: '12px', color: '#8a7a6a', fontWeight: 600, letterSpacing: '0.5px', textAlign: h === 'Actions' ? 'center' : 'left', whiteSpace: 'nowrap' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {fetchLoading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid #1a1410' }}>
                                                <td colSpan="8" style={{ padding: '12px 16px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                                        <div style={{ width: '44px', height: '44px', borderRadius: '4px', background: '#1a1410', flexShrink: 0 }} />
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ height: '12px', background: '#1a1410', borderRadius: '3px', marginBottom: '6px', width: '60%' }} />
                                                            <div style={{ height: '10px', background: '#1a1410', borderRadius: '3px', width: '40%' }} />
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        paginated.map((p, i) => (
                                            <tr key={p._id} style={{ borderBottom: '1px solid #1a1410', transition: 'background 0.15s' }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#8a7a6a' }}>{(currentPage - 1) * itemsPerPage + i + 1}</td>
                                                <td style={{ padding: '12px 16px' }}>
                                                    <img src={p.mainImage || 'https://via.placeholder.com/44'} alt={p.name} style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #2a1f10' }} />
                                                </td>
                                                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#fff', fontWeight: 500 }}>{p.name}</td>
                                                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#a09080' }}>{p.category}</td>
                                                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#c9a84c', fontWeight: 600 }}>Rs. {p.price.toLocaleString()}</td>
                                                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#fff' }}>{p.stock}</td>
                                                <td style={{ padding: '12px 16px' }}>
                                                    <span style={{ background: `${statusColor(p.status)}20`, color: statusColor(p.status), border: `1px solid ${statusColor(p.status)}40`, borderRadius: '20px', padding: '3px 12px', fontSize: '11px', fontWeight: 600 }}>{p.status}</span>
                                                </td>
                                                <td style={{ padding: '12px 16px' }}>
                                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                        <button style={{ width: '30px', height: '30px', background: 'transparent', border: '1px solid #3d3020', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color 0.15s' }}
                                                            onMouseEnter={e => e.currentTarget.style.borderColor = '#c9a84c'}
                                                            onMouseLeave={e => e.currentTarget.style.borderColor = '#3d3020'}>
                                                            <Eye size={13} style={{ color: '#c9a84c' }} />
                                                        </button>
                                                        <button onClick={() => handleEditOpen(p)}
                                                            style={{ width: '30px', height: '30px', background: 'transparent', border: '1px solid #3d3020', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color 0.15s' }}
                                                            onMouseEnter={e => e.currentTarget.style.borderColor = '#c9a84c'}
                                                            onMouseLeave={e => e.currentTarget.style.borderColor = '#3d3020'}>
                                                            <Pencil size={13} style={{ color: '#c9a84c' }} />
                                                        </button>
                                                        <button onClick={() => handleDeleteOpen(p)}
                                                            style={{ width: '30px', height: '30px', background: 'transparent', border: '1px solid #3d3020', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color 0.15s' }}
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

            {/* ── MODAL OVERLAY ── */}
            {(showAdd || showEdit || showDelete) && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
                    onClick={e => { if (e.target === e.currentTarget) { setShowAdd(false); setShowEdit(false); setShowDelete(false); } }}>

                    {/* ── ADD MODAL ── */}
                    {showAdd && (
                        <div style={{ background: '#0f0c09', border: '1px solid #3d3020', borderRadius: '6px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #2a1f10' }}>
                                <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>Add New Product</div>
                                <button onClick={() => setShowAdd(false)} style={{ background: 'transparent', border: 'none', color: '#8a7a6a', cursor: 'pointer' }}><X size={18} /></button>
                            </div>
                            <div style={{ padding: '24px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                    <div>
                                        <label style={labelStyle}>Product Name <span style={{ color: '#c9a84c' }}>*</span></label>
                                        <input name="name" value={form.name} onChange={handleFormChange} placeholder="Enter product name" style={inputStyle}
                                            onFocus={e => e.target.style.borderColor = '#c9a84c'} onBlur={e => e.target.style.borderColor = '#3d3020'} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Category <span style={{ color: '#c9a84c' }}>*</span></label>
                                        <select name="category" value={form.category} onChange={handleFormChange} style={{ ...inputStyle, cursor: 'pointer' }}>
                                            <option value="" style={{ background: '#1a1410' }}>Select Category</option>
                                            {categories.map(c => <option key={c._id} value={c.name} style={{ background: '#1a1410' }}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Price <span style={{ color: '#c9a84c' }}>*</span></label>
                                        <input name="price" value={form.price} onChange={handleFormChange} placeholder="Enter price" type="number" style={inputStyle}
                                            onFocus={e => e.target.style.borderColor = '#c9a84c'} onBlur={e => e.target.style.borderColor = '#3d3020'} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Sale Price</label>
                                        <input name="salePrice" value={form.salePrice} onChange={handleFormChange} placeholder="Enter sale price" type="number" style={inputStyle}
                                            onFocus={e => e.target.style.borderColor = '#c9a84c'} onBlur={e => e.target.style.borderColor = '#3d3020'} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Stock <span style={{ color: '#c9a84c' }}>*</span></label>
                                        <input name="stock" value={form.stock} onChange={handleFormChange} placeholder="Enter stock quantity" type="number" style={inputStyle}
                                            onFocus={e => e.target.style.borderColor = '#c9a84c'} onBlur={e => e.target.style.borderColor = '#3d3020'} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Status <span style={{ color: '#c9a84c' }}>*</span></label>
                                        <select name="status" value={form.status} onChange={handleFormChange} style={{ ...inputStyle, cursor: 'pointer' }}>
                                            {['Active', 'Low Stock', 'Out of Stock'].map(s => <option key={s} style={{ background: '#1a1410' }}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>
                                {/* Image Upload */}
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={labelStyle}>Product Images <span style={{ color: '#c9a84c' }}>*</span></label>
                                    <label style={{ display: 'block', border: '1px dashed #3d3020', borderRadius: '4px', padding: '24px', textAlign: 'center', background: '#141010', cursor: 'pointer' }}>
                                        <Upload size={28} style={{ color: '#c9a84c', marginBottom: '8px' }} />
                                        <div style={{ fontSize: '12px', color: '#8a7a6a' }}>Click to upload images</div>
                                        <input type="file" multiple accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                                    </label>
                                    {form.images.length > 0 && (
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                                            {form.images.map((img, idx) => (
                                                <img key={idx} src={img} alt="" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #3d3020' }} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={labelStyle}>Description <span style={{ color: '#c9a84c' }}>*</span></label>
                                    <textarea name="description" value={form.description} onChange={handleFormChange} placeholder="Enter product description" rows={3}
                                        style={{ ...inputStyle, resize: 'vertical' }}
                                        onFocus={e => e.target.style.borderColor = '#c9a84c'} onBlur={e => e.target.style.borderColor = '#3d3020'} />
                                </div>
                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                    <button onClick={() => setShowAdd(false)} disabled={loading}
                                        style={{ padding: '9px 20px', background: 'transparent', border: '1px solid #3d3020', color: '#fff', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 600 }}>
                                        Cancel
                                    </button>
                                    <button onClick={handleAdd} disabled={loading}
                                        style={{ padding: '9px 20px', background: '#c9a84c', border: 'none', color: '#0a0a0a', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 700, opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {loading && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                                        {loading ? 'Creating...' : 'Save Product'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── EDIT MODAL ── */}
                    {showEdit && selectedProduct && (
                        <div style={{ background: '#0f0c09', border: '1px solid #3d3020', borderRadius: '6px', width: '100%', maxWidth: '660px', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #2a1f10' }}>
                                <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>Edit Product</div>
                                <button onClick={() => setShowEdit(false)} style={{ background: 'transparent', border: 'none', color: '#8a7a6a', cursor: 'pointer' }}><X size={18} /></button>
                            </div>
                            <div style={{ padding: '24px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '20px', marginBottom: '20px' }}>
                                    {/* Image preview from Cloudinary */}
                                    <div>
                                        {/* Main image */}
                                        <img
                                            src={form.existingImages?.[0]?.url || selectedProduct.mainImage}
                                            alt=""
                                            style={{ width: '140px', height: '140px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #3d3020' }}
                                        />
                                        {/* Thumbnails row */}
                                        <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                                            {form.existingImages?.map((img, i) => (
                                                <div key={i} style={{ position: 'relative' }}>
                                                    <img src={img.url} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '3px', border: '1px solid #3d3020' }} />
                                                    {/* Remove existing image */}
                                                    <button
                                                        onClick={() => setForm(prev => ({ ...prev, existingImages: prev.existingImages.filter((_, idx) => idx !== i) }))}
                                                        style={{ position: 'absolute', top: '-4px', right: '-4px', width: '14px', height: '14px', background: '#e74c3c', border: 'none', borderRadius: '50%', color: '#fff', fontSize: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, padding: 0 }}>
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                            {/* New images preview */}
                                            {form.images?.map((src, i) => (
                                                <div key={`new-${i}`} style={{ position: 'relative' }}>
                                                    <img src={src} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '3px', border: '1px solid #c9a84c' }} />
                                                    <button
                                                        onClick={() => setForm(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))}
                                                        style={{ position: 'absolute', top: '-4px', right: '-4px', width: '14px', height: '14px', background: '#e74c3c', border: 'none', borderRadius: '50%', color: '#fff', fontSize: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, padding: 0 }}>
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                            {/* Add more images */}
                                            <label style={{ width: '40px', height: '40px', border: '1px dashed #3d3020', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                                <Plus size={14} style={{ color: '#8a7a6a' }} />
                                                <input type="file" multiple accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                                            </label>
                                        </div>
                                    </div>
                                    {/* Fields */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div>
                                            <label style={labelStyle}>Product Name <span style={{ color: '#c9a84c' }}>*</span></label>
                                            <input name="name" value={form.name} onChange={handleFormChange} style={inputStyle}
                                                onFocus={e => e.target.style.borderColor = '#c9a84c'} onBlur={e => e.target.style.borderColor = '#3d3020'} />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Category <span style={{ color: '#c9a84c' }}>*</span></label>
                                            <select name="category" value={form.category} onChange={handleFormChange} style={{ ...inputStyle, cursor: 'pointer' }}>
                                                <option value="" style={{ background: '#1a1410' }}>Select Category</option>
                                                {categories.map(c => <option key={c._id} value={c.name} style={{ background: '#1a1410' }}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                            <div>
                                                <label style={labelStyle}>Price <span style={{ color: '#c9a84c' }}>*</span></label>
                                                <input name="price" value={form.price} onChange={handleFormChange} type="number" style={inputStyle}
                                                    onFocus={e => e.target.style.borderColor = '#c9a84c'} onBlur={e => e.target.style.borderColor = '#3d3020'} />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Sale Price</label>
                                                <input name="salePrice" value={form.salePrice || ''} onChange={handleFormChange} type="number" style={inputStyle}
                                                    onFocus={e => e.target.style.borderColor = '#c9a84c'} onBlur={e => e.target.style.borderColor = '#3d3020'} />
                                            </div>
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Stock <span style={{ color: '#c9a84c' }}>*</span></label>
                                            <input name="stock" value={form.stock} onChange={handleFormChange} type="number" style={inputStyle}
                                                onFocus={e => e.target.style.borderColor = '#c9a84c'} onBlur={e => e.target.style.borderColor = '#3d3020'} />
                                        </div>
                                    </div>
                                </div>
                                <div style={{ marginBottom: '14px' }}>
                                    <label style={labelStyle}>Description <span style={{ color: '#c9a84c' }}>*</span></label>
                                    <textarea name="description" value={form.description} onChange={handleFormChange} rows={3}
                                        style={{ ...inputStyle, resize: 'vertical' }}
                                        onFocus={e => e.target.style.borderColor = '#c9a84c'} onBlur={e => e.target.style.borderColor = '#3d3020'} />
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={labelStyle}>Status <span style={{ color: '#c9a84c' }}>*</span></label>
                                    <select name="status" value={form.status} onChange={handleFormChange} style={{ ...inputStyle, cursor: 'pointer', width: '160px' }}>
                                        {['Active', 'Low Stock', 'Out of Stock'].map(s => <option key={s} style={{ background: '#1a1410' }}>{s}</option>)}
                                    </select>
                                </div>
                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                    <button onClick={() => setShowEdit(false)}
                                        style={{ padding: '9px 20px', background: 'transparent', border: '1px solid #3d3020', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                                        Cancel
                                    </button>
                                    <button onClick={handleEditSave} disabled={loading}
                                        style={{ padding: '9px 20px', background: '#c9a84c', border: 'none', color: '#0a0a0a', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 700, opacity: loading ? 0.7 : 1 }}>
                                        {loading ? 'Saving...' : 'Update Product'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── DELETE MODAL ── */}
                    {showDelete && selectedProduct && (
                        <div style={{ background: '#0f0c09', border: '1px solid #3d3020', borderRadius: '6px', width: '100%', maxWidth: '420px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #2a1f10' }}>
                                <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>Delete Product</div>
                                <button onClick={() => setShowDelete(false)} style={{ background: 'transparent', border: 'none', color: '#8a7a6a', cursor: 'pointer' }}><X size={18} /></button>
                            </div>
                            <div style={{ padding: '32px 24px', textAlign: 'center' }}>
                                <div style={{ width: '72px', height: '72px', borderRadius: '50%', border: '2px solid #e74c3c40', background: '#e74c3c15', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                    <Trash2 size={32} style={{ color: '#e74c3c' }} strokeWidth={1.4} />
                                </div>
                                <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>Are you sure you want to delete this product?</div>
                                <div style={{ fontSize: '13px', color: '#8a7a6a', marginBottom: '28px' }}>This action cannot be undone.</div>
                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                    <button onClick={() => setShowDelete(false)}
                                        style={{ padding: '10px 28px', background: 'transparent', border: '1px solid #3d3020', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                                        Cancel
                                    </button>
                                    <button onClick={handleDeleteConfirm} disabled={loading}
                                        style={{ padding: '10px 28px', background: '#e74c3c', border: 'none', color: '#fff', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 700, opacity: loading ? 0.7 : 1 }}>
                                        {loading ? 'Deleting...' : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
        </div>
    );
}