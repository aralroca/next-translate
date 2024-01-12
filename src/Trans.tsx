import { useMemo } from 'react'

import { TransProps } from '.'
import useTranslation from './useTranslation'
import formatElements from './formatElements'

/**
 * Translate transforming:
 * <0>This is an <1>example</1><0>
 * to -> <h1>This is an <b>example</b><h1>
 */
export default function Trans({
  i18nKey,
  values,
  components,
  fallback,
  defaultTrans,
  ns,
  returnObjects,
}: TransProps): any {
  const { t, lang } = useTranslation(ns)

  /**
   * Memoize the transformation
   */
  const result = useMemo(() => {
    const text = t<string>(i18nKey, values, {
      fallback,
      default: defaultTrans,
      returnObjects,
    })

    if (!text) return text

    if (!components || components.length === 0)
      return Array.isArray(text) ? text.map((item) => item) : text

    if (Array.isArray(text))
      return text.map((item) => formatElements(item, components))

    return formatElements(text, components)
  }, [i18nKey, values, components, lang]) as string

  return result
}
