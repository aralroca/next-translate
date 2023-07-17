# Type safety consuming translations (TypeScript only)

To enable type safety consuming translations, you have to add this to the `next-translate.d.ts` file specifying the name and location of the namespaces:

```ts
import type { Paths, I18n, Translate } from 'next-translate'

export interface TranslationsKeys {
  // Example with "common" and "home" namespaces in "en" (the default language):
  common: Paths<typeof import('./locales/en/common.json')>
  home: Paths<typeof import('./locales/en/home.json')>
  // Specify here all the namespaces you have...
}

export interface TypeSafeTranslate<Namespace extends keyof TranslationsKeys>
  extends Omit<I18n, 't'> {
  t: {
    (
      key: TranslationsKeys[Namespace],
      ...rest: Tail<Parameters<Translate>>
    ): string
    <T extends string>(template: TemplateStringsArray): string
  }
}

declare module 'next-translate/useTranslation' {
  export default function useTranslation<
    Namespace extends keyof TranslationsKeys
  >(namespace: Namespace): TypeSafeTranslate<Namespace>
}
```

Then type safety should work:

<img width="472" alt="Screenshot 2023-07-17 at 19 17 13" src="https://github.com/aralroca/next-translate/assets/13313058/e9e505a7-4cc5-41e3-b2e4-b7f27fb2d181">

<img width="282" alt="Screenshot 2023-07-17 at 19 22 00" src="https://github.com/aralroca/next-translate/assets/13313058/616987b4-e49b-4cf2-b511-cdfaba57e1d2">

Reference: https://github.com/aralroca/next-translate/pull/1108
