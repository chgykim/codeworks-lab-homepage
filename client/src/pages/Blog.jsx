import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import BlogList from '../components/blog/BlogList';
import Loading from '../components/common/Loading';
import { blogAPI } from '../utils/api';
import './Blog.css';

function Blog() {
    const { t } = useTranslation();
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        fetchPosts();
        fetchCategories();
    }, [selectedCategory]);

    const fetchPosts = async (pageNum = 1, append = false) => {
        try {
            if (append) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }

            const response = await blogAPI.getAll(pageNum, 10, selectedCategory);
            const newPosts = response.data.posts;

            if (append) {
                setPosts((prev) => [...prev, ...newPosts]);
            } else {
                setPosts(newPosts);
            }

            setHasMore(response.data.pagination.hasMore);
            setPage(pageNum);
        } catch (error) {
            console.error('Failed to fetch posts:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await blogAPI.getCategories();
            setCategories(response.data.categories);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        setPage(1);
    };

    const handleLoadMore = () => {
        if (!loadingMore && hasMore) {
            fetchPosts(page + 1, true);
        }
    };

    // Translate category names
    const getCategoryLabel = (category) => {
        const key = `blog.categories.${category.toLowerCase()}`;
        const translated = t(key);
        return translated !== key ? translated : category;
    };

    if (loading) {
        return (
            <div className="page">
                <Loading text={t('common.loading')} />
            </div>
        );
    }

    return (
        <div className="blog-page page">
            <div className="container">
                <div className="page-header">
                    <h1>{t('blog.title')}</h1>
                    <p>{t('blog.subtitle')}</p>
                </div>

                {categories.length > 0 && (
                    <div className="category-filter">
                        <button
                            className={`category-btn ${selectedCategory === '' ? 'active' : ''}`}
                            onClick={() => handleCategoryChange('')}
                        >
                            {t('blog.all')}
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category}
                                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                                onClick={() => handleCategoryChange(category)}
                            >
                                {getCategoryLabel(category)}
                            </button>
                        ))}
                    </div>
                )}

                <BlogList posts={posts} />

                {hasMore && (
                    <div className="load-more">
                        <button
                            className="btn btn-secondary"
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                        >
                            {loadingMore ? t('common.loading') : t('blog.loadMore')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Blog;
