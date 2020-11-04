import { getNormalExportRegex } from './hasExportName'

export default function templateWithLoader(
  rawCode,
  { page, typescript, loader, hasLoader } = {}
) {
  let modifiedCode = rawCode

  if (hasLoader) {
    modifiedCode = modifiedCode.replace(getNormalExportRegex(loader), (v) =>
      v.replace('export', 'const _getStaticProps = ')
    )
  }

  let template = `
    import __i18nConfig from '${process.cwd() + '/i18n'}'
    import __loadNamespaces from 'next-translate/loadNamespaces'
    ###__CURRENT_CODE_HERE__###
    export async function ${loader}(ctx) {
        ${hasLoader ? `let res = _${loader}(ctx)` : ''}
        ${hasLoader ? `if(typeof res.then === 'function') res = await res` : ''}
        return {
          ${hasLoader ? '...res,' : ''}
          props: {
            ${hasLoader ? '...(res.props || {}),' : ''}
            ...(await __loadNamespaces({
              ...ctx,
              pathname: '${page}',
              ...__i18nConfig,
              defaultLoader: (l, n) => import(\`${
                process.cwd() + '/locales/${l}/${n}'
              }\`)
                .then(m => m.default)
            }))
          }
        }
    }
  `

  if (typescript) template = template.replace(/\n/g, '\n// @ts-ignore\n')

  return template.replace('###__CURRENT_CODE_HERE__###', `\n${modifiedCode}\n`)
}
