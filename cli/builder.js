#!/usr/bin/env node

console.warn(`
#####################################################
######### NEXT-TRANSLATE CHANGES FOR 1.0.0 ##########
#####################################################

You don't need this extra step anymore!


Instead of having this in your package.json:

---------
{
  "scripts": {
    "dev": "next-translate && next dev",
    "build": "next-translate && next build",
  }
}

----------

Now you must add the nextTranslate plugin inside next.config.js.

---------

const nextTranslate = require('next-translate')

//...

module.exports = nextTranslate(nextConfig)

---------

See how to migrate to 1.0.0 here:

- https://github.com/vinissimus/next-translate/releases/tag/1.0.0

---------


`)
