import { ERR_NAME } from './config'

export default class CliErr extends Error {
  message: string
  name = ERR_NAME

  constructor(message: string) {
    super()
    this.message = message
  }
}
