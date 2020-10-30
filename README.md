<p align="center">
    <img src="images/logo.svg" width="300" alt="next-translate" />
</p>

<p align="center">
    <b>i18n</b> for Next.js >= 10.0.0
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
  - [How translations are added in each page?](#how-translations-are-added-in-each-page)
- [2. Getting started](#2-getting-started)
  - [Install](#install)
  - [Add the i18n.js config file](#add-the-i18njs-config-file)
  - [Use Next.js i18n routing](#use-nextjs-i18n-routing)
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
- [6. Plurals](#6-plurals)
- [7. Use HTML inside the translation](#7-use-html-inside-the-translation)
- [8. Nested translations](#8-nested-translations)
- [9. How to change the language](#9-how-to-change-the-language)
- [10. How to use multi-language in a page](#10-how-to-use-multi-language-in-a-page)
- [11. Do I need this "build step"? Is there an alternative?](#11-do-i-need-this-build-step-is-there-an-alternative)
  - [First alternative](#first-alternative)
  - [Second alternative](#second-alternative)
- [12. Demos](#12-demos)
  - [Demo from Next.js](#demo-from-nextjs)
  - [Basic demo: With the "build step"](#basic-demo-with-the-build-step)
  - [Basic demo: Using the appWithI18n alternative](#basic-demo-using-the-appwithi18n-alternative)
  - [Basic demo: Without the "build step"](#basic-demo-without-the-build-step)
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

### How translations are added in each page?

Instead of working on `/pages` directory to write our pages, we are going to generate this folder before building the app, and each page will have all the necessary translations from the locale.

This "build step" is designed to make it easy to download the necessary translations for each page in an easy way.

In the configuration, you specify each page that namespaces needs:

```js
{
  "pages": {
    "*": ["common"],
    "/": ["home"],
    "/cart": ["cart"],
    "/content/[slug]": ["content"],
    "rgx:^/account": ["account"]
  }
  // rest of config here...
}
```

_[Read here](#3-translation-jsons-folder) about how to add the namespaces JSON files._

Then, during the build step:

- The download of the page namespaces are added on corresponding loader method (`getInitialProps`, `getServerSideProps` or `getStaticProps`). In the case that the page doesn't have any loader method is using the `getStaticProps` by default, except:
  - For dynamic pages that is using `getServerSideProps` to avoid to write a `getStaticPaths`.
  - For pages that have a HOC is using `getInitialProps` in order to avoid possible conflicts.
- Each page is wrapped with an **i18nProvider** with its namespaces.

This **whole process is transparent**, so in your pages you can directly consume the `useTranslate` hook to use the namespaces, and you don't need to do anything else, because the 'build step' does it.

<details><summary>Example of page and how is converted</summary>
<p>

**pages\_/example.js**

```js
import useTranslation from 'next-translate/useTranslation'

export default function Examples() {
  const { t } = useTranslation()
  const exampleWithVariable = t('examples:example-with-variable', {
    count: 42,
  })

  return <div>{exampleWithVariable}</div>
}
```

And after the build step, this is converted to:

**pages/example.js**

```js
// @ts-nocheck
import I18nProvider from 'next-translate/I18nProvider'
import React from 'react'
import C from '../../pages_/example'

export default function Page({ _ns, _lang, ...p }) {
  return (
    <I18nProvider lang={_lang} namespaces={_ns}>
      <C {...p} />
    </I18nProvider>
  )
}

Page = Object.assign(Page, { ...C })

export const getStaticProps = async (ctx) => {
  const _lang = ctx.locale || ctx.router?.locale || 'en'
  const ns0 = await import(`../../locales/${_lang}/common.json`).then(
    (m) => m.default
  )
  const ns1 = await import(`../../locales/${_lang}/more-examples.json`).then(
    (m) => m.default
  )
  const _ns = { common: ns0, examples: ns1 }

  let res = {}
  if (typeof res.then === 'function') res = await res

  return {
    ...res,
    props: {
      ...(res.props || {}),
      _ns,
      _lang,
    },
  }
}
```

</p>
</details>

## 2. Getting started

This is the recommended way to get started. However, if you don't like the "build step" you can use an [alternative](#12-do-i-need-this-build-step-is-there-an-alternative).

### Install

- `yarn add next-translate`

**Note**: For a Next.js version below than `10.0.0`, use `next-translate@0.18.0` or below

In your **package.json**:

```json
"scripts": {
  "dev": "next-translate && next dev",
  "build": "next-translate && next build",
  "start": "next start"
}
```

### Add the i18n.js config file

You should create your namespaces files inside `/locales`. [See how to do it](#3-translation-jsons-folder)

Add a configuration file `i18n.json` _(or `i18n.js` with `module.exports`)_ in the root of the project. Each page should have its namespaces. Take a look at it in the [config](#4-configuration) section for more details.

```json
{
  "locales": ["en", "ca", "es"],
  "defaultLocale": "en",
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

### Use Next.js i18n routing

From version 10.0.0 of Next.js the i18n routing is in the core, so the following must be added to the `next.config.js` file:

```js
const { locales, defaultLocale } = require('./i18n.json')

module.exports = {
  i18n: { locales, defaultLocale },
}
```

### Use translations in your pages

Then, use the translations in the page and its components:

**pages\_/example.js**

```jsx
import useTranslation from 'next-translate/useTranslation'
// ...
const { t, lang } = useTranslation()
const example = t('common:variable-example', { count: 42 })
// ...
return <div>{example}</div>
```

Remember that we must work in the alternative directory `pages_`. The `pages` directory will be generated during the build step.

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

| Option            | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Type                            | Default                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------- | ------------------------------------------------------------------------------- |
| `defaultLocale`   | ISO of the default locale ("en" as default).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | `string\|function`              | `"en"`                                                                          |
| `locales`         | An array with all the languages to use in the project.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | `Array<string>`                 | `[]`                                                                            |
| `currentPagesDir` | A string with the directory where you have the pages code. This is needed for the "build step".                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | `string`                        | `"pages_"`                                                                      |
| `finalPagesDir`   | A string with the directory that is going to be used to build the pages. Only "pages" and "src/pages" are possible. This is needed for the "build step".                                                                                                                                                                                                                                                                                                                                                                                                                                               | `string`                        | `"pages"`                                                                       |
| `localesPath`     | A string with the directory of JSONs locales. This is needed for the "build step".                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | `string`                        | `"locales"`                                                                     |
| `loadLocaleFrom`  | As an alternative to `localesPath`, if `appWithI18n` is used instead of the "build step". It's an async function that returns the dynamic import of each locale.                                                                                                                                                                                                                                                                                                                                                                                                                                       | `Function`                      | `null`                                                                          |
| `pages`           | An object that defines the namespaces used in each page. Example of object: `{"/": ["home", "example"]}`. To add namespaces to all pages you should use the key `"*"`, ex: `{"*": ["common"]}`. It's also possible to use regex using `rgx:` on front: `{"rgx:/form$": ["form"]}`. In case of using a custom server as an [alternative](#using-an-alternative-of-the-build-step-custom-server) of the "build step", you can also use a function instead of an array, to provide some namespaces depending on some rules, ex: `{ "/": ({ req, query }) => query.type === 'example' ? ['example'] : []}` | `Object<Array<string>/Function` | `{}`                                                                            |
| `logger`          | Function to log the **missing keys** in development and production. If you are using `i18n.json` as config file you should change it to `i18n.js`.                                                                                                                                                                                                                                                                                                                                                                                                                                                     | `function`                      | By default the logger is a function doing a `console.warn` only in development. |  |
| `logBuild`        | Configure if the build result should be logged to the console                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | `Boolean`                       | `true`                                                                          |

## 5. API

### useTranslation

📦**Size**: ~150b

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

📦**Size**: ~560b

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

📦**Size**: ~1.4kb

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

📦**Size**: ~3.7kb

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

📦**Size**: ~1.5kb

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

📦**Size**: ~3kb

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

In order to change the current language you can use the [Next.js navigation](https://nextjs.org/docs/advanced-features/i18n-routing) (Link and Router) passing the `locale` prop.

An example of a possible `ChangeLanguage` component:

```js
import React from 'react'
import Link from 'next/link'
import useTranslation from 'next-translate/useTranslation'
import i18nConfig from '../i18n.json'

const { locales } = i18nConfig

function ChangeLanguage() {
  const { t, lang } = useTranslation()

  return locales.map((lng) => {
    if (lng === lang) return null

    // Or you can attach the current pathname at the end
    // to keep the same page
    return (
      <Link href="/" locale={lng} key={lng}>
        {t(`layout:language-name-${lng}`)}
      </Link>
    )
  })
}
```

## 10. How to use multi-language in a page

In some cases, when the page is in the current language, you may want to do some exceptions displaying some text in another language.

In this case, you can achieve this by using the `I18nProvider`.

Learn how to do it [here](#i18nprovider).

## 11. Do I need this "build step"? Is there an alternative?

The "build step" exists only to simplify work with Automatic Static Optimization, so right now it is the recommended way. However, if you prefer not to do the "build step", there are two alternatives.

### First alternative

If you don't need Automatic Static Optimization in your project, you can achieve the same by using a [appWithI18n](#appwithi18n).

Pros and cons:

- 🔴 Automatic Static Optimization is not an option
- 🟢 Easy to configure

Learn more: [Docs](docs/USING_APP_WRAPPER.md) · [Example](https://github.com/vinissimus/next-translate/tree/master/examples/with-appWithI18n)

### Second alternative

You can achieve the same that the "build step" by adding some helper to load the namespaces en each page (similar than the "build step" does).

Pros and cons:

- 🟢 Automatic Static Optimization
- 🔴 Hard to configure

## 12. Demos

### Demo from Next.js

There is a demo of `next-translate` on the Next.js repo:

- https://github.com/vercel/next.js/tree/master/examples/with-next-translate

To use it:

```bash
npx create-next-app --example with-next-translate with-next-translate-app
# or
yarn create next-app --example with-next-translate with-next-translate-app
```

### Basic demo: With the "build step"

This demo is in this repository:

- `git clone git@github.com:vinissimus/next-translate.git`
- `cd next-translate`
- `yarn && yarn example:with-build-step`

### Basic demo: Using the appWithI18n alternative

This demo is in this repository:

- `git clone git@github.com:vinissimus/next-translate.git`
- `cd next-translate`
- `yarn && yarn example:with-server`

### Basic demo: Without the "build step"

This demo is in this repository:

- `git clone git@github.com:vinissimus/next-translate.git`
- `cd next-translate`
- `yarn && yarn example:without-build-step`

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
    <td align="center"><a href="https://roman-minchyn.de"><img src="https://avatars0.githubusercontent.com/u/6419697?v=4" width="100px;" alt=""/><br /><sub><b>Roman Minchyn</b></sub></a><br /><a href="https://github.com/vinissimus/next-translate/commits?author=dnepro" title="Documentation">📖</a> <a href="https://github.com/vinissimus/next-translate/commits?author=dnepro" title="Code">💻</a></td>
    <td align="center"><a href="https://www.egorphilippov.me/"><img src="https://avatars2.githubusercontent.com/u/595980?v=4" width="100px;" alt=""/><br /><sub><b>Egor</b></sub></a><br /><a href="https://github.com/vinissimus/next-translate/commits?author=lone-cloud" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/dhobbs"><img src="https://avatars2.githubusercontent.com/u/367375?v=4" width="100px;" alt=""/><br /><sub><b>Darren</b></sub></a><br /><a href="https://github.com/vinissimus/next-translate/commits?author=dhobbs" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/giovannigiordano"><img src="https://avatars3.githubusercontent.com/u/15145952?v=4" width="100px;" alt=""/><br /><sub><b>Giovanni Giordano</b></sub></a><br /><a href="https://github.com/vinissimus/next-translate/commits?author=giovannigiordano" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/kidnapkin"><img src="https://avatars0.githubusercontent.com/u/9214135?v=4" width="100px;" alt=""/><br /><sub><b>Eugene</b></sub></a><br /><a href="https://github.com/vinissimus/next-translate/commits?author=kidnapkin" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://andrew-c.com"><img src="https://avatars2.githubusercontent.com/u/11482515?v=4" width="100px;" alt=""/><br /><sub><b>Andrew Chung</b></sub></a><br /><a href="https://github.com/vinissimus/next-translate/commits?author=hibearpanda" title="Code">💻</a></td>
    <td align="center"><a href="http://cuthanh.com"><img src="https://avatars0.githubusercontent.com/u/9281080?v=4" width="100px;" alt=""/><br /><sub><b>Thanh Minh</b></sub></a><br /><a href="https://github.com/vinissimus/next-translate/commits?author=thanhlmm" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
