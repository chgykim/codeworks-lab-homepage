import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, MessageSquare, Clock, CheckCircle, Mail } from 'lucide-react';
import { userAPI } from '../../utils/api';
import './User.css';

function MyInquiries() {
    const { t } = useTranslation();

    const [inquiries, setInquiries] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadInquiries();
    }, [pagination.page]);

    const loadInquiries = async () => {
        setLoading(true);
        try {
            const response = await userAPI.getInquiries(pagination.page, pagination.limit);
            setInquiries(response.data.inquiries);
            setPagination((prev) => ({
                ...prev,
                total: response.data.pagination.total,
                totalPages: response.data.pagination.totalPages
            }));
        } catch (error) {
            console.error('Failed to load inquiries:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'replied':
                return <Mail size={16} className="status-replied" />;
            case 'read':
                return <CheckCircle size={16} className="status-read" />;
            default:
                return <Clock size={16} className="status-unread" />;
        }
    };

    const getStatusText = (status) => {
        return t(`mypage.inquiryStatus.${status}`);
    };

    const getSubjectText = (subject) => {
        if (!subject) return t('mypage.noSubject');
        return t(`manual.contact.categories.${subject}`, subject);
    };

    return (
        <div className="user-page page">
            <div className="container">
                <div className="page-header">
                    <Link to="/mypage" className="back-link">
                        <ArrowLeft size={20} />
                        {t('mypage.title')}
                    </Link>
                    <h1>{t('mypage.myInquiries')}</h1>
                    <p>{t('mypage.totalInquiries', { count: pagination.total })}</p>
                </div>

                <div className="user-content">
                    {loading ? (
                        <div className="loading-state">{t('common.loading')}</div>
                    ) : inquiries.length === 0 ? (
                        <div className="empty-state card">
                            <MessageSquare size={48} />
                            <h3>{t('mypage.noInquiries')}</h3>
                            <p>{t('mypage.noInquiriesDesc')}</p>
                            <Link to="/manual" className="btn btn-primary">
                                {t('mypage.goToContact')}
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="inquiries-list">
                                {inquiries.map((inquiry) => (
                                    <div key={inquiry.id} className="inquiry-item card">
                                        <div className="inquiry-header">
                                            <span className="inquiry-subject">
                                                {getSubjectText(inquiry.subject)}
                                            </span>
                                            <div className="inquiry-status">
                                                {getStatusIcon(inquiry.status)}
                                                <span>{getStatusText(inquiry.status)}</span>
                                            </div>
                                        </div>

                                        <p className="inquiry-content">{inquiry.message}</p>

                                        <div className="inquiry-footer">
                                            <span className="inquiry-date">{formatDate(inquiry.created_at)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {pagination.totalPages > 1 && (
                                <div className="pagination">
                                    <button
                                        onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                                        disabled={pagination.page === 1}
                                        className="btn btn-secondary"
                                    >
                                        {t('common.prev')}
                                    </button>
                                    <span className="page-info">
                                        {pagination.page} / {pagination.totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                                        disabled={pagination.page === pagination.totalPages}
                                        className="btn btn-secondary"
                                    >
                                        {t('common.next')}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MyInquiries;
