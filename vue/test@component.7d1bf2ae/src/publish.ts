import { Repository, Storage, History } from '@csm/core'
import { Arguments, Argv } from 'yargs'
import check from './check'
import Err from './err'
import inquirer, { QuestionCollection, Answers } from 'inquirer'

export const command = 'publish [name]'
export const describe = 'Publish material to repository'

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
  const name = args.name as string | undefined
  const repositoryName = args.repository as string | undefined
  const category = args.category as string | undefined

  if (name === undefined) {
    return await Storage.storage().push()
  }

  if (repositoryName !== undefined && category !== undefined) {
    await initiative(repositoryName, category, name)
  } else {
    await interactive(name)
  }
}

async function interactive(name?: string) {
  const { size, repository } = Repository.repositoryList()

  if (size === 0) {
    throw new Err('No repository exist')
  }

  const question: QuestionCollection = [
    {
      type: 'autocomplete',
      name: 'repositoryName',
      message: 'Choose repository',
      source: async (_: Answers, input: string) => {
        return Object.keys(repository).filter((repositoryName) =>
          repositoryName.includes(input)
        )
      }
    },
    {
      type: 'autocomplete',
      name: 'category',
      message: 'Choose category',
      source: async (answer: Answers, input: string) => {
        const repositoryName = answer.repositoryName as string
        const repo = repository[repositoryName]
        return Object.keys(repo.getConfig().category).filter((c) =>
          c.includes(input)
        )
      }
    },
    {
      type: 'input',
      name: 'name',
      default: name,
      message: 'Material name',
      validate: async (answers: Answers) => {
        const repositoryName = answers.repositoryName as string
        const categoryName = answers.category as string
        const name = answers.name as string
        const repo = repository[repositoryName]
        const record = await repo.searchMaterial(name, categoryName)
        if (record.length !== 0) return true
        return `Material ${name} does not exists`
      }
    }
  ]

  const answers = await inquirer.prompt(question)
  const inputName = answers.name as string
  const inputCategory = answers.category as string
  const inputRepository = answers.repositoryName as string

  await publish(repository[inputRepository], inputCategory, inputName)
}

async function initiative(
  repositoryName: string,
  categoryName: string,
  name: string
) {
  const repository = Repository.find(repositoryName)
  if (repository === null) {
    throw new Err(`repository ${repositoryName} does not does not exist`)
  }

  await publish(repository, categoryName, name)
}

async function publish(
  repository: Repository,
  categoryName: string,
  name: string
) {
  const repositoryName = repository.getConfig().repository
  const record = await repository.searchMaterial(name, categoryName)

  if (record.length === 0) {
    throw new Err(
      `No material ${name} was found in repository ${repositoryName}`
    )
  }

  const commitHash = History.transform(record[0]).commitID
  await Storage.storage().push(commitHash)
}

export default {
  command,
  describe,
  builder,
  handler
}
