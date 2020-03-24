<p align="center">
    <img src="../images/logo.svg" width="300" alt="next-translate" />
</p>

<h1 align="center"> Getting started with a Custom Server </h1>

---

<p align="center">Remember ⚠️:</p>

> Before deciding to use a custom server please keep in mind that it should only be used when the integrated router of Next.js can't meet your app requirements. A custom server will remove important performance optimizations, like serverless functions and Automatic Static Optimization.

<p align="center"><a href="https://nextjs.org/docs/advanced-features/custom-server">View source</a></p>

How can I use `next-translate` without the need of a custom server? Take a look at the README.md.

## 1. Requirements

Before, you need to already use a custom server following this guide:

- https://nextjs.org/docs/advanced-features/custom-server

## 2. Install next-translate

- `yarn add next-translate`

<b>Note</b>: For a Next.js version below than `9.3.0`, use `next-translate@0.9.0` or below

## 3. Add the i18n middleware

You should add the `i18nMiddleware` in order to add the language and allow to render the pages behind the `/{lang}` prefix.

```js
const express = require('express')
const next = require('next')
const i18nMiddleware = require('next-translate/i18nMiddleware').default
const i18nConfig = require('./i18n')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()
const server = express()
const PORT = parseInt(process.env.PORT, 10) || 3000

// You should add this middleware
server.use(i18nMiddleware(i18nConfig))

server.get('*', handle)

module.exports = app
  .prepare()
  .then(() =>
    server.listen(PORT, (err) => {
      if (err) throw err
      console.log(`> Ready on http://localhost:${PORT}`)
    })
  )
  .catch(console.error)
```

Where the config is in the root path as `i18n.js`:

```js
module.exports = {
  allLanguages: ['en', 'ca', 'es'],
  defaultLanguage: 'es',
  redirectToDefaultLang: true,
  loadLocaleFrom: (lang, ns) =>
    import(`./locales/${lang}/${ns}.json`).then((m) => m.default),
  pages: {
    '/': ['common', 'home'],
    '/more-examples': ['common', 'more-examples'],
    '/more-examples/dynamic-namespace': ['common'],
  },
}
```

It's important to move the configuration in another file because in the next step also you are going to use it.

## 4. Wrap your \_app.js

You should create your namespaces files inside `/locales`. [See how to do it](/README.md#3-translation-jsons-folder)

You should pass the configuration into the `appWithI18n` wrapper of your app. Each page should have its namespaces. Take a look to the [config](/README.md#4-configuration) section for more details.

\_app.js

```js
import appWithI18n from 'next-translate/appWithI18n'
import i18nConfig from '../i18n'

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

export default appWithI18n(MyApp, i18nConfig)
```

Now, use translations in the page and its components:

```jsx
import useTranslation from 'next-translate/useTranslation'
// ...
const { t, lang } = useTranslation()
const example = t('common:variable-example', { count: 42 })
// ...
return <div>{example}</div>
```
