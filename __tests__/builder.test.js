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
      const pages_ = execSync('tree examples/static-site/pages_')
        .toString()
        .split('\n')
      expect(pages_[1]).toContain('_app.js')
      expect(pages_[2]).toContain('index.tsx')
      expect(pages_[3]).toContain('more-examples')
      expect(pages_[4]).toContain('dynamic-namespace.js')
      expect(pages_[5]).toContain('index.js')
      expect(pages_[7]).toContain('1 directory, 4 files')

      const pages = execSync('tree examples/static-site/pages')
        .toString()
        .split('\n')
      expect(pages[1]).toContain('_app.js')

      expect(pages[2]).toContain('ca')
      expect(pages[3]).toContain('index.js')
      expect(pages[4]).toContain('more-examples')
      expect(pages[5]).toContain('dynamic-namespace.js')
      expect(pages[6]).toContain('index.js')

      expect(pages[7]).toContain('en')
      expect(pages[8]).toContain('index.js')
      expect(pages[9]).toContain('more-examples')
      expect(pages[10]).toContain('dynamic-namespace.js')
      expect(pages[11]).toContain('index.js')

      expect(pages[12]).toContain('es')
      expect(pages[13]).toContain('index.js')
      expect(pages[14]).toContain('more-examples')
      expect(pages[15]).toContain('dynamic-namespace.js')
      expect(pages[16]).toContain('index.js')

      expect(pages[17]).toContain('index.js')
      expect(pages[18]).toContain('more-examples')
      expect(pages[19]).toContain('dynamic-namespace.js')
      expect(pages[20]).toContain('index.js')

      expect(pages[22]).toContain('7 directories, 13 files')
    })
  })

  describe('_app.js', () => {
    test('Should be the same than the pages_/_app.js', () => {
      const pages_ = fs.readFileSync('examples/static-site/pages_/_app.js')
      const pages = fs.readFileSync('examples/static-site/pages/_app.js')

      expect(pages_.equals(pages)).toBe(true)
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
      const es = fs.readFileSync('examples/static-site/pages/es/index.js')
      const ca = fs.readFileSync('examples/static-site/pages/ca/index.js')
      const en = fs.readFileSync('examples/static-site/pages/en/index.js')

      expect(deflt.toString()).toContain(
        `export const getStaticProps = ctx => _rest.getStaticProps({ ...ctx, lang: 'en' })`
      )
      expect(es.toString()).toContain(
        `export const getStaticProps = ctx => _rest.getStaticProps({ ...ctx, lang: 'es' })`
      )
      expect(ca.toString()).toContain(
        `export const getStaticProps = ctx => _rest.getStaticProps({ ...ctx, lang: 'ca' })`
      )
      expect(en.toString()).toContain(
        `export const getStaticProps = ctx => _rest.getStaticProps({ ...ctx, lang: 'en' })`
      )
    })
  })
})
