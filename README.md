# ㊗️ i18n-next-static

* [About the library](#about-the-library)
    * [How it works statically?](#how-it-works-statically)
* [Getting started](#getting-started)
    * [Add to your project](#add-to-your-project)
    * [Create /locales directory with translations JSONs](#create-locales-directory-with-translations-jsons)
    * [Use translations in your pages](#use-translations-in-your-pages)
    * [Add pages to .gitignore](#add-pages-to-gitignore)
* [Configuration](#configuration)
* [Plurals](#plurals)
* [Use HTML inside the translation](#use-html-inside-the-translation)

## About the library

Utility to translate Next.js pages without the need of a server (static i18n pages generator).

The main goal of this library is to keep the translations as simple as possible in a Next.js environment. 

This library is very tiny (~5kb). 

![i18n-next-static](images/translation-prerendered.gif "Translations in prerendered pages")


### How it works statically?

Instead of working on `/pages` directory to write our pages, we are going to generate this folder before build the app, an each page will be have all the necessary translations from the locale.

So imagine that we are working in an alternative `/pages_` to build our pages:

**/pages_**

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

## Getting started

### Add to your project

* `yarn install i18n-next-static`

And then, in your **package.json**:

```json
"scripts": {
  "dev": "yarn i18n && next dev",
  "build": "yarn i18n && next build",
  "start": "next start",
  "i18n": "i18nns-builder"
}
```

### Create /locales directory with translations JSONs

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

And each locales file is like:

```json
{
  "title": "Hello world",
  "variable-example": "Using a variable {{count}}"
}
```

### Use translations in your pages

First, define in the `/i18n.json` the namespaces of the page:

```json
{
  "pages": {
    "/index.js": ["common", "home"]
  }
}
```

Then, use translations in the page / children page component:

```jsx
import { useTranslation } from 'i18n-next-static'
// ...
const { t, lang } = useTranslation()
const example = t('common:variable-example', { count: 42 })
// ...
return <div>{example}</div>
```

When the final i18n key to use in the code will be `common:title`, when the namespace `common` is the name of the file, and `title` the translation key.

### Add /pages to .gitignore

`/pages` directory is going to be generated every time based on `/pages_`, so is not necessary to track in git.

## Configuration

Configuration file `i18n.json` in the root of the project:

```json
{
  "defaultLanguage": "en",
  "currentPagesDir": "pages_",
  "finalPagesDir": "pages",
  "localesPath": "locales",
  "pages": {}
}
```

| Option                         | Description                                                                                                                                                                                    | Type              | Default |
|-------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------|---------|
| `defaultLanguage`                     | String with the ISO locale ("en" as default). | `string` | "en"  |
| `currentPagesDir`                   | String with the directory that you have the pages code.  | `string` | "pages_" |
| `finalPagesDir`         | String with the directory that is going to build the pages. Only "pages" and "src/pages" is possible.  | `string` | "pages" |
| `localesPath`                  |String with the directory that are the JSON locales. | `string` | "locales" |
| `pages`                 |Is an object that define the namespaces used in each page. Ex: `{"/index.js": ["common", "home"]}` | `Object<Array<string>>` | {} |


## Plurals

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
function PluralExample(){
  const [count, setCount] = useState(0)
  const { t } = useTranslation()

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(v => v === 5 ? 0 : v + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <p>
      {t('namespace:plural-example', { count })}
    </p>
  )
}
```

Result:

![plural](images/plural.gif "Plural example")

***Note**: Only works if the name of the variable is {{count}}.*

## Use HTML inside the translation

You can define HTML inside the translation in this way:

```json
{
  "example-with-html": "<0>This is an example <1>using HTML</1> inside the translation</0>"
}
```

Example of usage:

```jsx
import { Trans } from 'i18n-next-static'
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

## How to run the examples of this repo

### Static site example

* `yarn install`
* `yarn example:static-site`

### With server example

* `yarn install`
* `yarn example:with-server`
