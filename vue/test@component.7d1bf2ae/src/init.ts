import yargs from 'yargs'
import path from 'path'
import fs from 'fs-extra'

import { Storage } from '@csm/core'
import { CONF_FILE } from '../src/config'
import init from '../src/init'

const testDir = path.resolve(__dirname, 'test_dir_init')

jest.mock('@csm/core')
jest.mock('../src/config', () => ({
  CONF_FILE: path.resolve(__dirname, 'test_dir_init/.csm.conf'),
  ERR_NAME: 'CLI_ERR'
}))

const testConfig = { dir: 'test_dir_init' }
Storage.init = jest.fn().mockReturnValue(testConfig)
const command = yargs.command(init)

test('command init should be right', async () => {
  fs.ensureFileSync(CONF_FILE)
  let args = command.parse()
  await expect(init.handler(args)).resolves.not.toThrow()
  expect(Storage.init).toBeCalledWith(undefined, undefined)

  args = command.parse(['--storageDir', 's', '--remote', 'r'])
  await init.handler(args)
  expect(Storage.init).toBeCalledWith('s', 'r')
  expect(fs.readJSONSync(CONF_FILE)).toEqual(testConfig)

  fs.removeSync(testDir)
})
