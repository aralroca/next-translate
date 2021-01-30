# hoist-non-react-statics

The HOCs we have in our API ([appWithI18n](../README.md#appwithi18n)), do not use [hoist-non-react-statics](https://github.com/mridgway/hoist-non-react-statics) in order not to include more kb than necessary _(static values different than getInitialProps in the pages are rarely used)_. If you have any conflict with statics, you can add hoist-non-react-statics (or any other alternative) in the configuration.

**i18n.js**

```js
const hoistNonReactStatics = require('hoist-non-react-statics')

module.exports = {
  locales: ['en', 'ca', 'es'],
  defaultLocale: 'en',
  // you need to add:
  staticsHoc: hoistNonReactStatics,
  // ... rest of conf
}
```
