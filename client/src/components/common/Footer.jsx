import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart } from 'lucide-react';
import './Footer.css';

function Footer() {
    const { t, i18n } = useTranslation();
    const currentYear = new Date().getFullYear();

    // Display admin nickname based on language
    const adminNickname = i18n.language === 'ko' ? '허접도사' : 'Rustic Sage';

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-section">
                        <div className="footer-logo">
                            <img src="/logo.jpg" alt="Logo" className="logo-img" />
                            <span className="logo-text">{t('brand.name')}</span>
                        </div>
                        <p className="footer-description">
                            {t('footer.description')}
                        </p>
                    </div>

                    <div className="footer-section">
                        <h4>{t('footer.quickLinks')}</h4>
                        <ul className="footer-links">
                            <li><Link to="/">{t('nav.home')}</Link></li>
                            <li><Link to="/manual">{t('nav.manual')}</Link></li>
                            <li><Link to="/reviews">{t('nav.reviews')}</Link></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4>{t('footer.legal')}</h4>
                        <ul className="footer-links">
                            <li><a href="#privacy">{t('footer.privacy')}</a></li>
                            <li><a href="#terms">{t('footer.terms')}</a></li>
                            <li><a href="#refund">{t('footer.refund')}</a></li>
                        </ul>
                    </div>

                </div>

                <div className="footer-bottom">
                    <p>&copy; {currentYear} {t('brand.name')}. {t('footer.copyright')}</p>
                    <p className="made-by">
                        {t('footer.madeBy')} <Heart size={14} className="heart-icon" /> {adminNickname}
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
