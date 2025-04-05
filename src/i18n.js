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
    fallbackLng: 'en-UK', // Default language if detection fails
    debug: true, // Set to false in production
    interpolation: {
      escapeValue: false, // React already safes from xss
    },
    detection: {
      // Order and from where user language should be detected
      order: ['querystring', 'cookie', 'localStorage', 'sessionStorage', 'path', 'subdomain', 'navigator', 'htmlTag'],
      // Keys or params to lookup language from
      caches: [], // Disable caching
      lookupQuerystring: 'lng',
      lookupCookie: 'i18next',
      lookupLocalStorage: 'i18nextLng',
      lookupSessionStorage: 'i18nextLng',
      lookupFromPathIndex: 0,
      lookupFromSubdomainIndex: 0,
      // Cache user language on
      caches: ['localStorage', 'cookie'],
      excludeCacheFor: ['cimode'], // Languages to not persist (cookie, localStorage)
      // Optional htmlTag attribute which defaults to 'lang'
      htmlTag: document.documentElement
    }
  });

export default i18n;
