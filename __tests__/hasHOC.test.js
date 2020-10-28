import hasHOC from '../src/_helpers/hasHOC'

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
    test('with -> it has getStaticProps', () => {
      expect(
        hasHOC(`
        import withWrapper from 'somewhere'

        function Page() {
          return <div>Hello world</div>
        }

        export const getStaticProps() {
          return {
            props: {}
          }
        }

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
