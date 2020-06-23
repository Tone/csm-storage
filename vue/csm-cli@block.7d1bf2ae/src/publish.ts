import yargs from 'yargs'

import { Storage, Repository, History } from '@csm/core'
import publish from '../src/publish'
import check from '../src/check'
import inquirer from 'inquirer'

jest.mock('@csm/core')
jest.mock('../src/check', () => jest.fn().mockResolvedValue(true))
jest.mock('inquirer')

History.transform = jest.fn().mockReturnValue({
  commitID: 'test'
})

inquirer.prompt = (jest.fn().mockResolvedValue({
  category: 'test',
  repositoryName: 'test'
})) as unknown as inquirer.PromptModule

const storage = {
  push: jest.fn()
}

Storage.storage = jest.fn().mockReturnValue(storage)

const repository = {
  getConfig: jest.fn().mockReturnValue({}),
  searchMaterial: jest.fn().mockReturnValueOnce([]).mockReturnValue([[]])
}
Repository.repositoryList = jest.fn().mockReturnValueOnce({ size: 0 }).mockReturnValue({
  size: 1,
  repository: {
    test: repository
  }
})
Repository.find = jest.fn().mockReturnValueOnce(null).mockReturnValue(repository)

const command = yargs.command(publish)

describe('command publish should be right', () => {
  test('all push should be right', async () => {
    const args = command.parse()
    await expect(publish.handler(args)).resolves.not.toThrow()
    expect(storage.push).toBeCalledWith()
    expect(check).toBeCalledTimes(1)
  })

  test('initiative publish should be right ', async () => {
    const args = command.parse(['--name', 'test', '--repository', 'test', '--category', 'test'])

    await expect(publish.handler(args)).rejects.toThrow(/repository .* does not does not exist/)
    expect(Repository.find).toBeCalledWith('test')

    await expect(publish.handler(args)).rejects.toThrow(/No material/)
    expect(repository.searchMaterial).toBeCalledWith('test', 'test')
    expect(repository.getConfig).toBeCalledTimes(1)

    await expect(publish.handler(args)).resolves.not.toThrow()
    expect(History.transform).toBeCalledWith([])
    expect(storage.push).toBeCalledWith('test')
  })

  test('interactive publish should be right ', async () => {
    const args = command.parse(['--name', 'test', '--target', '/test'])
    await expect(publish.handler(args)).rejects.toThrow(/No repository exist/)
    expect(Repository.repositoryList).toBeCalledTimes(1)
    await expect(publish.handler(args)).resolves.not.toThrow()
    expect(Repository.repositoryList).toBeCalledTimes(2)

    expect(inquirer.prompt).toBeCalledTimes(1)
    expect(repository.searchMaterial).toBeCalledWith('test', 'test')
    expect(History.transform).toBeCalledWith([])
    expect(storage.push).toBeCalledWith('test')
  })
})
