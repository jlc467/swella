/*eslint-disable no-console*/
import http from 'http'
import express from 'express'
import bodyParser from 'body-parser'
import Promise from 'bluebird'
import cors from 'cors'
import { SERVER_API_PORT } from './config'
import getNearbyZonesRequest from './getNearbyZones'
import getZoneByIdRequest from './getZoneById'
import loadZoneExtents from './loadZoneExtents'

const createRouter = () => {
  const router = express.Router()
  router.route('/').get((req, res) => {
    res.json('Welcome!')
  })
  router.route('/getNearbyZones').post(getNearbyZonesRequest)
  router.route('/getZoneById').post(getZoneByIdRequest)
  return router
}

const errorHandler = (err, req, res, next) => {
  res.status(500).send('<p>Internal Server Error</p>')
  console.error(err.stack)
  next(err)
}

const createServer = () => {
  const app = express()
  app.disable('x-powered-by')
  app.use(cors())
  app.use(bodyParser.json({limit: '50mb'}))
  app.use(bodyParser.text())
  app.use(errorHandler)
  app.use(createRouter())

  const server = http.createServer(app)
  return server
}

const loadDefinitions = () =>
  new Promise((resolve, reject) => {
    const toResolve = {
      extents: loadZoneExtents()
    }
    Promise.props(toResolve).then(
      result => resolve(result),
      reason => reject(reason)
    )
  })

const startServer = () => {
  loadDefinitions().then(
    result => {
      const server = createServer()
      server.listen(SERVER_API_PORT, () => {
        console.log(`Swella API Server listening on port ${SERVER_API_PORT}, Ctrl+C to stop`)
      })
    },
    reason => {
      console.error('Failed to load startup definitions', reason)
    }
  )
}

startServer()