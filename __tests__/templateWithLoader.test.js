import templateWithLoader from '../src/plugin/templateWithLoader'
import { specialStringsRenderer } from './templateWith.utils'
import prettier from 'prettier'

function clean(code) {
  return prettier.format(code, { parser: 'typescript' })
}

const tests = [
  {
    describe: 'exporting as a function - with loader',
    code: `
      export default function Page() {
        return <div>Hello world</div>
      }

      export function getStaticPaths() {
        return {}
      }

      export function getStaticProps(){
        return { props: {} }
      }
  `,
    cases: [
      {
        page: '/index',
        loader: 'getStaticProps',
        hasLoader: true,
      },
    ],
  },
  {
    describe: 'exporting as a function - without loader',
    code: `
      export default function Page() {
        return <div>Hello world</div>
      }
  `,
    cases: [
      {
        page: '/index',
        loader: 'getStaticProps',
        hasLoader: false,
      },
      {
        page: '/blog/[post]/[...catchall]',
        loader: 'getServerSideProps',
        hasLoader: false,
      },
    ],
  },
  {
    describe: 'exporting as a arrow function - without loader',
    code: `export default () => <div>Hello world</div>`,
    cases: [
      {
        page: '/index',
        loader: 'getStaticProps',
        hasLoader: false,
      },
      {
        page: '/blog/[post]/[...catchall]',
        loader: 'getServerSideProps',
        hasLoader: false,
      },
    ],
  },
  {
    describe: 'exporting as a function in diferent line - with loader',
    code: `
      function Page() {
        return <div>Hello world</div>
      }

      function getServerSideProps() {
        return { props: {} }
      }

      export { getServerSideProps }
      export default Page
  `,
    cases: [
      {
        page: '/index',
        loader: 'getServerSideProps',
        hasLoader: true,
      },
    ],
  },
  {
    describe: 'exporting as a function in diferent line - without loader',
    code: `
      function Page() {
        return <div>Hello world</div>
      }

      export default Page
  `,
    cases: [
      {
        page: '/index',
        loader: 'getStaticProps',
        hasLoader: false,
      },
      {
        page: '/blog/[post]/[...catchall]',
        loader: 'getServerSideProps',
        hasLoader: false,
      },
    ],
  },
  {
    describe: 'exporting as a class - with loader',
    code: `
      import React from 'react'

      export default class Page extends React.Component {
        render() {
          return <div>Hello world</div>
        }
      }

      export function getStaticProps(){
        return { props: {} }
      }
  `,
    cases: [
      {
        page: '/index',
        loader: 'getStaticProps',
        hasLoader: true,
      },
    ],
  },
  {
    describe: 'exporting as a class in a diferent line - without loader',
    code: `
      import React from 'react'

      class Page extends React.Component {
        render() {
          return <div>Hello world</div>
        }
      }

      const myPage = Page

      export default myPage
  `,
    cases: [
      {
        page: '/index',
        loader: 'getStaticProps',
        hasLoader: false,
      },
      {
        page: '/blog/[post]/[...catchall]',
        loader: 'getServerSideProps',
        hasLoader: false,
      },
    ],
  },
  {
    describe: 'loader as a arrow function',
    code: `
      export default function Page() {
        return <div>Hello world</div>
      }

      const getStaticProps = () => ({ props: {} })
      export { getStaticProps }
  `,
    cases: [
      {
        page: '/index',
        loader: 'getStaticProps',
        hasLoader: true,
      },
    ],
  },
  {
    describe: 'loader as a wrapper',
    code: `
      export default function Page() {
        return <div>Hello world</div>
      }

      const getStaticProps = wrapper.getStaticProps(() => ({ props: {} }))
      export { getStaticProps }
  `,
    cases: [
      {
        page: '/index',
        loader: 'getStaticProps',
        hasLoader: true,
      },
    ],
  },
  {
    describe: 'loader imported to another place',
    code: `
      import getStaticProps from 'somewhere/getStaticProps'
      import getStaticPaths from 'somewhere/getStaticPaths'

      const config = {}

      export default function Page() {
        return <div>Hello world</div>
      }

      export { config, getStaticProps, getStaticPaths }
  `,
    cases: [
      {
        page: '/index',
        loader: 'getStaticProps',
        hasLoader: true,
      },
    ],
  },
  {
    describe: 'loader with named import to another place',
    code: `
      import { getStaticProps } from 'somewhere/getStaticProps'
      import { getStaticPaths } from 'somewhere/getStaticPaths'

      const config = {}

      export default function Page() {
        return <div>Hello world</div>
      }

      export { config, getStaticProps, getStaticPaths }
  `,
    cases: [
      {
        page: '/index',
        loader: 'getStaticProps',
        hasLoader: true,
      },
    ],
  },
  {
    describe: 'loader with one named import to another place',
    code: `
      import { getStaticPaths, getStaticProps, config } from 'somewhere/getStaticProps'

      export default function Page() {
        const test = 'getStaticProps'
        console.log('This should log getStaticProps without any modification')
        return <div>Hello getStaticProps</div>
      }

      export { config, getStaticProps, getStaticPaths }
  `,
    cases: [
      {
        page: '/index',
        loader: 'getStaticProps',
        hasLoader: true,
      },
    ],
  },
  {
    describe: 'loader with named import to another place + rename',
    code: `
      import { getStaticPropsA as getStaticProps } from 'somewhere/getStaticProps'
      import { getStaticProps as getStaticPaths } from 'somewhere/getStaticPaths'

      const config = {}

      export default function Page() {
        return <div>Hello world</div>
      }

      export { config, getStaticProps, getStaticPaths }
  `,
    cases: [
      {
        page: '/index',
        loader: 'getStaticProps',
        hasLoader: true,
      },
    ],
  },
  {
    describe: 'should add the "as" on the import only when is necessary',
    code: `import { getStaticProps } from "somewhere/getStaticProps";
    import {getStaticProps} from "somewhere/getStaticProps";
    
    import { getStaticPropsA, getStaticProps, getStaticPropsB } from "somewhere/getStaticProps";
    import { getStaticProps as getStaticPaths } from 'somewhere/getStaticPaths'
    import { fake_getStaticProps } from 'somewhere/getStaticPaths'
    
    import { 
      getStaticPropsA, 
      getStaticProps, 
      getStaticPropsB
    } from "somewhere/getStaticProps";
    
    import {
      getStaticPropsA, 
      getStaticProps, 
      getStaticPropsB
    } from "somewhere/getStaticProps";
    let getStaticProps = false
    // Comment to import getStaticProps
    const a = 'import { getStaticProps }'`,
    cases: [
      {
        page: '/index',
        loader: 'getStaticProps',
        hasLoader: true,
      },
    ],
  },
  {
    describe: 'should remove exports of existings loaders with "as"',
    code: `export { test as    getStaticProps }
    export {
      test as getStaticProps,
      anotherThing
    }
    
    export {something,getStaticPropsA as getStaticProps}
    export {something,AgetStaticProps as getStaticProps}
    export {something,AgetStaticProps as getStaticProps, getStaticPropsB}`,
    cases: [
      {
        page: '/index',
        loader: 'getStaticProps',
        hasLoader: true,
      },
    ],
  },
  {
    describe: 'should add "revalidate: 55" prop into getStaticProps',
    code: `function Page() {
      return <div>Hello world</div>
    }

    export default Page`,
    cases: [
      {
        page: '/index',
        loader: 'getStaticProps',
        hasLoader: true,
        revalidate: 55,
      },
    ],
  },
  {
    describe:
      'should not add "revalidate" prop into getStaticProps because revalidate = 0',
    code: `function Page() {
      return <div>Hello world</div>
    }

    export default Page`,
    cases: [
      {
        page: '/index',
        loader: 'getStaticProps',
        hasLoader: true,
        revalidate: 0,
      },
    ],
  },
  {
    describe:
      'should not add "revalidate" prop into getStaticProps because revalidate < 0',
    code: `function Page() {
      return <div>Hello world</div>
    }

    export default Page`,
    cases: [
      {
        page: '/index',
        loader: 'getStaticProps',
        hasLoader: true,
        revalidate: -1,
      },
    ],
  },
  {
    describe:
      'should allow developers to override revalidate prop per page, by having the "default" revalidate defined before "...res"',
    code: `export default function Page() {
      return <div>Hello world</div>
    }
    
    export function getStaticProps(){
      return { revalidate:10, props: { prop1: 'hello' } }
    }
    `,
    cases: [
      {
        page: '/index',
        loader: 'getStaticProps',
        hasLoader: true,
        revalidate: 88,
      },
    ],
  },
  {
    describe:
      'should use the revalidate value already present on getStaticProps arrow function',
    code: `
    import { GetStaticProps } from 'next'

    export default function Page() {
      return <div>Hello world</div>
    }
    
    export const getStaticProps: GetStaticProps = () => {
      return { revalidate:10, props: { prop1: 'hello' } }
    }
    `,
    cases: [
      {
        page: '/index',
        loader: 'getStaticProps',
        hasLoader: true,
        revalidate: 77,
      },
    ],
  },
  {
    describe: 'should work with duplicated loader but one in a comment',
    code: `
    import { GetStaticProps } from 'next'

    export default function Page() {
      return <div>Hello world</div>
    }

    // export const getStaticProps: GetStaticProps = () => {
    //  return { revalidate:10, props: { prop1: 'hello' } }
    // }
    
    export const getStaticProps: GetStaticProps = () => {
      return { revalidate:10, props: { prop1: 'hello' } }
    }
    `,
    cases: [
      {
        page: '/index',
        loader: 'getStaticProps',
        hasLoader: true,
        revalidate: 77,
      },
    ],
  },
].map((t) => {
  t.code = specialStringsRenderer + '\n' + t.code
  return t
})

describe('templateWithLoader', () => {
  tests.forEach((d) => {
    describe(d.describe, () => {
      d.cases.forEach(({ expected, debug, ...options }) => {
        const fn = debug ? test.only : test
        const testname = Object.entries(options).map(([k, v]) => `${k}: ${v}`)
        fn(testname.join(' | '), () => {
          expect(clean(templateWithLoader(d.code, options))).toMatchSnapshot()
        })
      })
    })
  })
})
