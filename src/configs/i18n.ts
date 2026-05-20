import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import faTranslations from '../../public/locales/fa.json'

i18n.use(initReactI18next).init({
  lng: 'fa',
  fallbackLng: 'fa',
  resources: {
    fa: {
      translation: faTranslations
    }
  },
  debug: false,
  keySeparator: false,
  react: {
    useSuspense: false
  },
  interpolation: {
    escapeValue: false,
    formatSeparator: ','
  }
})

export default i18n
