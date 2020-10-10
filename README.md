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
<a href="https://github.com/vinissimus/next-translate/actions?query=workflow%3ACI" alt="Tests status">
<img src="https://github.com/vinissimus/next-translate/workflows/CI/badge.svg" /></a>
<a href="https://twitter.com/intent/follow?screen_name=shields_io">
<img src="https://img.shields.io/twitter/follow/aralroca?style=social&logo=twitter"
            alt="follow on Twitter"></a>

</div>

- [1. About next-translate](#1-about-next-translate)
  - [How is this lib handling the routes?](#how-is-this-lib-handling-the-routes)
- [2. Getting started](#2-getting-started)
  - [Install](#install)
  - [Use translations in your pages](#use-translations-in-your-pages)
  - [Add /pages to .gitignore](#add-pages-to-gitignore)
- [3. Translation JSONs folder](#3-translation-jsons-folder)
- [4. Configuration](#4-configuration)
- [5. API](#5-api)
  - [useTranslation](#usetranslation)
  - [withTranslation](#withtranslation)
  - [Trans Component](#trans-component)
  - [appWithI18n](#appwithi18n)
  - [DynamicNamespaces](#dynamicnamespaces)
  - [I18nProvider](#i18nprovider)
  - [i18nMiddleware](#i18nmiddleware)
  - [Link](#link)
  - [Router](#router)
  - [clientSideLang](#clientsidelang)
  - [fixHref](#fixhref)
  - [documentLang](#documentlang)
- [6. Plurals](#6-plurals)
- [7. Use HTML inside the translation](#7-use-html-inside-the-translation)
- [8. Nested translations](#8-nested-translations)
- [9. How to change the language](#9-how-to-change-the-language)
- [10. Get language in the special Next.js functions](#10-get-language-in-the-special-nextjs-functions)
  - [getStaticProps](#getstaticprops)
  - [getStaticPaths](#getstaticpaths)
  - [getServerSideProps](#getserversideprops)
  - [getInitialProps](#getinitialprops)
- [11. How to use multi-language in a page](#11-how-to-use-multi-language-in-a-page)
- [12. Do I need this "build step"? Is there an alternative?](#12-do-i-need-this-build-step-is-there-an-alternative)
  - [First alternative](#first-alternative)
  - [Second alternative](#second-alternative)
- [13. Demos](#13-demos)
  - [Using the "build step"](#using-the-build-step)
  - [Alternatives to the "build step"](#alternatives-to-the-build-step)
    - [dynamic routes](#dynamic-routes)
    - [custom server](#custom-server)
- [Contributors ✨](#contributors-)

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

Instead of working on `/pages` directory to write our pages, we are going to generate this folder before building the app, and each page will have all the necessary translations from the locale.

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
│   ├── [...path].js
├── es
│   ├── about.js
│   ├── index.js
│   └── nested
│       └── index.js
├── index.js
└── nested
    └── index.js
```

**Note**: `/en/[...path].js` is a redirect from `/en/some-route` to `/some-route`

Each page and its components can consume the translations with the `useTranslation` hook.

```js
const { t, lang } = useTranslation()
const title = t('common:title')
```

## 2. Getting started

This is the recommended way to get started. However, if you don't like the "build step" you can use an [alternative](#12-do-i-need-this-build-step-is-there-an-alternative).

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

Add a configuration file `i18n.json` in the root of the project. Each page should have its namespaces. Take a look at it in the [config](#4-configuration) section for more details.

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

⚠️ **Important**: \_app.js, \_document.js and \_error.js are not going to be wrapped with the translations context, so it's not possible to directly translate these files. In order to do that, you should take a look at [DynamicNamespaces](#dynamicnamespaces) to load the namespaces dynamically.

### Add /pages to .gitignore

`/pages` directory is going to be generated every time based on `/pages_`, so it's not necessary to track it in git.

## 3. Translation JSONs folder

The **/locales** directory should be like this:

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

| Option                | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Type                            | Default                                                                    |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------- | -------------------------------------------------------------------------- |
| `defaultLanguage`     | ISO of the default locale ("en" as default).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | `string\|function`              | `"en"`                                                                     |
| `allLanguages`        | An array with all the languages to use in the project.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | `Array<string>`                 | `[]`                                                                       |
| `ignoreRoutes`        | An array with all the routes to ignore in the middleware. This config property only effects using the `i18nMiddleware`, SO MAYBE YOU'LL NEVER NEED THIS.                                                                                                                                                                                                                                                                                                                                                                                                                                               | `Array<string>`                 | `['/_next/', '/static/', '/favicon.ico', '/manifest.json', '/robots.txt']` |
| `defaultLangRedirect` | It accepts `lang-path` and `root` as string. If it's set to `lang-path` redirects the default language routes from `/my-route` to `/en/my-route`. If it's set to `root` redirects the default language routes from `/en/my-route` to `/my-route`. Otherwise, when it's not defined, it's not doing any redirect (default).                                                                                                                                                                                                                                                                             | `string\|undefined`             | undefined                                                                  |
| `currentPagesDir`     | A string with the directory where you have the pages code. This is needed for the "build step".                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | `string`                        | `"pages_"`                                                                 |
| `finalPagesDir`       | A string with the directory that is going to be used to build the pages. Only "pages" and "src/pages" are possible. This is needed for the "build step".                                                                                                                                                                                                                                                                                                                                                                                                                                               | `string`                        | `"pages"`                                                                  |
| `localesPath`         | A string with the directory of JSONs locales. This is needed for the "build step".                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | `string`                        | `"locales"`                                                                |
| `loadLocaleFrom`      | As an alternative to `localesPath`, if `i18nMiddleware` is used instead of the "build step". It's an async function that returns the dynamic import of each locale. [See an example](/docs/USING_CUSTOM_SERVER.md#3-add-the-i18n-middleware)                                                                                                                                                                                                                                                                                                                                                           | `Function`                      | `null`                                                                     |
| `pages`               | An object that defines the namespaces used in each page. Example of object: `{"/": ["home", "example"]}`. To add namespaces to all pages you should use the key `"*"`, ex: `{"*": ["common"]}`. It's also possible to use regex using `rgx:` on front: `{"rgx:/form$": ["form"]}`. In case of using a custom server as an [alternative](#using-an-alternative-of-the-build-step-custom-server) of the "build step", you can also use a function instead of an array, to provide some namespaces depending on some rules, ex: `{ "/": ({ req, query }) => query.type === 'example' ? ['example'] : []}` | `Object<Array<string>/Function` | `{}`                                                                       |
| `logBuild`            | Configure if the build result should be logged to the console                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | `Boolean`                       | `true`                                                                     |

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
  const title = t('common:title')
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

Sometimes we need to do some translations with HTML inside the text (bolds, links, etc), the `Trans` component is exactly what you need for this. We recommend to use this component only in this case, for other cases we highly recommend the usage of `useTranslation` hook instead.

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
  - `components` - Array<Node> - Each index corresponds to the defined tag `<0>`/`<1>`.
  - `values` - Object - query params

### appWithI18n

📦**Size**: ~4.7kb

Using the "build step" you'll never need this.

This HOC is the way to wrap all your app under translations in the case that you are using a custom server as an [alternative](#12-do-i-need-this-build-step-is-there-an-alternative) to the "build step", adding logic to the `getInitialProps` to download the necessary namespaces in order to use it in your pages.

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

See more details about the [config](#4-configuration) you can use.

### DynamicNamespaces

📦**Size**: ~4.1kb

The `DynamicNamespaces` component is useful to load dynamic namespaces, for example, in modals.

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

### I18nProvider

📦**Size**: ~1.8kb

The `I18nProvider` is a context provider internally used by next-translate to provide the current **lang** and the page **namespaces**. SO MAYBE YOU'LL NEVER NEED THIS.

However, it's exposed to the API because it can be useful in some cases. For example, to use multi-language translations in a page.

The `I18nProvider` is accumulating the namespaces, so you can rename the new ones in order to keep the old ones.

```jsx
import React from 'react'
import I18nProvider from 'next-translate/I18nProvider'
import useTranslation from 'next-translate/useTranslation'

// Import English common.json
import commonEN from '../../locales/en/common.json'

function PageContent() {
  const { t, lang } = useTranslation()

  console.log(lang) // -> current language

  return (
    <div>
      <p>{t('common:example') /* Current language */}</p>
      <p>{t('commonEN:example') /* Force English */}</p>
    </div>
  )
}

export default function Page() {
  const { lang } = useTranslation()

  return (
    <I18nProvider lang={lang} namespaces={{ commonEN }}>
      <PageContent />
    </I18nProvider>
  )
}
```

### i18nMiddleware

📦**Size**: ~1.4kb

If you are using Automatic Static Optimization, you don't need this. This middleware is an alternative to the "build step".

```js
const i18nMiddleware = require('next-translate/i18nMiddleware').default
const i18nConfig = require('./i18n')

// ...
server.use(i18nMiddleware(i18nConfig))
```

See more details about the [config](#4-configuration) you can use.

**Props**:

- `dynamic` - Function - Generic dynamic import of all namespaces (mandatory).
- `namespaces` - Array<string> - List of namespaces to load dynamically (mandatory).
- `fallback` - Any - Fallback to render meanwhile namespaces are loading (default: `null`)

### Link

📦**Size**: ~11kb (`next/link` size included)

It's a wrapper of `next/link` that adds the current language at the beginning of the path, so you don't have to worry to add the language in every navigation. In order to change the language, you can pass the `lang` as props:

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

It's a wrapper of `next/router` so you can use the normal router of next.js, adding two extra methods:

- **Router.pushI18n**: It is exactly the same as `Router.push`, except that it adds the current language at the beginning of the URL. In order to change the language, you can pass the `lang` into the `options`.
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

```js
import clientSideLang from 'next-translate/clientSideLang'

// ...

export function myClientSideHelper() {
  const lang = clientSideLang()
  // ...
}
```

It is **not recommended** to use the `clientSideLang` directly on the server-side because it's stored in a global variable and it can cause some concurrency issues.

### fixHref

📦**Size**: ~100b

Useful to get the `href` string with the language (if necessary). It's similar to ![Link](#link) , but only to get the `href` string. It's recommended to use the [Link](#link) component or [Router](#router) instead.

```js
import useTranslation from 'next-translate/useTranslation'
import fixHref from 'next-translate/fixHref'

// ...
const defaultLang = 'en'

export function MyComponent() {
  const { lang } = useTranslation()
  const href = fixHref('/some/route', lang) // /es/some/route
  console.log(fixHref('/some/route', defaultLang))
  // if it's default lang: /some/route or /en/some/route (depends on your config)
}
```

**Props**:

- `href`: `<string>` href string
- `lang`: `<string>` language

### documentLang

📦**Size**: ~300b (0b in client-side)

Helper to get the page language inside `\_document.js`.

```js
import Document, { Html, Head, Main, NextScript } from 'next/document'
import documentLang from 'next-translate/documentLang'

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang={documentLang(this.props)}>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
```

- **Props**:
  - `props` - Object - the document properties
  - `i18nConfig` - Object - i18n config. Is optional. By default is using the config from `/i18n.json` file.

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

**Note**: Only works if the name of the variable is {{count}}.

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

In the `components` array, it's not necessary to pass the children of each element. Children will be calculated.

## 8. Nested translations

In the namespace, it's possible to define nested keys like this:

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

Also is possible to use as array:

```json
{
  "array-example": [
    { "example": "Example {{count}}" },
    { "another-example": "Another example {{count}}" }
  ]
}
```

And get all the array translations with the option `returnObjects`:

```js
t('namespace:array-example', { count: 1 }, { returnObjects: true })
/*
[
  { "example": "Example 1" },
  { "another-example": "Another example 1" }
]
*/
```

## 9. How to change the language

In order to change the current language you can use [next-translate/Link](#link) and [next-translate/Router](#router).

An example of a possible `ChangeLanguage` component:

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

    // Or you can attach the current pathname at the end
    // to keep the same page
    return (
      <Link href="/" lang={lng} key={lng}>
        {t(`layout:language-name-${lng}`)}
      </Link>
    )
  })
}
```

## 10. Get language in the special Next.js functions

If you are using an alternative to the "build step", this section is not applicable.
In order to use the `lang` in the special Next.js functions, the `lang` property is added to the context.

### getStaticProps

```js
export async function getStaticProps({ lang }) {
  return {
    props: {
      data: fetchMyDataFromLang(lang),
    },
  }
}
```

See [here](https://nextjs.org/docs/basic-features/data-fetching#getstaticprops-static-generation) the official Next.js docs about `getStaticProps`.

### getStaticPaths

```js
export async function getStaticPaths({ lang }) {
  return {
    paths: generatePathsFromLang(lang),
    fallback: false,
  }
}
```

See [here](https://nextjs.org/docs/basic-features/data-fetching#getstaticpaths-static-generation) the official Next.js docs about `getStaticPaths`.

### getServerSideProps

```js
export async function getServerSideProps({ lang }) {
  return {
    props: {
      data: queryDataFromDB(lang),
    },
  }
}
```

See [here](https://nextjs.org/docs/basic-features/data-fetching#getserversideprops-server-side-rendering) the official Next.js docs about `getServerSideProps`

### getInitialProps

Recommended: Use **getStaticProps** or **getServerSideProps** instead.

```js
MyPage.getInitialProps = async ({ lang }) => {
  return {
    data: fetchMyDataFromLang(lang),
  }
}
```

See [here](https://nextjs.org/docs/api-reference/data-fetching/getInitialProps#getinitialprops-for-older-versions-of-nextjs) the official Next.js docs about `getInitialProps`

## 11. How to use multi-language in a page

In some cases, when the page is in the current language, you may want to do some exceptions displaying some text in another language.

In this case, you can achieve this by using the `I18nProvider`.

Learn how to do it [here](#i18nprovider).

## 12. Do I need this "build step"? Is there an alternative?

The "build step" exists only to simplify work with Automatic Static Optimization, so right now it is the recommended way. However, if you prefer not to do the "build step", there are two alternatives.

### First alternative

You can achieve the same with dynamic routes.

Pros and cons:

- 🟢 Automatic Static Optimization
- 🔴 Hard to configure

See a full example [here](https://github.com/vinissimus/next-translate/tree/master/examples/with-dynamic-routes)

In future major releases, we may evolve simplifying this and removing the "build step". If you want to help on this, there is an open issue [here](https://github.com/vinissimus/next-translate/issues/129) to discuss.

### Second alternative

If you don't need Automatic Static Optimization in your project, you can achieve the same by using a custom server.

Pros and cons:

- 🔴 Automatic Static Optimization is not an option
- 🟢 Easy to configure

Learn more: [Docs](docs/USING_CUSTOM_SERVER.md) · [Example](https://github.com/vinissimus/next-translate/tree/master/examples/with-server)

## 13. Demos

### Using the "build step"

- `yarn install`
- `yarn example:static-site`

### Alternatives to the "build step"

There are alternatives to the "build step", namely using "dynamic routes" or a "custom server".

#### dynamic routes

- `yarn install`
- `yarn example:with-dynamic-routes`

#### custom server

- `yarn install`
- `yarn example:with-server`

[badge-prwelcome]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[prwelcome]: http://makeapullrequest.com
[spectrum]: https://spectrum.chat/next-translate

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://aralroca.com"><img src="https://avatars3.githubusercontent.com/u/13313058?v=4" width="100px;" alt=""/><br /><sub><b>Aral Roca Gomez</b></sub></a><br /><a href="#maintenance-aralroca" title="Maintenance">🚧</a> <a href="https://github.com/vinissimus/next-translate/commits?author=aralroca" title="Code">💻</a></td>
    <td align="center"><a href="https://twitter.com/vincentducorps"><img src="https://avatars0.githubusercontent.com/u/6338609?v=4" width="100px;" alt=""/><br /><sub><b>Vincent Ducorps</b></sub></a><br /><a href="https://github.com/vinissimus/next-translate/commits?author=vincentducorps" title="Code">💻</a></td>
    <td align="center"><a href="https://www.rahwn.com"><img src="https://avatars3.githubusercontent.com/u/36173920?v=4" width="100px;" alt=""/><br /><sub><b>Björn Rave</b></sub></a><br /><a href="https://github.com/vinissimus/next-translate/commits?author=BjoernRave" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/justincy"><img src="https://avatars2.githubusercontent.com/u/1037458?v=4" width="100px;" alt=""/><br /><sub><b>Justin</b></sub></a><br /><a href="https://github.com/vinissimus/next-translate/commits?author=justincy" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/psanlorenzo"><img src="https://avatars2.githubusercontent.com/u/42739235?v=4" width="100px;" alt=""/><br /><sub><b>Pol</b></sub></a><br /><a href="#infra-psanlorenzo" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
    <td align="center"><a href="https://twitter.com/ftonato"><img src="https://avatars2.githubusercontent.com/u/5417662?v=4" width="100px;" alt=""/><br /><sub><b>Ademílson F. Tonato</b></sub></a><br /><a href="https://github.com/vinissimus/next-translate/commits?author=ftonato" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/Faulik"><img src="https://avatars3.githubusercontent.com/u/749225?v=4" width="100px;" alt=""/><br /><sub><b>Faul</b></sub></a><br /><a href="https://github.com/vinissimus/next-translate/commits?author=Faulik" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/bickmaev5"><img src="https://avatars2.githubusercontent.com/u/13235737?v=4" width="100px;" alt=""/><br /><sub><b>bickmaev5</b></sub></a><br /><a href="https://github.com/vinissimus/next-translate/commits?author=bickmaev5" title="Code">💻</a></td>
    <td align="center"><a href="https://p.ier.re"><img src="https://avatars1.githubusercontent.com/u/1866496?v=4" width="100px;" alt=""/><br /><sub><b>Pierre Grimaud</b></sub></a><br /><a href="https://github.com/vinissimus/next-translate/commits?author=pgrimaud" title="Documentation">📖</a></td>
    <td align="center"><a href="https://roman-minchyn.de"><img src="https://avatars0.githubusercontent.com/u/6419697?v=4" width="100px;" alt=""/><br /><sub><b>Roman Minchyn</b></sub></a><br /><a href="https://github.com/vinissimus/next-translate/commits?author=dnepro" title="Documentation">📖</a></td>
    <td align="center"><a href="https://www.egorphilippov.me/"><img src="https://avatars2.githubusercontent.com/u/595980?v=4" width="100px;" alt=""/><br /><sub><b>Egor</b></sub></a><br /><a href="https://github.com/vinissimus/next-translate/commits?author=lone-cloud" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/dhobbs"><img src="https://avatars2.githubusercontent.com/u/367375?v=4" width="100px;" alt=""/><br /><sub><b>Darren</b></sub></a><br /><a href="https://github.com/vinissimus/next-translate/commits?author=dhobbs" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/giovannigiordano"><img src="https://avatars3.githubusercontent.com/u/15145952?v=4" width="100px;" alt=""/><br /><sub><b>Giovanni Giordano</b></sub></a><br /><a href="https://github.com/vinissimus/next-translate/commits?author=giovannigiordano" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/kidnapkin"><img src="https://avatars0.githubusercontent.com/u/9214135?v=4" width="100px;" alt=""/><br /><sub><b>Eugene</b></sub></a><br /><a href="https://github.com/vinissimus/next-translate/commits?author=kidnapkin" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://andrew-c.com"><img src="https://avatars2.githubusercontent.com/u/11482515?v=4" width="100px;" alt=""/><br /><sub><b>Andrew Chung</b></sub></a><br /><a href="https://github.com/vinissimus/next-translate/commits?author=hibearpanda" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
