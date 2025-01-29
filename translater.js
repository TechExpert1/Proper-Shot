const {translateJson}  = require('@parvineyvazov/json-translator');
console.log(translateJson);

const fs = require('fs');
const enJson = require('./locales/en.json');
const targetLanguages = ['fr', 'es', 'de', 'ar']; 
async function translateToLanguages() {
  for (const lang of targetLanguages) {
    try {
      console.log(`Translating to ${lang}...`);

      // Translate JSON
      const translatedJson = await translateJson(enJson, 'en', lang);

      // Save the translated JSON file
      fs.writeFileSync(`./locales/${lang}.json`, JSON.stringify(translatedJson, null, 2));

      console.log(`Translation for ${lang} saved successfully.`);
    } catch (error) {
      console.error(`Error translating to ${lang}:`, error);
    }
  }
}

// Execute the function
translateToLanguages();
