import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Calendar, Eye } from 'lucide-react';
import Loading from '../components/common/Loading';
import { blogAPI } from '../utils/api';
import { formatDate, sanitizeHTML } from '../utils/sanitize';
import './BlogPost.css';

function BlogPost() {
    const { t } = useTranslation();
    const { slug } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPost();
    }, [slug]);

    const fetchPost = async () => {
        try {
            setLoading(true);
            const response = await blogAPI.getBySlug(slug);
            setPost(response.data.post);
        } catch (error) {
            setError(t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="page">
                <Loading />
            </div>
        );
    }

    if (error) {
        return (
            <div className="blog-post-page page">
                <div className="container">
                    <div className="error-container">
                        <h2>{error}</h2>
                        <button className="btn btn-primary" onClick={() => navigate('/blog')}>
                            {t('blog.backToList')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="blog-post-page page">
            <div className="container">
                <Link to="/blog" className="back-link">
                    <ArrowLeft size={18} />
                    {t('blog.backToList')}
                </Link>

                <article className="blog-post-content">
                    <header className="blog-post-header">
                        {post.category && (
                            <span className="badge badge-primary">
                                {t(`blog.categories.${post.category.toLowerCase()}`, post.category)}
                            </span>
                        )}
                        <h1>{post.title}</h1>
                        <div className="blog-post-meta">
                            <span>
                                <Calendar size={16} />
                                {formatDate(post.createdAt)}
                            </span>
                            <span>
                                <Eye size={16} />
                                {t('blog.views')} {post.views}
                            </span>
                        </div>
                    </header>

                    <div
                        className="blog-post-body"
                        dangerouslySetInnerHTML={{ __html: sanitizeHTML(post.content) }}
                    />
                </article>

                <div className="blog-post-footer">
                    <Link to="/blog" className="btn btn-secondary">
                        <ArrowLeft size={18} />
                        {t('blog.backToList')}
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default BlogPost;
