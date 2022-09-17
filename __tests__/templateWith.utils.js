import prettier from 'prettier'

const specialPatternsOfReplaceMethod = ["$'", '$$', '$&', '$`']

// take each pattern and create a string including the reversed version
// i.e. $' => '$SomeString$'
const specialPatternsCases = specialPatternsOfReplaceMethod.map(
  (pattern) => `${pattern.split('').reverse().join('')}SomeString${pattern}`
)
const nestedQuotesCases = [`".cssClass{content:' ';"`, `'Hello "world"'`]

export const specialStringsRenderer = specialPatternsCases
  .concat(nestedQuotesCases)
  .join('\n')

export function clean(code) {
  return prettier.format(code, { parser: 'typescript' })
}
