import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Megaphone, Sparkles, RefreshCw, Calendar, AlertCircle } from 'lucide-react';
import { announcementsAPI } from '../utils/api';
import Loading from '../components/common/Loading';
import './Announcements.css';

function Announcements() {
    const { t } = useTranslation();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [typeFilter, setTypeFilter] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        fetchAnnouncements();
    }, [typeFilter]);

    const fetchAnnouncements = async (pageNum = 1, append = false) => {
        try {
            setLoading(true);
            const response = await announcementsAPI.getAll(pageNum, 10, typeFilter);

            if (append) {
                setAnnouncements(prev => [...prev, ...response.data.announcements]);
            } else {
                setAnnouncements(response.data.announcements);
            }

            setHasMore(response.data.pagination.hasMore);
            setPage(pageNum);
        } catch (err) {
            setError(t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'new_app':
                return <Sparkles size={20} />;
            case 'update':
                return <RefreshCw size={20} />;
            default:
                return <Megaphone size={20} />;
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'new_app':
                return t('announcements.types.newApp');
            case 'update':
                return t('announcements.types.update');
            default:
                return t('announcements.types.announcement');
        }
    };

    const getTypeClass = (type) => {
        switch (type) {
            case 'new_app':
                return 'new-app';
            case 'update':
                return 'update';
            default:
                return 'announcement';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="announcements-page page">
            <div className="container">
                <div className="page-header">
                    <h1>
                        <Megaphone size={32} />
                        {t('announcements.title')}
                    </h1>
                    <p>{t('announcements.subtitle')}</p>
                </div>

                <div className="filter-tabs">
                    <button
                        className={`filter-tab ${typeFilter === '' ? 'active' : ''}`}
                        onClick={() => setTypeFilter('')}
                    >
                        {t('announcements.all')}
                    </button>
                    <button
                        className={`filter-tab ${typeFilter === 'new_app' ? 'active' : ''}`}
                        onClick={() => setTypeFilter('new_app')}
                    >
                        <Sparkles size={16} />
                        {t('announcements.types.newApp')}
                    </button>
                    <button
                        className={`filter-tab ${typeFilter === 'update' ? 'active' : ''}`}
                        onClick={() => setTypeFilter('update')}
                    >
                        <RefreshCw size={16} />
                        {t('announcements.types.update')}
                    </button>
                    <button
                        className={`filter-tab ${typeFilter === 'announcement' ? 'active' : ''}`}
                        onClick={() => setTypeFilter('announcement')}
                    >
                        <Megaphone size={16} />
                        {t('announcements.types.announcement')}
                    </button>
                </div>

                {error && (
                    <div className="alert alert-error">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                {loading && announcements.length === 0 ? (
                    <Loading text={t('common.loading')} />
                ) : announcements.length === 0 ? (
                    <div className="no-announcements">
                        <Megaphone size={48} />
                        <p>{t('announcements.empty')}</p>
                    </div>
                ) : (
                    <div className="announcements-list">
                        {announcements.map((item) => (
                            <div key={item.id} className={`announcement-card ${getTypeClass(item.type)}`}>
                                <div className="announcement-header">
                                    <span className={`announcement-type ${getTypeClass(item.type)}`}>
                                        {getIcon(item.type)}
                                        {getTypeLabel(item.type)}
                                    </span>
                                    <span className="announcement-date">
                                        <Calendar size={14} />
                                        {formatDate(item.createdAt)}
                                    </span>
                                </div>
                                <h2 className="announcement-title">{item.title}</h2>
                                <p className="announcement-content">{item.content}</p>
                            </div>
                        ))}
                    </div>
                )}

                {hasMore && !loading && (
                    <div className="load-more">
                        <button
                            className="btn btn-secondary"
                            onClick={() => fetchAnnouncements(page + 1, true)}
                        >
                            {t('common.loadMore')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Announcements;
