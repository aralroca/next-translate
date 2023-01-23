# Migrating from next-translate v1 to v2

In version 2 of the **next-translate** library, we have made a significant change to the way the Webpack plugin is implemented. This change improves the library by solving many of the issues reported by users and makes it more powerful. However, it also means that two of the library's rules have been broken - it is now slightly larger and has a dependency on a specific version of the TypeScript parser.

To address this, we have split the library into two separate packages. The main package, **[next-translate](https://github.com/aralroca/next-translate)**, is used as before and handles all of the translation functionality. The new package, **[next-translate-plugin](https://github.com/aralroca/next-translate-plugin)**, is used specifically for the Webpack plugin and should only be used in the `next.config.js` file.

It's worth noting that by splitting the library into two packages and only using the `next-translate-plugin` in the `next.config.js` file, we are able to ensure that the extra kilobytes added by the TypeScript parser are only loaded during the build process and not included in the final bundle that is served to the client. This helps to keep the size of the final bundle as small as possible and improves the performance of your application. Additionally, by listing the `next-translate-plugin` will be installed as devDependency to reduce the extra kilobytes in the pipeline.

To migrate your project to use version 2, you will need to make the following changes:

- Install the **next-translate-plugin** package as a devDependency using `yarn add -D next-translate-plugin` or `npm install --save-dev next-translate-plugin`
- In your `next.config.js` file, replace `require('next-translate')` with `require('next-translate-plugin')`

Example of `next.config.js`:

```js
const nextTranslate = require('next-translate-plugin')

module.exports = nextTranslate()
```

After making these changes, your project should be fully migrated to the latest version of next-translate
