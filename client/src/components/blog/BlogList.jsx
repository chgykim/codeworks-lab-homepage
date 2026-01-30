import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Eye, ArrowRight } from 'lucide-react';
import { formatDate, truncateText } from '../../utils/sanitize';
import './BlogList.css';

function BlogList({ posts }) {
    if (!posts || posts.length === 0) {
        return (
            <div className="no-posts-message">
                <p>등록된 게시글이 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="blog-list">
            {posts.map((post) => (
                <article key={post.id} className="blog-item card">
                    <div className="blog-item-content">
                        <div className="blog-item-meta">
                            {post.category && (
                                <span className="badge badge-primary">{post.category}</span>
                            )}
                            <span className="blog-item-date">
                                <Calendar size={14} />
                                {formatDate(post.created_at)}
                            </span>
                            <span className="blog-item-views">
                                <Eye size={14} />
                                {post.views || 0}
                            </span>
                        </div>

                        <h2 className="blog-item-title">
                            <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                        </h2>

                        <p className="blog-item-excerpt">
                            {truncateText(post.excerpt, 150)}
                        </p>

                        <Link to={`/blog/${post.slug}`} className="blog-item-link">
                            자세히 보기
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                </article>
            ))}
        </div>
    );
}

export default BlogList;
