import db from './db';
import Promise from 'bluebird';
import _ from 'lodash';
import extent from "geojson-extent";
import { getZoneExtent } from './loadZoneExtents';

const getNearbyZones = ({ lat, long }) => new Promise((resolve, reject) => {
  const query = { g: `point(${long} ${lat})`, limit: 4, nearest: true, format: 'legacy' };

  db
    .geo('zone_polygons', 'zones', query)
    .then(zones => {
      if (!_.has(zones, 'features'))
        throw Error('No features found!');
      return resolve(zones.features);
    })
    .catch(err => {
      console.error(err);
      return reject({ message: 'Failed to retrieve nearby zones.' });
    });
});

const getNearbyZonesRequest = (req, res) => {
  if (!req.body || !req.body.coordinates || !req.body.coordinates.lat || !req.body.coordinates.long) {
    return res.status(409).send({ message: 'Request is missing coordinates needed to find nearby zones.' });
  }
  getNearbyZones(req.body.coordinates).then(result => res.send(result), reason => res.status(409).send(reason));
};

export default getNearbyZonesRequest;
