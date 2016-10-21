import db from './db'
import Promise from 'bluebird'
import _ from 'lodash'
import extent from 'geojson-extent'
import { getZoneExtent } from './loadZoneExtents'

const getZoneById = zoneId =>
  new Promise((resolve, reject) => {
    return resolve({
      bbox: getZoneExtent(zoneId.toLowerCase()),
      zoneId
    })
  })

const getZoneByIdRequest = (req, res) => {
  if (!req.body || !req.body.zoneId) {
    return res.status(409).send({ message: 'Request is missing zone id.' })
  }
  getZoneById(req.body.zoneId).then(
    result => res.send(result),
    reason => res.status(409).send(reason)
  )
}

export default getZoneByIdRequest