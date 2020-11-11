const fs = require('fs')
const execSync = require('child_process').execSync

describe('builder', () => {
  beforeAll(() => {
    execSync('yarn build')
    execSync('rm -rf examples/with-build-step-nested-locales/pages')
    execSync('rm -rf examples/with-build-step-nested-locales/localesBuild')
    execSync(
      'cd examples/with-build-step-nested-locales/ && yarn i18n && cd ../../'
    )
  })

  afterAll(() => {
    execSync('rm -rf examples/with-build-step-nested-locales/pages')
    execSync('rm -rf examples/with-build-step-nested-locales/localesBuild')
  })

  describe('locales files tree', () => {
    test('should build all the necessary files', () => {
      /* Test localesPath */
      expect(
        fs.existsSync(
          'examples/with-build-step-nested-locales/locales/en/common.json'
        )
      ).toBe(true)
      expect(
        fs.existsSync(
          'examples/with-build-step-nested-locales/locales/en/dynamic.json'
        )
      ).toBe(true)
      expect(
        fs.existsSync(
          'examples/with-build-step-nested-locales/locales/en/error.json'
        )
      ).toBe(true)
      expect(
        fs.existsSync(
          'examples/with-build-step-nested-locales/locales/en/home.json'
        )
      ).toBe(true)
      expect(
        fs.existsSync(
          'examples/with-build-step-nested-locales/locales/en/more-examples/index.json'
        )
      ).toBe(true)
      expect(
        fs.existsSync(
          'examples/with-build-step-nested-locales/locales/en/more-examples/nested-example/very-nested.json'
        )
      ).toBe(true)

      /* Test finalLocalesPath */
      expect(
        fs.existsSync(
          'examples/with-build-step-nested-locales/localesBuild/en/common.json'
        )
      ).toBe(true)
      expect(
        fs.existsSync(
          'examples/with-build-step-nested-locales/localesBuild/en/dynamic.json'
        )
      ).toBe(true)
      expect(
        fs.existsSync(
          'examples/with-build-step-nested-locales/localesBuild/en/error.json'
        )
      ).toBe(true)
      expect(
        fs.existsSync(
          'examples/with-build-step-nested-locales/localesBuild/en/home.json'
        )
      ).toBe(true)
      expect(
        fs.existsSync(
          'examples/with-build-step-nested-locales/localesBuild/en/more-examples.json'
        )
      ).toBe(true)
    })
  })

  describe('more-examples.json', () => {
    test('Should contain nested objects from more-examples folder', () => {
      const page = fs.readFileSync(
        'examples/with-build-step-nested-locales/localesBuild/en/more-examples.json'
      )
      expect(page.toString()).toContain(
        `nested-example":{"very-nested":{"nested":"Nested example!"}}`
      )
    })
  })
})
