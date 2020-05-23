<p align="center">
    <img src="../images/logo.svg" width="300" alt="next-translate" />
</p>

<h1 align="center"> Getting started with a Custom Server alternative </h1>

---

<p align="center">Warning ⚠️:</p>

> It will remove important performance optimizations, like serverless functions and Automatic Static Optimization.

<p align="center"><a href="https://nextjs.org/docs/advanced-features/custom-server">View source</a></p>

How can I use `next-translate` with performance optimizations? Take a look at the [README.md](/README.md).

## 1. Requirements

First, you need to use a custom server in your Next.js application. You can follow this guide:

- https://nextjs.org/docs/advanced-features/custom-server

## 2. Install

- `yarn add next-translate`

<b>Note</b>: For a Next.js version below than `9.3.0`, use `next-translate@0.9.0` or below

## 3. Add the i18n middleware

You should add the `i18nMiddleware` to handle all i18n routes.

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

And the config is on `/i18n.js`:

```js
module.exports = {
  allLanguages: ['en', 'ca', 'es'],
  defaultLanguage: 'es',
  defaultLangRedirect: 'lang-path',
  loadLocaleFrom: (lang, ns) =>
    import(`./locales/${lang}/${ns}.json`).then((m) => m.default),
  pages: {
    '/': ['common', 'home'],
    '/more-examples': ['common', 'more-examples'],
    '/more-examples/dynamic-namespace': ['common'],
  },
}
```

It's important to move the configuration to another file because in the next step you are also going to use it.

## 4. Wrap your \_app.js

You should create your namespaces files inside `/locales`. [See here how to do it](/README.md#3-translation-jsons-folder)

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

## 5. Get language in the special Next.js functions

Consider to not use a custom server to have fully support of this feature. Read more about it [here](/README.md#10-get-language-in-the-special-nextjs-functions).

### getStaticProps

_❌ Not available with a custom server_

### getStaticPaths

_❌ Not available with a custom server_

### getServerSideProps

In order to get the language, you can use `req.lang`.

```js
export async function getServerSideProps({ req }) {
  return {
    props: {
      data: getDataFromLang(req.lang),
    },
  }
}
```

### getInitialProps

In order to get the language, you can use `req.lang` on server side, and `clientSideLang` on client side.

```js
import clientSideLang from 'next-translate/clientSideLang'

// ...

Page.getInitialProps = async ({ req }) => {
  const lang = req ? req.lang : clientSideLang()

  return {
    data: getDataFromLang(lang),
  }
}
```
