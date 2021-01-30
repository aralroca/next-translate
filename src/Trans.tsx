import React, {
  cloneElement,
  useMemo,
  Fragment,
  ReactElement,
  ReactNode,
} from 'react'
import { TransProps } from '.'
import useTranslation from './useTranslation'

const tagRe = /<(\w+)>(.*?)<\/\1>|<(\w+)\/>/
const nlRe = /(?:\r\n|\r|\n)/g

function getElements(
  parts: Array<string | undefined>
): Array<string | undefined>[] {
  if (!parts.length) return []

  const [paired, children, unpaired, after] = parts.slice(0, 4)

  return [
    [(paired || unpaired) as string, children || ('' as string), after],
  ].concat(getElements(parts.slice(4, parts.length)))
}

function formatElements(
  value: string,
  elements: ReactElement[] | Record<string, ReactElement> = []
): string | ReactNode[] {
  const parts = value.replace(nlRe, '').split(tagRe)

  if (parts.length === 1) return value

  const tree = []

  const before = parts.shift()
  if (before) tree.push(before)

  getElements(parts).forEach(([key, children, after], realIndex: number) => {
    const element =
      // @ts-ignore
      elements[key as string] || <Fragment />

    tree.push(
      cloneElement(
        element,
        { key: realIndex },

        // format children for pair tags
        // unpaired tags might have children if it's a component passed as a variable
        children ? formatElements(children, elements) : element.props.children
      )
    )

    if (after) tree.push(after)
  })

  return tree
}

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
}: TransProps): any {
  const { t } = useTranslation()

  /**
   * Memorize the transformation
   */
  const result = useMemo(() => {
    const text = t(i18nKey, values, { fallback })

    if (!components || components.length === 0) return text

    return formatElements(text, components)
  }, [i18nKey, values, components]) as string

  return result
}
