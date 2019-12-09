<h1 align="center"> ㊗ ️ next-translate</h1>

<p align="center">
    <b>i18n</b> for Next.js static pages ⚡️
</p>

<div align="center">

[![PRs Welcome][Badge-PRWelcome]][PRWelcome]
[![Join the community on Spectrum](https://withspectrum.github.io/badge/badge.svg)][Spectrum]

</div>

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
  - [useTranslation](#usetranslation)
  - [withTranslation](#withtranslation)
  - [Trans Component](#trans-component)
  - [appWithI18n](#appwithi18n)
  - [DynamicNamespaces](#dynamicnamespaces)
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

⚠️ **Important**: _app.js, _document.js and _error.js are not going to be wrapped with the translations context, so it's not possible to direclty translate these files. In order to do that, you should take a look at [DynamicNamespaces](#dynamicnamespaces) to load the namespaces dynamically.

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

### useTranslation

📦**Size**: ~1.5kb

This hook is the recommended way to use translations in your pages / components.

- **Input**: void
- **Output**: Object { t: Function, lang: string }

Example of usage:

```jsx
import React from 'react'
import useTranslation from 'next-translate/useTranslation'

export default function Description() {
  const { t, lang } = useTranslation()
  const description = t('common:description')

  return <p>{description}</p>
}
```

The `t` function:

- **Input**:
  - i18nKey: string (namespace:key)
  - query: Object (example: { name: 'Leonard' })
- **Output**: string

### withTranslation

📦**Size**: ~2.5kb

Is an alternative to `useTranslation` hook, but in a HOC for these components that are no-functional.

The `withTranslation` HOC returns a Component with an extra prop named `i18n` (Object { t: Function, lang: string }).

Example of usage:

```jsx
import React from 'react'
import withTranslation from 'next-translate/withTranslation'

class Description extends React.Component {
  render() {
    const { t, lang } = this.props.i18n
    const description = t('common:description')

    return <p>{description}</p>
  }
}

export default withTranslation(NoFunctionalComponent)
```

### Trans Component

📦**Size**: ~5kb

Sometimes we need to do some translations with HTML inside the text (bolds, links, etc). The `Trans` component is exactly to do that. We recommend to use this component only in this case, for other cases we highly recommend the usage of `useTranslation` hook instead.

Example of usage:

```jsx
// The defined dictionary enter is like:
// "extended-description": "<0>This is an example <1>using HTML</1> inside the translation</0>",
<Trans
  i18nKey="common:extended-description"
  components={[<Component />, <b className="red" />]}
/>
```

- **Props**:
  - `i18nKey` - string - key of i18n entry (namespace:key)
  - `components` - Array<Node> - Each index correspont to the defined tag `<0>`/`<1>`.

### appWithI18n

📦**Size**: ~10kb

This HOC is the way to wrap all your app under translations in the case that you are using a server. This method should not be used in a static site. This HOC adds logic to the `getInitialProps` to download the necessary namespaces in order to use it in your pages.

Example of usage:

`_app.js`

```jsx
import appWithI18n from 'next-translate/appWithI18n'

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

export default appWithI18n(MyApp, {
  defaultLanguage: 'es',
  loadLocaleFrom: (lang, ns) =>
    import(`../locales/${lang}/${ns}.json`).then(m => m.default),
  pages: {
    '/': ['common', 'home'], // namespaces used in "/" page
    '/about': ['common', 'about'], // namespaces used in "about" page
  },
})
```

### DynamicNamespaces

📦**Size**: ~13kb

The `DynamicNamespaces` component is useful to load dynamic namespaces, for example, in modals. This component works in both cases (static sites and with a server).

Example of usage:

```jsx
import React from 'react'
import Trans from 'next-translate/Trans'
import DynamicNamespaces from 'next-translate/DynamicNamespaces'

export default function ExampleWithDynamicNamespace() {
  return (
    <DynamicNamespaces
      dynamic={(lang, ns) =>
        import(`../../locales/${lang}/${ns}.json`).then(m => m.default)
      }
      namespaces={['dynamic']}
      fallback="Loading..."
    >
      {/* ALSO IS POSSIBLE TO USE NAMESPACES FROM THE PAGE */}
      <h1>
        <Trans i18nKey="common:title" />
      </h1>

      {/* USING DYNAMIC NAMESPACE */}
      <Trans i18nKey="dynamic:example-of-dynamic-translation" />
    </DynamicNamespaces>
  )
}
```

And `['dynamic']` namespace should **not** be listed on `pages` configuration:

```js
 pages: {
    '/my-page': ['common'], // only common namespace
  }
```

**Props**:

- `dynamic` - Function - Generic dynamic import of all namespaces (mandatory).
- `namespaces` - Array<string> - List of namespaces to load dynamically (mandatory).
- `fallback` - Any - Fallback to render meanwhile namespaces are loading (default: `null`)

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



[Badge-PRWelcome]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[PRWelcome]: http://makeapullrequest.com
[Spectrum]: https://spectrum.chat/next-translate
