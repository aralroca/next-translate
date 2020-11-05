export default function templateWithLoader(
  rawCode,
  { page, typescript, loader, hasLoader } = {}
) {
  const configFile = process.cwd() + '/i18n'
  const locales = process.cwd() + '/locales/${l}/${n}'
  let modifiedCode = rawCode

  if (hasLoader) {
    modifiedCode = modifiedCode
      // Replacing:
      //    const getStaticProps = () => console.log('getStaticProps')
      //    import getStaticProps from './getStaticProps'
      // To:
      //    const _getStaticProps = () => console.log('getStaticProps')
      //    import _getStaticProps from './getStaticProps'
      .replace(
        new RegExp(
          `(const|var|let|async +function|function|import|import {.* as) +${loader}\\W`
        ),
        (v) =>
          v.replace(new RegExp(`\\W${loader}\\W`), (r) =>
            r.replace(loader, '_' + loader)
          )
      )
      // Replacing:
      //    export const _getStaticProps = () => ({ props: {} })
      // To:
      //    const _getStaticProps = () => ({ props: {} })
      .replace(
        new RegExp(
          `export +(const|var|let|async +function|function) +_${loader}`
        ),
        (v) => v.replace('export', '')
      )
      // Replacing: "export { getStaticProps }" to ""
      .replace(/export +\{ *(getStaticProps|getServerSideProps)( |,)*\}/, '')
      // Replacing:
      //    export { something, getStaticProps, somethingelse }
      // To
      //    export { something, somethingelse }
      .replace(new RegExp(`export { +.*${loader}\\W`), (v) =>
        v.replace(new RegExp(`${loader},?`), '')
      )
      // Replacing:
      //    import { something, getStaticProps, somethingelse } from './getStaticProps'
      // To:
      //    import { something, getStaticProps as _getStaticProps, somethingelse } from './getStaticProps'
      .replace(/^ *import +{( |\n)*[^}]*/gm, (v) => {
        if (v.match(new RegExp(`\\W+${loader} +as `))) return v
        return v.replace(new RegExp(`\\W+${loader}(\\W|$)`), (r) =>
          r.replace(loader, `${loader} as _${loader}`)
        )
      })
  }

  let template = `
    import __i18nConfig from '${configFile}'
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
              defaultLoader: (l, n) => import(\`${locales}\`)
                .then(m => m.default)
            }))
          }
        }
    }
  `

  if (typescript) template = template.replace(/\n/g, '\n// @ts-ignore\n')

  return template.replace('###__CURRENT_CODE_HERE__###', `\n${modifiedCode}\n`)
}
