#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const figlet_1 = __importDefault(require("figlet"));
const yargs = __importStar(require("yargs"));
// TODO https://github.com/terkelg/prompts#readme
const inquirer_1 = __importDefault(require("inquirer"));
const err_1 = __importDefault(require("./err"));
const init_1 = __importDefault(require("./init"));
const pick_1 = __importDefault(require("./pick"));
const patch_1 = __importDefault(require("./patch"));
const publish_1 = __importDefault(require("./publish"));
const search_1 = __importDefault(require("./search"));
const submit_1 = __importDefault(require("./submit"));
const update_1 = __importDefault(require("./update"));
// eslint-disable-next-line @typescript-eslint/no-var-requires
const autocomplete = require('inquirer-autocomplete-prompt');
inquirer_1.default.registerPrompt('autocomplete', autocomplete);
console.log(chalk_1.default.yellow(figlet_1.default.textSync('CSM', { horizontalLayout: 'full' })));
const argv = yargs
    .command(init_1.default)
    .command(pick_1.default)
    .command(patch_1.default)
    .command(publish_1.default)
    .command(search_1.default)
    .command(submit_1.default)
    .command(update_1.default)
    .demandCommand(1)
    .help()
    .wrap(null)
    .fail((msg, err, yargs) => {
    if (err instanceof err_1.default) {
        console.log(chalk_1.default.bgRedBright(err.message));
        return;
    }
    console.error('You broke it!');
    console.error(msg !== null && msg !== void 0 ? msg : err);
    console.error('You should be doing', yargs.help());
    process.exit(1);
}).argv;
exports.default = argv;
