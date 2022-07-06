import { isPageToIgnore } from '../src/plugin/utils'

describe('utils', () => {
  describe('utils -> isPageToIgnore', () => {
    const testPath = (path, expected) => {
      const extensions = ['js', 'jsx', 'ts', 'tsx']
      extensions.forEach((extension) => {
        expect(isPageToIgnore(`${path}.${extension}`)).toBe(expected)
      })
    }

    test('ignores api pages', () => {
      testPath('/api/test', true)
    })

    test('ignores nested api pages', () => {
      testPath('/api/nested/test', true)
    })

    test('ignores _document', () => {
      testPath('/_document', true)
    })

    test('ignores root middleware', () => {
      expect(isPageToIgnore(`/middleware.js`)).toBe(true)
      expect(isPageToIgnore(`/middleware.ts`)).toBe(true)
    })

    test('ignores _middleware', () => {
      testPath('/_middleware', true)
    })

    test('ignores nested _middleware', () => {
      testPath('/nested/_middleware', true)
    })

    test('ignores files in __mocks__ folder', () => {
      testPath('/__mocks__/test', true)
    })

    test('ignores files in __tests__ folder', () => {
      testPath('/__tests__/test', true)
    })

    test('ignores .test files', () => {
      testPath('/file.test', true)
    })

    test('ignores nested .test files', () => {
      testPath('/nested/file.test', true)
    })

    test('ignores .spec files', () => {
      testPath('/file.spec', true)
    })

    test('ignores nested .spec files', () => {
      testPath('/nested/file.spec', true)
    })

    test('does not ignore _app', () => {
      testPath('_app', false)
    })

    test('does not ignore page files', () => {
      testPath('index', false)
    })

    test('does not ignore nested page files', () => {
      testPath('/nested/index', false)
    })
  })
})
