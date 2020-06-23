import { Repository, History } from '@csm/core'
import { Arguments, Argv } from 'yargs'
import check from './check'
import Err from './err'
import ora from 'ora'
import chalk from 'chalk'

export const command = 'search <name>'
export const describe = 'Search material'

export function builder(argv: Argv) {
  argv.positional('name', {
    describe: 'material name',
    type: 'string'
  })

  argv.options({
    repository: {
      alias: 'r',
      type: 'string',
      describe: 'repository name',
      require: false
    },
    category: {
      alias: 'c',
      type: 'string',
      describe: 'category name',
      require: false
    }
  })
  return argv
}

export async function handler(args: Arguments) {
  await check()
  const name = args.name as string
  const repositoryName = args.repository as string | undefined
  const categoryName = args.category as string | undefined

  if (repositoryName === undefined) {
    await searchAllRepository(name, categoryName)
  } else {
    await searchInRepository(name, repositoryName, categoryName)
  }
}

async function searchAllRepository(name: string, categoryName?: string) {
  const repositories = Object.values(Repository.repositoryList().repository)
  if (repositories.length === 0) throw new Err('No repository exist')

  const spinner = ora('Searching...').start()
  const progress = repositories.map(async (repository) => {
    spinner.text = `Searching ${repository.getConfig().repository}`
    return await repository.searchMaterial(name, categoryName)
  })

  const result = await Promise.all(progress)
  spinner.succeed('Done')

  if (result.flat().length === 0) throw new Err('No results in all repository')

  result.forEach((repo, index) => {
    const repositoryName: string = repositories[index].getConfig().repository
    repo.forEach((r) => {
      const record = History.transform(r)
      const name: string = record.name
      const category: string = record.category
      const author: string = record.author

      console.log(
        `${chalk.green(
          name
        )} in repository ${repositoryName} category ${category} by ${author}`
      )
    })
  })
}

async function searchInRepository(
  name: string,
  repositoryName: string,
  categoryName?: string
) {
  const repository = Repository.find(repositoryName)
  if (repository === null) {
    throw new Err(`repository ${repositoryName} does not does not exist`)
  }
  const spinner = ora(
    `Searching ${name} in repository ${repositoryName}`
  ).start()
  const result = await repository.searchMaterial(name, categoryName)
  spinner.succeed('Done')
  if (result.length === 0) throw new Err(`No results in ${repositoryName}`)

  result.forEach((r) => {
    const record = History.transform(r)
    const name: string = record.name
    const category: string = record.category
    const author: string = record.author

    console.log(`${chalk.green(name)} in category ${category} by ${author}`)
  })
}

export default {
  command,
  describe,
  builder,
  handler
}
