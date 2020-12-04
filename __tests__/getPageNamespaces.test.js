import getPageNamespaces from '../src/getPageNamespaces'

describe('getPageNamespaces', () => {
  let ctx
  beforeAll(() => {
    ctx = { query: {} }
  })

  describe('empty', () => {
    test('should not return any namespace with empty pages', async () => {
      const input = [{ pages: {} }, '/test-page', ctx]
      const output = await getPageNamespaces(...input)

      expect(output.length).toBe(0)
    })
    test('should not return any namespace with pages as undefined', async () => {
      const input = [{}, '/test-page', ctx]
      const output = await getPageNamespaces(...input)

      expect(output.length).toBe(0)
    })
  })

  describe('regular expressions', () => {
    test('should return namespaces that match the rgx', async () => {
      const config = {
        pages: {
          '*': ['common'],
          '/example/form': ['valid'],
          '/example/form/other': ['invalid'],
          'rgx:/form$': ['form'],
          'rgx:/invalid$': ['invalid'],
          'rgx:^/example': ['example'],
        },
      }
      const input = [config, '/example/form']
      const output = await getPageNamespaces(...input)

      expect(output.length).toBe(4)
      expect(output[0]).toBe('common')
      expect(output[1]).toBe('valid')
      expect(output[2]).toBe('form')
      expect(output[3]).toBe('example')
    })
  })

  describe('as array', () => {
    test('should return the page namespace', async () => {
      const input = [
        { pages: { '/test-page': ['test-ns'] } },
        '/test-page',
        ctx,
      ]
      const output = await getPageNamespaces(...input)
      const expected = ['test-ns']

      expect(output.length).toBe(1)
      expect(output[0]).toBe(expected[0])
    })

    test('should return the page namespace + common', async () => {
      const input = [
        {
          pages: {
            '*': ['common'],
            '/test-page': ['test-ns'],
          },
        },
        '/test-page',
        ctx,
      ]
      const output = await getPageNamespaces(...input)
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
        {
          pages: {
            '/test-page': ({ query }) => (query.example ? ['test-ns'] : []),
          },
        },
        '/test-page',
        ctx,
      ]
      const output = await getPageNamespaces(...input)
      const expected = ['test-ns']

      expect(output.length).toBe(1)
      expect(output[0]).toBe(expected[0])
    })

    test('should work as an async fn', async () => {
      ctx.query.example = '1'
      const input = [
        {
          pages: {
            '*': () => ['common'],
            '/test-page': async ({ query }) =>
              query.example ? ['test-ns'] : [],
          },
        },
        '/test-page',
        ctx,
      ]
      const output = await getPageNamespaces(...input)
      const expected = ['common', 'test-ns']

      expect(output.length).toBe(2)
      expect(output[0]).toBe(expected[0])
      expect(output[1]).toBe(expected[1])
    })
  })
})
