import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import StarRating from '../common/StarRating';
import { reviewsAPI } from '../../utils/api';
import { formatRelativeTime } from '../../utils/sanitize';
import './ReviewPreview.css';

function ReviewPreview() {
    const { t } = useTranslation();
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const [reviewsRes, statsRes] = await Promise.all([
                reviewsAPI.getAll(1, 3),
                reviewsAPI.getStats()
            ]);
            setReviews(reviewsRes.data.reviews);
            setStats(statsRes.data);
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <section className="review-preview section">
                <div className="container">
                    <div className="loading-container">
                        <div className="spinner"></div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="review-preview section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">{t('reviews.title')}</h2>
                    {stats && (
                        <p className="section-subtitle">
                            {t('reviews.subtitle', { count: stats.approved, rating: stats.averageRating })}
                        </p>
                    )}
                </div>

                {reviews.length > 0 ? (
                    <>
                        <div className="reviews-grid">
                            {reviews.map((review) => (
                                <div key={review.id} className="review-card card">
                                    <div className="review-header">
                                        <StarRating rating={review.rating} />
                                        <span className="review-date">
                                            {formatRelativeTime(review.created_at)}
                                        </span>
                                    </div>
                                    <p className="review-content">{review.content}</p>
                                    <p className="review-author">- {review.author_name}</p>
                                </div>
                            ))}
                        </div>

                        <div className="review-cta">
                            <Link to="/reviews" className="btn btn-secondary">
                                {t('reviews.loadMore')}
                                <ArrowRight size={18} />
                            </Link>
                        </div>
                    </>
                ) : (
                    <div className="no-reviews">
                        <p>{t('reviews.noReviews')}</p>
                        <Link to="/reviews" className="btn btn-primary">
                            {t('reviews.writeReview')}
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}

export default ReviewPreview;
