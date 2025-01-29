const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const path = require('path');

i18next
  .use(Backend)
  .init({
    lng: 'en', // Default language is English
    fallbackLng: 'en', // Fallback language in case the current language is not available
    preload: ['en', 'fr', 'es'], // Preload English, French, and Spanish
    ns: ['common'],
    defaultNS: 'common',
    backend: {
      loadPath: path.join(__dirname, '../locales/{{lng}}.json'), // Path to translation files
    },
    interpolation: {
      escapeValue: false, // Disable escaping of values
    },
  })
  .then(() => {
    console.log(i18next.t('welcome.title')); // Logs in English

    i18next.changeLanguage('fr', (err, t) => {
      if (err) {
        console.error('Error changing language to fr:', err);
      } else {
        console.log(i18next.t('welcome.title')); // Logs in French
      }
    });

    i18next.changeLanguage('es', (err, t) => {
      if (err) {
        console.error('Error changing language to es:', err);
      } else {
        console.log(i18next.t('welcome.title')); // Logs in Spanish
      }
    });
  })
  .catch(err => {
    console.error('Error initializing i18next:', err);
  });

module.exports = i18next;


