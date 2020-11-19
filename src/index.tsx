import plugin from './plugin'
import { ReactElement, ReactNode } from 'react'

export interface TranslationQuery {
  [name: string]: string | number
}

export interface I18n {
  t(
    i18nKey: string | string[],
    query: TranslationQuery | null | undefined,
    options: { returnObjects: boolean }
  ): string | object
  t(
    i18nKey: string | string[],
    query: TranslationQuery | null | undefined
  ): string
  t(i18nKey: string | string[]): string

  lang: string
  loadLocaleFrom?: (
    language: string,
    namespace: string
  ) => Promise<I18nDictionary>
}

export interface I18nProviderProps {
  lang?: string
  namespaces?: Record<string, I18nDictionary>
  children?: ReactNode
  logger?: I18nLogger
  loadLocaleFrom?: (
    language: string,
    namespace: string
  ) => Promise<I18nDictionary>
}

export interface TransProps {
  i18nKey: string
  components?: ReactElement[]
  values?: TranslationQuery
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
}

export interface LoaderConfig extends I18nConfig {
  locale?: string
  router?: { locale: string }
  pathname?: string
  skipInitialProps?: boolean
  loaderName?: string
  isLoader?: boolean
  defaultLoader?: (
    language: string,
    namespace: string
  ) => Promise<I18nDictionary>
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
  fallback?: React.ReactNode
  children?: React.ReactNode
}

module.exports = plugin
