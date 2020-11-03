import { ParsedUrlQuery } from 'querystring'
import * as React from 'react'

export interface TranslationQuery {
  [name: string]: string | number
}

export interface Translate {
  (
    i18nKey: string,
    query: TranslationQuery,
    options?: { returnObjects?: boolean }
  ): unknown
}

export interface I18n {
  t: Translate
  lang: string
}

export interface I18nDictionary {
  [key: string]: unknown
}

export interface I18nLogger {
  (context: { namespace: string; i18nKey: string }): void
}

export interface I18nConfig {
  defaultLocale?: string | (() => string)
  locales?: string[]
  currentPagesDir?: string
  finalPagesDir?: string
  localesPath?: string
  package?: boolean
  loadLocaleFrom?: ((language: string, namespace: string) => string) | null
  pages?: Record<
    string,
    string[] | ((context: { req: Request; query: ParsedUrlQuery }) => string[])
  >
  logger?: I18nLogger
  logBuild?: boolean
}

export interface TransProps {
  i18nKey: string
  components?: React.ReactNodeArray
  values?: Record<string, unknown>
}

export interface DynamicNamespacesProps {
  dynamic: (language: string, namespace: string) => Promise<I18nDictionary>
  namespaces: string[]
  fallback?: React.ReactNode
}

export interface I18nProviderProps {
  lang: string
  namespaces?: Record<string, I18nDictionary>
  logger?: I18nLogger
}

export { default as appWithI18n } from './appWithI18n'
export { default as DynamicNamespaces } from './DynamicNamespaces'
export { default as I18nProvider } from './I18nProvider'
export { default as Trans } from './Trans'
export { default as useTranslation } from './useTranslation'
export { default as withTranslation } from './withTranslation'
