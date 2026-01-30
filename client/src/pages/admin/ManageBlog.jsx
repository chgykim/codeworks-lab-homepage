import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Edit, Trash2, Eye, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { adminAPI } from '../../utils/api';
import Loading from '../../components/common/Loading';
import { formatDate } from '../../utils/sanitize';
import './Admin.css';

function ManageBlog() {
    const navigate = useNavigate();
    const { user, loading: authLoading, isAdmin } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [showEditor, setShowEditor] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [message, setMessage] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        excerpt: '',
        category: 'general',
        status: 'draft'
    });

    useEffect(() => {
        if (!authLoading && !isAdmin()) {
            navigate('/admin/login');
        }
    }, [authLoading, user, navigate]);

    useEffect(() => {
        if (isAdmin()) {
            fetchPosts();
        }
    }, [user, filter]);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getBlogPosts(1, 100, filter);
            setPosts(response.data.posts);
        } catch (error) {
            setMessage({ type: 'error', text: '포스트를 불러오는데 실패했습니다.' });
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingPost(null);
        setFormData({
            title: '',
            content: '',
            excerpt: '',
            category: 'general',
            status: 'draft'
        });
        setShowEditor(true);
    };

    const handleEdit = async (id) => {
        try {
            const response = await adminAPI.getBlogPost(id);
            const post = response.data.post;
            setEditingPost(post);
            setFormData({
                title: post.title,
                content: post.content,
                excerpt: post.excerpt || '',
                category: post.category || 'general',
                status: post.status
            });
            setShowEditor(true);
        } catch (error) {
            setMessage({ type: 'error', text: '포스트를 불러오는데 실패했습니다.' });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('정말로 이 포스트를 삭제하시겠습니까?')) return;

        try {
            await adminAPI.deleteBlogPost(id);
            setPosts((prev) => prev.filter((p) => p.id !== id));
            setMessage({ type: 'success', text: '포스트가 삭제되었습니다.' });
        } catch (error) {
            setMessage({ type: 'error', text: '삭제에 실패했습니다.' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.content.trim()) {
            setMessage({ type: 'error', text: '제목과 내용을 입력해주세요.' });
            return;
        }

        try {
            if (editingPost) {
                await adminAPI.updateBlogPost(editingPost.id, formData);
                setMessage({ type: 'success', text: '포스트가 수정되었습니다.' });
            } else {
                await adminAPI.createBlogPost(formData);
                setMessage({ type: 'success', text: '포스트가 생성되었습니다.' });
            }

            setShowEditor(false);
            fetchPosts();
        } catch (error) {
            const errorMsg = error.response?.data?.error || '저장에 실패했습니다.';
            setMessage({ type: 'error', text: errorMsg });
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
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
                        <FileText size={28} />
                        블로그 관리
                    </h1>
                    <button className="btn btn-primary" onClick={handleCreate}>
                        <Plus size={18} />
                        새 포스트
                    </button>
                </div>

                {message && (
                    <div className={`alert alert-${message.type}`}>
                        {message.text}
                    </div>
                )}

                {showEditor ? (
                    <div className="blog-editor card">
                        <h2>{editingPost ? '포스트 수정' : '새 포스트 작성'}</h2>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">제목</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleFormChange}
                                    className="form-input"
                                    placeholder="포스트 제목"
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">카테고리</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleFormChange}
                                        className="form-select"
                                    >
                                        <option value="general">일반</option>
                                        <option value="공지사항">공지사항</option>
                                        <option value="업데이트">업데이트</option>
                                        <option value="건강 팁">건강 팁</option>
                                        <option value="이벤트">이벤트</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">상태</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleFormChange}
                                        className="form-select"
                                    >
                                        <option value="draft">임시저장</option>
                                        <option value="published">게시</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">요약 (선택)</label>
                                <textarea
                                    name="excerpt"
                                    value={formData.excerpt}
                                    onChange={handleFormChange}
                                    className="form-textarea"
                                    placeholder="포스트 요약 (목록에 표시됨)"
                                    rows={2}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">내용</label>
                                <textarea
                                    name="content"
                                    value={formData.content}
                                    onChange={handleFormChange}
                                    className="form-textarea"
                                    placeholder="포스트 내용 (HTML 사용 가능)"
                                    rows={15}
                                    required
                                />
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="btn btn-primary">
                                    {editingPost ? '수정하기' : '작성하기'}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowEditor(false)}
                                >
                                    취소
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <>
                        <div className="filter-tabs">
                            <button
                                className={`filter-tab ${filter === '' ? 'active' : ''}`}
                                onClick={() => setFilter('')}
                            >
                                전체
                            </button>
                            <button
                                className={`filter-tab ${filter === 'published' ? 'active' : ''}`}
                                onClick={() => setFilter('published')}
                            >
                                게시됨
                            </button>
                            <button
                                className={`filter-tab ${filter === 'draft' ? 'active' : ''}`}
                                onClick={() => setFilter('draft')}
                            >
                                임시저장
                            </button>
                        </div>

                        {loading ? (
                            <Loading text="포스트를 불러오는 중..." />
                        ) : posts.length === 0 ? (
                            <div className="no-data-container">
                                <AlertCircle size={48} />
                                <p>포스트가 없습니다.</p>
                                <button className="btn btn-primary" onClick={handleCreate}>
                                    첫 포스트 작성하기
                                </button>
                            </div>
                        ) : (
                            <div className="admin-table-container">
                                <table className="admin-table table">
                                    <thead>
                                        <tr>
                                            <th>제목</th>
                                            <th>카테고리</th>
                                            <th>상태</th>
                                            <th>조회수</th>
                                            <th>작성일</th>
                                            <th>작업</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {posts.map((post) => (
                                            <tr key={post.id}>
                                                <td>
                                                    <span className="post-title">{post.title}</span>
                                                </td>
                                                <td>
                                                    <span className="badge badge-primary">
                                                        {post.category}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge badge-${
                                                        post.status === 'published' ? 'success' : 'warning'
                                                    }`}>
                                                        {post.status === 'published' ? '게시됨' : '임시저장'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <Eye size={14} style={{ marginRight: 4 }} />
                                                    {post.views || 0}
                                                </td>
                                                <td>{formatDate(post.created_at)}</td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button
                                                            className="btn-icon primary"
                                                            onClick={() => handleEdit(post.id)}
                                                            title="수정"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            className="btn-icon danger"
                                                            onClick={() => handleDelete(post.id)}
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
                    </>
                )}
            </div>
        </div>
    );
}

export default ManageBlog;
