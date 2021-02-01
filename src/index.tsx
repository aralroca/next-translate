import { ReactElement, ReactNode } from 'react'

import nextTranslate from './plugin'

export interface TranslationQuery {
  // the parameters could be anything if interpolation format is used, e.g. Date objects, users, ...
  [name: string]: any
}

export type Translate = (
  i18nKey: string | TemplateStringsArray,
  query?: TranslationQuery | null,
  options?: { returnObjects?: boolean; fallback?: string | string[] }
) => string

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
}

export type PageValue = string[] | ((context: object) => string[])

export type LocaleLoader = (
  language: string | undefined,
  namespace: string
) => Promise<I18nDictionary>

export interface I18nConfig {
  defaultLocale?: string
  locales?: string[]
  loadLocaleFrom?: LocaleLoader
  pages?: Record<string, PageValue>
  logger?: I18nLogger
  staticsHoc?: Function
  loader?: boolean
  logBuild?: boolean
  interpolation?: {
    format?: Function
    prefix?: string
    suffix?: string
  }
}

export interface LoaderConfig extends I18nConfig {
  locale?: string
  router?: { locale: string }
  pathname?: string
  skipInitialProps?: boolean
  loaderName?: string
  isLoader?: boolean
}

export interface LoggerProps {
  namespace: string
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
  module NodeJS {
    interface Global {
      i18nConfig: LoaderConfig
    }
  }

  interface Window {
    i18nConfig: LoaderConfig
  }
}

module.exports = nextTranslate
