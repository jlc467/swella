import geo from './zones-geometry-good.json'
import nano from 'nano'
import Promise from 'bluebird'
import _ from 'lodash'
import { CLOUDANT_USERNAME, CLOUDANT_PASSWORD } from '../../config/server'

nano('https://jlc467.cloudant.com/').auth(CLOUDANT_USERNAME, CLOUDANT_PASSWORD, (err, body, headers) => {
  if (err) {
    return console.log(err)
  }

  if (headers && headers['set-cookie']) {
    console.log(headers['set-cookie'][0])
    const db = nano({ url : 'https://jlc467.cloudant.com/', cookie: headers['set-cookie'][0] }).use('swella')

    const saveZone = zone =>
      new Promise((resolve, reject) => {
        db.insert(Object.assign({ _id: zone.properties.ID.toLowerCase() }, zone ), (err, body) => {
          if (err) {
            console.log('error', zone.properties.ID.toLowerCase())
            return reject(err)
          }
          console.log('saved', zone.properties.ID.toLowerCase())
          return resolve(body)
        })
      })

    const saveAllZones = () => {
      const toResolve = _.map(geo.features, zone => () => saveZone(zone).reflect())
      Promise.mapSeries(toResolve, write => write()).then(
        result => console.log(result),
        reason => console.log(reason)
      )
    }
    saveAllZones()


  }
});




