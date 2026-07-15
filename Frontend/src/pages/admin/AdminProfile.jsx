import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAlert } from '../../context/AlertContext';
import {
    Users, Menu, X, Shield, User, Lock, Trash2, Loader2, ChevronLeft, ChevronRight
} from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import API_URL from '../../config';

const inputStyle = {
    width: '100%', background: '#1a1410', border: '1px solid #3d3020',
    borderRadius: '4px', color: '#fff', fontSize: '13px',
    padding: '10px 14px', outline: 'none'
};
const labelStyle = { fontSize: '12px', color: '#a09080', marginBottom: '6px', display: 'block', fontWeight: 600, letterSpacing: '0.5px' };

export default function AdminProfile() {
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(false);
    const [admins, setAdmins] = useState([]);
    const [loadingAdmins, setLoadingAdmins] = useState(true);

    const [profile, setProfile] = useState({ username: '', email: '' });
    const [profileLoading, setProfileLoading] = useState(true);
    const [myRole, setMyRole] = useState('');

    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [deleteTarget, setDeleteTarget] = useState(null);

    const token = localStorage.getItem('adminToken');
    const authConfig = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchProfile();
        fetchAdmins();
    }, []);

    const fetchProfile = async () => {
        setProfileLoading(true);
        try {
            const { data } = await axios.get(`${API_URL}/api/auth/profile`, authConfig);
            if (data.success) {
                setProfile({ username: data.admin.username, email: data.admin.email });
                setMyRole(data.admin.role);
            }
        } catch (error) {
            console.error('Error fetching profile', error);
        } finally {
            setProfileLoading(false);
        }
    };

    const fetchAdmins = async () => {
        setLoadingAdmins(true);
        try {
            const { data } = await axios.get(`${API_URL}/api/auth/admins`, authConfig);
            if (data.success) setAdmins(data.admins);
        } catch (error) {
            console.error('Error fetching admins', error);
        } finally {
            setLoadingAdmins(false);
        }
    };

    const handleProfileSave = async () => {
        if (!profile.username.trim()) { showAlert({ type: 'warning', message: 'Username is required.' }); return; }
        if (!profile.email.trim()) { showAlert({ type: 'warning', message: 'Email is required.' }); return; }
        setLoading(true);
        try {
            const { data } = await axios.put(`${API_URL}/api/auth/profile`, profile, authConfig);
            if (data.success) {
                showAlert({ type: 'success', message: 'Profile updated successfully.' });
                setProfile({ username: data.admin.username, email: data.admin.email });
            }
        } catch (error) {
            showAlert({ type: 'error', message: error.response?.data?.message || 'Failed to update profile.' });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async () => {
        if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
            showAlert({ type: 'warning', message: 'All password fields are required.' }); return;
        }
        if (passwords.newPassword.length < 8) {
            showAlert({ type: 'warning', message: 'New password must be at least 8 characters.' }); return;
        }
        if (passwords.newPassword !== passwords.confirmPassword) {
            showAlert({ type: 'warning', message: 'New password and confirm password do not match.' }); return;
        }
        setLoading(true);
        try {
            const { data } = await axios.put(`${API_URL}/api/auth/change-password`, passwords, authConfig);
            if (data.success) {
                showAlert({ type: 'success', message: 'Password changed successfully.' });
                setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
            }
        } catch (error) {
            showAlert({ type: 'error', message: error.response?.data?.message || 'Failed to change password.' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAdmin = async () => {
        if (!deleteTarget) return;
        setLoading(true);
        try {
            const { data } = await axios.delete(`${API_URL}/api/auth/admins/${deleteTarget._id}`, authConfig);
            if (data.success) {
                showAlert({ type: 'success', message: 'Admin deleted successfully.' });
                setAdmins(prev => prev.filter(a => a._id !== deleteTarget._id));
                setDeleteTarget(null);
            }
        } catch (error) {
            showAlert({ type: 'error', message: error.response?.data?.message || 'Failed to delete admin.' });
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin-secret-login');
    };

    return (
        <div className="bg-black text-white" style={{ fontFamily: "'Inter', sans-serif", paddingTop: '10px' }}>
            <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

                <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                {/* ── MAIN CONTENT ── */}
                <div className="admin-main-content" style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
                    {/* Top Bar */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #1a1410', background: '#0d0a06' }}>
                        <div className="d-flex align-items-center gap-3">
                            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="admin-hamburger" style={{ background: 'transparent', border: 'none', color: '#c9a84c', cursor: 'pointer', padding: '4px' }}>
                                {sidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
                            </button>
                            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>Admin Profile & Settings</h2>
                        </div>
                        <div className="d-flex align-items-center gap-2" style={{ fontSize: '12px', color: '#8a7a6a' }}>
                            <Shield size={14} style={{ color: '#c9a84c' }} />
                            {myRole === 'founder' ? 'Founder Admin' : 'Admin'}
                        </div>
                    </div>

                    <div style={{ padding: '28px 32px', maxWidth: '900px' }}>
                        {/* ── EDIT PROFILE ── */}
                        <div style={{ background: '#0d0a06', border: '1px solid #2a1f10', borderRadius: '8px', marginBottom: '24px' }}>
                            <div style={{ padding: '18px 24px', borderBottom: '1px solid #1a1410', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <User size={18} style={{ color: '#c9a84c' }} />
                                <span style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>Edit Profile</span>
                            </div>
                            <div style={{ padding: '24px' }}>
                                {profileLoading ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#8a7a6a' }}>
                                        <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                                        <span style={{ fontSize: '13px' }}>Loading profile...</span>
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                            <div>
                                                <label style={labelStyle}>Username</label>
                                                <input
                                                    value={profile.username}
                                                    onChange={e => setProfile({ ...profile, username: e.target.value })}
                                                    style={inputStyle}
                                                    onFocus={e => e.target.style.borderColor = '#c9a84c'}
                                                    onBlur={e => e.target.style.borderColor = '#3d3020'}
                                                />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Email</label>
                                                <input
                                                    value={profile.email}
                                                    onChange={e => setProfile({ ...profile, email: e.target.value })}
                                                    type="email"
                                                    style={inputStyle}
                                                    onFocus={e => e.target.style.borderColor = '#c9a84c'}
                                                    onBlur={e => e.target.style.borderColor = '#3d3020'}
                                                />
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <button
                                                onClick={handleProfileSave}
                                                disabled={loading}
                                                style={{
                                                    padding: '10px 24px', background: '#c9a84c', border: 'none', color: '#0a0a0a',
                                                    borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 700,
                                                    opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '6px'
                                                }}
                                            >
                                                {loading && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                                                {loading ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* ── CHANGE PASSWORD ── */}
                        <div style={{ background: '#0d0a06', border: '1px solid #2a1f10', borderRadius: '8px', marginBottom: '24px' }}>
                            <div style={{ padding: '18px 24px', borderBottom: '1px solid #1a1410', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Lock size={18} style={{ color: '#c9a84c' }} />
                                <span style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>Change Password</span>
                            </div>
                            <div style={{ padding: '24px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                    <div>
                                        <label style={labelStyle}>Current Password</label>
                                        <input
                                            type="password"
                                            value={passwords.currentPassword}
                                            onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                            style={inputStyle}
                                            onFocus={e => e.target.style.borderColor = '#c9a84c'}
                                            onBlur={e => e.target.style.borderColor = '#3d3020'}
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>New Password</label>
                                        <input
                                            type="password"
                                            value={passwords.newPassword}
                                            onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                                            style={inputStyle}
                                            onFocus={e => e.target.style.borderColor = '#c9a84c'}
                                            onBlur={e => e.target.style.borderColor = '#3d3020'}
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Confirm New Password</label>
                                        <input
                                            type="password"
                                            value={passwords.confirmPassword}
                                            onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                            style={inputStyle}
                                            onFocus={e => e.target.style.borderColor = '#c9a84c'}
                                            onBlur={e => e.target.style.borderColor = '#3d3020'}
                                        />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <button
                                        onClick={handlePasswordChange}
                                        disabled={loading}
                                        style={{
                                            padding: '10px 24px', background: '#c9a84c', border: 'none', color: '#0a0a0a',
                                            borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 700,
                                            opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '6px'
                                        }}
                                    >
                                        {loading && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                                        {loading ? 'Changing...' : 'Change Password'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ── ALL ADMINS ── */}
                        <div style={{ background: '#0d0a06', border: '1px solid #2a1f10', borderRadius: '8px' }}>
                            <div style={{ padding: '18px 24px', borderBottom: '1px solid #1a1410', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Users size={18} style={{ color: '#c9a84c' }} />
                                <span style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>All Admins</span>
                                <span style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '10px', padding: '1px 10px', fontSize: '11px', color: '#c9a84c', fontWeight: 700 }}>{admins.length}</span>
                            </div>
                            <div style={{ padding: '16px 24px' }}>
                                {loadingAdmins ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#8a7a6a', padding: '20px 0' }}>
                                        <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                                        <span style={{ fontSize: '13px' }}>Loading admins...</span>
                                    </div>
                                ) : (
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid #2a1f10' }}>
                                                {['#', 'Username', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                                                    <th key={h} style={{ padding: '10px 14px', fontSize: '11px', color: '#6a5a4a', fontWeight: 600, letterSpacing: '0.5px', textAlign: h === 'Actions' ? 'center' : 'left', textTransform: 'uppercase' }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {admins.map((a, i) => {
                                                const isMe = a._id === profile._id || a.email === profile.email;
                                                return (
                                                    <tr key={a._id} style={{ borderBottom: '1px solid #1a1410' }}
                                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                        <td style={{ padding: '12px 14px', fontSize: '13px', color: '#6a5a4a' }}>{i + 1}</td>
                                                        <td style={{ padding: '12px 14px', fontSize: '13px', color: '#fff', fontWeight: 500 }}>
                                                            {a.username} {isMe && <span style={{ fontSize: '10px', color: '#c9a84c', marginLeft: '6px' }}>(You)</span>}
                                                        </td>
                                                        <td style={{ padding: '12px 14px', fontSize: '13px', color: '#a09080' }}>{a.email}</td>
                                                        <td style={{ padding: '12px 14px' }}>
                                                            <span style={{
                                                                background: a.role === 'founder' ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.05)',
                                                                color: a.role === 'founder' ? '#c9a84c' : '#8a7a6a',
                                                                border: `1px solid ${a.role === 'founder' ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.1)'}`,
                                                                borderRadius: '20px', padding: '3px 12px', fontSize: '11px', fontWeight: 600
                                                            }}>
                                                                {a.role === 'founder' ? 'Founder' : 'Admin'}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '12px 14px', fontSize: '12px', color: '#6a5a4a' }}>
                                                            {new Date(a.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                        </td>
                                                        <td style={{ padding: '12px 14px' }}>
                                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                                {!isMe && myRole === 'founder' && (
                                                                    <button
                                                                        onClick={() => setDeleteTarget(a)}
                                                                        style={{
                                                                            width: '30px', height: '30px', background: 'transparent',
                                                                            border: '1px solid #3d3020', borderRadius: '4px', cursor: 'pointer',
                                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                            transition: 'border-color 0.15s'
                                                                        }}
                                                                        onMouseEnter={e => e.currentTarget.style.borderColor = '#e74c3c'}
                                                                        onMouseLeave={e => e.currentTarget.style.borderColor = '#3d3020'}
                                                                    >
                                                                        <Trash2 size={13} style={{ color: '#e74c3c' }} />
                                                                    </button>
                                                                )}
                                                                {isMe && (
                                                                    <span style={{ fontSize: '11px', color: '#6a5a4a', padding: '6px 0' }}>—</span>
                                                                )}
                                                                {!isMe && myRole !== 'founder' && (
                                                                    <span style={{ fontSize: '11px', color: '#6a5a4a', padding: '6px 0' }}>—</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── DELETE ADMIN MODAL ── */}
            {deleteTarget && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
                    zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }} onClick={() => !loading && setDeleteTarget(null)}>
                    <div style={{
                        background: '#0f0c09', border: '1px solid #3d3020', borderRadius: '8px',
                        width: '90%', maxWidth: '420px', padding: '0'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #2a1f10' }}>
                            <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>Delete Admin</div>
                            <button onClick={() => !loading && setDeleteTarget(null)} style={{ background: 'transparent', border: 'none', color: '#8a7a6a', cursor: 'pointer' }}><X size={18} /></button>
                        </div>
                        <div style={{ padding: '32px 24px', textAlign: 'center' }}>
                            <div style={{ width: '72px', height: '72px', borderRadius: '50%', border: '2px solid #e74c3c40', background: '#e74c3c15', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                <Trash2 size={32} style={{ color: '#e74c3c' }} strokeWidth={1.4} />
                            </div>
                            <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
                                Delete admin <span style={{ color: '#c9a84c' }}>{deleteTarget.username}</span>?
                            </div>
                            <div style={{ fontSize: '13px', color: '#8a7a6a', marginBottom: '28px' }}>
                                This action cannot be undone.
                            </div>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                <button onClick={() => setDeleteTarget(null)} disabled={loading}
                                    style={{ padding: '10px 28px', background: 'transparent', border: '1px solid #3d3020', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                                    Cancel
                                </button>
                                <button onClick={handleDeleteAdmin} disabled={loading}
                                    style={{ padding: '10px 28px', background: '#e74c3c', border: 'none', color: '#fff', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 700, opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    {loading && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                                    {loading ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
