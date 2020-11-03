import templateWithHoc from '../src/_utils/templateWithHoc'

const clean = (t) => t.replace(/( |\n)/g, '')

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
    cases: [
      {
        i18nFile: '/i18n.js',
        arePagesInsideSrc: false,
        skipInitialProps: false,
        prefix: undefined,
        expected: `
      import __i18nConfig from '../i18n.js'
      import __appWithI18n from 'next-translate/appWithI18n'
      import withWrapper from 'somewhere'

      function Page() {
        return <div>Hello world</div>
      }
        
      const anothervariable = withWrapper(Page);
      const somevariable = anothervariable;
      const __Page_Next_Translate__ = somevariable

      export default __appWithI18n(__Page_Next_Translate__, {
        loadLocaleFrom: (l, n) => import(\`../locales/\${l}/\${n}.json\`).then(m => m.default),
        ...__i18nConfig,
        isLoader: true,
        skipInitialProps: false,
      });
    `,
      },
      {
        i18nFile: '/i18n.json',
        arePagesInsideSrc: false,
        skipInitialProps: false,
        prefix: undefined,
        expected: `
      import __i18nConfig from '../i18n.json'
      import __appWithI18n from 'next-translate/appWithI18n'
      import withWrapper from 'somewhere'

      function Page() {
        return <div>Hello world</div>
      }
        
      const anothervariable = withWrapper(Page);
      const somevariable = anothervariable;
      const __Page_Next_Translate__ = somevariable

      export default __appWithI18n(__Page_Next_Translate__, {
        loadLocaleFrom: (l, n) => import(\`../locales/\${l}/\${n}.json\`).then(m => m.default),
        ...__i18nConfig,
        isLoader: true,
        skipInitialProps: false,
      });
    `,
      },
      {
        i18nFile: '/i18n.js',
        arePagesInsideSrc: true,
        skipInitialProps: false,
        prefix: undefined,
        expected: `
      import __i18nConfig from '../../i18n.js'
      import __appWithI18n from 'next-translate/appWithI18n'
      import withWrapper from 'somewhere'

      function Page() {
        return <div>Hello world</div>
      }
        
      const anothervariable = withWrapper(Page);
      const somevariable = anothervariable;
      const __Page_Next_Translate__ = somevariable

      export default __appWithI18n(__Page_Next_Translate__, {
        loadLocaleFrom: (l, n) => import(\`../../locales/\${l}/\${n}.json\`).then(m => m.default),
        ...__i18nConfig,
        isLoader: true,
        skipInitialProps: false,
      });
    `,
      },
      {
        i18nFile: '/i18n.json',
        arePagesInsideSrc: true,
        skipInitialProps: true,
        prefix: undefined,
        expected: `
      import __i18nConfig from '../../i18n.json'
      import __appWithI18n from 'next-translate/appWithI18n'
      import withWrapper from 'somewhere'

      function Page() {
        return <div>Hello world</div>
      }
        
      const anothervariable = withWrapper(Page);
      const somevariable = anothervariable;
      const __Page_Next_Translate__ = somevariable

      export default __appWithI18n(__Page_Next_Translate__, {
        loadLocaleFrom: (l, n) => import(\`../../locales/\${l}/\${n}.json\`).then(m => m.default),
        ...__i18nConfig,
        isLoader: true,
        skipInitialProps: true,
      });
    `,
      },
      {
        i18nFile: '/i18n.json',
        arePagesInsideSrc: true,
        skipInitialProps: true,
        prefix: '../../../../..',
        expected: `
      import __i18nConfig from '../../../../../i18n.json'
      import __appWithI18n from 'next-translate/appWithI18n'
      import withWrapper from 'somewhere'

      function Page() {
        return <div>Hello world</div>
      }
        
      const anothervariable = withWrapper(Page);
      const somevariable = anothervariable;
      const __Page_Next_Translate__ = somevariable

      export default __appWithI18n(__Page_Next_Translate__, {
        loadLocaleFrom: (l, n) => import(\`../../../../../locales/\${l}/\${n}.json\`).then(m => m.default),
        ...__i18nConfig,
        isLoader: true,
        skipInitialProps: true,
      });
    `,
      },
    ],
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
    cases: [
      {
        i18nFile: '/i18n.js',
        arePagesInsideSrc: false,
        skipInitialProps: false,
        prefix: undefined,
        expected: `
      import __i18nConfig from '../i18n.js'
      import __appWithI18n from 'next-translate/appWithI18n'
      import React from 'react';

      const __Page_Next_Translate__ = class Page extends React.Component {
        render() {
          return <div>Hello world</div>
        }
      }

      __Page_Next_Translate__.getInitialProps = () => ({})

      export default __appWithI18n(__Page_Next_Translate__, {
        loadLocaleFrom: (l, n) => import(\`../locales/\${l}/\${n}.json\`).then(m => m.default),
        ...__i18nConfig,
        isLoader: true,
        skipInitialProps: false,
      });
    `,
      },
    ],
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
    cases: [
      {
        i18nFile: '/i18n.js',
        arePagesInsideSrc: false,
        skipInitialProps: false,
        prefix: undefined,
        expected: `
    import __i18nConfig from '../i18n.js'
    import __appWithI18n from 'next-translate/appWithI18n'
    import React from 'react';
    
    /*
    const __Page_Next_Translate__ = class FakePage extends React.Component {
      render() {
        return <div>Hello world</div>
      }
    } */

    const __Page_Next_Translate__ = class Page extends React.Component {
      render() {
        return <div>Hello world</div>
      }
    }

    // FakePage.getInitialProps = () => ({})

    /*
      __Page_Next_Translate__.getInitialProps = () => ({})
    */

    __Page_Next_Translate__.getInitialProps = () => ({})
    export default __appWithI18n(__Page_Next_Translate__, {
      loadLocaleFrom: (l, n) => import(\`../locales/\${l}/\${n}.json\`).then(m => m.default),
      ...__i18nConfig,
      isLoader: true,
      skipInitialProps: false,
    });
    `,
      },
    ],
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
    cases: [
      {
        i18nFile: '/i18n.js',
        arePagesInsideSrc: false,
        skipInitialProps: false,
        prefix: undefined,
        expected: `
      import __i18nConfig from '../i18n.js'
      import __appWithI18n from 'next-translate/appWithI18n'
      import React from 'react';

      const __Page_Next_Translate__ = class Page extends React.Component {
        static getInitialProps() {
          return {}
        }
        render() {
          return <div>Hello world</div>
        }
      }

      export default __appWithI18n(__Page_Next_Translate__, {
        loadLocaleFrom: (l, n) => import(\`../locales/\${l}/\${n}.json\`).then(m => m.default),
        ...__i18nConfig,
        isLoader: true,
        skipInitialProps: false,
      });
    `,
      },
    ],
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
    cases: [
      {
        i18nFile: '/i18n.js',
        arePagesInsideSrc: false,
        skipInitialProps: false,
        prefix: undefined,
        expected: `
      import __i18nConfig from '../i18n.js'
      import __appWithI18n from 'next-translate/appWithI18n'
      import React from 'react';

      class Page extends React.Component {
        static getInitialProps() {
          return {}
        }
        render() {
          return <div>Hello world</div>
        }
      }

      const __Page_Next_Translate__ = Page

      export default __appWithI18n(__Page_Next_Translate__, {
        loadLocaleFrom: (l, n) => import(\`../locales/\${l}/\${n}.json\`).then(m => m.default),
        ...__i18nConfig,
        isLoader: true,
        skipInitialProps: false,
      });
    `,
      },
    ],
  },
  {
    describe: 'exporting a arrow function with Hoc',
    code: `
    import someHoc from 'whatever'

    export default someHoc(() => {
      return <div>Hello world</div>
    })
  `,
    cases: [
      {
        i18nFile: '/i18n.js',
        arePagesInsideSrc: false,
        skipInitialProps: false,
        prefix: undefined,
        expected: `
      import __i18nConfig from '../i18n.js'
      import __appWithI18n from 'next-translate/appWithI18n'
      import someHoc from 'whatever'

      const __Page_Next_Translate__ = someHoc(() => {
        return <div>Hello world</div>
      })

      export default __appWithI18n(__Page_Next_Translate__, {
        loadLocaleFrom: (l, n) => import(\`../locales/\${l}/\${n}.json\`).then(m => m.default),
        ...__i18nConfig,
        isLoader: true,
        skipInitialProps: false,
      });
    `,
      },
    ],
  },
  {
    describe: 'exporting a arrow function with getInitialProps',
    code: `
    const Page = () => <div>Hello world</div>

    Page.getInitialProps = () => ({})

    export default Page
  `,
    cases: [
      {
        i18nFile: '/i18n.js',
        arePagesInsideSrc: false,
        skipInitialProps: false,
        prefix: undefined,
        expected: `
      import __i18nConfig from '../i18n.js'
      import __appWithI18n from 'next-translate/appWithI18n'
      
      const Page = () => <div>Hello world</div>

      Page.getInitialProps = () => ({})

      const __Page_Next_Translate__ = Page

      export default __appWithI18n(__Page_Next_Translate__, {
        loadLocaleFrom: (l, n) => import(\`../locales/\${l}/\${n}.json\`).then(m => m.default),
        ...__i18nConfig,
        isLoader: true,
        skipInitialProps: false,
      });
    `,
      },
    ],
  },
  {
    describe: 'page without "export default" should skip any transformation',
    code: `
    const Page = () => <div>Hello world</div>

    Page.getInitialProps = () => ({})
  `,
    cases: [
      {
        i18nFile: '/i18n.js',
        arePagesInsideSrc: false,
        skipInitialProps: false,
        prefix: undefined,
        expected: `
      const Page = () => <div>Hello world</div>

      Page.getInitialProps = () => ({})
    `,
      },
    ],
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
    cases: [
      {
        i18nFile: '/i18n.js',
        arePagesInsideSrc: false,
        skipInitialProps: false,
        prefix: undefined,
        expected: `
      import__i18nConfigfrom'../i18n.js'import__appWithI18nfrom'next-translate/appWithI18n'

      const Page = () => <div>Hello world</div>

      Page.getInitialProps = () => ({})

      // const __Page_Next_Translate__ = Page
      /*
        const __Page_Next_Translate__ = Page
      */
      const __Page_Next_Translate__ = Page

      export default __appWithI18n(__Page_Next_Translate__, {
        loadLocaleFrom: (l, n) => import(\`../locales/\${l}/\${n}.json\`).then(m => m.default),
        ...__i18nConfig,
        isLoader: true,
        skipInitialProps: false,
      });
    `,
      },
    ],
  },
  {
    describe: 'page with one commented "export default" skip transformation',
    code: `
    const Page = () => <div>Hello world</div>

    Page.getInitialProps = () => ({})

    // export default Page
  `,
    cases: [
      {
        i18nFile: '/i18n.js',
        arePagesInsideSrc: false,
        skipInitialProps: false,
        prefix: undefined,
        expected: `
      const Page = () => <div>Hello world</div>

      Page.getInitialProps = () => ({})

      // export default Page
    `,
      },
    ],
  },
]

describe('templateWithHoc', () => {
  tests.forEach((d) => {
    describe(d.describe, () => {
      d.cases.forEach(({ expected, debug, ...options }) => {
        const fn = debug ? test.only : test
        const testname = Object.entries(options).map(([k, v]) => `${k}: ${v}`)
        fn(testname.join(' | '), () => {
          expect(clean(templateWithHoc(d.code, options))).toContain(
            clean(expected)
          )
        })
      })
    })
  })
})
