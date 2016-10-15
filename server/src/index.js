/*eslint-disable no-console*/
import http from 'http'
import express from 'express'
import bodyParser from 'body-parser'
import { SERVER_API_PORT } from './config'
import getNearbyZonesRequest from './getNearbyZones'

export const createRouter = () => {
  const router = express.Router()
  router.route('/').get((req, res) => {
    res.json('Welcome!')
  })
  router.route('/getNearbyZones').post(getNearbyZonesRequest)
  return router
}

const errorHandler = (err, req, res, next) => {
  res.status(500).send('<p>Internal Server Error</p>')
  console.error(err.stack)
  next(err)
}

export const createServer = () => {
  const app = express()
  app.disable('x-powered-by')
  app.use(bodyParser.json({limit: '50mb'}))
  app.use(bodyParser.text())
  app.use(errorHandler)
  app.use(createRouter())

  const server = http.createServer(app)
  return server
}

export const startServer = () => {

  const server = createServer()

  server.listen(SERVER_API_PORT, () => {
    console.log(`Swella API Server listening on port ${SERVER_API_PORT}, Ctrl+C to stop`)
  })
}

startServer()