import yargs from 'yargs'

import { Storage, Repository, Material } from '@csm/core'
import submit from '../src/submit'
import check from '../src/check'
import inquirer from 'inquirer'
import path from 'path'
import fs from 'fs-extra'
import { mocked } from 'ts-jest/utils'

jest.mock('@csm/core')
jest.mock('../src/check', () => jest.fn().mockResolvedValue(true))
jest.mock('inquirer')
jest.mock('fs-extra')

inquirer.prompt = (jest.fn().mockResolvedValue({
  repositoryName: 'test'
})) as unknown as inquirer.PromptModule

const storage = {
  author: jest.fn()
}
Storage.storage = jest.fn().mockReturnValue(storage)

const material = {
  submit: jest.fn()
}

const repository = {}
Repository.repositoryList = jest.fn().mockReturnValueOnce({ size: 0 }).mockReturnValue({
  size: 1,
  repository: {
    test: repository
  }
})

const command = yargs.command(submit)

describe('command submit should be right', () => {
  test('submit file dir should be right ', async () => {
    let args = command.parse(['--dir', 'test'])

    fs.pathExistsSync = jest.fn().mockReturnValue(false)
    await expect(submit.handler(args)).rejects.toThrow(/dir .* does not exists/)
    expect(check).toBeCalledTimes(1)
    expect(fs.pathExistsSync).toBeCalledWith(path.resolve(process.cwd(), 'test'))

    args = command.parse([])
    await expect(submit.handler(args)).rejects.toThrow(/dir .* does not exists/)
    expect(fs.pathExistsSync).toBeCalledWith(process.cwd())
  })

  test('submit info should be right ', async () => {
    fs.pathExistsSync = jest.fn().mockReturnValue(true)
    const args = command.parse(['--dir', 'test'])
    await expect(submit.handler(args)).rejects.toThrow(/No repository exist/)
    expect(Repository.repositoryList).toBeCalledTimes(1)

    const materialFn = jest.fn().mockReturnValue(material)
    mocked(Material).mockImplementation(materialFn)
    await expect(submit.handler(args)).resolves.not.toThrow()
    expect(storage.author).toBeCalledTimes(1)
    expect(inquirer.prompt).toBeCalledTimes(1)
    expect(materialFn).toBeCalledWith(repository, { author: undefined, category: undefined, description: undefined, inject: undefined, name: undefined, package: undefined, repository: 'test', tags: undefined })
    expect(material.submit).toBeCalledWith(path.resolve(process.cwd(), 'test'))
  })
})
