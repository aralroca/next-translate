import { ReactElement, ReactNode } from 'react'
import type { NextConfig } from 'next'

export interface TranslationQuery {
  [name: string]: any
}

export type DataForStoreType = {
  lang: string
  namespaces: Record<string, I18nDictionary>
  config: LoaderConfig
}

export type Translate = <T extends unknown = string>(
  i18nKey: string | TemplateStringsArray,
  query?: TranslationQuery | null,
  options?: {
    returnObjects?: boolean
    fallback?: string | string[]
    default?: T | string
    ns?: string
  }
) => T

export interface I18n {
  t: Translate
  lang: string
}

export interface I18nProviderProps {
  lang?: string
  namespaces?: Record<string, I18nDictionary>
  children?: ReactNode
  config?: I18nConfig
}

export interface TransProps {
  i18nKey: string
  components?: ReactElement[] | Record<string, ReactElement>
  values?: TranslationQuery
  fallback?: string | string[]
  defaultTrans?: string
  ns?: string
  returnObjects?: boolean
}

export type PageValue = string[] | ((context: object) => string[])

export type LocaleLoader = (
  language: string | undefined,
  namespace: string
) => Promise<I18nDictionary>

// Makes the specified properties within a Typescript interface optional
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

// Built-in i18n Next.js options
export type RawNextI18nConfig = Exclude<NextConfig['i18n'], null | undefined>
export type NextI18nConfig = Optional<
  RawNextI18nConfig,
  'locales' | 'defaultLocale'
>

export interface I18nConfig extends NextI18nConfig {
  loadLocaleFrom?: LocaleLoader
  localesToIgnore?: string[]
  pages?: Record<string, PageValue>
  logger?: I18nLogger
  loggerEnvironment?: 'node' | 'browser' | 'both'
  staticsHoc?: Function
  extensionsRgx?: string
  loader?: boolean
  logBuild?: boolean
  revalidate?: number
  pagesInDir?: string
  interpolation?: {
    format?: (value: TranslationQuery[string], format: any, lang: string | undefined) => string
    prefix?: string
    suffix?: string
  }
  keySeparator?: string | false
  nsSeparator?: string | false
  defaultNS?: string
  allowEmptyStrings?: boolean
}

export interface LoaderConfig extends I18nConfig {
  locale?: string
  router?: { locale: string }
  pathname?: string
  skipInitialProps?: boolean
  loaderName?: string
  isLoader?: boolean
  [key: string]: any
}

export interface LoggerProps {
  namespace: string | undefined
  i18nKey: string
}

export interface I18nLogger {
  (context: LoggerProps): void
}

export interface I18nDictionary {
  [key: string]: string | I18nDictionary
}

export interface DynamicNamespacesProps {
  dynamic?: LocaleLoader
  namespaces?: string[]
  fallback?: ReactNode
  children?: ReactNode
}

declare global {
  // For NodeJS 16+
  // eslint-disable-next-line no-var
  var i18nConfig: LoaderConfig
  // eslint-disable-next-line no-var
  var __NEXT_TRANSLATE__: {
    namespaces: Record<string, I18nDictionary>
    lang: string
    config: LoaderConfig
  }

  namespace NodeJS {
    interface Global {
      i18nConfig: LoaderConfig
      __NEXT_TRANSLATE__: {
        namespaces: Record<string, I18nDictionary>
        lang: string
      }
    }
  }

  interface Window {
    i18nConfig: LoaderConfig
    __NEXT_TRANSLATE__: {
      namespaces: Record<string, I18nDictionary>
      lang: string
    }
  }
}

//////// For type safety (next-translate.d.ts):  ///////////
/*
 *
 * import type { Paths, I18n, Translate } from "next-translate";
 *
 * export interface TranslationsKeys {
 *   common: Paths<typeof import("./locales/en/common.json")>;
 *   home: Paths<typeof import("./locales/en/home.json")>;
 * }
 *
 * export interface TypeSafeTranslate<Namespace extends keyof TranslationsKeys>
 *   extends Omit<I18n, "t"> {
 *   t: {
 *     (key: TranslationsKeys[Namespace], ...rest: Tail<Parameters<Translate>>): string;
 *     <T extends string>(template: TemplateStringsArray): string;
 *   };
 * }
 *
 * declare module "next-translate/useTranslation" {
 *   export default function useTranslation<
 *     Namespace extends keyof TranslationsKeys,
 *   >(namespace: Namespace): TypeSafeTranslate<Namespace>;
 * }
 */

type RemovePlural<Key extends string> = Key extends `${infer Prefix}${
  | '_zero'
  | '_one'
  | '_two'
  | '_few'
  | '_many'
  | '_other'
  | `_${number}`}`
  ? Prefix
  : Key

type Join<S1, S2> = S1 extends string
  ? S2 extends string
    ? `${S1}.${S2}`
    : never
  : never

// @ts-ignore
export type Paths<T> = RemovePlural<
  // @ts-ignore
  {
    // @ts-ignore
    [K in Extract<keyof T, string>]: T[K] extends Record<string, unknown>
      ? Join<K, Paths<T[K]>>
      : K
  }[Extract<keyof T, string>]
>

// TODO: Remove this in future versions > 2.0.0
function nextTranslate(nextConfig: NextConfig = {}): NextConfig {
  console.log(`
    #########################################################################
    #                                                                       #
    #   next-translate plugin in 2.0.0 is replaced by                       #
    #   next-translate-plugin package:                                      #
    #                                                                       #
    #   > yarn add next-translate-plugin -D                                 #
    #   or:                                                                 #
    #   > npm install next-translate-plugin --save-dev                      #
    #                                                                       #
    #   replace in next.config.js file:                                     #
    #    const nextTranslate = require('next-translate')                    #
    #   to:                                                                 #
    #    const nextTranslate = require('next-translate-plugin')             #
    #                                                                       #
    #########################################################################
  `)
  return nextConfig
}

module.exports = nextTranslate
export default nextTranslate
