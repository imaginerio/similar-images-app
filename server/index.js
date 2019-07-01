const express = require('express')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
const app = express()
app.use(express.json())

const datastore = require('nedb')
const db = new datastore('./database/database.db')

db.loadDatabase()

app.get('/api', (req, res) => {
  if (req.query) {
    const { similarity, found } = req.query

    const query = { $and: [{ found: found ? found : true }, { "neighbors": { $elemMatch: { similarity: { $gt: parseFloat(similarity) } } } }] }

    db.find(query, (err, data) => {
      res.json(data)
    })
  } else {
    db.find({}, (err, data) => {
      res.json(data)
    })
  }

})

app.get('/api/:id', (req, res) => {
  const { id } = req.params
  db.find({ _id: id }, (err, data) => {
    res.json(data)
  })
})

app.post('/api/:id', (req, res) => {
  const { id } = req.params
  const payload = req.body

  db.update({ _id: id }, payload, { returnUpdatedDocs: true }, (err, numAffected, affectedDocuments, upsert) => {
    res.json(affectedDocuments)
    console.log(affectedDocuments)
  })

})

// Import and Set Nuxt.js options
let config = require('../nuxt.config.js')
config.dev = !(process.env.NODE_ENV === 'production')

async function start() {
  // Init Nuxt.js
  const nuxt = new Nuxt(config)

  const { host, port } = nuxt.options.server

  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  } else {
    await nuxt.ready()
  }


  // Give nuxt middleware to express
  app.use(nuxt.render)

  // Listen the server
  app.listen(port, host)
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })
}
start()
