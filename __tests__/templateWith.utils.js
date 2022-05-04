import prettier from 'prettier'

export function clean(code) {
  return prettier.format(code, { parser: 'typescript' })
}
