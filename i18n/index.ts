import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

const es = require('../locales/es.json');
const en = require('../locales/en.json');
const fr = require('../locales/fr.json');
const pt = require('../locales/pt.json');
const de = require('../locales/de.json');

// Get device language, default to Spanish if not supported
const getDeviceLanguage = (): string => {
  const deviceLocale = Localization.getLocales()[0]?.languageCode || 'es';
  const supportedLanguages = ['es', 'en', 'fr', 'pt', 'de'];
  
  // Check if device language is supported
  if (supportedLanguages.includes(deviceLocale)) {
    return deviceLocale;
  }
  
  // Fallback to Spanish
  return 'es';
};

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4',
    resources: {
      es: { translation: es },
      en: { translation: en },
      fr: { translation: fr },
      pt: { translation: pt },
      de: { translation: de },
    },
    lng: getDeviceLanguage(),
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

export default i18n;
