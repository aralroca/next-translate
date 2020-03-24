<p align="center">
    <img src="images/logo.svg" width="300" alt="next-translate" />
</p>

<p align="center">
    <b>i18n</b> for Next.js | ○  (Static)  | ●  (SSG) | λ  (Server)
    
    
</p>

<div align="center">

[![npm version](https://badge.fury.io/js/next-translate.svg)](https://badge.fury.io/js/next-translate)
[![PRs Welcome][badge-prwelcome]][prwelcome]
[![Join the community on Spectrum](https://withspectrum.github.io/badge/badge.svg)][spectrum]

</div>

- [1. About next-translate](#1-about-next-translate)
  - [How is this lib handling the routes?](#how-is-this-lib-handling-the-routes)
- [2. Getting started](#2-getting-started)
  - [Requirements](#requirements)
  - [Install](#install)
  - [Use translations in your pages](#use-translations-in-your-pages)
  - [Add pages to .gitignore](#add-pages-to-gitignore)
- [3. Translation JSONs folder](#3-translation-jsons-folder)
- [4. Configuration](#4-configuration)
- [5. API](#5-api)
  - [useTranslation](#usetranslation)
  - [withTranslation](#withtranslation)
  - [Trans Component](#trans-component)
  - [appWithI18n](#appwithi18n)
  - [DynamicNamespaces](#dynamicnamespaces)
  - [i18nMiddleware](#i18nmiddleware)
  - [Link](#link)
  - [Router](#router)
  - [clientSideLang](#clientsidelang)
- [6. Plurals](#6-plurals)
- [7. Use HTML inside the translation](#7-use-html-inside-the-translation)
- [8. Nested translations](#8-nested-translations)
- [9. How to change the language](#9-how-to-change-the-language)
- [10. Demos](#10-demos)
  - [Static site example](#static-site-example)
  - [With custom server example](#with-custom-server-example)

<p align="center">
    <img src="images/translation-prerendered.gif" alt="Translations in prerendered pages" />
</p>

## 1. About next-translate

Next-translate is a tool to translate Next.js pages.

The main goal of this library is to keep the translations as simple as possible in a Next.js environment.

This library is very tiny and tree shakable.

<p align="center">
    <img width="500" src="images/bundle-size.png" alt="Bundle size" />
</p>

### How is this lib handling the routes?

Instead of working on `/pages` directory to write our pages, we are going to generate this folder before building the app, an each page will have all the necessary translations from the locale.

Imagine that we are working in an alternative `/pages_` to build our pages:

**/pages\_**

```bash
.
├── about.js
├── index.js
└── nested
    └── index.js
```

Then, when we build the app, this **/pages** structure is going to be automatically generated:

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

Each page and its components can consume the translations with the `useTranslation` hook.

```js
const { t, lang } = useTranslation()
const title = t('common:title')
```

## 2. Getting started

### Requirements

In order to take the advantage of Automatic Static Optimization of Next.js, make sure to don't use a custom server.

If you need a custom server, instead of this Getting started, take a look to [this other one](/docs/USING_CUSTOM_SERVER.md).

### Install

- `yarn add next-translate`

**Note**: For a Next.js version below than `9.3.0`, use `next-translate@0.9.0` or below

In your **package.json**:

```json
"scripts": {
  "dev": "next-translate && next dev",
  "build": "next-translate && next build",
  "start": "next start"
}
```

### Use translations in your pages

You should create your namespaces files inside `/locales`. [See how to do it](#3-translation-jsons-folder)

Add a configuration file `i18n.json` in the root of the project. Each page should have its namespaces. Take a look to the [config](#4-configuration) section for more details.

```json
{
  "allLanguages": ["en", "ca", "es"],
  "defaultLanguage": "en",
  "currentPagesDir": "pages_",
  "finalPagesDir": "pages",
  "localesPath": "locales",
  "pages": {
    "*": ["common"],
    "/": ["home", "example"],
    "/about": ["about"]
  }
}
```

Then, use the translations in the page and its components:

```jsx
import useTranslation from 'next-translate/useTranslation'
// ...
const { t, lang } = useTranslation()
const example = t('common:variable-example', { count: 42 })
// ...
return <div>{example}</div>
```

⚠️ **Important**: \_app.js, \_document.js and \_error.js are not going to be wrapped with the translations context, so it's not possible to direclty translate these files. In order to do that, you should take a look at [DynamicNamespaces](#dynamicnamespaces) to load the namespaces dynamically.

### Add /pages to .gitignore

`/pages` directory is going to be generated every time based on `/pages_`, so it's not necessary to track it in git.

## 3. Translation JSONs folder

The locales directory should be like this:

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

Each filename matches the namespace, while each file content should be similar to this:

```json
{
  "title": "Hello world",
  "variable-example": "Using a variable {{count}}"
}
```

In order to use each translation in the project, use the _translation id_ composed by `namespace:key`(ex: `common:variable-example`).

## 4. Configuration

| Option                  | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Type                            | Default                                                                    |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | -------------------------------------------------------------------------- |
| `defaultLanguage`       | A string with the ISO locale ("en" as default). Also you can pass it as a function to return the language depending the `req` param (only in case to use a custom server).                                                                                                                                                                                                                                                                                                                         | `string|function`               | `"en"`                                                                     |
| `allLanguages`          | An array with all the languages to use in the project.                                                                                                                                                                                                                                                                                                                                                                                                                                             | `Array<string>`                 | `[]`                                                                       |
| `ignoreRoutes`          | An array with all the routes to ignore in the middleware. This config property only effect using a custom server with the `i18nMiddleware`.                                                                                                                                                                                                                                                                                                                                                        | `Array<string>`                 | `['/_next/', '/static/', '/favicon.ico', '/manifest.json', '/robots.txt']` |
| `redirectToDefaultLang` | When is set to `true` the route `/some-page` redirects to `/en/some-path` (if `en` is the default language). When is set to `false` entering to `/some-path` is rendering the page with the default language but without redirecting. Using Static/SSG the redirect is done in the browser with Route.replace meanwhile using a custom server is doing a real 301 status redirect.                                                                                                                 | `boolean`                       | `false`                                                                    |
| `currentPagesDir`       | A string with the directory where you have the pages code. Using a custom server this configuration won't have any effect.                                                                                                                                                                                                                                                                                                                                                                         | `string`                        | `"pages\_"`                                                                |
| `finalPagesDir`         | A string with the directory that is going to be used to build the pages. Only "pages" and "src/pages" are possible. Using a custom server this configuration won't have any effect.                                                                                                                                                                                                                                                                                                                | `string`                        | `"pages"`                                                                  |
| `localesPath`           | A string with the directory of JSONs locales. It doesn't work with a custom server, instead you should use the `loadLocaleFrom` config.                                                                                                                                                                                                                                                                                                                                                            | `string`                        | `"locales"`                                                                |
| `loadLocaleFrom`        | A function to return the dynamic import of each locale. IT ONLY WORKS with a custom server. In the case to don't use a custom server you should use the `localesPath` instead. [See an example](#use-translations-in-your-pages)                                                                                                                                                                                                                                                                   | `Function`                      | `null`                                                                     |
| `pages`                 | An object that defines the namespaces used in each page. Example of object: `{"/": ["home", "example"]}`. To add namespaces to all pages you should use the key `"*"`, ex: `{"*": ["common"]}`. Also is possible to use regex using `rgx:` on front: `{"rgx:/form$": ["form"]}`. In case of using a custom server, you also can use a function instead of an array, to provide some namespaces depending some rules, ex: `{ "/": ({ req, query }) => query.type === 'example' ? ['example'] : []}` | `Object<Array<string>/Function` | `{}`                                                                       |

## 5. API

### useTranslation

📦**Size**: ~614b

This hook is the recommended way to use translations in your pages / components.

- **Input**: void
- **Output**: Object { t: Function, lang: string }

Example:

```jsx
import React from 'react'
import useTranslation from 'next-translate/useTranslation'

export default function Description() {
  const { t, lang } = useTranslation()
  const title = t('title')
  const description = t`common:description` // also works as template string
  const example = t('common:example', { count: 3 }) // and with query params

  return (
    <>
      <h1>{title}</h1>
      <p>{description}</p>
      <p>{example}</p>
    <>
  )
}
```

The `t` function:

- **Input**:
  - i18nKey: string (namespace:key)
  - query: Object (example: { name: 'Leonard' })
- **Output**: string

### withTranslation

📦**Size**: ~759b

It's an alternative to `useTranslation` hook, but in a HOC for these components that are no-functional.

The `withTranslation` HOC returns a Component with an extra prop named `i18n` (Object { t: Function, lang: string }).

Example:

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

📦**Size**: ~1.5kb

Sometimes we need to do some translations with HTML inside the text (bolds, links, etc). The `Trans` component is exactly what you need for this. We recommend to use this component only in this case, for other cases we highly recommend the usage of `useTranslation` hook instead.

Example:

```jsx
// The defined dictionary enter is like:
// "example": "<0>The number is <1>{{count}}</1></0>",
<Trans
  i18nKey="common:example"
  components={[<Component />, <b className="red" />]}
  values={{ count: 42 }}
/>
```

- **Props**:
  - `i18nKey` - string - key of i18n entry (namespace:key)
  - `components` - Array<Node> - Each index correspont to the defined tag `<0>`/`<1>`.
  - `values` - Object - query params

### appWithI18n

📦**Size**: ~4.7kb

This HOC is the way to wrap all your app under translations in the case that you are using a custom server. This method should not be used in a static site. This HOC adds logic to the `getInitialProps` to download the necessary namespaces in order to use it in your pages.

Example:

`_app.js`

```jsx
import appWithI18n from 'next-translate/appWithI18n'
import i18nConfig from '../i18n'

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

export default appWithI18n(MyApp, i18nConfig)
```

See more details about the [config](#4-configuration) that you can use.

### DynamicNamespaces

📦**Size**: ~4.1kb

The `DynamicNamespaces` component is useful to load dynamic namespaces, for example, in modals. This component works in both cases (static sites and with a custom server).

Example:

```jsx
import React from 'react'
import Trans from 'next-translate/Trans'
import DynamicNamespaces from 'next-translate/DynamicNamespaces'

export default function ExampleWithDynamicNamespace() {
  return (
    <DynamicNamespaces
      dynamic={(lang, ns) =>
        import(`../../locales/${lang}/${ns}.json`).then((m) => m.default)
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

Remember that `['dynamic']` namespace should **not** be listed on `pages` configuration:

```js
 pages: {
    '/my-page': ['common'], // only common namespace
  }
```

### i18nMiddleware

📦**Size**: ~1.4kb

This middleware is to use translations behind a custom server. You should add this middleware:

```js
const i18nMiddleware = require('next-translate/i18nMiddleware').default
const i18nConfig = require('./i18n')

// ...
server.use(i18nMiddleware(i18nConfig))
```

See more details about the [config](#4-configuration) that you can use.

**Props**:

- `dynamic` - Function - Generic dynamic import of all namespaces (mandatory).
- `namespaces` - Array<string> - List of namespaces to load dynamically (mandatory).
- `fallback` - Any - Fallback to render meanwhile namespaces are loading (default: `null`)

### Link

📦**Size**: ~11kb (`next/link` size included)

It is a wrapper of `next/link` that adds the current language at the beginning of the path, without to worry to add the language in every navigation. In order to change the language, you can pass the `lang` as props:

```jsx
import Link from 'next-translate/Link'

// If the current language is 'en':

// -> Navigate to /en/some-path
<Link href="/some-path"><a>Navigate</a></Link>

 // -> Navigate to /es/route-in-spanish
<Link href="/route-in-spanish" lang="es"><a>Navigate</a></Link>

// -> Navigate to /some-path
<Link noLang href="/some-path"><a>Navigate</a></Link>
```

**Props**: Same props than `next/link` + only one additional prop:

- `lang`: `<String>` prop useful to navigate to a different language than the current one. The default value, if this prop is not provided, is the current language. So you don't need to worry about passing this prop for normal navigation.
- `noLang`: `<Boolean>` prop to disable appending the current language to the route.

### Router

📦**Size**: ~10kb (`next/router` size included)

It is a wrapper of `next/router` when you can use the normal router of next.js, adding two extra methods:

- **Router.pushI18n**: It is exactly the same as `Router.push`, with the difference that it adds the current language at the beginning of the URL. In order to change the language, you can pass the `lang` into the `options`.
- **Router.replaceI18n**: It is exactly the same as `Router.replace`, with the difference that it adds the current language at the beginning of the URL. In order to change the language, you can pass the `lang` into the `options`.

```js
import Router from 'next-translate/Router'

// If the current language is 'en':

// -> Navigate to /en/some-path
Router.pushI18n('/some-path')

// -> Navigate to /es/route-in-spanish
Router.pushI18n({ url: '/route-in-spanish', options: { lang: 'es' } })
// or
Router.pushI18n('/route-in-spanish', undefined, { lang: 'es' })
```

### clientSideLang

📦**Size**: ~590b

Useful to get the language outside Components.

Example using a custom server:

```js
import clientSideLang from 'next-translate/clientSideLang'

// ...

Page.getInitialProps({ req }) {
   const lang = req ? req.lang : clientSideLang()
  // ...
}
```

Or just for helpers:

```js
import clientSideLang from 'next-translate/clientSideLang'

// ...

export function myClientSideHelper() {
  const lang = clientSideLang()
  // ...
}
```

It is **not recommended** to use the `clientSideLang` on the server-side directly because is stored in a global variable and it can cause some concurrency issues.

## 6. Plurals

You can define plurals this way:

```json
{
  "plural-example": "This is singular because the value is {{count}}",
  "plural-example_0": "Is zero because the value is {{count}}",
  "plural-example_2": "Is two because the value is {{count}}",
  "plural-example_plural": "Is in plural because the value is {{count}}"
}
```

Example:

```jsx
function PluralExample() {
  const [count, setCount] = useState(0)
  const { t } = useTranslation()

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((v) => (v === 5 ? 0 : v + 1))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return <p>{t('namespace:plural-example', { count })}</p>
}
```

Result:

![plural](images/plural.gif 'Plural example')

**\*Note**: Only works if the name of the variable is {{count}}.\*

## 7. Use HTML inside the translation

You can define HTML inside the translation this way:

```json
{
  "example-with-html": "<0>This is an example <1>using HTML</1> inside the translation</0>"
}
```

Example:

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

Each index of `components` array corresponds with `<index></index>` of the definition.

In the `components` array it's not necessary to pass the children of each element. Children will be calculed.

## 8. Nested translations

In the namespace is possible to define nested keys like:

```json
{
  "nested-example": {
    "very-nested": {
      "nested": "Nested example!"
    }
  }
}
```

In order to use it, you should use "." as id separator:

```js
t`namespace:nested-example.very-nested.nested`
```

## 9. How to change the language

In order to change the current language you don't need anything of this library, you can do it directly with the next navigation:

- https://nextjs.org/learn/basics/navigate-between-pages

The only thing to remember, is to navigate with the **/lang/** on front.

One example of a possible `ChangeLanguage` component:

```js
import React from 'react'
import Link from 'next-translate/Link'
import useTranslation from 'next-translate/useTranslation'
import i18nConfig from '../i18n.json'

const { allLanguages } = i18nConfig

function ChangeLanguage() {
  const { t, lang } = useTranslation()

  return allLanguages.map((lng) => {
    if (lng === lang) return null

    // Or you can attach the current pathame at the end
    // to keep the same page
    return (
      <Link href="/" lang={lng} key={lng}>
        {t(`layout:language-name-${lng}`)}
      </Link>
    )
  })
}
```

## 10. Demos

### Static site example

- `yarn install`
- `yarn example:static-site`

### With custom server example

- `yarn install`
- `yarn example:with-server`

[badge-prwelcome]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[prwelcome]: http://makeapullrequest.com
[spectrum]: https://spectrum.chat/next-translate
