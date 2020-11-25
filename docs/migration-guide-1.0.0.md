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

module.exports = {
-  i18n: { locales, defaultLocale },
+  ...nextTranslate(),
};
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

7. Make sure to update plural suffixes. More information on this can be found [in the README](https://github.com/vinissimus/next-translate/tree/1.0.0-experimental#5-plurals).

```diff
{
-  "lorem-ipsum_plural": "The value is {{count}}"
+  "lorem-ipsum_other": "The value is {{count}}"
}
```
