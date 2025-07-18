import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations directly
import translationEN from '../public/i18n/lang/en-UK.json';
import translationES from '../public/i18n/lang/es-ES.json';
import translationPT from '../public/i18n/lang/pt-PT.json';

// The translations
const resources = {
  'en-UK': {
    translation: translationEN
  },
  'es-ES': {
    translation: translationES
  },
  'pt-PT': {
    translation: translationPT
  }
};

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // Init i18next
  .init({
    resources,
    lng: 'pt-PT', // Set Portuguese as default language
    fallbackLng: 'pt-PT', // Portuguese fallback
    supportedLngs: ['pt-PT', 'es-ES', 'en-UK'], // Supported languages
    debug: false, // Set to false in production
    interpolation: {
      escapeValue: false, // React already safes from xss
    },
    detection: {
      // Order and from where user language should be detected
      order: ['querystring', 'cookie', 'localStorage', 'sessionStorage', 'navigator', 'htmlTag'],
      // Cache user language
      caches: ['localStorage', 'cookie'],
      // Only detect from supported languages
      checkWhitelist: true
    }
  });

export default i18n;
