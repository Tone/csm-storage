"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@csm/core");
const check_1 = __importDefault(require("./check"));
const err_1 = __importDefault(require("./err"));
const ora_1 = __importDefault(require("ora"));
exports.command = 'update [name]';
exports.describe = 'Update repository';
function builder(argv) {
    argv.positional('name', {
        describe: 'repository name',
        type: 'string'
    });
    return argv;
}
exports.builder = builder;
function handler(args) {
    return __awaiter(this, void 0, void 0, function* () {
        yield check_1.default();
        const name = args.name;
        if (name === undefined) {
            yield updateAllRepository();
            return;
        }
        yield updateByRepositoryName(name);
    });
}
exports.handler = handler;
function updateByRepositoryName(name) {
    return __awaiter(this, void 0, void 0, function* () {
        const repository = core_1.Repository.find(name);
        if (repository === null) {
            throw new err_1.default(`repository ${name} does not does not exist`);
        }
        const spinner = ora_1.default(`Updating  repository ${name}...`).start();
        yield repository.update();
        spinner.succeed('Done');
    });
}
function updateAllRepository() {
    return __awaiter(this, void 0, void 0, function* () {
        const repositories = core_1.Repository.repositoryList();
        if (repositories.size === 0)
            throw new err_1.default('No repository exist');
        const spinner = ora_1.default('Updating...').start();
        const progress = Object.values(repositories.repository).map((repository) => __awaiter(this, void 0, void 0, function* () {
            spinner.text = `Updating  repository ${repository.getConfig().repository}...`;
            return yield repository.update();
        }));
        yield Promise.all(progress);
        spinner.succeed('Done');
    });
}
exports.default = {
    command: exports.command,
    describe: exports.describe,
    builder,
    handler
};
