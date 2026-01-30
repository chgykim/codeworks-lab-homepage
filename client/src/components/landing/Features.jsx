import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Pencil,
    BarChart3,
    HelpingHand,
    Shield,
    WifiOff,
    Cloud,
    Zap,
    Heart
} from 'lucide-react';
import './Features.css';

const featureKeys = [
    { key: 'recording', icon: Pencil },
    { key: 'display', icon: BarChart3 },
    { key: 'assist', icon: HelpingHand },
    { key: 'privacy', icon: Shield },
    { key: 'offline', icon: WifiOff },
    { key: 'sync', icon: Cloud },
    { key: 'simple', icon: Zap },
    { key: 'support', icon: Heart }
];

function Features() {
    const { t } = useTranslation();

    return (
        <section className="features section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">{t('features.title')}</h2>
                    <p className="section-subtitle">
                        {t('features.subtitle')}
                    </p>
                </div>

                <div className="features-grid">
                    {featureKeys.map(({ key, icon: Icon }) => (
                        <div key={key} className="feature-card">
                            <div className="feature-icon">
                                <Icon size={24} />
                            </div>
                            <h3 className="feature-title">
                                {t(`features.items.${key}.title`)}
                            </h3>
                            <p className="feature-description">
                                {t(`features.items.${key}.description`)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Features;
