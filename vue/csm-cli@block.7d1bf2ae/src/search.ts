import yargs from 'yargs'

import { Repository, History } from '@csm/core'
import search from '../src/search'
import check from '../src/check'

jest.spyOn(console, 'log').mockImplementation()

jest.mock('@csm/core')
jest.mock('../src/check', () => jest.fn().mockResolvedValue(true))
jest.mock('ora', () => jest.fn().mockReturnValue({
  start: jest.fn().mockReturnValue({ succeed: jest.fn() }),
  stop: jest.fn()
}))

const repositoryConfig = {
  repository: 'test'
}

const repository = {
  getConfig: jest.fn().mockReturnValue(repositoryConfig),
  searchMaterial: jest.fn().mockResolvedValue([['test']])
}

Repository.repositoryList = jest.fn().mockReturnValueOnce({ size: 0, repository: {} }).mockReturnValue({
  size: 1,
  repository: {
    test: repository
  }
})
Repository.find = jest.fn().mockReturnValueOnce(null).mockReturnValue(repository)

History.transform = jest.fn().mockReturnValue({})

const command = yargs.command(search)

describe('command search should be right', () => {
  test('searchAllRepository should be right ', async () => {
    const args = command.parse(['--name', 'test'])

    await expect(search.handler(args)).rejects.toThrow(/No repository exist/)
    expect(check).toBeCalledTimes(1)
    expect(Repository.repositoryList).toBeCalledTimes(1)

    repository.searchMaterial = jest.fn().mockResolvedValue([])
    await expect(search.handler(args)).rejects.toThrow(/No results in all repository/)
    expect(repository.searchMaterial).toBeCalledWith('test', undefined)

    repository.searchMaterial = jest.fn().mockResolvedValue([['test']])
    await expect(search.handler(args)).resolves.not.toThrow()
    expect(repository.getConfig).toReturnWith(repositoryConfig)
    expect(History.transform).toBeCalledWith(['test'])
  })

  test('searchInRepository should be right ', async () => {
    const args = command.parse(['--name', 'test', '--repository', 'test', '--category', 'test'])

    await expect(search.handler(args)).rejects.toThrow(/repository .* does not does not exist/)
    expect(Repository.find).toBeCalledWith('test')

    repository.searchMaterial = jest.fn().mockResolvedValue([])
    await expect(search.handler(args)).rejects.toThrow(/No results in/)
    expect(repository.searchMaterial).toBeCalledWith('test', 'test')

    repository.searchMaterial = jest.fn().mockResolvedValue([['test']])
    await expect(search.handler(args)).resolves.not.toThrow()
    expect(History.transform).toBeCalledWith(['test'])
  })
})
