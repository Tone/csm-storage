import { Repository } from '@csm/core'
import { Arguments, Argv } from 'yargs'
import check from './check'
import Err from './err'
import ora from 'ora'

export const command = 'update [name]'
export const describe = 'Update repository'

export function builder(argv: Argv) {
  argv.positional('name', {
    describe: 'repository name',
    type: 'string'
  })

  return argv
}

export async function handler(args: Arguments) {
  await check()
  const name = args.name as string | undefined

  if (name === undefined) {
    await updateAllRepository()
    return
  }

  await updateByRepositoryName(name)
}

async function updateByRepositoryName(name: string) {
  const repository = Repository.find(name)
  if (repository === null) {
    throw new Err(`repository ${name} does not does not exist`)
  }
  const spinner = ora(`Updating  repository ${name}...`).start()
  await repository.update()
  spinner.succeed('Done')
}

async function updateAllRepository() {
  const repositories = Repository.repositoryList()
  if (repositories.size === 0) throw new Err('No repository exist')

  const spinner = ora('Updating...').start()

  const progress = Object.values(repositories.repository).map(
    async (repository) => {
      spinner.text = `Updating  repository ${
        repository.getConfig().repository
      }...`
      return await repository.update()
    }
  )

  await Promise.all(progress)
  spinner.succeed('Done')
}

export default {
  command,
  describe,
  builder,
  handler
}
