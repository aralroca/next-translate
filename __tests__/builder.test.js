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
    test('should build all the necessary files', () => {
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

      // Pages
      expect(
        fs.existsSync(
          'examples/static-site/pages/more-examples/dynamic-namespace.js'
        )
      ).toBe(true)
      expect(
        fs.existsSync('examples/static-site/pages/more-examples/index.js')
      ).toBe(true)
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
        "const _ns = { 'common': ns0, 'home': ns1 }"
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

    test('Should generate /index/index.js pages correctly', () => {
      const page = fs
        .readFileSync('examples/static-site/pages/more-examples/index.js')
        .toString()

      expect(page).toContain(`import C from '../../pages_/more-examples/index'`)
      expect(page).toContain(
        'const ns0 = await import(`../../locales/${_lang}/common.json`)'
      )
    })
  })

  describe('Should use getInitialProps as a default loader if the page has a HOC in order to avoid issues', () => {
    const page = fs
      .readFileSync('examples/static-site/pages/example-hoc.js')
      .toString()

    expect(page).toContain('Page.getInitialProps')
    expect(page).toContain(
      'const ns0 = await import(`../locales/${_lang}/common.json`)'
    )
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
