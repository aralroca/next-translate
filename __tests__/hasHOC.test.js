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
    test('with -> export default function', () => {
      expect(
        hasHOC(`
        export default function Page() {
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
