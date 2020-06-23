import { Arguments, Argv, CommandModule } from 'yargs'
import { Storage } from '@csm/core'
import fs from 'fs-extra'
import { CONF_FILE } from './config'

class Init implements CommandModule {
  readonly command = 'init [storageDir]'
  readonly describe = 'Init local storage'
  builder(argv: Argv) {
    argv.positional('storageDir', {
      describe: 'local storage dir',
      type: 'string'
    })

    argv.options({
      remote: {
        alias: 'r',
        type: 'string',
        describe: 'remote repository url',
        require: false
      }
    })
    return argv
  }

  async handler(args: Arguments) {
    const storageDir = args.storageDir as string
    const remoteUrl = args.remote as string
    const { dir } = await Storage.init(storageDir, remoteUrl)
    await fs.writeJSON(CONF_FILE, { dir })
  }
}

export default new Init()
