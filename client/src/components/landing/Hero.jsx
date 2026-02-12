import React from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Play } from 'lucide-react';
import './Hero.css';

function Hero({ settings }) {
    const { t } = useTranslation();

    return (
        <section className="hero">
            <div className="container">
                <div className="hero-content">
                    <div className="hero-text">
                        <h1 className="hero-title">
                            {t('hero.title')}<br />
                            <span className="highlight">{t('hero.titleHighlight')}</span>
                        </h1>
                        <p className="hero-subtitle">
                            {t('hero.subtitle')}
                        </p>

                        <div className="hero-buttons">
                            <a
                                href={settings?.appStoreUrl || '#'}
                                className="btn btn-primary btn-lg"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Download size={20} />
                                {t('hero.appStore')}
                            </a>
                            <a
                                href={settings?.playStoreUrl || '#'}
                                className="btn btn-secondary btn-lg"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Play size={20} />
                                {t('hero.playStore')}
                            </a>
                        </div>

                        <div className="hero-stats">
                            <div className="stat">
                                <span className="stat-value">12</span>
                                <span className="stat-label">{t('hero.apps')}</span>
                            </div>
                            <div className="stat">
                                <span className="stat-value">-</span>
                                <span className="stat-label">{t('hero.rating')}</span>
                            </div>
                            <div className="stat">
                                <span className="stat-value">-</span>
                                <span className="stat-label">{t('hero.downloads')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="hero-image">
                        <div className="phone-mockup">
                            <div className="phone-screen">
                                <div className="app-preview">
                                    <div className="app-header">
                                        <span>{t('brand.safeWay')}</span>
                                    </div>
                                    <div className="app-content">
                                        <div className="app-card">
                                            <span className="card-icon">📝</span>
                                            <span>{t('features.items.recording.title')}</span>
                                        </div>
                                        <div className="app-card">
                                            <span className="card-icon">📊</span>
                                            <span>{t('features.items.display.title')}</span>
                                        </div>
                                        <div className="app-card">
                                            <span className="card-icon">🤝</span>
                                            <span>{t('features.items.assist.title')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Hero;
