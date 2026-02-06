const { Translate } = require('@google-cloud/translate').v2;

// Supported languages (11 languages)
const SUPPORTED_LANGUAGES = [
    'ko',    // Korean (source)
    'en',    // English
    'ja',    // Japanese
    'zh-CN', // Chinese Simplified
    'zh-TW', // Chinese Traditional
    'es',    // Spanish
    'fr',    // French
    'de',    // German
    'pt',    // Portuguese
    'ru',    // Russian
    'ar'     // Arabic
];

// Initialize Google Translate client
let translate = null;

const initTranslate = () => {
    if (!translate) {
        // Use API key from environment variable
        const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;

        if (!apiKey) {
            console.warn('[TranslateService] GOOGLE_TRANSLATE_API_KEY not set');
            return null;
        }

        translate = new Translate({ key: apiKey });
    }
    return translate;
};

/**
 * Translate text to multiple languages
 * @param {string} text - Text to translate (Korean)
 * @param {string} sourceLanguage - Source language code (default: 'ko')
 * @returns {Object} - Object with language codes as keys and translated text as values
 */
const translateToAllLanguages = async (text, sourceLanguage = 'ko') => {
    const client = initTranslate();

    if (!client) {
        console.log('[TranslateService] Translation skipped - API key not configured');
        return null;
    }

    if (!text || text.trim().length === 0) {
        return null;
    }

    const translations = {
        [sourceLanguage]: text // Keep original
    };

    // Translate to each target language
    const targetLanguages = SUPPORTED_LANGUAGES.filter(lang => lang !== sourceLanguage);

    try {
        const translatePromises = targetLanguages.map(async (targetLang) => {
            try {
                const [translation] = await client.translate(text, {
                    from: sourceLanguage,
                    to: targetLang
                });
                return { lang: targetLang, text: translation };
            } catch (error) {
                console.error(`[TranslateService] Failed to translate to ${targetLang}:`, error.message);
                return { lang: targetLang, text: text }; // Fallback to original
            }
        });

        const results = await Promise.all(translatePromises);

        results.forEach(({ lang, text }) => {
            translations[lang] = text;
        });

        console.log(`[TranslateService] Translated to ${Object.keys(translations).length} languages`);
        return translations;
    } catch (error) {
        console.error('[TranslateService] Translation error:', error.message);
        return null;
    }
};

/**
 * Translate announcement title and content
 * @param {string} title - Announcement title
 * @param {string} content - Announcement content
 * @param {string} sourceLanguage - Source language code
 * @returns {Object} - { titleTranslations, contentTranslations }
 */
const translateAnnouncement = async (title, content, sourceLanguage = 'ko') => {
    console.log('[TranslateService] Starting announcement translation...');

    const [titleTranslations, contentTranslations] = await Promise.all([
        translateToAllLanguages(title, sourceLanguage),
        translateToAllLanguages(content, sourceLanguage)
    ]);

    return {
        titleTranslations,
        contentTranslations
    };
};

module.exports = {
    translateToAllLanguages,
    translateAnnouncement,
    SUPPORTED_LANGUAGES
};
