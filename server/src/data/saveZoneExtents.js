import db from '../db'
import Promise from 'bluebird'
import _ from 'lodash'
import extent from 'geojson-extent'


const handleSave = doc =>
  new Promise((resolve, reject) => {
    db.insert(doc).then(
      result => {
        console.log(`Saved ${doc._id}!`)
        return resolve(result)
      }
    ).catch(err => {
      console.error(`Error Saving ${doc._id}`, err)
      return reject(err)
    })
  })

/**
 * calculate and save zone extents to geojson shape
 */
const saveZoneExtents = () =>
  new Promise((resolve, reject) => {
    db.list({ include_docs: true }).then(
      data => {
        const toSave = _.reduce(data.rows, (final, { doc }) => {
          if (doc._id.indexOf('_design') === -1) {
            final.push(() => handleSave(extent.bboxify(doc)).reflect())
          }
          return final
        }, [])
        Promise.mapSeries(toSave, s => s()).then(
          result => console.log(result),
          reason => console.error(reason)
        )
    }).catch(err => {
      console.error('error saveZoneExtents', err);
    })
  })

saveZoneExtents()