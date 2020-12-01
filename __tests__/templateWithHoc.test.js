import templateWithHoc from '../src/plugin/templateWithHoc'
import prettier from 'prettier'

function clean(code) {
  return prettier.format(code, { parser: 'typescript' })
}

const tests = [
  {
    describe: 'exporting a variable and with an existing HoC',
    code: `
    import withWrapper from 'somewhere'

    function Page() {
      return <div>Hello world</div>
    }

    const anothervariable = withWrapper(Page);
    const somevariable = anothervariable;
    
    export default somevariable
  `,
    cases: [{ skipInitialProps: false }, { skipInitialProps: true }],
  },
  {
    describe: 'exporting a class with a getInitialProps static outside',
    code: `
    import React from 'react';

    export default class Page extends React.Component {
      render() {
        return <div>Hello world</div>
      }
    }

    Page.getInitialProps = () => ({})
  `,
    cases: [{ skipInitialProps: false }, { skipInitialProps: true }],
  },
  {
    describe:
      'exporting a class with a getInitialProps static outside + one commented before',
    code: `
    import React from 'react';
    
    /*
    export default class FakePage extends React.Component {
      render() {
        return <div>Hello world</div>
      }
    } */

    export default class Page extends React.Component {
      render() {
        return <div>Hello world</div>
      }
    }

    // FakePage.getInitialProps = () => ({})
    /* 
      Page.getInitialProps = () => ({})
    */
    Page.getInitialProps = () => ({})
  `,
    cases: [{ skipInitialProps: false }, { skipInitialProps: true }],
  },
  {
    describe: 'exporting a class with a getInitialProps static',
    code: `
    import React from 'react';

    export default class Page extends React.Component {
      static getInitialProps() {
        return {}
      }

      render() {
        return <div>Hello world</div>
      }
    }
  `,
    cases: [{ skipInitialProps: false }, { skipInitialProps: true }],
  },
  {
    describe:
      'exporting a class with a getInitialProps static | exporting apart',
    code: `
    import React from 'react';

    class Page extends React.Component {
      static getInitialProps() {
        return {}
      }

      render() {
        return <div>Hello world</div>
      }
    }

    export default Page
  `,
    cases: [{ skipInitialProps: false }, { skipInitialProps: true }],
  },
  {
    describe: 'exporting a arrow function with Hoc',
    code: `
    import someHoc from 'whatever'

    export default someHoc(() => {
      return <div>Hello world</div>
    })
  `,
    cases: [{ skipInitialProps: false }, { skipInitialProps: true }],
  },
  {
    describe: 'exporting a arrow function with getInitialProps',
    code: `
    const Page = () => <div>Hello world</div>

    Page.getInitialProps = () => ({})

    export default Page
  `,
    cases: [{ skipInitialProps: false }, { skipInitialProps: true }],
  },
  {
    describe: 'page without "export default" should skip any transformation',
    code: `
    const Page = () => <div>Hello world</div>

    Page.getInitialProps = () => ({})

    export default Page
  `,
    cases: [{ skipInitialProps: false }, { skipInitialProps: true }],
  },
  {
    describe:
      'page with multiple commented "export default" + the correct one should do it right',
    code: `
    const Page = () => <div>Hello world</div>

    Page.getInitialProps = () => ({})

    // export default Page
    /*
      export default Page
    */
    export default Page
  `,
    cases: [{ skipInitialProps: false }, { skipInitialProps: true }],
  },
]

describe('templateWithHoc', () => {
  tests.forEach((d) => {
    describe(d.describe, () => {
      d.cases.forEach(({ expected, debug, ...options }) => {
        const fn = debug ? test.only : test
        const testname = Object.entries(options).map(([k, v]) => `${k}: ${v}`)
        fn(testname.join(' | '), () => {
          expect(clean(templateWithHoc(d.code, options))).toMatchSnapshot()
        })
      })
    })
  })
})
