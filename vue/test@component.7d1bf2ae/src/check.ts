import { Storage } from '@csm/core'
import path from 'path'
import fs from 'fs-extra'

import '../src/config'
import check from '../src/check'

const testDir = path.resolve(__dirname, 'test_dir')
const testFile = path.resolve(testDir, '.csm.conf')

jest.mock('@csm/core')
jest.mock('../src/config', () => ({
  CONF_FILE: path.resolve(__dirname, 'test_dir/.csm.conf'),
  ERR_NAME: 'CLI_ERR'
}))

Storage.check = jest.fn()
Storage.init = jest.fn()

test('command pre check should be right', async () => {
  await expect(check()).rejects.toThrowError(/dir is not set/)
  fs.outputJSONSync(testFile, {})
  await expect(check()).rejects.toThrowError(/dir is not set/)

  fs.outputJSONSync(testFile, { dir: 'tes' })
  await expect(check()).resolves.not.toThrow()
  expect(Storage.check).toBeCalledTimes(1)
  expect(Storage.init).toBeCalledTimes(1)

  Storage.check = jest.fn().mockRejectedValue(new Error('storage check err'))
  await expect(check()).rejects.toThrowError(/storage check err/)
  fs.removeSync(testDir)
})
