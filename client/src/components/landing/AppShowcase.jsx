import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    MapPin,
    HeartPulse,
    Mic,
    ScanSearch,
    ShieldAlert,
    Brain,
    Moon,
    TreePine,
    Stethoscope,
    BookOpen,
    Car,
    Sparkles,
    Lock
} from 'lucide-react';
import './AppShowcase.css';

const appIcons = {
    wayback: MapPin,
    waypulse: HeartPulse,
    waysound: Mic,
    wayscan: ScanSearch,
    waypanic: ShieldAlert,
    waybrain: Brain,
    wayrest: Moon,
    waywild: TreePine,
    wayer: Stethoscope,
    waystory: BookOpen,
    waycrash: Car,
    waymoments: Sparkles
};

const appColors = {
    wayback: '#3b82f6',
    waypulse: '#ef4444',
    waysound: '#06b6d4',
    wayscan: '#10b981',
    waypanic: '#f97316',
    waybrain: '#8b5cf6',
    wayrest: '#6b7280',
    waywild: '#84cc16',
    wayer: '#ec4899',
    waystory: '#f59e0b',
    waycrash: '#6366f1',
    waymoments: '#e11d48'
};

const appKeys = [
    'waymoments', 'wayback', 'waypulse', 'waysound', 'wayscan', 'waypanic',
    'waybrain', 'wayrest', 'waywild', 'wayer', 'waystory', 'waycrash'
];

function AppShowcase({ releasedApps = [] }) {
    const { t } = useTranslation();

    return (
        <section className="app-showcase section">
            <div className="container">
                <div className="section-header">
                    <span className="section-badge">{t('brand.safeWay')}</span>
                    <h2 className="section-title">{t('apps.title')}</h2>
                    <p className="section-subtitle">{t('apps.subtitle')}</p>
                </div>

                <div className="apps-grid">
                    {appKeys.map((key) => {
                        const Icon = appIcons[key];
                        const color = appColors[key];
                        const isReleased = releasedApps.includes(key);

                        return (
                            <div key={key} className={`app-card ${!isReleased ? 'app-card-locked' : ''}`}>
                                <div
                                    className="app-icon"
                                    style={{
                                        backgroundColor: isReleased ? `${color}15` : '#f3f4f6',
                                        color: isReleased ? color : '#9ca3af'
                                    }}
                                >
                                    {isReleased ? <Icon size={28} /> : <Lock size={28} />}
                                </div>
                                <div className="app-info">
                                    <h3 className="app-name">{t(`apps.items.${key}.name`)}</h3>
                                    {isReleased ? (
                                        <>
                                            <span className="app-tagline">{t(`apps.items.${key}.tagline`)}</span>
                                            <p className="app-description">{t(`apps.items.${key}.description`)}</p>
                                            <span className="app-category" style={{ color: color }}>
                                                {t(`apps.items.${key}.category`)}
                                            </span>
                                        </>
                                    ) : (
                                        <span className="app-locked-text">{t('apps.comingSoon')}</span>
                                    )}
                                </div>
                                <div className="app-status">
                                    {isReleased ? (
                                        <span className="released-badge">{t('apps.learnMore')}</span>
                                    ) : (
                                        <span className="coming-soon-badge">{t('apps.comingSoon')}</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="core-message">
                    <p>"{t('hero.coreMessage')}"</p>
                </div>
            </div>
        </section>
    );
}

export default AppShowcase;
