# Migration Guide `0.x` to `1.0.0`

This migration guide describes how to upgrade existing projects using `next-translate@0.x` to `next-translate@1.0.0`.

1. Update `next-translate` to `^1.0.0` using your preferred package manager.

```bash
yarn add next-translate@^1.0.0
```

```bash
npm install next-translate@^1.0.0
```

2. Update `next.config.js`:

```diff
-const { locales, defaultLocale } = require("./i18n.json");
+const nextTranslate = require("next-translate");

-module.exports = {
+module.exports = nextTranslate()
-  i18n: { locales, defaultLocale },
-};
```

3. Remove obsolete options from `i18n.json`:

```diff
{
  "locales": ["de", "fr", "it"],
  "defaultLocale": "de",
-  "currentPagesDir": "pages_",
-  "finalPagesDir": "pages",
-  "localesPath": "locales",
-  "package": false,
  "pages": {
    "*": ["common"],
    "rgx:^/products": ["products"]
  }
}
```

If you were using `localesPath` to load the namespaces from another directory, you should change `i18n.json` to `i18n.js` and use:

```js
module.exports = {
  // ...rest of config
  loadLocaleFrom: (lang, ns) =>
    import(`./locales/${lang}/${ns}.json`).then((m) => m.default),
}
```

4. Remove the extra build step in `package.json`:

```diff
"scripts": {
-  "dev": "next-translate && next dev",
-  "build": "next-translate && next build",
+  "dev": "next dev",
+  "build": "next build",
  "start": "next start"
}
```

5. Remove `/pages` from `.gitignore`:

```diff
# local env files
.env.local
.env.development.local
.env.test.local
.env.production.local

-# i18n
-/pages
```

6. Rename directory `pages_` to `pages`:

```bash
rm -rf pages
mv pages_ pages
```

7. Replace `_plural` suffixes to `_other`. We are now supporting 6 plural forms, more info [in the README](https://github.com/vinissimus/next-translate/blob/1.0.0/README.md#5-plurals).

```diff
{
-  "lorem-ipsum_plural": "The value is {{count}}"
+  "lorem-ipsum_other": "The value is {{count}}"
}
```

## Optional changes

The `dynamic` prop of `DynamicNamespaces` component now is optional. By default is using the `locales` root folder or whatever you specified in `loadLocaleFrom` in the configuration. However, you can still use it if by the dynamic namespaces you want to use another place to store the JSONs.

```diff
import React from 'react'
import Trans from 'next-translate/Trans'
import DynamicNamespaces from 'next-translate/DynamicNamespaces'

export default function ExampleWithDynamicNamespace() {
  return (
    <DynamicNamespaces
-      dynamic={(lang, ns) =>
-        import(`../../locales/${lang}/${ns}.json`).then((m) => m.default)
-      }
      namespaces={['dynamic']}
      fallback="Loading..."
    >
      <Trans i18nKey="dynamic:example-of-dynamic-translation" />
    </DynamicNamespaces>
  )
}
```
