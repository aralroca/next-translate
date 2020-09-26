const fs = require('fs')
const execSync = require('child_process').execSync

describe('builder', () => {
  beforeAll(() => {
    execSync('yarn build')
    execSync('rm -rf examples/static-site/pages')
    execSync('cd examples/static-site/ && yarn i18n && cd ../../')
  })

  afterAll(() => {
    execSync('rm -rf examples/static-site/pages')
  })

  describe('files tree', () => {
    test('should build all the necessary files for all languages', () => {
      /* Test currentPagesDir */
      expect(fs.existsSync('examples/static-site/pages_/_app.js')).toBe(true)
      expect(fs.existsSync('examples/static-site/pages_/index.tsx')).toBe(true)
      expect(
        fs.existsSync(
          'examples/static-site/pages_/more-examples/dynamic-namespace.js'
        )
      ).toBe(true)
      expect(
        fs.existsSync(
          'examples/static-site/pages_/more-examples/index/index.js'
        )
      ).toBe(true)

      /* Test finalPagesDir */
      expect(fs.existsSync('examples/static-site/pages/_app.js')).toBe(true)
      expect(fs.existsSync('examples/static-site/pages/index.js')).toBe(true)

      // Default language
      expect(
        fs.existsSync(
          'examples/static-site/pages/more-examples/dynamic-namespace.js'
        )
      ).toBe(true)
      expect(
        fs.existsSync('examples/static-site/pages/more-examples/index.js')
      ).toBe(true)

      // Rest of languages
      expect(fs.existsSync('examples/static-site/pages/ca/index.js')).toBe(true)
      expect(
        fs.existsSync(
          'examples/static-site/pages/ca/more-examples/dynamic-namespace.js'
        )
      ).toBe(true)
      expect(
        fs.existsSync('examples/static-site/pages/ca/more-examples/index.js')
      ).toBe(true)

      expect(fs.existsSync('examples/static-site/pages/es/index.js')).toBe(true)
      expect(
        fs.existsSync(
          'examples/static-site/pages/es/more-examples/dynamic-namespace.js'
        )
      ).toBe(true)
      expect(
        fs.existsSync('examples/static-site/pages/es/more-examples/index.js')
      ).toBe(true)

      // The default language should be not generated when defaultLangRedirect != 'lang-path'
      expect(fs.existsSync('examples/static-site/pages/en/index.js')).toBe(
        false
      )
      expect(
        fs.existsSync(
          'examples/static-site/pages/en/more-examples/dynamic-namespace.js'
        )
      ).toBe(false)
      expect(
        fs.existsSync('examples/static-site/pages/en/more-examples/index.js')
      ).toBe(false)
    })
  })

  describe('_app.js', () => {
    test('Should be the same than the pages_/_app.js', () => {
      const pages_ = fs.readFileSync('examples/static-site/pages_/_app.js')
      const pages = fs.readFileSync('examples/static-site/pages/_app.js')

      expect(pages_.equals(pages)).toBe(true)
    })
  })

  describe('/dashboard.js', () => {
    test('Should add common + home namespaces', () => {
      const page = fs.readFileSync('examples/static-site/pages/dashboard.js')
      expect(page.toString()).toContain(
        "const namespaces = { 'common': ns0, 'home': ns1 }"
      )
    })
  })

  describe('index.js', () => {
    test('Should NOT be the same than the pages_/index.js', () => {
      const pages_ = fs.readFileSync('examples/static-site/pages_/index.tsx')
      const pages = fs.readFileSync('examples/static-site/pages/index.js')

      expect(pages_.equals(pages)).toBe(false)
      expect(pages.toString()).toContain('I18nProvider')
      expect(pages.toString()).toContain('Page = Object.assign(Page, { ...C })')
    })

    test('Should inject lang to getStaticProps', () => {
      const deflt = fs.readFileSync('examples/static-site/pages/index.js')
      const en = fs.readFileSync('examples/static-site/pages/en/[...path].js')
      const es = fs.readFileSync('examples/static-site/pages/es/index.js')
      const ca = fs.readFileSync('examples/static-site/pages/ca/index.js')

      expect(deflt.toString()).toContain(
        `export const getStaticProps = ctx => _rest.getStaticProps({ ...ctx, lang: 'en' })`
      )
      expect(en.toString()).toContain(`DefaultLanguageCatchAll`)
      expect(es.toString()).toContain(
        `export const getStaticProps = ctx => _rest.getStaticProps({ ...ctx, lang: 'es' })`
      )
      expect(ca.toString()).toContain(
        `export const getStaticProps = ctx => _rest.getStaticProps({ ...ctx, lang: 'ca' })`
      )
    })

    test('Should generate /index/index.js pages correctly', () => {
      const deflt = fs
        .readFileSync('examples/static-site/pages/more-examples/index.js')
        .toString()
      const withLang = fs
        .readFileSync('examples/static-site/pages/ca/more-examples/index.js')
        .toString()

      expect(deflt).toContain(
        `import C from '../../pages_/more-examples/index'`
      )
      expect(deflt).toContain(`import ns0 from '../../locales/en/common.json'`)

      expect(withLang).toContain(
        `import C from '../../../pages_/more-examples/index'`
      )
      expect(withLang).toContain(
        `import ns0 from '../../../locales/ca/common.json'`
      )
    })
  })

  describe('amp.js', () => {
    test('Should NOT be the same than the pages_/amp.js', () => {
      const pages_ = fs.readFileSync('examples/static-site/pages_/amp.tsx')
      const pages = fs.readFileSync('examples/static-site/pages/amp.js')

      expect(pages_.equals(pages)).toBe(false)
      expect(pages.toString()).toContain('I18nProvider')
      expect(pages.toString()).toContain('Page = Object.assign(Page, { ...C })')
    })

    test('Should contain config export', () => {
      const deflt = fs.readFileSync('examples/static-site/pages/amp.js')

      expect(deflt.toString()).toContain(`export const config = { amp: true }`)
    })
  })
})
