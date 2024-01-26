import type { Paths, I18n, Translate } from 'next-translate'

type Tail<T> = T extends [unknown, ...infer Rest] ? Rest : never;

export interface TranslationsKeys {
  // Example with "common" and "home" namespaces in "en" (the default language):
  common: Paths<typeof import('./locales/en/common.json')>
  home: Paths<typeof import('./locales/en/home.json')>
  // Specify here all the namespaces you have...
}

type TranslationNamespace = keyof TranslationsKeys;

export interface TranslateFunction<Namespace extends TranslationNamespace>  {
  (
    key: TranslationsKeys[Namespace],
    ...rest: Tail<Parameters<Translate>>
  ): string
  <T extends string>(template: TemplateStringsArray): string
};

export interface TypeSafeTranslate<Namespace extends TranslationNamespace>
  extends Omit<I18n, 't'> {
  t: TranslateFunction<Namespace>
}

declare module 'next-translate/useTranslation' {
  export default function useTranslation<
    Namespace extends TranslationNamespace
  >(namespace: Namespace): TypeSafeTranslate<Namespace>
}

declare module 'next-translate/getT' {
  export default function getT<
    Namespace extends TranslationNamespace
  >(locale?: string, namespace: Namespace): Promise<TranslateFunction<Namespace>>  
}
