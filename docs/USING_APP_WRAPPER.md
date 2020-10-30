<p align="center">
    <img src="../images/logo.svg" width="300" alt="next-translate" />
</p>

<h1 align="center"> Getting started with a appWithI18n alternative </h1>

---

<p align="center">Warning ⚠️:</p>

> It will remove important performance optimizations, like serverless functions and Automatic Static Optimization.

How can I use `next-translate` with performance optimizations? Take a look at the [README.md](/README.md).

## 1. Install

- `yarn add next-translate`

## 2. You should add the i18n config file to next.config.js

Although `next-translate` has its own configuration, it is required to pass it also to `next.config.js` file so that it can solve the routing well.

```js
const { locales, defaultLocale } = require('./i18n.js')

module.exports = {
  i18n: { locales, defaultLocale },
}
```

## 3. Wrap your \_app.js

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
