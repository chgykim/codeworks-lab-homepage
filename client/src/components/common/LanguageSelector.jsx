import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';
import { languages, getDirection } from '../../i18n';
import './LanguageSelector.css';

function LanguageSelector() {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        // Update document direction based on language
        document.documentElement.dir = getDirection(i18n.language);
        document.documentElement.lang = i18n.language;
    }, [i18n.language]);

    const handleLanguageChange = (langCode) => {
        setIsOpen(false);

        // Save to localStorage
        localStorage.setItem('selectedLanguage', langCode);

        // Navigate to same page with lang parameter
        const url = new URL(window.location.href);
        url.searchParams.set('lang', langCode);

        // Force page reload with new language
        window.location.replace(url.toString());
    };

    return (
        <div className="language-selector" ref={dropdownRef}>
            <button
                className="language-btn"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Select language"
            >
                <Globe size={18} />
                <span className="current-lang">
                    <span className="lang-flag">{currentLang.flag}</span>
                    <span className="lang-code">{currentLang.code.toUpperCase()}</span>
                </span>
                <ChevronDown size={14} className={`chevron ${isOpen ? 'open' : ''}`} />
            </button>

            {isOpen && (
                <div className="language-dropdown">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            className={`language-option ${lang.code === i18n.language ? 'active' : ''}`}
                            onClick={() => handleLanguageChange(lang.code)}
                        >
                            <span className="lang-flag">{lang.flag}</span>
                            <span className="lang-native">{lang.nativeName}</span>
                            {lang.code === i18n.language && (
                                <span className="check-mark">✓</span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default LanguageSelector;
