import { getNormalExportRegex } from './hasExportName'

function templateWithLoader(
  rawCode,
  { i18nFile, page, typescript, prefix, loader, hasLoader } = {}
) {
  const configPath = `${prefix}${i18nFile}`
  const defaultLoadLocaleFrom = `${prefix}/locales/\${l}/\${n}.json`
  let modifiedCode = rawCode

  const pathname = page.replace(/\/index$/, '') || '/'

  if (hasLoader) {
    modifiedCode = modifiedCode.replace(getNormalExportRegex(loader), (v) =>
      v.replace('export', 'const _getStaticProps = ')
    )
  }

  let template = `
    import __i18nConfig from '${configPath}'
    import getPageNamespaces from 'next-translate/_utils/getPageNamespaces'
    
    ###__CURRENT_CODE_HERE__###

    export async function ${loader}(ctx) {
        const __lang = ctx.locale
        ${hasLoader ? `let res = _${loader}(ctx)` : ''}
        ${hasLoader ? `if(typeof res.then === 'function') res = await res` : ''}
        const defaultLoader = (l, n) => import(\`${defaultLoadLocaleFrom}\`).then(m => m.default)
        const loader = __i18nConfig.loadLocaleFrom || defaultLoader
        const namespaces = await getPageNamespaces(__i18nConfig, '${pathname}', ctx)
        const pns = await Promise.all(namespaces.map(ns => loader(__lang, ns)))
        const __namespaces = namespaces.reduce((obj, ns, i) => { obj[ns] = pns[i]; return obj }, {})
        return {
          ${hasLoader ? '...res,' : ''}
          props: {
            ${hasLoader ? '...(res.props || {}),' : ''}
            __namespaces,
            __lang,
          }
        }
    }
  `

  if (typescript) template = template.replace(/\n/g, '\n// @ts-ignore\n')

  return template.replace('###__CURRENT_CODE_HERE__###', modifiedCode)
}

export default templateWithLoader
