import { Repository, Material, MaterialConfig, Storage } from '@csm/core'
import { Arguments, Argv } from 'yargs'
import check from './check'
import Err from './err'
import inquirer, { QuestionCollection, Answers } from 'inquirer'
import path from 'path'
import fs from 'fs-extra'

export const command = 'submit [dir]'
export const describe = 'Submit material to storage'

export function builder(argv: Argv) {
  argv.positional('dir', {
    describe: 'material dir',
    type: 'string'
  })
  return argv
}

export async function handler(args: Arguments) {
  await check()
  const dir = args.dir as string | undefined

  let srcDir = process.cwd()
  if (dir !== undefined) {
    srcDir = path.resolve(srcDir, dir)
  }

  if (!fs.pathExistsSync(srcDir)) throw new Err(`dir ${srcDir} does not exists`)

  await interactive(srcDir)
}

async function interactive(dir: string) {
  const { size, repository } = Repository.repositoryList()

  if (size === 0) {
    throw new Err('No repository exist')
  }

  const materialName = path.dirname(dir).split('/').pop()
  const author = await Storage.storage().author()

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
      message: 'Material name',
      default: materialName,
      validate: async (name: string, answers: Answers) => {
        const repositoryName = answers.repositoryName as string
        const categoryName = answers.category as string

        const repo = repository[repositoryName]
        const record = await repo.searchMaterial(name, categoryName)
        if (record.length === 0) return true
        return `Material ${name} already exists`
      },
      require: true
    },
    {
      type: 'input',
      name: 'description',
      message: 'Material description',
      require: false
    },
    {
      type: 'input',
      name: 'tags',
      message: 'Material tags, separated by commas',
      require: false,
      filter: (tags = '') => tags.split(',')
    },
    {
      type: 'editor',
      name: 'inject',
      message: 'Material inject',
      default: '',
      require: false
    },
    {
      type: 'input',
      name: 'packages',
      message: 'Material packages, separated by space name@version',
      filter: (packages = '') =>
        packages === ''
          ? []
          : packages.split(' ').map((p: string) => p.split('@')),
      require: false
    }
  ]

  const answers = await inquirer.prompt(question)
  const inputName = answers.name as string
  const inputCategory = answers.category as string
  const inputRepository = answers.repositoryName as string

  const config: MaterialConfig = {
    repository: inputRepository,
    name: inputName,
    category: inputCategory,
    description: answers.description,
    author,
    tags: answers.tags,
    inject: answers.inject,
    package: answers.packages
  }

  await submit(dir, repository[inputRepository], config)
}

async function submit(
  srcDir: string,
  repository: Repository,
  config: MaterialConfig
) {
  const material = await new Material(repository, config)
  await material.submit(srcDir)
}

export default {
  command,
  describe,
  builder,
  handler
}
