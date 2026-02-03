import React from 'react';
import { useTranslation } from 'react-i18next';
import { FileText } from 'lucide-react';
import './Legal.css';

function Terms() {
    const { t } = useTranslation();

    return (
        <div className="legal-page page">
            <div className="container">
                <div className="page-header">
                    <FileText size={48} className="page-icon" />
                    <h1>{t('terms.title')}</h1>
                    <p className="effective-date">{t('terms.effectiveDate')}: 2026-02-03</p>
                </div>

                <div className="legal-content card">
                    <section className="legal-section">
                        <p className="legal-intro">{t('terms.intro')}</p>
                    </section>

                    <section className="legal-section">
                        <h2>{t('terms.section1.title')}</h2>
                        <p>{t('terms.section1.desc')}</p>
                    </section>

                    <section className="legal-section">
                        <h2>{t('terms.section2.title')}</h2>
                        <ul>
                            <li><strong>{t('terms.section2.term1')}</strong> {t('terms.section2.def1')}</li>
                            <li><strong>{t('terms.section2.term2')}</strong> {t('terms.section2.def2')}</li>
                            <li><strong>{t('terms.section2.term3')}</strong> {t('terms.section2.def3')}</li>
                        </ul>
                    </section>

                    <section className="legal-section">
                        <h2>{t('terms.section3.title')}</h2>
                        <ul>
                            <li>{t('terms.section3.item1')}</li>
                            <li>{t('terms.section3.item2')}</li>
                            <li>{t('terms.section3.item3')}</li>
                            <li>{t('terms.section3.item4')}</li>
                        </ul>
                    </section>

                    <section className="legal-section">
                        <h2>{t('terms.section4.title')}</h2>
                        <ul>
                            <li>{t('terms.section4.item1')}</li>
                            <li>{t('terms.section4.item2')}</li>
                            <li>{t('terms.section4.item3')}</li>
                            <li>{t('terms.section4.item4')}</li>
                        </ul>
                    </section>

                    <section className="legal-section">
                        <h2>{t('terms.section5.title')}</h2>
                        <p>{t('terms.section5.desc')}</p>
                        <ul>
                            <li>{t('terms.section5.item1')}</li>
                            <li>{t('terms.section5.item2')}</li>
                            <li>{t('terms.section5.item3')}</li>
                            <li>{t('terms.section5.item4')}</li>
                            <li>{t('terms.section5.item5')}</li>
                            <li>{t('terms.section5.item6')}</li>
                        </ul>
                    </section>

                    <section className="legal-section">
                        <h2>{t('terms.section6.title')}</h2>
                        <ul>
                            <li>{t('terms.section6.item1')}</li>
                            <li>{t('terms.section6.item2')}</li>
                            <li>{t('terms.section6.item3')}</li>
                        </ul>
                    </section>

                    <section className="legal-section">
                        <h2>{t('terms.section7.title')}</h2>
                        <ul>
                            <li>{t('terms.section7.item1')}</li>
                            <li>{t('terms.section7.item2')}</li>
                            <li>{t('terms.section7.item3')}</li>
                        </ul>
                    </section>

                    <section className="legal-section">
                        <h2>{t('terms.section8.title')}</h2>
                        <ul>
                            <li>{t('terms.section8.item1')}</li>
                            <li>{t('terms.section8.item2')}</li>
                            <li>{t('terms.section8.item3')}</li>
                            <li>{t('terms.section8.item4')}</li>
                        </ul>
                    </section>

                    <section className="legal-section">
                        <h2>{t('terms.section9.title')}</h2>
                        <ul>
                            <li>{t('terms.section9.item1')}</li>
                            <li>{t('terms.section9.item2')}</li>
                        </ul>
                    </section>

                    <section className="legal-section">
                        <h2>{t('terms.section10.title')}</h2>
                        <ul>
                            <li>{t('terms.section10.item1')}</li>
                            <li>{t('terms.section10.item2')}</li>
                            <li>{t('terms.section10.item3')}</li>
                        </ul>
                    </section>

                    <section className="legal-section">
                        <h2>{t('terms.section11.title')}</h2>
                        <p>{t('terms.section11.desc')}</p>
                    </section>

                    <section className="legal-section">
                        <h2>{t('terms.supplementary.title')}</h2>
                        <p>{t('terms.supplementary.desc')}</p>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default Terms;
