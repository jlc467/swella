import db from './db'
import Promise from 'bluebird'

const query = {
  g: 'point(-80.86936 28.62520)',
  limit: 1,
  nearest: true,
  format: 'legacy'
}


const getNearbyZones = coordinates =>
  new Promise((resolve, reject) => {
    db.geo('zone_polygons', 'zones', query).then(
      zones => {
        console.log(zones)
        return resolve(zones)
      }
    ).catch(err => {
      console.log('something went wrong', err)
      return reject(err)
    })
  })

const getNearbyZonesRequest = (req, res) => {
  if (!req.body || !req.body.coordinates) { // should not happen, client is trippin
    return res.status(409).send({ message: 'Request is missing coordinates needed to find nearby zones.' })
  }
  getNearbyZones(req.body.coordinates).then(
    result => res.send(result),
    reason => res.status(409).send(reason)
  )
}

export default getNearbyZonesRequest