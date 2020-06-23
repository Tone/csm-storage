import { Repository, Storage } from '@csm/core'
import { Arguments, Argv } from 'yargs'
import check from './check'
import Err from './err'
import inquirer, { QuestionCollection, Answers } from 'inquirer'
import path from 'path'
import fs from 'fs-extra'

export const command = 'patch <name> [dir]'
export const describe = 'Patch material'

export function builder(argv: Argv) {
  argv.positional('name', {
    describe: 'material name',
    type: 'string'
  })

  argv.positional('dir', {
    describe: 'Patch file dir',
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
  const dir = args.dir as string | undefined
  const repositoryName = args.repository as string | undefined
  const category = args.category as string | undefined

  let srcDir = process.cwd()
  if (dir !== undefined) {
    srcDir = path.resolve(srcDir, dir)
  }
  if (!fs.pathExistsSync(srcDir)) {
    throw new Err(`Patch dir ${srcDir} does not exists`)
  }

  if (repositoryName !== undefined && category !== undefined) {
    await initiative(name, repositoryName, category, srcDir)
  } else {
    await interactive(name, srcDir)
  }
}

async function interactive(name: string, dir: string) {
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
  const inputCategory = answers.category as string
  const inputRepository = answers.repositoryName as string

  await submit(name, dir, repository[inputRepository], inputCategory)
}

async function initiative(
  name: string,
  repositoryName: string,
  categoryName: string,
  srcDir: string
) {
  const repository = Repository.find(repositoryName)
  if (repository === null) {
    throw new Err(`repository ${repositoryName} does not does not exist`)
  }

  await submit(name, srcDir, repository, categoryName)
}

async function submit(
  name: string,
  srcDir: string,
  repository: Repository,
  categoryName: string
) {
  const repositoryName = repository.getConfig().repository
  const material = await repository.find(name, categoryName)
  if (material === null) {
    throw new Err(
      `No material ${name} was found in repository ${repositoryName}`
    )
  }

  const localAuthor = await Storage.storage().author()
  const author: string = material.config.author
  const materialName: string = material.config.name

  if (localAuthor !== author) {
    throw new Err(
      `Material ${materialName} author is ${author}, but local is ${localAuthor}`
    )
  }
  console.log(srcDir)
  await material.submit(srcDir)
}

export default {
  command,
  describe,
  builder,
  handler
}
