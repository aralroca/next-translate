<h1 align="center"> ㊗ ️ next-translate</h1>

<p align="center">
    <b>i18n</b> for Next.js static pages ⚡️ (~5kb + tree shakable)
</p>

- [1. About the library](#1-about-the-library)
  - [How it works statically?](#how-it-works-statically)
- [2. Getting started (static site)](#2-getting-started-static-site)
  - [Add to your project](#add-to-your-project)
  - [Use translations in your pages](#use-translations-in-your-pages)
  - [Add pages to .gitignore](#add-pages-to-gitignore)
- [3. Getting started (with a server)](#3-getting-started-with-a-server)
  - [Add to your project](#add-to-your-project-1)
  - [Use translations in your pages](#use-translations-in-your-pages-1)
- [4. Create /locales directory with translations JSONs](#4-create-locales-directory-with-translations-jsons)
- [5. Configuration](#5-configuration)
- [5. API](#6-api)
  - [appWithI18n](#-appwithi18n)
  - [useTranslation](#-usetranslation)
  - [withTranslation](#-withtranslation)
  - [Trans Component](#-trans-component)
  - [I18nProvider (rare use case)](#i18nprovider-rare-use-case)
- [7. Plurals](#7-plurals)
- [8. Use HTML inside the translation](#8-use-html-inside-the-translation)
- [9. Demos](#9-demos)
  - [Static site example](#static-site-example)
  - [With server example](#with-server-example)

<p align="center">
    <img src="images/translation-prerendered.gif" alt="Translations in prerendered pages" />
</p>

## 1. About the library

Utility to translate Next.js pages without the need of a server (static i18n pages generator).

The main goal of this library is to keep the translations as simple as possible in a Next.js environment.

This library is very tiny (~5kb).

### How it works statically?

Instead of working on `/pages` directory to write our pages, we are going to generate this folder before build the app, an each page will be have all the necessary translations from the locale.

So imagine that we are working in an alternative `/pages_` to build our pages:

**/pages\_**

```bash
.
├── about.js
├── index.js
└── nested
    └── index.js
```

And when we build the app, this **/pages** is automatically generated:

```bash
.
├── about.js
├── ca
│   ├── about.js
│   ├── index.js
│   └── nested
│       └── index.js
├── en
│   ├── about.js
│   ├── index.js
│   └── nested
│       └── index.js
├── es
│   ├── about.js
│   ├── index.js
│   └── nested
│       └── index.js
├── index.js
└── nested
    └── index.js
```

And each page and page children can consume the translations with the hook `useTranslation`.

```js
const { t, lang } = useTranslation()
const title = t('common:title')
```

## 2. Getting started (static site)

### Add to your project

- `yarn install next-translate`

And then, in your **package.json**:

```json
"scripts": {
  "dev": "next-translate && next dev",
  "build": "next-translate && next build",
  "start": "next start"
}
```

### Use translations in your pages

You should create your namespaces files inside `/locales`. [See how to do it](#create-locales-directory-with-translations-jsons)

For static site you should add a configuration file `i18n.json` in the root of the project. Each page should have their namespaces. Take a look to the [config](#5-configuration) section to more details.

```json
{
  "defaultLanguage": "en",
  "currentPagesDir": "pages_",
  "finalPagesDir": "pages",
  "localesPath": "locales",
  "pages": {
    "/": ["common", "home"],
    "/about": ["common", "about"]
  }
}
```

Then, use translations in the page / children page component:

```jsx
import useTranslation from 'next-translate/useTranslation'
// ...
const { t, lang } = useTranslation()
const example = t('common:variable-example', { count: 42 })
// ...
return <div>{example}</div>
```

### Add /pages to .gitignore

`/pages` directory is going to be generated every time based on `/pages_`, so is not necessary to track in git.

## 3. Getting started (with a server)

### Add to your project

- `yarn install next-translate`

### Use translations in your pages

You should create your namespaces files inside `/locales`. [See how to do it](#4-create-locales-directory-with-translations-jsons)

Using a server, you should pass the configuration into the `appWithI18n` wrapper of your app. Each page should have their namespaces. Take a look to the [config](#5-configuration) section to more details.

\_app.js

```js
import appWithI18n from 'next-translate/appWithI18n'

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

export default appWithI18n(MyApp, {
  defaultLanguage: 'es',
  loadLocaleFrom: (lang, ns) =>
    import(`../locales/${lang}/${ns}.json`).then(m => m.default),
  pages: {
    '/': ['common', 'home'],
    '/more-examples': ['common', 'more-examples'],
  },
})
```

Then, use translations in the page / children page component:

```jsx
import useTranslation from 'next-translate/useTranslation'
// ...
const { t, lang } = useTranslation()
const example = t('common:variable-example', { count: 42 })
// ...
return <div>{example}</div>
```

## 4. Create /locales directory with translations JSONs

The locales directory should be like:

**/locales**

```bash
.
├── ca
│   ├── common.json
│   └── home.json
├── en
│   ├── common.json
│   └── home.json
└── es
    ├── common.json
    └── home.json
```

When each filename is the namespace. And each file should be like:

```json
{
  "title": "Hello world",
  "variable-example": "Using a variable {{count}}"
}
```

And the id to use it in the projec is `namespace:key` (ex: `common:variable-example`)

## 5. Configuration

| Option                                                             | Description                                                                                                                                                                                                                              | Type                    | Default   |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | --------- |
| `defaultLanguage`                                                  | String with the ISO locale ("en" as default).                                                                                                                                                                                            | `string`                | "en"      |
| `currentPagesDir`                                                  | String with the directory that you have the pages code. IT ONLY APPLIES in static sites. If you use the `                                                                                                                                |
| `this configuration doesn't have any effect. |`string` | "pages\_" |
| `finalPagesDir`                                                    | String with the directory that is going to build the pages. Only "pages" and "src/pages" is possible. IT ONLY APPLIES in static sites. If you use the `appWithI18n` this configuration doesn't have any effect.                          | `string`                | "pages"   |
| `localesPath`                                                      | String with the directory that are the JSON locales. IT ONLY WORKS with static sites. If you use the `appWithI18n` then you should use the `loadLocaleFrom` config.                                                                      | `string`                | "locales" |
| `loadLocaleFrom`                                                   | Function to return the dynamic import of each locale. IT ONLY WORKS with a server (`appWithI18n`). For static site use the `localesPath` instead. [See an example](#use-translations-in-your-pages-1)                                    | `Function`              | null      |
| `pages`                                                            | Is an object that define the namespaces used in each page (Only used by the builder tool to generate static i18n pages). Example of object: `{"/": ["common", "home"]}`. This configuration is for both: static sites and with a server. | `Object<Array<string>>` | {}        |

## 6. API

### appWithI18n

@todo

### useTranslation

@todo

### withTranslation

@todo

### Trans Component

@todo

### I18nProvider (rare use case)

@todo

## 7. Plurals

You can define plurals in this way:

```json
{
  "plural-example": "This is singular because the value is {{count}}",
  "plural-example_0": "Is zero because the value is {{count}}",
  "plural-example_2": "Is two because the value is {{count}}",
  "plural-example_plural": "Is in plural because the value is {{count}}"
}
```

Example of usage:

```jsx
function PluralExample() {
  const [count, setCount] = useState(0)
  const { t } = useTranslation()

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(v => (v === 5 ? 0 : v + 1))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return <p>{t('namespace:plural-example', { count })}</p>
}
```

Result:

![plural](images/plural.gif 'Plural example')

**\*Note**: Only works if the name of the variable is {{count}}.\*

## 8. Use HTML inside the translation

You can define HTML inside the translation in this way:

```json
{
  "example-with-html": "<0>This is an example <1>using HTML</1> inside the translation</0>"
}
```

Example of usage:

```jsx
import Trans from 'next-translate/Trans'
// ...
const Component = (props) => <p {...props} />
// ...
<Trans
  i18nKey="namespace:example-with-html"
  components={[<Component />, <b className="red" />]}
/>
```

Rendered result:

```html
<p>This is an example <b class="red">using HTML</b> inside the translation</p>
```

Each index of `components` array is corresponding on `<index></index>` of the definition.

In the `components` array is not necessary to pass the children of each element. The children will be calculed.

## 9. Demos

### Static site example

- `yarn install`
- `yarn example:static-site`

### With server example

- `yarn install`
- `yarn example:with-server`
