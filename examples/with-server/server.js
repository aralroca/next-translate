const express = require('express')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()
const server = express()
const PORT = parseInt(process.env.PORT, 10) || 3000

server.get('*', handle)

module.exports = app
  .prepare()
  .then(() =>
    server.listen(PORT, (err) => {
      if (err) throw err
      console.log(`> Ready on http://localhost:${PORT}`)
    })
  )
  .catch(console.error)
