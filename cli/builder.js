#!/usr/bin/env node

console.warn(`
#####################################################
######### NEXT-TRANSLATE CHANGES FOR 1.0.0 ##########
#####################################################

You don't need this extra step anymore!

Now you must add the configuration in next.config.js.

Example:

---------

const nextTranslate = require('next-translate')

module.exports = nextTranslate({
  i18n: {
    locales: ['en', 'ca', 'es'],
    defaultLocale: 'en',
    pages: {
      '*': ['common'],
      '/404': ['error'],
      '/': ['home'],
      '/dashboard': ['home'],
      'rgx:^/more-examples': ['more-examples'],
    }
  }
})

---------

See how to migrate to 1.0.0 here:

- https://github.com/vinissimus/next-translate/releases/tag/1.0.0

---------


`)
