import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Check, X, Trash2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { adminAPI } from '../../utils/api';
import Loading from '../../components/common/Loading';
import StarRating from '../../components/common/StarRating';
import { formatDate } from '../../utils/sanitize';
import './Admin.css';

function ManageReviews() {
    const navigate = useNavigate();
    const { user, loading: authLoading, isAdmin } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (!authLoading && !isAdmin()) {
            navigate('/admin/login');
        }
    }, [authLoading, user, navigate]);

    useEffect(() => {
        if (isAdmin()) {
            fetchReviews();
        }
    }, [user, filter]);

    const fetchReviews = async (pageNum = 1, append = false) => {
        try {
            setLoading(true);
            const response = await adminAPI.getReviews(pageNum, 20, filter);

            if (append) {
                setReviews((prev) => [...prev, ...response.data.reviews]);
            } else {
                setReviews(response.data.reviews);
            }

            setHasMore(response.data.pagination.hasMore);
            setPage(pageNum);
        } catch (error) {
            setMessage({ type: 'error', text: '리뷰를 불러오는데 실패했습니다.' });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await adminAPI.updateReviewStatus(id, status);
            setReviews((prev) =>
                prev.map((r) => (r.id === id ? { ...r, status } : r))
            );
            setMessage({
                type: 'success',
                text: `리뷰가 ${status === 'approved' ? '승인' : '거절'}되었습니다.`
            });
        } catch (error) {
            setMessage({ type: 'error', text: '상태 변경에 실패했습니다.' });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('정말로 이 리뷰를 삭제하시겠습니까?')) return;

        try {
            await adminAPI.deleteReview(id);
            setReviews((prev) => prev.filter((r) => r.id !== id));
            setMessage({ type: 'success', text: '리뷰가 삭제되었습니다.' });
        } catch (error) {
            setMessage({ type: 'error', text: '삭제에 실패했습니다.' });
        }
    };

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        setPage(1);
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
                        <Star size={28} />
                        리뷰 관리
                    </h1>
                </div>

                {message && (
                    <div className={`alert alert-${message.type}`}>
                        {message.text}
                    </div>
                )}

                <div className="filter-tabs">
                    <button
                        className={`filter-tab ${filter === '' ? 'active' : ''}`}
                        onClick={() => handleFilterChange('')}
                    >
                        전체
                    </button>
                    <button
                        className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
                        onClick={() => handleFilterChange('pending')}
                    >
                        대기중
                    </button>
                    <button
                        className={`filter-tab ${filter === 'approved' ? 'active' : ''}`}
                        onClick={() => handleFilterChange('approved')}
                    >
                        승인됨
                    </button>
                    <button
                        className={`filter-tab ${filter === 'rejected' ? 'active' : ''}`}
                        onClick={() => handleFilterChange('rejected')}
                    >
                        거절됨
                    </button>
                </div>

                {loading ? (
                    <Loading text="리뷰를 불러오는 중..." />
                ) : reviews.length === 0 ? (
                    <div className="no-data-container">
                        <AlertCircle size={48} />
                        <p>리뷰가 없습니다.</p>
                    </div>
                ) : (
                    <div className="admin-table-container">
                        <table className="admin-table table">
                            <thead>
                                <tr>
                                    <th>작성자</th>
                                    <th>평점</th>
                                    <th>내용</th>
                                    <th>상태</th>
                                    <th>작성일</th>
                                    <th>작업</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reviews.map((review) => (
                                    <tr key={review.id}>
                                        <td>
                                            <div className="author-info">
                                                <span className="author-name">{review.authorName}</span>
                                                {review.email && (
                                                    <span className="author-email">{review.email}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <StarRating rating={review.rating} size={14} />
                                        </td>
                                        <td>
                                            <div className="review-content-preview">
                                                {review.content.length > 100
                                                    ? review.content.substring(0, 100) + '...'
                                                    : review.content}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge badge-${
                                                review.status === 'approved' ? 'success' :
                                                review.status === 'pending' ? 'warning' : 'danger'
                                            }`}>
                                                {review.status === 'approved' ? '승인' :
                                                 review.status === 'pending' ? '대기' : '거절'}
                                            </span>
                                        </td>
                                        <td>{formatDate(review.createdAt)}</td>
                                        <td>
                                            <div className="action-buttons">
                                                {review.status !== 'approved' && (
                                                    <button
                                                        className="btn-icon success"
                                                        onClick={() => handleStatusUpdate(review.id, 'approved')}
                                                        title="승인"
                                                    >
                                                        <Check size={16} />
                                                    </button>
                                                )}
                                                {review.status !== 'rejected' && (
                                                    <button
                                                        className="btn-icon warning"
                                                        onClick={() => handleStatusUpdate(review.id, 'rejected')}
                                                        title="거절"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    className="btn-icon danger"
                                                    onClick={() => handleDelete(review.id)}
                                                    title="삭제"
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
                            onClick={() => fetchReviews(page + 1, true)}
                        >
                            더 보기
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ManageReviews;
