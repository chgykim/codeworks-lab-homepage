import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Home, BookOpen, Star, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import LanguageSelector from './LanguageSelector';
import './Header.css';

function Header() {
    const { t } = useTranslation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const { user, logout, isAdmin } = useAuth();

    const navLinks = [
        { path: '/', labelKey: 'nav.home', icon: Home },
        { path: '/manual', labelKey: 'nav.manual', icon: BookOpen },
        { path: '/reviews', labelKey: 'nav.reviews', icon: Star }
    ];

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    const handleLogout = async () => {
        await logout();
        setIsMenuOpen(false);
    };

    return (
        <header className="header">
            <div className="container">
                <div className="header-content">
                    <Link to="/" className="logo">
                        <img src="/logo.jpg" alt="Logo" className="logo-img" />
                        <span className="logo-text">{t('brand.name')}</span>
                    </Link>

                    <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
                        <ul className="nav-list">
                            {navLinks.map(({ path, labelKey, icon: Icon }) => (
                                <li key={path}>
                                    <Link
                                        to={path}
                                        className={`nav-link ${isActive(path) ? 'active' : ''}`}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <Icon size={18} />
                                        <span>{t(labelKey)}</span>
                                    </Link>
                                </li>
                            ))}
                            {isAdmin() && (
                                <li>
                                    <Link
                                        to="/admin"
                                        className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <Settings size={18} />
                                        <span>{t('nav.admin')}</span>
                                    </Link>
                                </li>
                            )}
                        </ul>

                        <div className="nav-actions">
                            <LanguageSelector />
                            {isAdmin() && user && (
                                <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                                    {t('nav.logout')}
                                </button>
                            )}
                        </div>
                    </nav>

                    <button
                        className="menu-toggle"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>
        </header>
    );
}

export default Header;
