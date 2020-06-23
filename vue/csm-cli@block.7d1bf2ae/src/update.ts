import yargs from 'yargs'

import { Repository } from '@csm/core'
import update from '../src/update'
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
  update: jest.fn()
}

Repository.repositoryList = jest.fn().mockReturnValueOnce({ size: 0, repository: {} }).mockReturnValue({
  size: 1,
  repository: {
    test: repository
  }
})
Repository.find = jest.fn().mockReturnValueOnce(null).mockReturnValue(repository)

const command = yargs.command(update)

describe('command update should be right', () => {
  test('updateAllRepository should be right ', async () => {
    const args = command.parse([])

    await expect(update.handler(args)).rejects.toThrow(/No repository exist/)
    expect(check).toBeCalledTimes(1)
    expect(Repository.repositoryList).toBeCalledTimes(1)

    await expect(update.handler(args)).resolves.not.toThrow()
    expect(repository.getConfig).toBeCalledTimes(1)
    expect(repository.update).toBeCalledTimes(1)
  })

  test('searchInRepository should be right ', async () => {
    const args = command.parse(['--name', 'test'])

    await expect(update.handler(args)).rejects.toThrow(/repository .* does not does not exist/)
    expect(Repository.find).toBeCalledWith('test')

    repository.update = jest.fn()
    await expect(update.handler(args)).resolves.not.toThrow()
    expect(repository.update).toBeCalledTimes(1)
  })
})
