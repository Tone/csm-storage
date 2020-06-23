import yargs from 'yargs'

import { Storage, Repository } from '@csm/core'
import pick from '../src/pick'
import check from '../src/check'
import inquirer from 'inquirer'
import path from 'path'

jest.mock('@csm/core')
jest.mock('../src/check', () => jest.fn().mockResolvedValue(true))
jest.mock('inquirer')

inquirer.prompt = (jest.fn().mockResolvedValue({
  category: 'test',
  repositoryName: 'test'
})) as unknown as inquirer.PromptModule

const storage = {
  checkout: jest.fn()
}

Storage.storage = jest.fn().mockReturnValue(storage)

const material = {
  pick: jest.fn(),
  getDir: jest.fn().mockReturnValueOnce('test').mockReturnValue(__dirname)
}

const repositoryConfig = {
  category: {
    test: {
      position: 'category_test'
    }
  }
}

const repository = {
  getConfig: jest.fn().mockReturnValue(repositoryConfig),
  find: jest.fn().mockReturnValueOnce(null).mockReturnValue(material)
}
Repository.repositoryList = jest.fn().mockReturnValueOnce({ size: 0 }).mockReturnValue({
  size: 1,
  repository: {
    test: repository
  }
})
Repository.find = jest.fn().mockReturnValueOnce(null).mockReturnValue(repository)

const command = yargs.command(pick)

describe('command pick should be right', () => {
  test('initiative pick should be right ', async () => {
    const args = command.parse(['--name', 'test', '--repository', 'test', '--category', 'test'])

    await expect(pick.handler(args)).rejects.toThrow(/repository .* does not does not exist/)
    expect(check).toBeCalledTimes(1)
    expect(Repository.find).toBeCalledWith('test')

    await expect(pick.handler(args)).rejects.toThrow(/No material/)
    expect(repository.find).toBeCalledWith('test', 'test')
    expect(repository.getConfig).toBeCalledTimes(1)
    await expect(pick.handler(args)).resolves.not.toThrow()
    expect(material.getDir).toBeCalled()
    expect(storage.checkout).toBeCalledWith(['test'])
    expect(material.pick).toBeCalledTimes(1)
    await expect(pick.handler(args)).resolves.not.toThrow()
    expect(storage.checkout).toBeCalledTimes(1)
    expect(material.pick).toBeCalledWith(path.resolve(process.cwd(), 'category_test'))
  })

  test('interactive pick should be right ', async () => {
    const args = command.parse(['--name', 'test', '--target', '/test'])
    await expect(pick.handler(args)).rejects.toThrow(/No repository exist/)
    expect(Repository.repositoryList).toBeCalledTimes(1)
    await expect(pick.handler(args)).resolves.not.toThrow()
    expect(Repository.repositoryList).toBeCalledTimes(2)
    expect(inquirer.prompt).toBeCalledTimes(1)
    expect(repository.find).toBeCalledWith('test', 'test')
    expect(repository.getConfig).toBeCalled()
    expect(material.pick).toBeCalledWith('/test')
  })
})
