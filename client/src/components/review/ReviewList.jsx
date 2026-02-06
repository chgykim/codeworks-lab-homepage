import React from 'react';
import { useTranslation } from 'react-i18next';
import StarRating from '../common/StarRating';
import { formatDate } from '../../utils/sanitize';
import './ReviewList.css';

function ReviewList({ reviews }) {
    const { t } = useTranslation();

    if (!reviews || reviews.length === 0) {
        return (
            <div className="no-reviews-message">
                <p>{t('reviews.noReviews')}</p>
            </div>
        );
    }

    return (
        <div className="review-list">
            {reviews.map((review) => (
                <div key={review.id} className="review-item card">
                    <div className="review-item-header">
                        <div className="review-item-meta">
                            <span className="review-author-name">{review.author_name}</span>
                            <span className="review-item-date">
                                {formatDate(review.created_at)}
                            </span>
                        </div>
                        <StarRating rating={review.rating} />
                    </div>
                    <p className="review-item-content">{review.content}</p>
                </div>
            ))}
        </div>
    );
}

export default ReviewList;
