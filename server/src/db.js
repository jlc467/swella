import Cloudant from 'cloudant'
import Promise from 'bluebird'
import { CLOUDANT_USERNAME, CLOUDANT_PASSWORD, CLOUDANT_ACCOUNT } from './config'

const cloudant = Cloudant(
  {
    account: CLOUDANT_ACCOUNT,
    username: CLOUDANT_USERNAME,
    password: CLOUDANT_PASSWORD,
    plugin: 'promises'
  },
  (err, cloudant) => {
    if (err) {
      console.log(err)
    } else {
      console.log('Connected to Cloudant!')
    }
  }
)

const db = cloudant.db.use("swella")

export default db
