import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import StarRating from '../common/StarRating';
import { reviewsAPI } from '../../utils/api';
import { isValidEmail } from '../../utils/sanitize';
import './ReviewForm.css';

function ReviewForm({ onSuccess }) {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        authorName: '',
        email: '',
        rating: 5,
        content: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.authorName.trim()) {
            newErrors.authorName = t('common.required');
        } else if (formData.authorName.length < 2) {
            newErrors.authorName = t('common.required');
        }

        if (formData.email && !isValidEmail(formData.email)) {
            newErrors.email = t('common.error');
        }

        if (!formData.content.trim()) {
            newErrors.content = t('common.required');
        } else if (formData.content.length < 10) {
            newErrors.content = t('common.required');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleRatingChange = (rating) => {
        setFormData((prev) => ({ ...prev, rating }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);

        if (!validateForm()) return;

        setLoading(true);

        try {
            await reviewsAPI.create(formData);

            setMessage({
                type: 'success',
                text: t('reviews.submitSuccess')
            });

            setFormData({
                authorName: '',
                email: '',
                rating: 5,
                content: ''
            });

            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.error ||
                error.response?.data?.details?.[0]?.message ||
                t('common.error');

            setMessage({
                type: 'error',
                text: errorMessage
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="review-form-container card">
            <h3 className="review-form-title">{t('reviews.writeReview')}</h3>

            {message && (
                <div className={`alert alert-${message.type}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="review-form">
                <div className="form-group">
                    <label className="form-label">{t('reviews.rating')}</label>
                    <StarRating
                        rating={formData.rating}
                        size={28}
                        interactive={true}
                        onChange={handleRatingChange}
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="authorName" className="form-label">
                            {t('reviews.name')} <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="authorName"
                            name="authorName"
                            value={formData.authorName}
                            onChange={handleChange}
                            className={`form-input ${errors.authorName ? 'error' : ''}`}
                            maxLength={100}
                        />
                        {errors.authorName && (
                            <span className="form-error">{errors.authorName}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email" className="form-label">
                            {t('reviews.email')}
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`form-input ${errors.email ? 'error' : ''}`}
                            placeholder="email@example.com"
                        />
                        {errors.email && (
                            <span className="form-error">{errors.email}</span>
                        )}
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="content" className="form-label">
                        {t('reviews.content')} <span className="required">*</span>
                    </label>
                    <textarea
                        id="content"
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        className={`form-textarea ${errors.content ? 'error' : ''}`}
                        placeholder={t('reviews.contentPlaceholder')}
                        maxLength={2000}
                        rows={5}
                    />
                    {errors.content && (
                        <span className="form-error">{errors.content}</span>
                    )}
                    <span className="char-count">
                        {formData.content.length} / 2000
                    </span>
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                >
                    {loading ? t('common.loading') : t('reviews.submitReview')}
                </button>
            </form>
        </div>
    );
}

export default ReviewForm;
