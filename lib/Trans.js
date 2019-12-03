import useTranslation from './useTranslation'

const closeTagsRegex = new RegExp('<\\/\\d*>', 'gm')
const digitRegex = new RegExp('\\d*', 'gm')

function textToChildren(key, text, components){
  const children = components.map((_, i) => (
    text.match(`<${i}>(.*)</${i}>`)[1] 
  ))

  const tags = children.map(child => 
    (child.match(closeTagsRegex) || []).map(
      tag => parseInt(tag.match(digitRegex).join(''), 0)
  ))

  const formattedChildren = children.map((txt, i) => {
    const childTags = tags[i]

    // Return the text if doesn't have children
    if(!childTags || childTags.length === 0) return txt

    const regex = new RegExp(
      childTags.map(n => `<${n}>.*<\/${n}>`).join('|'), 'gm'
    )

    return txt.match(regex) 
  })
  
  console.log({ tags, children, formattedChildren })
  return formattedChildren
}

/**
 * <0>This is an <1>example</1><0>
 * -> <h1>This is an <b>example</b><h1>
 */
export default function Trans({ i18nKey, values, components = [] }){
  const { t } = useTranslation()
  const text = t(i18nKey, values)

  if(!components || components.length === 0) return text

  // const tags = text.match(tagsRegex)

  // return tags.map(tag => {
  //   const isCloseTag = tag.startsWith('</')
  //   const digit = tag.match(digitRegex).join('')
  //   const index = parseInt(digit, 10)

  //   console.log(digit, index)
  //   return isCloseTag
  // })
  // console.log(textToChildren(i18nKey, text, components))

  return textToChildren(i18nKey, text, components)
}
