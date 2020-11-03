import templateWithLoader from '../src/_utils/templateWithLoader'

const clean = (t) => t.replace(/( |\n|\t|\u00A0)/g, '')

const tests = [
  {
    describe: 'exporting getStaticProps is a function',
    code: `
      export default function Page() {
        return <div>Hello world</div>
      }

      export function getStaticProps(){
        return { {props: {}} }
      }
  `,
    cases: [
      {
        i18nFile: '/i18n.js',
        page: '/index',
        typescript: false,
        loader: 'getStaticProps',
        hasLoader: true,
        prefix: '..',
        expected: `
        import __i18nConfig from '../i18n.js'
        import getPageNamespaces from 'next-translate/_utils/getPageNamespaces'

        export default function Page() {
          return <div>Hello world</div>
        }
  
        const _getStaticProps = function getStaticProps(){
          return { {props: {}} }
        }

        export async function getStaticProps(ctx) {
           const __lang = ctx.locale
           let res = _getStaticProps(ctx)
           if(typeof res.then === 'function') res = await res

           const defaultLoader = (l, n) => import(\`../locales/\${l}/\${n}.json\`).then(m => m.default)
           const loader = __i18nConfig.loadLocaleFrom || defaultLoader
           const namespaces = await getPageNamespaces(__i18nConfig, '/', ctx)
           const pns = await Promise.all(namespaces.map(ns => loader(__lang, ns)))
           const __namespaces = namespaces.reduce((obj, ns, i) => { obj[ns] = pns[i]; return obj }, {})

           return { 
              ...res, 
              props: {
                ...(res.props || {}),
                __namespaces,
                __lang,
              }
            }
        }
    `,
      },
    ],
  },
  {
    describe: 'without loader (getStaticProps as default)',
    code: `
      export default function Page() {
        return <div>Hello world</div>
      }
  `,
    cases: [
      {
        i18nFile: '/i18n.json',
        page: '/index',
        typescript: false,
        loader: 'getStaticProps',
        hasLoader: false,
        prefix: '..',
        expected: `
        import __i18nConfig from '../i18n.json'
        import getPageNamespaces from 'next-translate/_utils/getPageNamespaces'

        export default function Page() {
          return <div>Hello world</div>
        }

        export async function getStaticProps(ctx) {
           const __lang = ctx.locale

           const defaultLoader = (l, n) => import(\`../locales/\${l}/\${n}.json\`).then(m => m.default)
           const loader = __i18nConfig.loadLocaleFrom || defaultLoader
           const namespaces = await getPageNamespaces(__i18nConfig, '/', ctx)
           const pns = await Promise.all(namespaces.map(ns => loader(__lang, ns)))
           const __namespaces = namespaces.reduce((obj, ns, i) => { obj[ns] = pns[i]; return obj }, {})

           return { 
              props: {
                __namespaces,
                __lang,
              }
            }
        }
    `,
      },
    ],
  },
]

describe('templateWithLoader', () => {
  tests.forEach((d) => {
    describe(d.describe, () => {
      d.cases.forEach(({ expected, debug, ...options }) => {
        const fn = debug ? test.only : test
        const testname = Object.entries(options).map(([k, v]) => `${k}: ${v}`)
        fn(testname.join(' | '), () => {
          expect(clean(templateWithLoader(d.code, options))).toEqual(
            clean(expected)
          )
        })
      })
    })
  })
})
