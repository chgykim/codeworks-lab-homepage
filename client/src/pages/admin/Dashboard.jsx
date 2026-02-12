import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    LayoutDashboard,
    Star,
    Users,
    Eye,
    TrendingUp,
    AlertCircle,
    Smartphone,
    Megaphone
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { adminAPI } from '../../utils/api';
import Loading from '../../components/common/Loading';
import './Admin.css';

function Dashboard() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, loading: authLoading, isAdmin } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!authLoading && !isAdmin()) {
            navigate('/admin/login');
        }
    }, [authLoading, user, navigate]);

    useEffect(() => {
        if (isAdmin()) {
            fetchDashboard();
        }
    }, [user]);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getDashboard();
            setStats(response.data);
        } catch (error) {
            setError(t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="admin-page">
                <Loading text={t('common.loading')} />
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
                    <div>
                        <h1>
                            <LayoutDashboard size={28} />
                            {t('admin.dashboard.title')}
                        </h1>
                        <p>{t('admin.dashboard.welcome')}, {user?.email}</p>
                    </div>
                </div>

                {error && (
                    <div className="alert alert-error">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                {stats && (
                    <>
                        <div className="stats-grid">
                            <div className="stat-card card">
                                <div className="stat-icon reviews">
                                    <Star size={24} />
                                </div>
                                <div className="stat-info">
                                    <span className="stat-value">{stats.reviews.total}</span>
                                    <span className="stat-label">{t('admin.dashboard.totalReviews')}</span>
                                </div>
                                <div className="stat-details">
                                    <span className="badge badge-warning">
                                        {t('admin.dashboard.pendingReviews')} {stats.reviews.pending}
                                    </span>
                                    <span className="badge badge-success">
                                        {t('admin.dashboard.approvedReviews')} {stats.reviews.approved}
                                    </span>
                                </div>
                            </div>

                            <div className="stat-card card">
                                <div className="stat-icon visitors">
                                    <Users size={24} />
                                </div>
                                <div className="stat-info">
                                    <span className="stat-value">{stats.visitors.uniqueVisitors}</span>
                                    <span className="stat-label">{t('admin.dashboard.uniqueVisitors')}</span>
                                </div>
                                <div className="stat-details">
                                    <span>{t('admin.dashboard.totalVisits')}: {stats.visitors.totalVisits}</span>
                                </div>
                            </div>

                            <div className="stat-card card">
                                <div className="stat-icon rating">
                                    <TrendingUp size={24} />
                                </div>
                                <div className="stat-info">
                                    <span className="stat-value">
                                        {stats.reviews.averageRating || '0.0'}
                                    </span>
                                    <span className="stat-label">{t('admin.dashboard.avgRating')}</span>
                                </div>
                                <div className="stat-details">
                                    <span>Safe Way 12</span>
                                </div>
                            </div>
                        </div>

                        <div className="admin-sections">
                            <div className="admin-section card">
                                <h2>
                                    <Eye size={20} />
                                    {t('admin.dashboard.topPages')}
                                </h2>
                                {stats.visitors.topPages.length > 0 ? (
                                    <ul className="top-pages-list">
                                        {stats.visitors.topPages.map((page, index) => (
                                            <li key={index}>
                                                <span className="page-rank">{index + 1}</span>
                                                <span className="page-name">{page.page}</span>
                                                <span className="page-views">{page.views} {t('blog.views')}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="no-data">{t('common.noData')}</p>
                                )}
                            </div>

                            <div className="admin-section card">
                                <h2>{t('admin.dashboard.quickLinks')}</h2>
                                <div className="quick-links">
                                    <Link to="/admin/reviews" className="quick-link">
                                        <Star size={20} />
                                        <span>{t('admin.dashboard.manageReviews')}</span>
                                        {stats.reviews.pending > 0 && (
                                            <span className="badge badge-warning">
                                                {stats.reviews.pending}
                                            </span>
                                        )}
                                    </Link>
                                    <Link to="/admin/apps" className="quick-link">
                                        <Smartphone size={20} />
                                        <span>{t('admin.dashboard.manageApps') || 'Manage Apps'}</span>
                                    </Link>
                                    <Link to="/admin/announcements" className="quick-link">
                                        <Megaphone size={20} />
                                        <span>{t('admin.dashboard.manageAnnouncements') || 'Manage Announcements'}</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
