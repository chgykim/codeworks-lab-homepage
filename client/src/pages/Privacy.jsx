import React from 'react';
import { useTranslation } from 'react-i18next';
import { Shield } from 'lucide-react';
import './Legal.css';

function Privacy() {
    const { t } = useTranslation();

    return (
        <div className="legal-page page">
            <div className="container">
                <div className="page-header">
                    <Shield size={48} className="page-icon" />
                    <h1>{t('privacy.title')}</h1>
                    <p className="effective-date">{t('privacy.effectiveDate')}: 2026-02-03</p>
                </div>

                <div className="legal-content card">
                    <section className="legal-section">
                        <p className="legal-intro">{t('privacy.intro')}</p>
                    </section>

                    <section className="legal-section">
                        <h2>{t('privacy.section1.title')}</h2>
                        <p>{t('privacy.section1.desc')}</p>
                        <ul>
                            <li>{t('privacy.section1.item1')}</li>
                            <li>{t('privacy.section1.item2')}</li>
                            <li>{t('privacy.section1.item3')}</li>
                            <li>{t('privacy.section1.item4')}</li>
                        </ul>
                        <p>{t('privacy.section1.noSensitive')}</p>
                        <p>{t('privacy.section1.noPayment')}</p>
                    </section>

                    <section className="legal-section">
                        <h2>{t('privacy.section2.title')}</h2>
                        <p>{t('privacy.section2.desc')}</p>
                        <ul>
                            <li>{t('privacy.section2.item1')}</li>
                            <li>{t('privacy.section2.item2')}</li>
                            <li>{t('privacy.section2.item3')}</li>
                            <li>{t('privacy.section2.item4')}</li>
                        </ul>
                    </section>

                    <section className="legal-section">
                        <h2>{t('privacy.section3.title')}</h2>
                        <ul>
                            <li>{t('privacy.section3.item1')}</li>
                            <li>{t('privacy.section3.item2')}</li>
                            <li>{t('privacy.section3.item3')}</li>
                            <li>{t('privacy.section3.item4')}</li>
                        </ul>
                    </section>

                    <section className="legal-section">
                        <h2>{t('privacy.section4.title')}</h2>
                        <p>{t('privacy.section4.desc')}</p>
                        <ul>
                            <li>{t('privacy.section4.item1')}</li>
                            <li>{t('privacy.section4.item2')}</li>
                        </ul>
                    </section>

                    <section className="legal-section">
                        <h2>{t('privacy.section5.title')}</h2>
                        <p>{t('privacy.section5.desc')}</p>
                        <ul>
                            <li>{t('privacy.section5.item1')}</li>
                            <li>{t('privacy.section5.item2')}</li>
                            <li>{t('privacy.section5.item3')}</li>
                        </ul>
                        <p>{t('privacy.section5.note')}</p>
                        <p>{t('privacy.section5.overseas')}</p>
                    </section>

                    <section className="legal-section">
                        <h2>{t('privacy.section6.title')}</h2>
                        <p>{t('privacy.section6.desc')}</p>
                        <ul>
                            <li>{t('privacy.section6.item1')}</li>
                            <li>{t('privacy.section6.item2')}</li>
                        </ul>
                    </section>

                    <section className="legal-section">
                        <h2>{t('privacy.section7.title')}</h2>
                        <p>{t('privacy.section7.desc')}</p>
                        <ul>
                            <li>{t('privacy.section7.item1')}</li>
                            <li>{t('privacy.section7.item2')}</li>
                            <li>{t('privacy.section7.item3')}</li>
                            <li>{t('privacy.section7.item4')}</li>
                        </ul>
                        <p>{t('privacy.section7.note')}</p>
                    </section>

                    <section className="legal-section">
                        <h2>{t('privacy.section8.title')}</h2>
                        <p>{t('privacy.section8.desc')}</p>
                        <ul>
                            <li>{t('privacy.section8.item1')}</li>
                            <li>{t('privacy.section8.item2')}</li>
                            <li>{t('privacy.section8.item3')}</li>
                        </ul>
                    </section>

                    <section className="legal-section">
                        <h2>{t('privacy.section9.title')}</h2>
                        <p>{t('privacy.section9.desc')}</p>
                        <div className="contact-info">
                            <p><strong>{t('privacy.section9.officer')}</strong></p>
                            <p>{t('privacy.section9.name')}</p>
                            <p>{t('privacy.section9.position')}</p>
                            <p>{t('privacy.section9.contact')}</p>
                        </div>
                    </section>

                    <section className="legal-section">
                        <h2>{t('privacy.section10.title')}</h2>
                        <p>{t('privacy.section10.desc')}</p>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default Privacy;
