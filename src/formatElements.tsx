import React, { cloneElement, Fragment, ReactElement, ReactNode } from 'react'

export const tagParsingRegex =
  /<(\w+)((?: +[^>]*?)?)>(.*?)<\/\1 *>|<(\w+)((?: +[^>]*?)?)\/>/

const nlRe = /(?:\r\n|\r|\n)/g

function getElements(
  parts: Array<string | undefined>
): Array<string | undefined>[] {
  if (!parts.length) return []

  const [paired, attrs, children, unpaired, unpairedAttrs, after] = parts.slice(
    0,
    6
  )

  return [
    [
      (paired || unpaired) as string,
      (attrs || unpairedAttrs) as string,
      children || ('' as string),
      after,
    ],
  ].concat(getElements(parts.slice(6, parts.length)))
}

export default function formatElements(
  value: string,
  elements: ReactElement[] | Record<string, ReactElement> = []
): string | ReactNode[] {
  const parts = value.replace(nlRe, '').split(tagParsingRegex)

  if (parts.length === 1) return value

  const tree = []

  const before = parts.shift()
  if (before) tree.push(before)

  getElements(parts).forEach(
    ([key, attrs, children, after], realIndex: number) => {
      const element =
        // @ts-ignore
        elements[key as string] || <Fragment />

      const props: any = { key: realIndex }

      if (attrs) {
        const hrefMatch = attrs.match(/href=(['"])(.*?)\1/)
        if (hrefMatch?.[2]) props.href = hrefMatch[2]
      }

      tree.push(
        cloneElement(
          element,
          props,

          // format children for pair tags
          // unpaired tags might have children if it's a component passed as a variable
          children ? formatElements(children, elements) : element.props.children
        )
      )

      if (after) tree.push(after)
    }
  )

  return tree
}
