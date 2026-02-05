import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    User,
    Mail,
    Lock,
    Star,
    MessageSquare,
    Trash2,
    ChevronRight,
    LogOut,
    Calendar
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { userAPI } from '../../utils/api';
import './User.css';

function MyPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [stats, setStats] = useState({
        reviewCount: 0,
        inquiryCount: 0
    });
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const [reviewsRes, inquiriesRes] = await Promise.all([
                userAPI.getReviews(1, 1),
                userAPI.getInquiries(1, 1)
            ]);

            setStats({
                reviewCount: reviewsRes.data.pagination.total,
                inquiryCount: inquiriesRes.data.pagination.total
            });
        } catch (error) {
            console.error('Failed to load stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const handleDeleteAccount = async () => {
        if (!deletePassword) {
            setDeleteError(t('common.required'));
            return;
        }

        setDeleteLoading(true);
        setDeleteError('');

        try {
            await userAPI.deleteAccount(deletePassword);
            await logout();
            navigate('/');
        } catch (error) {
            setDeleteError(error.response?.data?.error || t('mypage.deleteFailed'));
        } finally {
            setDeleteLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="mypage page">
            <div className="container">
                <div className="page-header">
                    <h1>{t('mypage.title')}</h1>
                    <p>{t('mypage.subtitle')}</p>
                </div>

                <div className="mypage-content">
                    <div className="profile-card card">
                        <div className="profile-header">
                            <div className="profile-avatar">
                                <User size={48} />
                            </div>
                            <div className="profile-info">
                                <h2>{user?.name || t('mypage.noName')}</h2>
                                <p className="profile-email">
                                    <Mail size={14} />
                                    {user?.email}
                                </p>
                                {user?.createdAt && (
                                    <p className="profile-joined">
                                        <Calendar size={14} />
                                        {t('mypage.joined', { date: formatDate(user.createdAt) })}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="profile-stats">
                            <div className="stat-item">
                                <Star size={20} />
                                <span className="stat-value">{stats.reviewCount}</span>
                                <span className="stat-label">{t('mypage.reviews')}</span>
                            </div>
                            <div className="stat-item">
                                <MessageSquare size={20} />
                                <span className="stat-value">{stats.inquiryCount}</span>
                                <span className="stat-label">{t('mypage.inquiries')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mypage-menu">
                        <Link to="/mypage/password" className="menu-item card">
                            <Lock size={20} />
                            <span>{t('mypage.changePassword')}</span>
                            <ChevronRight size={18} />
                        </Link>

                        <Link to="/mypage/reviews" className="menu-item card">
                            <Star size={20} />
                            <span>{t('mypage.myReviews')}</span>
                            <span className="menu-badge">{stats.reviewCount}</span>
                            <ChevronRight size={18} />
                        </Link>

                        <Link to="/mypage/inquiries" className="menu-item card">
                            <MessageSquare size={20} />
                            <span>{t('mypage.myInquiries')}</span>
                            <span className="menu-badge">{stats.inquiryCount}</span>
                            <ChevronRight size={18} />
                        </Link>

                        <button onClick={handleLogout} className="menu-item card logout-btn">
                            <LogOut size={20} />
                            <span>{t('auth.logout')}</span>
                        </button>

                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="menu-item card delete-btn"
                        >
                            <Trash2 size={20} />
                            <span>{t('mypage.deleteAccount')}</span>
                        </button>
                    </div>
                </div>

                {showDeleteModal && (
                    <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                        <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
                            <h3>{t('mypage.deleteAccountTitle')}</h3>
                            <p className="modal-warning">{t('mypage.deleteWarning')}</p>

                            <div className="form-group">
                                <label className="form-label">{t('mypage.confirmPassword')}</label>
                                <input
                                    type="password"
                                    value={deletePassword}
                                    onChange={(e) => setDeletePassword(e.target.value)}
                                    className={`form-input ${deleteError ? 'error' : ''}`}
                                    placeholder={t('auth.passwordPlaceholder')}
                                />
                                {deleteError && <span className="form-error">{deleteError}</span>}
                            </div>

                            <div className="modal-actions">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="btn btn-secondary"
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    className="btn btn-danger"
                                    disabled={deleteLoading}
                                >
                                    {deleteLoading ? t('common.loading') : t('mypage.deleteAccount')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyPage;
