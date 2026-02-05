import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Megaphone,
    Plus,
    Edit2,
    Trash2,
    Mail,
    AlertCircle,
    Check,
    X,
    Send
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { adminAPI } from '../../utils/api';
import Loading from '../../components/common/Loading';
import { formatDate } from '../../utils/sanitize';
import './Admin.css';

function ManageAnnouncements() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, loading: authLoading, isAdmin } = useAuth();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [message, setMessage] = useState(null);

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        type: 'announcement',
        title: '',
        content: '',
        status: 'draft'
    });
    const [formErrors, setFormErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [sendingEmail, setSendingEmail] = useState(null);

    useEffect(() => {
        if (!authLoading && !isAdmin()) {
            navigate('/admin/login');
        }
    }, [authLoading, user, navigate]);

    useEffect(() => {
        if (isAdmin()) {
            fetchAnnouncements();
        }
    }, [user, typeFilter, statusFilter]);

    const fetchAnnouncements = async (pageNum = 1, append = false) => {
        try {
            setLoading(true);
            const response = await adminAPI.getAnnouncements(pageNum, 20, typeFilter, statusFilter);

            if (append) {
                setAnnouncements((prev) => [...prev, ...response.data.announcements]);
            } else {
                setAnnouncements(response.data.announcements);
            }

            setHasMore(response.data.pagination.hasMore);
            setPage(pageNum);
        } catch (error) {
            setMessage({ type: 'error', text: t('common.error') });
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.title.trim()) errors.title = t('common.required');
        if (!formData.content.trim()) errors.content = t('common.required');
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            if (editingId) {
                await adminAPI.updateAnnouncement(editingId, formData);
                setAnnouncements((prev) =>
                    prev.map((a) => (a.id === editingId ? { ...a, ...formData } : a))
                );
                setMessage({ type: 'success', text: t('admin.announcements.updated') });
            } else {
                const response = await adminAPI.createAnnouncement(formData);
                fetchAnnouncements();
                setMessage({ type: 'success', text: t('admin.announcements.created') });
            }
            resetForm();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || t('common.error') });
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (announcement) => {
        setEditingId(announcement.id);
        setFormData({
            type: announcement.type,
            title: announcement.title,
            content: announcement.content,
            status: announcement.status
        });
        setShowForm(true);
        setFormErrors({});
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t('admin.announcements.deleteConfirm'))) return;

        try {
            await adminAPI.deleteAnnouncement(id);
            setAnnouncements((prev) => prev.filter((a) => a.id !== id));
            setMessage({ type: 'success', text: t('admin.announcements.deleted') });
        } catch (error) {
            setMessage({ type: 'error', text: t('common.error') });
        }
    };

    const handleSendEmail = async (id) => {
        if (!window.confirm(t('admin.announcements.sendEmailConfirm'))) return;

        setSendingEmail(id);
        try {
            const response = await adminAPI.sendAnnouncementEmail(id);
            setAnnouncements((prev) =>
                prev.map((a) => (a.id === id ? { ...a, emailSent: true, emailSentAt: new Date().toISOString() } : a))
            );
            setMessage({
                type: 'success',
                text: t('admin.announcements.emailStarted') || '이메일 발송이 시작되었습니다'
            });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || t('common.error') });
        } finally {
            setSendingEmail(null);
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({
            type: 'announcement',
            title: '',
            content: '',
            status: 'draft'
        });
        setFormErrors({});
    };

    const getTypeBadgeClass = (type) => {
        switch (type) {
            case 'new_app': return 'success';
            case 'update': return 'primary';
            case 'announcement': return 'warning';
            default: return 'secondary';
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'new_app': return t('admin.announcements.types.newApp');
            case 'update': return t('admin.announcements.types.update');
            case 'announcement': return t('admin.announcements.types.announcement');
            default: return type;
        }
    };

    if (authLoading) {
        return (
            <div className="admin-page">
                <Loading />
            </div>
        );
    }

    if (!isAdmin()) {
        return null;
    }

    return (
        <div className="admin-page page">
            <div className="container">
                <div className="admin-header">
                    <h1>
                        <Megaphone size={28} />
                        {t('admin.announcements.title')}
                    </h1>
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            resetForm();
                            setShowForm(true);
                        }}
                    >
                        <Plus size={18} />
                        {t('admin.announcements.new')}
                    </button>
                </div>

                {message && (
                    <div className={`alert alert-${message.type}`}>
                        {message.text}
                    </div>
                )}

                {showForm && (
                    <div className="card form-card">
                        <h3>{editingId ? t('admin.announcements.edit') : t('admin.announcements.new')}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">{t('admin.announcements.type')}</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleFormChange}
                                    className="form-input"
                                >
                                    <option value="new_app">{t('admin.announcements.types.newApp')}</option>
                                    <option value="update">{t('admin.announcements.types.update')}</option>
                                    <option value="announcement">{t('admin.announcements.types.announcement')}</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">{t('admin.announcements.titleLabel')}</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleFormChange}
                                    className={`form-input ${formErrors.title ? 'error' : ''}`}
                                    placeholder={t('admin.announcements.titlePlaceholder')}
                                />
                                {formErrors.title && <span className="form-error">{formErrors.title}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">{t('admin.announcements.content')}</label>
                                <textarea
                                    name="content"
                                    value={formData.content}
                                    onChange={handleFormChange}
                                    className={`form-textarea ${formErrors.content ? 'error' : ''}`}
                                    rows={6}
                                    placeholder={t('admin.announcements.contentPlaceholder')}
                                />
                                {formErrors.content && <span className="form-error">{formErrors.content}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">{t('admin.announcements.status')}</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleFormChange}
                                    className="form-input"
                                >
                                    <option value="draft">{t('admin.announcements.draft')}</option>
                                    <option value="published">{t('admin.announcements.published')}</option>
                                </select>
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    <Check size={18} />
                                    {submitting ? t('common.loading') : t('common.save')}
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                                    <X size={18} />
                                    {t('common.cancel')}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="filter-section">
                    <div className="filter-tabs">
                        <button
                            className={`filter-tab ${typeFilter === '' ? 'active' : ''}`}
                            onClick={() => setTypeFilter('')}
                        >
                            {t('admin.announcements.all')}
                        </button>
                        <button
                            className={`filter-tab ${typeFilter === 'new_app' ? 'active' : ''}`}
                            onClick={() => setTypeFilter('new_app')}
                        >
                            {t('admin.announcements.types.newApp')}
                        </button>
                        <button
                            className={`filter-tab ${typeFilter === 'update' ? 'active' : ''}`}
                            onClick={() => setTypeFilter('update')}
                        >
                            {t('admin.announcements.types.update')}
                        </button>
                        <button
                            className={`filter-tab ${typeFilter === 'announcement' ? 'active' : ''}`}
                            onClick={() => setTypeFilter('announcement')}
                        >
                            {t('admin.announcements.types.announcement')}
                        </button>
                    </div>

                    <div className="filter-tabs">
                        <button
                            className={`filter-tab ${statusFilter === '' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('')}
                        >
                            {t('admin.announcements.allStatus')}
                        </button>
                        <button
                            className={`filter-tab ${statusFilter === 'draft' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('draft')}
                        >
                            {t('admin.announcements.draft')}
                        </button>
                        <button
                            className={`filter-tab ${statusFilter === 'published' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('published')}
                        >
                            {t('admin.announcements.published')}
                        </button>
                    </div>
                </div>

                {loading ? (
                    <Loading text={t('common.loading')} />
                ) : announcements.length === 0 ? (
                    <div className="no-data-container">
                        <AlertCircle size={48} />
                        <p>{t('common.noData')}</p>
                    </div>
                ) : (
                    <div className="admin-table-container">
                        <table className="admin-table table">
                            <thead>
                                <tr>
                                    <th>{t('admin.announcements.type')}</th>
                                    <th>{t('admin.announcements.titleLabel')}</th>
                                    <th>{t('admin.announcements.status')}</th>
                                    <th>{t('admin.announcements.emailStatus')}</th>
                                    <th>{t('admin.announcements.date')}</th>
                                    <th>{t('admin.announcements.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {announcements.map((announcement) => (
                                    <tr key={announcement.id}>
                                        <td>
                                            <span className={`badge badge-${getTypeBadgeClass(announcement.type)}`}>
                                                {getTypeLabel(announcement.type)}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="announcement-title-cell">
                                                <span className="announcement-title">{announcement.title}</span>
                                                <span className="announcement-preview">
                                                    {announcement.content.length > 50
                                                        ? announcement.content.substring(0, 50) + '...'
                                                        : announcement.content}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge badge-${
                                                announcement.status === 'published' ? 'success' : 'secondary'
                                            }`}>
                                                {announcement.status === 'published'
                                                    ? t('admin.announcements.published')
                                                    : t('admin.announcements.draft')}
                                            </span>
                                        </td>
                                        <td>
                                            {announcement.emailSent ? (
                                                <span className="email-sent-badge">
                                                    <Mail size={14} />
                                                    {formatDate(announcement.emailSentAt)}
                                                </span>
                                            ) : (
                                                <span className="email-not-sent">-</span>
                                            )}
                                        </td>
                                        <td>{formatDate(announcement.createdAt)}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn-icon primary"
                                                    onClick={() => handleEdit(announcement)}
                                                    title={t('common.edit')}
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                {announcement.status === 'published' && !announcement.emailSent && (
                                                    <button
                                                        className="btn-icon success"
                                                        onClick={() => handleSendEmail(announcement.id)}
                                                        disabled={sendingEmail === announcement.id}
                                                        title={t('admin.announcements.sendEmail')}
                                                    >
                                                        {sendingEmail === announcement.id ? (
                                                            <span className="spinner-small" />
                                                        ) : (
                                                            <Send size={16} />
                                                        )}
                                                    </button>
                                                )}
                                                <button
                                                    className="btn-icon danger"
                                                    onClick={() => handleDelete(announcement.id)}
                                                    title={t('common.delete')}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {hasMore && !loading && (
                    <div className="load-more">
                        <button
                            className="btn btn-secondary"
                            onClick={() => fetchAnnouncements(page + 1, true)}
                        >
                            {t('reviews.loadMore')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ManageAnnouncements;
