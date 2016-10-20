import db from './db'
import Promise from 'bluebird'
import _ from 'lodash'


let zoneExtents = null

export const getZoneExtent = zoneId => zoneExtents[zoneId]

/**
 * store load extents in memory
 */
const loadZoneExtents = () =>
  new Promise((resolve, reject) => {
    db.view('zone_polygons', 'getBbox', {}).then(
      data => {
        zoneExtents = _.reduce(data.rows, (final, { key, value }) => {
          final[key] = value
          return final
        }, {})
        return resolve()
    }).catch(err => {
      return reject(err)
    })
  })

export default loadZoneExtents