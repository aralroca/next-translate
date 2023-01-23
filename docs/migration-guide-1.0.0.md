# Migration Guide `0.x` to `1.0.0`

This migration guide describes how to upgrade existing projects using `next-translate@0.x` to `next-translate@1.0.0`.

- [About 1.0](https://dev-blog.aralroca.com/next-translate-1.0)
- [Release notes about 1.0](https://github.com/aralroca/next-translate/releases/tag/1.0.0)
- [Demo video with 1.0](https://www.youtube.com/watch?v=QnCIjjYLCfc)
- [Examples with 1.0](https://github.com/aralroca/next-translate/tree/1.0.0/examples)

**If you are using a version prior to `0.19`, you should first [follow these steps](https://github.com/aralroca/next-translate/releases/tag/0.19.0) to migrate to `0.19` because it has some breaking changes.**

This guide is useful both if you used the **"build step"** and if you used a **`getInitialProps` on top of `_app.js`** with the `appWithI18n`, since both have been unified under the webpack loader.

## Steps to follow

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

4. Remove the extra build step in `package.json` _(in the case you were using the build step)_:

```diff
"scripts": {
-  "dev": "next-translate && next dev",
-  "build": "next-translate && next build",
+  "dev": "next dev",
+  "build": "next build",
  "start": "next start"
}
```

5. Remove `/pages` from `.gitignore` _(in the case you were using the build step)_:

```diff
# local env files
.env.local
.env.development.local
.env.test.local
.env.production.local

-# i18n
-/pages
```

6. Rename directory `pages_` to `pages` _(in the case you were using the build step)_:

```bash
rm -rf pages
mv pages_ pages
```

7. Remove the `appWithI18n` wrapper on `_app.js` _(if instead of the "build step" you were using the appWithI18n)_:

```diff
import React from 'react'
import type { AppProps } from 'next/app'
-import appWithI18n from 'next-translate/appWithI18n'
-import i18nConfig from '../i18n'

import '../styles.css'

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

-export default appWithI18n(MyApp, i18nConfig)
+export default MyApp
```

8. Replace `_plural` suffixes to `_other`. We are now supporting 6 plural forms, more info [in the README](https://github.com/aralroca/next-translate/blob/1.0.0/README.md#5-plurals).

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
