const request = require('supertest')
const express = require('express')
const next = require('next')
const i18nMiddleware = require('../src/i18nMiddleware').default

function loadServerWithMiddleware(config) {
  const dev = process.env.NODE_ENV !== 'production'
  const app = next({ dev })
  const handle = app.getRequestHandler()
  const PORT = 3005
  const server = express()
  server.use(i18nMiddleware(config))

  server.get('*', handle)

  return app
    .prepare()
    .then(() =>
      server.listen(PORT, err => {
        if (err) throw err
      })
    )
    .catch(console.error)
}

jest.mock('next', () => () => ({
  prepare: () => Promise.resolve(),
  getRequestHandler: () => (req, res) => res.send('Welcome to Next.js!'),
  render: (req, res) => res.send(''),
}))

const defaultLanguage = 'en'

const TESTS = [
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
  ['/test', 200, defaultLanguage],
]

let server

describe('i18nMiddleware', () => {
  beforeAll(async () => {
    server = await loadServerWithMiddleware({
      allLanguages: ['es', 'en', 'ca'],
      defaultLanguage,
    })
  })

  TESTS.forEach(([path, status, lang, redirect]) => {
    test(`${path} -> ${status}${
      redirect ? ` to ${redirect}` : ''
    }`, async () => {
      await request(server)
        .get(path)
        .set('Host', 'www.test.com')
        .expect(status)
    })
  })

  afterAll(() => server.close())
})
