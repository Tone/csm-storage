#!/usr/bin/env node
import chalk from 'chalk'
import figlet from 'figlet'
import * as yargs from 'yargs'

// TODO https://github.com/terkelg/prompts#readme
import inquirer from 'inquirer'

import CliErr from './err'
import init from './init'
import pick from './pick'
import patch from './patch'
import publish from './publish'
import search from './search'
import submit from './submit'
import update from './update'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const autocomplete = require('inquirer-autocomplete-prompt')

inquirer.registerPrompt('autocomplete', autocomplete)

console.log(chalk.yellow(figlet.textSync('CSM', { horizontalLayout: 'full' })))

const argv = yargs
  .command(init)
  .command(pick)
  .command(patch)
  .command(publish)
  .command(search)
  .command(submit)
  .command(update)
  .demandCommand(1)
  .help()
  .wrap(null)
  .fail((msg, err: Error | CliErr, yargs) => {
    if (err instanceof CliErr) {
      console.log(chalk.bgRedBright(err.message))
      return
    }
    console.error('You broke it!')
    console.error(msg ?? err)
    console.error('You should be doing', yargs.help())
    process.exit(1)
  }).argv

export default argv
