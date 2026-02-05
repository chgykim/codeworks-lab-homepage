import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Star, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { userAPI } from '../../utils/api';
import './User.css';

function MyReviews() {
    const { t } = useTranslation();

    const [reviews, setReviews] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        loadReviews();
    }, [pagination.page]);

    const loadReviews = async () => {
        setLoading(true);
        try {
            const response = await userAPI.getReviews(pagination.page, pagination.limit);
            setReviews(response.data.reviews);
            setPagination((prev) => ({
                ...prev,
                total: response.data.pagination.total,
                totalPages: response.data.pagination.totalPages
            }));
        } catch (error) {
            console.error('Failed to load reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setDeleteLoading(true);
        try {
            await userAPI.deleteReview(id);
            setReviews((prev) => prev.filter((r) => r.id !== id));
            setPagination((prev) => ({
                ...prev,
                total: prev.total - 1
            }));
            setDeleteId(null);
        } catch (error) {
            console.error('Failed to delete review:', error);
        } finally {
            setDeleteLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved':
                return <CheckCircle size={16} className="status-approved" />;
            case 'rejected':
                return <XCircle size={16} className="status-rejected" />;
            default:
                return <Clock size={16} className="status-pending" />;
        }
    };

    const getStatusText = (status) => {
        return t(`mypage.status.${status}`);
    };

    return (
        <div className="user-page page">
            <div className="container">
                <div className="page-header">
                    <Link to="/mypage" className="back-link">
                        <ArrowLeft size={20} />
                        {t('mypage.title')}
                    </Link>
                    <h1>{t('mypage.myReviews')}</h1>
                    <p>{t('mypage.totalReviews', { count: pagination.total })}</p>
                </div>

                <div className="user-content">
                    {loading ? (
                        <div className="loading-state">{t('common.loading')}</div>
                    ) : reviews.length === 0 ? (
                        <div className="empty-state card">
                            <Star size={48} />
                            <h3>{t('mypage.noReviews')}</h3>
                            <p>{t('mypage.noReviewsDesc')}</p>
                            <Link to="/reviews" className="btn btn-primary">
                                {t('mypage.writeReview')}
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="reviews-list">
                                {reviews.map((review) => (
                                    <div key={review.id} className="review-item card">
                                        <div className="review-header">
                                            <div className="review-rating">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={16}
                                                        className={i < review.rating ? 'star-filled' : 'star-empty'}
                                                    />
                                                ))}
                                            </div>
                                            <div className="review-status">
                                                {getStatusIcon(review.status)}
                                                <span>{getStatusText(review.status)}</span>
                                            </div>
                                        </div>

                                        <p className="review-content">{review.content}</p>

                                        <div className="review-footer">
                                            <span className="review-date">{formatDate(review.created_at)}</span>
                                            <button
                                                onClick={() => setDeleteId(review.id)}
                                                className="delete-btn"
                                            >
                                                <Trash2 size={16} />
                                            </button>
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

                {deleteId && (
                    <div className="modal-overlay" onClick={() => setDeleteId(null)}>
                        <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
                            <h3>{t('mypage.deleteReviewTitle')}</h3>
                            <p>{t('mypage.deleteReviewConfirm')}</p>

                            <div className="modal-actions">
                                <button onClick={() => setDeleteId(null)} className="btn btn-secondary">
                                    {t('common.cancel')}
                                </button>
                                <button
                                    onClick={() => handleDelete(deleteId)}
                                    className="btn btn-danger"
                                    disabled={deleteLoading}
                                >
                                    {deleteLoading ? t('common.loading') : t('common.delete')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyReviews;
