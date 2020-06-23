import { Repository, Storage } from '@csm/core'
import { Arguments, Argv } from 'yargs'
import check from './check'
import Err from './err'
import inquirer, { QuestionCollection, Answers } from 'inquirer'
import path from 'path'
import fs from 'fs-extra'

export const command = 'pick <name> [target]'
export const describe = 'Pick materials to project'

export function builder(argv: Argv) {
  argv.positional('name', {
    describe: 'material name',
    type: 'string'
  })

  argv.positional('target', {
    describe: 'target dir',
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
  const target = args.target as string
  const repositoryName = args.repository as string | undefined
  const category = args.category as string | undefined

  if (repositoryName !== undefined && category !== undefined) {
    await initiative(name, repositoryName, category, target)
  } else {
    await interactive(name, target)
  }
}

async function interactive(name: string, target?: string) {
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
    }
  ]

  const answers = await inquirer.prompt(question)
  const categoryName = answers.category as string
  const repositoryName = answers.repositoryName as string
  await pick(name, repository[repositoryName], categoryName, target)
}

async function pick(
  name: string,
  repository: Repository,
  categoryName: string,
  target?: string
) {
  const repositoryConfig = repository.getConfig()
  const category = repositoryConfig.category[categoryName]
  const repositoryName = repositoryConfig.repository

  let targetDir = target ?? category.position
  targetDir = path.isAbsolute(targetDir)
    ? targetDir
    : path.resolve(process.cwd(), targetDir)

  const material = await repository.find(name, categoryName)
  if (material === null) {
    throw new Err(
      `No material ${name} was found in repository ${repositoryName}`
    )
  }

  const dir = await material.getDir()
  if (!fs.pathExistsSync(dir)) {
    await Storage.storage().checkout([dir])
  }
  await material.pick(targetDir)
}

async function initiative(
  name: string,
  repositoryName: string,
  categoryName: string,
  target?: string
) {
  const repository = Repository.find(repositoryName)
  if (repository === null) {
    throw new Err(`repository ${repositoryName} does not does not exist`)
  }
  await pick(name, repository, categoryName, target)
}

export default {
  command,
  describe,
  builder,
  handler
}
