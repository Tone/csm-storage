import { Storage } from '@csm/core'
import { CONF_FILE } from './config'
import fs from 'fs-extra'
import Err from './err'

export default async function () {
  if (!fs.pathExistsSync(CONF_FILE)) {
    throw new Err('local storage dir is not set, please run init first')
  } else {
    const { dir } = fs.readJsonSync(CONF_FILE)
    if (dir === undefined || dir === '') throw new Err('local storage dir is not set, please run init first')
    try {
      await Storage.check(dir)
      await Storage.init(dir)
    } catch (e) {
      if (e?.message !== undefined) {
        throw new Err(e.message)
      }
      throw e
    }
  }
}
