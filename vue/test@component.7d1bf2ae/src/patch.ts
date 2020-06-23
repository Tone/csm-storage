import yargs from 'yargs'

import { Storage, Repository } from '@csm/core'
import patch from '../src/patch'
import check from '../src/check'
import inquirer from 'inquirer'

jest.mock('@csm/core')
jest.mock('../src/check', () => jest.fn().mockResolvedValue(true))
jest.mock('inquirer')

inquirer.prompt = (jest.fn().mockResolvedValue({
  category: 'test',
  repositoryName: 'test'
})) as unknown as inquirer.PromptModule

const storage = {
  author: jest.fn().mockResolvedValueOnce('test').mockResolvedValue('author')
}

Storage.storage = jest.fn().mockReturnValue(storage)

const submitFn = jest.fn()
const repository = {
  getConfig: jest.fn().mockReturnValue({}),
  find: jest.fn().mockReturnValueOnce(null).mockReturnValue({
    config: {
      author: 'author',
      name: 'test'
    },
    submit: submitFn
  })
}
Repository.repositoryList = jest.fn().mockReturnValueOnce({ size: 0 }).mockReturnValue({
  size: 1,
  repository: {
    test: repository
  }
})
Repository.find = jest.fn().mockReturnValueOnce(null).mockReturnValue(repository)

const command = yargs.command(patch)

describe('command patch  should be right', () => {
  test('throw should be right ', async () => {
    const args = command.parse(['--name', 'test', '--dir', 'test'])
    await expect(patch.handler(args)).rejects.toThrow(/Patch dir .* does not exists/)
    expect(check).toBeCalledTimes(1)
  })

  test('initiative submit should be right ', async () => {
    const args = command.parse(['--name', 'test', '--repository', 'test', '--category', 'test'])

    await expect(patch.handler(args)).rejects.toThrow(/repository .* does not does not exist/)
    expect(Repository.find).toBeCalledWith('test')

    await expect(patch.handler(args)).rejects.toThrow(/No material/)
    expect(repository.find).toBeCalledWith('test', 'test')
    expect(repository.getConfig).toBeCalledTimes(1)

    await expect(patch.handler(args)).rejects.toThrow(/author is /)

    await expect(patch.handler(args)).resolves.not.toThrow()
    expect(submitFn).toBeCalledWith(process.cwd())
  })

  test('interactive submit should be right ', async () => {
    const args = command.parse(['--name', 'test'])
    await expect(patch.handler(args)).rejects.toThrow(/No repository exist/)
    expect(Repository.repositoryList).toBeCalledTimes(1)
    await expect(patch.handler(args)).resolves.not.toThrow()
    expect(Repository.repositoryList).toBeCalledTimes(2)
    expect(inquirer.prompt).toBeCalledTimes(1)
    expect(repository.find).toBeCalledWith('test', 'test')
    expect(repository.getConfig).toBeCalled()
    expect(submitFn).toBeCalledWith(process.cwd())
  })
})
