const request = require('supertest')
const express = require('express')
const next = require('next')
const i18nMiddleware = require('../src/i18nMiddleware').default

function loadServerWithMiddleware(config, port) {
  const dev = process.env.NODE_ENV !== 'production'
  const app = next({ dev })
  const handle = app.getRequestHandler()
  const server = express()

  server.use(i18nMiddleware(config))
  server.get('*', handle)

  return app
    .prepare()
    .then(() =>
      server.listen(port, (err) => {
        if (err) throw err
      })
    )
    .catch(console.error)
}

jest.mock('next', () => () => ({
  prepare: () => Promise.resolve(),
  getRequestHandler: () => (req, res) => res.send(req.lang),
  render: (req, res) => res.send(''),
}))

const defaultLanguage = 'en'
const allLanguages = ['es', 'en', 'ca']

let server1
let server2

describe('i18nMiddleware', () => {
  beforeAll(async () => {
    server1 = await loadServerWithMiddleware(
      {
        allLanguages,
        defaultLanguage,
        defaultLangRedirect: 'root',
      },
      3005
    )
    server2 = await loadServerWithMiddleware(
      {
        allLanguages,
        defaultLanguage: () => defaultLanguage,
        defaultLangRedirect: 'lang-path',
      },
      3006
    )
  })
  describe('defaultLangRedirect="root"', () => {
    ;[
      ['/_next/chunk.js', 200, null],
      ['/ca/test', 200, 'ca'],
      ['/en/test', 301, null, '/test'],
      ['/es/test', 200, 'es'],
      ['/favicon.ico', 200, null],
      ['/robots.txt', 200, null],
      ['/es/favicon.ico', 301, null, '/favicon.ico'],
      ['/es/robots.txt', 301, null, '/robots.txt'],
      ['/manifest.json', 200, null],
      ['/es/manifest.json', 301, null, '/manifest.json'],
      ['/static/images/logo.svg', 200, null],
      ['/es/static/images/logo.svg', 301, null, '/static/images/logo.svg'],
      ['/test', 200, defaultLanguage],
    ].forEach(([path, status, lang, redirect]) => {
      test(`${path} -> ${status}${
        redirect ? ` to ${redirect}` : ''
      }`, (done) => {
        request(server1)
          .get(path)
          .set('Host', 'www.test.com')
          .end((err, res) => {
            expect(res.status).toBe(status)
            if (lang) expect(res.text).toBe(lang)
            done()
          })
      })
    })
  })

  describe('defaultLangRedirect="lang-path"', () => {
    ;[
      ['/_next/chunk.js', 200, null],
      ['/ca/test', 200, 'ca'],
      ['/en/test', 200, 'en'],
      ['/es/test', 200, 'es'],
      ['/favicon.ico', 200, null],
      ['/robots.txt', 200, null],
      ['/es/favicon.ico', 301, null, '/favicon.ico'],
      ['/es/robots.txt', 301, null, '/robots.txt'],
      ['/manifest.json', 200, null],
      ['/es/manifest.json', 301, null, '/manifest.json'],
      ['/static/images/logo.svg', 200, null],
      ['/es/static/images/logo.svg', 301, null, '/static/images/logo.svg'],
      ['/test', 301, null, `/${defaultLanguage}/test`],
      [`/${defaultLanguage}/test`, 200, defaultLanguage],
    ].forEach(([path, status, lang, redirect]) => {
      test(`${path} -> ${status}${
        redirect ? ` to ${redirect}` : ''
      }`, (done) => {
        request(server2)
          .get(path)
          .set('Host', 'www.test.com')
          .expect(status, (err, res) => {
            expect(res.status).toBe(status)
            if (lang) expect(res.text).toBe(lang)
            done()
          })
      })
    })
  })
  afterAll(() => {
    server1.close()
    server2.close()
  })
})
