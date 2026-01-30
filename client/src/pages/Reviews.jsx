import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ReviewList from '../components/review/ReviewList';
import ReviewForm from '../components/review/ReviewForm';
import Loading from '../components/common/Loading';
import { reviewsAPI } from '../utils/api';
import './Reviews.css';

function Reviews() {
    const { t } = useTranslation();
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        fetchReviews();
        fetchStats();
    }, []);

    const fetchReviews = async (pageNum = 1, append = false) => {
        try {
            if (append) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }

            const response = await reviewsAPI.getAll(pageNum, 10);
            const newReviews = response.data.reviews;

            if (append) {
                setReviews((prev) => [...prev, ...newReviews]);
            } else {
                setReviews(newReviews);
            }

            setHasMore(response.data.pagination.hasMore);
            setPage(pageNum);
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await reviewsAPI.getStats();
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const handleLoadMore = () => {
        if (!loadingMore && hasMore) {
            fetchReviews(page + 1, true);
        }
    };

    const handleReviewSuccess = () => {
        fetchStats();
    };

    if (loading) {
        return (
            <div className="page">
                <Loading text={t('common.loading')} />
            </div>
        );
    }

    return (
        <div className="reviews-page page">
            <div className="container">
                <div className="page-header">
                    <h1>{t('reviews.title')}</h1>
                    {stats && (
                        <p>{t('reviews.subtitle', { count: stats.approved, rating: stats.averageRating })}</p>
                    )}
                </div>

                <div className="reviews-content">
                    <div className="reviews-main">
                        <ReviewList reviews={reviews} />

                        {hasMore && (
                            <div className="load-more">
                                <button
                                    className="btn btn-secondary"
                                    onClick={handleLoadMore}
                                    disabled={loadingMore}
                                >
                                    {loadingMore ? t('common.loading') : t('reviews.loadMore')}
                                </button>
                            </div>
                        )}
                    </div>

                    <aside className="reviews-sidebar">
                        <ReviewForm onSuccess={handleReviewSuccess} />
                    </aside>
                </div>
            </div>
        </div>
    );
}

export default Reviews;
