import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import all translation files directly (synchronous)
import en from './locales/en/translation.json';
import ko from './locales/ko/translation.json';
import ja from './locales/ja/translation.json';
import zhCN from './locales/zh-CN/translation.json';
import es from './locales/es/translation.json';
import pt from './locales/pt/translation.json';
import fr from './locales/fr/translation.json';
import de from './locales/de/translation.json';
import ru from './locales/ru/translation.json';
import ar from './locales/ar/translation.json';
import hi from './locales/hi/translation.json';

// Supported languages
export const supportedLngs = ['en', 'ko', 'ja', 'zh-CN', 'es', 'pt', 'fr', 'de', 'ru', 'ar', 'hi'];

// Get language from URL param first, then localStorage, then default to Korean
function getLanguage() {
    // 1. Check URL parameter (highest priority)
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');

    if (urlLang && supportedLngs.includes(urlLang)) {
        // Save to localStorage for persistence
        try { localStorage.setItem('selectedLanguage', urlLang); } catch(e) {}
        return urlLang;
    }

    // 2. Check localStorage
    try {
        const saved = localStorage.getItem('selectedLanguage');
        if (saved && supportedLngs.includes(saved)) {
            return saved;
        }
    } catch (e) {}

    // 3. Default to Korean
    return 'ko';
}

const currentLanguage = getLanguage();

// All translations
const resources = {
    en: { translation: en },
    ko: { translation: ko },
    ja: { translation: ja },
    'zh-CN': { translation: zhCN },
    es: { translation: es },
    pt: { translation: pt },
    fr: { translation: fr },
    de: { translation: de },
    ru: { translation: ru },
    ar: { translation: ar },
    hi: { translation: hi }
};

// Initialize i18n
if (!i18n.isInitialized) {
    i18n
        .use(initReactI18next)
        .init({
            resources,
            lng: currentLanguage,
            fallbackLng: false, // No fallback - use only selected language
            supportedLngs,
            load: 'currentOnly', // Only load current language

            // Disable all detection
            detection: {
                order: [],
                caches: []
            },

            interpolation: {
                escapeValue: false
            },

            react: {
                useSuspense: false
            }
        });
}

// Export current language for components
export const getCurrentLanguage = () => currentLanguage;

export default i18n;

// Language metadata for display
export const languages = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
    { code: 'zh-CN', name: 'Chinese', nativeName: '简体中文', flag: '🇨🇳' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' }
];

// Get language direction
export const getDirection = (lang) => {
    return lang === 'ar' ? 'rtl' : 'ltr';
};
