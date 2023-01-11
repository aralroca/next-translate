import { ReactElement, ReactNode } from 'react'
import type { NextConfig } from 'next'

import nextTranslate from './plugin'

export interface TranslationQuery {
  [name: string]: any
}

export type Translate = <T = string>(
  i18nKey: string | TemplateStringsArray,
  query?: TranslationQuery | null,
  options?: {
    returnObjects?: boolean
    fallback?: string | string[]
    default?: string
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
    format?: Function
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

  namespace NodeJS {
    interface Global {
      i18nConfig: LoaderConfig
    }
  }

  interface Window {
    i18nConfig: LoaderConfig
  }
}

module.exports = nextTranslate
export default nextTranslate
