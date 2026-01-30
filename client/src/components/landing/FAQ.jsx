import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import './FAQ.css';

const faqKeys = ['free', 'devices', 'integration', 'privacy', 'cancel'];

function FAQ() {
    const { t } = useTranslation();
    const [openIndex, setOpenIndex] = useState(null);

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="faq section section-alt">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">{t('faq.title')}</h2>
                    <p className="section-subtitle">
                        {t('faq.subtitle')}
                    </p>
                </div>

                <div className="faq-list">
                    {faqKeys.map((key, index) => (
                        <div
                            key={key}
                            className={`faq-item ${openIndex === index ? 'open' : ''}`}
                        >
                            <button
                                className="faq-question"
                                onClick={() => toggleFAQ(index)}
                            >
                                <span>{t(`faq.items.${key}.question`)}</span>
                                <ChevronDown
                                    size={20}
                                    className={`faq-icon ${openIndex === index ? 'rotated' : ''}`}
                                />
                            </button>
                            <div className="faq-answer">
                                <p>{t(`faq.items.${key}.answer`)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default FAQ;
