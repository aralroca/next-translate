import { hasHOC } from '../src/plugin/utils'

describe('hasHOC', () => {
  describe('HOC -> should return true', () => {
    test('with -> export default somevariable (in case is it)', () => {
      expect(
        hasHOC(`
        import withWrapper from 'somewhere'

        function Page() {
          return <div>Hello world</div>
        }

        const anothervariable = withWrapper(Page);
        const somevariable = anothervariable;
        
        export default somevariable
      `)
      ).toBe(true)
    })
    test('with -> curry config on HOC', () => {
      expect(
        hasHOC(`
          import React from 'react';
          import Head from 'next/head';
          import { withUrqlClient } from 'next-urql';
          
          const Index = () => {
            const [result] = useQuery({
              query: '{ test }',
            });
            return null
          };

          export default withUrqlClient((_ssrExchange, ctx) => ({
            url: 'http://localhost:3000/graphql',
          },{ssr:true}))(Index);
        `)
      ).toBe(true)
    })
    test('with -> curry config on HOC in a class', () => {
      expect(
        hasHOC(`
          import React from 'react';
          import Head from 'next/head';
          import { withUrqlClient } from 'next-urql';
          
          class Index {
            render() { 
              return null
            }
          }

          export default withUrqlClient((_ssrExchange, ctx) => ({
            url: 'http://localhost:3000/graphql',
          },{ssr:true}))(Index);
        `)
      ).toBe(true)
    })
    test('with -> curry empty config on HOC', () => {
      expect(
        hasHOC(`
          import React from 'react';
          import Head from 'next/head';
          import { withHOC } from 'hoc-example';
          
          const Index = () => null

          export default withHOC()(Index);
        `)
      ).toBe(true)
    })
    test('with -> curry config on HOC in different order', () => {
      expect(
        hasHOC(`
          import React from 'react';
          import Head from 'next/head';
          import { withHOC } from 'hoc-example';
          
          const Index = () => null

          export default withHOC(Index)({ someconfig: true })();
        `)
      ).toBe(true)
    })
    test('with -> curry empty config on HOC with a reference', () => {
      expect(
        hasHOC(`
          import React from 'react';
          import Head from 'next/head';
          import { withHOC } from 'hoc-example';
          
          const Index = () => null

          const refComp = withHOC()(Index);

          export default refComp
        `)
      ).toBe(true)
    })
    test('with -> with withTranslation + another hoc', () => {
      expect(
        hasHOC(`
        import withTranslation from 'next-translate/withTranslation'
        import withWrapper from 'somewhere'

        function Page() {
          return <div>Hello world</div>
        }

        const anothervariable = withWrapper(Page);
        const somevariable = anothervariable;
        
        export default withTranslation(somevariable)
      `)
      ).toBe(true)
    })
    test('with -> export default withWrapper(Page)', () => {
      expect(
        hasHOC(`
        import withWrapper from 'somewhere'

        function Page() {
          return <div>Hello world</div>
        }

        export default withWrapper(Page)
      `)
      ).toBe(true)
    })
  })

  describe('HOC -> should return false', () => {
    test('with -> arrow function with TS type', () => {
      expect(
        hasHOC(`
        import { NextPage } from 'next'
        import useTranslation from 'next-translate/useTranslation'
        import React from 'react'

        const NotFoundPage: NextPage = () => {
          const { t } = useTranslation()
          return <div>{t('error:page-not-found')}</div>
        }

        export default NotFoundPage
        `)
      ).toBe(false)
    })
    test('with -> any export default', () => {
      expect(
        hasHOC(`
        // missing export
        function Page() {
          return <div>Hello world</div>
        }
      `)
      ).toBe(false)
    })
    test('with -> curry config on fake HOC', () => {
      expect(
        hasHOC(`
          import React from 'react';
          import Head from 'next/head';
          import { withUrqlClient } from 'next-urql';
          
          const Index = () => {
            const [result] = useQuery({
              query: '{ test }',
            });
            return null
          };

          const fakeHoc = withUrqlClient((_ssrExchange, ctx) => ({
            url: 'http://localhost:3000/graphql',
          },{ssr:true}))(Index);

          export default Index
        `)
      ).toBe(false)
    })
    test('with -> export default function', () => {
      expect(
        hasHOC(`
        export default function Page() {
          return <div>Hello world</div>
        }
      `)
      ).toBe(false)
    })
    test('with -> export default class', () => {
      expect(
        hasHOC(`
        export default class Page { // (some comment)
          render() {
            return <div>Hello world</div>
          }
        }
      `)
      ).toBe(false)
    })
    test('with -> export default function with props', () => {
      expect(
        hasHOC(`
        export default function Page(Props) {
          return <div>Hello world</div>
        }
      `)
      ).toBe(false)
    })
    test('with -> export default arrow function with props', () => {
      expect(
        hasHOC(`
        export default (Props) => {
          return <div>Hello world</div>
        }
      `)
      ).toBe(false)
    })
    test('with -> export default arrow function with destructured props', () => {
      expect(
        hasHOC(`
        export default ({ title }) => {
          return <div>Hello world</div>
        }
      `)
      ).toBe(false)
    })
    test('with -> export default Page', () => {
      expect(
        hasHOC(`
        function Page() {
          return <div>Hello world</div>
        }

        export default Page;
      `)
      ).toBe(false)
    })
    test("with -> export default somevariable (in case isn't)", () => {
      expect(
        hasHOC(`
        function Page() {
          return <div>Hello world</div>
        }

        const somevariable = Page

        export default somevariable;
      `)
      ).toBe(false)
    })
    test('with -> export default () => {}', () => {
      expect(
        hasHOC(`
        export default () => {
          return <div>Hello world</div>
        }
      `)
      ).toBe(false)
    })
    test('with -> export default somevariable', () => {
      expect(
        hasHOC(`
        function Page() {
          return <div>Hello world</div>
        }
  
        const somevariable = Page;
        
        export default somevariable`)
      ).toBe(false)
    })
    test('with -> export default Page + withFakeHOC', () => {
      expect(
        hasHOC(`
        import useTranslation from 'next-translate/useTranslation'

        const withFakeHOC = (C) => (p) => <C {...p} />

        // Just for tests
        function PageWithHOC() {
          const { t } = useTranslation()
          return <div>{t\`common:title\`}</div>
        }

        export default PageWithHOC
      `)
      ).toBe(false)
    })
    test('with -> with withTranslation', () => {
      expect(
        hasHOC(`
        import useTranslation from 'next-translate/useTranslation'
        import withTranslation from 'next-translate/withTranslation'

        const withHOC = (C) => (p) => <C {...p} />

        // Just for tests
        function PageWithHOC() {
          const { t } = useTranslation()
          return <div>{t\`common:title\`}</div>
        }

        export default withTranslation(PageWithHOC)
      `)
      ).toBe(false)
    })
    test('with -> with renamed withTranslation', () => {
      expect(
        hasHOC(`
        import useTranslation from 'next-translate/useTranslation'
        import justI18nHoc from 'next-translate/withTranslation'

        const withHOC = (C) => (p) => <C {...p} />

        // Just for tests
        function PageWithHOC() {
          const { t } = useTranslation()
          return <div>{t\`common:title\`}</div>
        }

        export default justI18nHoc(PageWithHOC)
      `)
      ).toBe(false)
    })
    test('with -> it has getStaticProps in a wrapper', () => {
      expect(
        hasHOC(`
        import withWrapper from 'somewhere'

        function Page() {
          return <div>Hello world</div>
        }

        export const getStaticProps = wrapper()`)
      ).toBe(false)
    })
    test('with -> it has getStaticProps', () => {
      expect(
        hasHOC(`
        import withWrapper from 'somewhere'

        function Page() {
          return <div>Hello world</div>
        }

        export function getStaticProps() {
          return {
            props: {}
          }
        }

        export default withWrapper(Page)
      `)
      ).toBe(false)
    })

    test('with -> it has getStaticProps exported as {}', () => {
      expect(
        hasHOC(`
        import withWrapper from 'somewhere'

        function Page() {
          return <div>Hello world</div>
        }

        function getStaticProps() {
          return {
            props: {}
          }
        }

        export { getStaticProps }

        export default withWrapper(Page)
      `)
      ).toBe(false)
    })

    test('with -> it has getServerSideProps', () => {
      expect(
        hasHOC(`
        import withWrapper from 'somewhere'

        function Page() {
          return <div>Hello world</div>
        }

        export const getServerSideProps() {
          return {
            props: {}
          }
        }

        export default withWrapper(Page)
      `)
      ).toBe(false)
    })
  })
})
