import getServerPageNamespaces from '../src/_helpers/getServerPageNamespaces'

describe('getServerPageNamespaces', () => {
  let ctx
  beforeAll(() => {
    ctx = { query: {} }
  })

  describe('empty', () => {
    test('should not return any namespace with empty pages', async () => {
      const input = [ctx, { pages: {} }, '/test-page']
      const output = await getServerPageNamespaces(...input)

      expect(output.length).toBe(0)
    })
    test('should not return any namespace with pages as undefined', async () => {
      const input = [ctx, {}, '/test-page']
      const output = await getServerPageNamespaces(...input)

      expect(output.length).toBe(0)
    })
  })

  describe('as array', () => {
    test('should return the page namespace', async () => {
      const input = [
        ctx,
        { pages: { '/test-page': ['test-ns'] } },
        '/test-page',
      ]
      const output = await getServerPageNamespaces(...input)
      const expected = ['test-ns']

      expect(output.length).toBe(1)
      expect(output[0]).toBe(expected[0])
    })

    test('should return the page namespace + common', async () => {
      const input = [
        ctx,
        {
          pages: {
            '*': ['common'],
            '/test-page': ['test-ns'],
          },
        },
        '/test-page',
      ]
      const output = await getServerPageNamespaces(...input)
      const expected = ['common', 'test-ns']

      expect(output.length).toBe(2)
      expect(output[0]).toBe(expected[0])
      expect(output[1]).toBe(expected[1])
    })
  })

  describe('as function', () => {
    test('should work as a fn', async () => {
      ctx.query.example = '1'
      const input = [
        ctx,
        {
          pages: {
            '/test-page': ({ query }) => (query.example ? ['test-ns'] : []),
          },
        },
        '/test-page',
      ]
      const output = await getServerPageNamespaces(...input)
      const expected = ['test-ns']

      expect(output.length).toBe(1)
      expect(output[0]).toBe(expected[0])
    })

    test('should work as an async fn', async () => {
      ctx.query.example = '1'
      const input = [
        ctx,
        {
          pages: {
            '*': () => ['common'],
            '/test-page': async ({ query }) =>
              query.example ? ['test-ns'] : [],
          },
        },
        '/test-page',
      ]
      const output = await getServerPageNamespaces(...input)
      const expected = ['common', 'test-ns']

      expect(output.length).toBe(2)
      expect(output[0]).toBe(expected[0])
      expect(output[1]).toBe(expected[1])
    })
  })
})
