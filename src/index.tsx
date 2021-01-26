import { ReactElement, ReactNode } from 'react'

import nextTranslate from './plugin'

export interface TranslationQuery {
  [name: string]: string | number
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

export interface I18nConfig {
  defaultLocale?: string
  locales?: string[]
  loadLocaleFrom?: (
    language: string,
    namespace: string
  ) => Promise<I18nDictionary>
  pages?: Record<string, PageValue>
  logger?: I18nLogger
  loader?: boolean
  logBuild?: boolean
  interpolation?: {
    prefix: string
    suffix: string
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
  [key: string]: unknown
}

export interface DynamicNamespacesProps {
  dynamic?: (language: string, namespace: string) => Promise<I18nDictionary>
  namespaces?: string[]
  fallback?: ReactNode
  children?: ReactNode
}

module.exports = nextTranslate
