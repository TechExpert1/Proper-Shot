const i18next = require('i18next');
const i18nextFsBackend = require('i18next-fs-backend');
const i18nextHttpMiddleware = require('i18next-http-middleware');

i18next
  .use(i18nextFsBackend)
  .use(i18nextHttpMiddleware.LanguageDetector)
  .init({
    backend: {
      loadPath: './locales/{{lng}}/{{ns}}.json', 
    },
    debug: true, 
    fallbackLng: 'en', 
    preload: ['en', 'es'], 
    ns: ['common'],
    defaultNS: 'common',
  });

module.exports = i18next;