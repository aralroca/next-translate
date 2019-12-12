import { cloneElement, useMemo, Fragment } from 'react'
import useTranslation from './useTranslation'

const tagRe = /<(\d+)>(.*?)<\/\1>|<(\d+)\/>/
const nlRe = /(?:\r\n|\r|\n)/g

function getElements(parts) {
  if (!parts.length) return []

  const [paired, children, unpaired, after] = parts.slice(0, 4)

  return [[parseInt(paired || unpaired), children || "", after]].concat(
    getElements(parts.slice(4, parts.length))
  )
}

function formatElements(
  value,
  elements = []
) {
  const parts = value.replace(nlRe, "").split(tagRe)

  if (parts.length === 1) return value

  const tree = []

  const before = parts.shift()
  if (before) tree.push(before)

  for (const [index, children, after] of getElements(parts)) {
    const element = elements[index] || <Fragment />

    tree.push(
      cloneElement(
        element,
        { key: index },

        // format children for pair tags
        // unpaired tags might have children if it's a component passed as a variable
        children ? formatElements(children, elements) : element.props.children
      )
    )

    if (after) tree.push(after)
  }

  return tree
}

/**
 * Translate transforming:
 * <0>This is an <1>example</1><0>
 * to -> <h1>This is an <b>example</b><h1>
 */
export default function Trans({ i18nKey, values, components }){
  const { t } = useTranslation()

  /**
   * Memorize the transformation
   */
  const result = useMemo(() => {
    const text = t(i18nKey, values)

    if(!components || components.length === 0) return text

    return formatElements(text, components)
  }, [i18nKey, values, components])

  return result
}
