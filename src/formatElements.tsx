import {
  MessageFormat,
  type MessagePart,
  type MessageLiteralPart,
  type MessageMarkupPart,
} from 'messageformat'
import React, { cloneElement, Fragment, ReactElement, ReactNode } from 'react'

export const tagParsingRegex = /<(\w+) *>(.*?)<\/\1 *>|<(\w+) *\/>/

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

export default function formatElements(
  value: string,
  elements: ReactElement[] | Record<string, ReactElement> = []
): string | ReactNode[] {
  const message = value
    .replace(/<(\d+\/?)>/g, '{#_$1}')
    .replace(/<\/(\d+)>/g, '{/_$1}')
    .replace(/<(\w+\/?)>/g, '{#$1}') // open/standalone
    .replace(/<(\/\w+)>/g, '{$1}') // close
  const mf = new MessageFormat(undefined, message)
  const list = mf.formatToParts()
  const processed = ProcessPartsList(list)
  const contents = HetListToDOMTree(processed, elements)
  return contents
}

type PartsList = Array<MessagePart | Markup>

class Markup {
  #markup: boolean
  name: string
  child: PartsList

  constructor(name: string, child: PartsList) {
    this.#markup = true
    this.name = name
    this.child = child
  }

  static isMarkup(obj: object): boolean {
    return #markup in obj
  }
}

function ProcessPartsList(parts: MessagePart[]): PartsList {
  // Make a copy of `parts` so we can modify it
  const toDo = [...parts]

  // ProcessNodes() processes a flat list of message parts
  // into a tree structure.
  // (Currently only handles one level of nesting.)
  // `accum` is the list of already-processed subtrees.
  // The individual elements in the list are all `MessageParts`,
  // but the lists in the returned value may be nested arbitrarily.
  function ProcessNodes(accum: PartsList): PartsList {
    if (toDo.length === 0) {
      return accum
    }
    // Markup node: should be an `open` node if the output of formatToParts()
    // is valid.
    if (toDo[0].type === 'markup') {
      const markupNode = toDo[0] as MessageMarkupPart
      if (markupNode.kind === 'open') {
        const openNode = toDo.shift() as MessageMarkupPart
        // Recursively process everything between the open and close nodes
        const tree = ProcessNodes([])
        const closeNode = toDo.shift() as MessageMarkupPart
        if (closeNode.kind !== 'close') {
          console.log('Warning: unmatched tags!')
        }
        // Append a new subtree representing the tree denoted by this markup open/close pair
        // TODO: To handle arbitrary nesting, we really want `tree` and not `...tree`
        const subtree = new Markup(openNode.name, tree)
        return ProcessNodes(accum.toSpliced(accum.length, 0, subtree))
      }
      // When we see a close tag, we just return the accumulator
      if (markupNode.kind === 'close') {
        return accum
      }
    }
    // Default case (not markup): append onto the existing list
    return ProcessNodes(accum.toSpliced(accum.length, 0, toDo.shift()!))
  }
  return ProcessNodes([])
}

function handleMarkupName(name: string): string {
  if (name.charAt(0) === '_') return name.substring(1)
  return name
}

// hetList is really a list of arbitrarily-nested lists where all the
// leaf elements are MessageParts
function HetListToDOMTree(
  hetList: PartsList,
  components: Record<string, ReactElement> | Array<ReactElement>
): ReactElement[] {
  return hetList.flatMap((part) => {
    // part is either a (nested) list of MessageParts, or a single MessagePart
    if (Markup.isMarkup(part)) {
      // `subtree` is all the nodes between the open and the close
      const markup = part as Markup
      const subtree = HetListToDOMTree(markup.child, components)
      // Use the name of the open node to look up the component in the map
      // (we assume open.name === close.name)
      // TODO: this means overlapping tags don't work
      const component = components[handleMarkupName(markup.name)] //assert
      // Finally, wrap the sublist in a component of the kind
      // that matches its markup's name
      return component
        ? React.cloneElement(component, undefined, ...subtree)
        : subtree
    }
    if (Array.isArray(part)) {
      return HetListToDOMTree(part, components)
    }
    // If part is not an array, it must be a MessagePart
    const messagePart = part as MessagePart
    switch (messagePart.type) {
      case 'literal':
        // Literals are just strings
        return <>{(messagePart as MessageLiteralPart).value}</>
      case 'markup':
        // assert part.kind=standalone
        return React.cloneElement(
          components[(messagePart as MessageMarkupPart).name]
        )
      case 'number':
      case 'datetime': {
        return (
          <>{messagePart.parts?.reduce((acc, part) => acc + part.value, '')}</>
        )
      }
      case 'fallback': {
        return <>{`{${messagePart.source}}`}</>
      }
      default: {
        throw new Error(`unreachable: ${messagePart.type}`)
      }
    }
  })
}
