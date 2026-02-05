import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Download,
    User,
    Activity,
    Bell,
    HelpCircle,
    ChevronRight,
    Send
} from 'lucide-react';
import { contactAPI } from '../utils/api';
import { isValidEmail } from '../utils/sanitize';
import './Manual.css';

const sectionConfigs = [
    { id: 'gettingStarted', icon: Download, items: ['download', 'signup', 'setup'] },
    { id: 'profile', icon: User, items: ['basic', 'goals', 'sync'] },
    { id: 'features', icon: Activity, items: ['tracking', 'auto', 'routines'] },
    { id: 'notifications', icon: Bell, items: ['newApp', 'update', 'announcement'] }
];

function Manual() {
    const { t } = useTranslation();
    const [activeSection, setActiveSection] = useState('gettingStarted');
    const [contactForm, setContactForm] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const handleContactChange = (e) => {
        const { name, value } = e.target;
        setContactForm((prev) => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validateContactForm = () => {
        const errors = {};
        if (!contactForm.name.trim()) errors.name = t('common.required');
        if (!contactForm.email.trim()) errors.email = t('common.required');
        else if (!isValidEmail(contactForm.email)) errors.email = t('common.error');
        if (!contactForm.message.trim()) errors.message = t('common.required');
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);

        if (!validateContactForm()) return;

        setLoading(true);

        try {
            await contactAPI.submit(contactForm);
            setMessage({
                type: 'success',
                text: t('manual.contact.success')
            });
            setContactForm({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.error || t('common.error')
            });
        } finally {
            setLoading(false);
        }
    };

    const currentSection = sectionConfigs.find((s) => s.id === activeSection);

    return (
        <div className="manual-page page">
            <div className="container">
                <div className="page-header">
                    <h1>{t('manual.title')}</h1>
                    <p>{t('manual.subtitle')}</p>
                </div>

                <div className="manual-content">
                    <nav className="manual-nav">
                        {sectionConfigs.map((section) => {
                            const Icon = section.icon;
                            return (
                                <button
                                    key={section.id}
                                    className={`manual-nav-item ${activeSection === section.id ? 'active' : ''}`}
                                    onClick={() => setActiveSection(section.id)}
                                >
                                    <Icon size={20} />
                                    <span>{t(`manual.sections.${section.id}.title`)}</span>
                                    <ChevronRight size={16} className="nav-arrow" />
                                </button>
                            );
                        })}
                    </nav>

                    <div className="manual-detail">
                        {currentSection && (
                            <>
                                <div className="manual-detail-header">
                                    {React.createElement(currentSection.icon, { size: 32 })}
                                    <h2>{t(`manual.sections.${currentSection.id}.title`)}</h2>
                                </div>

                                <div className="manual-steps">
                                    {currentSection.items.map((itemKey, index) => (
                                        <div key={itemKey} className="manual-step">
                                            <div className="step-number">{index + 1}</div>
                                            <div className="step-content">
                                                <h3>{t(`manual.sections.${currentSection.id}.items.${itemKey}.title`)}</h3>
                                                <p>{t(`manual.sections.${currentSection.id}.items.${itemKey}.text`)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <section className="contact-section section-alt">
                    <div className="contact-container">
                        <div className="contact-info">
                            <HelpCircle size={48} className="contact-icon" />
                            <h2>{t('manual.contact.title')}</h2>
                            <p>{t('manual.contact.subtitle')}</p>
                        </div>

                        <form className="contact-form card" onSubmit={handleContactSubmit}>
                            {message && (
                                <div className={`alert alert-${message.type}`}>
                                    {message.text}
                                </div>
                            )}

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">{t('manual.contact.name')}</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={contactForm.name}
                                        onChange={handleContactChange}
                                        className={`form-input ${formErrors.name ? 'error' : ''}`}
                                    />
                                    {formErrors.name && <span className="form-error">{formErrors.name}</span>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{t('manual.contact.email')}</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={contactForm.email}
                                        onChange={handleContactChange}
                                        className={`form-input ${formErrors.email ? 'error' : ''}`}
                                    />
                                    {formErrors.email && <span className="form-error">{formErrors.email}</span>}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">{t('manual.contact.subject')}</label>
                                <select
                                    name="subject"
                                    value={contactForm.subject}
                                    onChange={handleContactChange}
                                    className="form-input"
                                >
                                    <option value="">{t('manual.contact.selectCategory')}</option>
                                    <option value="appError">{t('manual.contact.categories.appError')}</option>
                                    <option value="deviceSupport">{t('manual.contact.categories.deviceSupport')}</option>
                                    <option value="countryLanguage">{t('manual.contact.categories.countryLanguage')}</option>
                                    <option value="improvement">{t('manual.contact.categories.improvement')}</option>
                                    <option value="featureRequest">{t('manual.contact.categories.featureRequest')}</option>
                                    <option value="appDevelopment">{t('manual.contact.categories.appDevelopment')}</option>
                                    <option value="other">{t('manual.contact.categories.other')}</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">{t('manual.contact.message')}</label>
                                <textarea
                                    name="message"
                                    value={contactForm.message}
                                    onChange={handleContactChange}
                                    className={`form-textarea ${formErrors.message ? 'error' : ''}`}
                                    rows={5}
                                />
                                {formErrors.message && <span className="form-error">{formErrors.message}</span>}
                            </div>

                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                <Send size={18} />
                                {loading ? t('common.loading') : t('manual.contact.send')}
                            </button>
                        </form>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default Manual;
