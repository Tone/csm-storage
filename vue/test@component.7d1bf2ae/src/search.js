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
const chalk_1 = __importDefault(require("chalk"));
exports.command = 'search <name>';
exports.describe = 'Search material';
function builder(argv) {
    argv.positional('name', {
        describe: 'material name',
        type: 'string'
    });
    argv.options({
        repository: {
            alias: 'r',
            type: 'string',
            describe: 'repository name',
            require: false
        },
        category: {
            alias: 'c',
            type: 'string',
            describe: 'category name',
            require: false
        }
    });
    return argv;
}
exports.builder = builder;
function handler(args) {
    return __awaiter(this, void 0, void 0, function* () {
        yield check_1.default();
        const name = args.name;
        const repositoryName = args.repository;
        const categoryName = args.category;
        if (repositoryName === undefined) {
            yield searchAllRepository(name, categoryName);
        }
        else {
            yield searchInRepository(name, repositoryName, categoryName);
        }
    });
}
exports.handler = handler;
function searchAllRepository(name, categoryName) {
    return __awaiter(this, void 0, void 0, function* () {
        const repositories = Object.values(core_1.Repository.repositoryList().repository);
        if (repositories.length === 0)
            throw new err_1.default('No repository exist');
        const spinner = ora_1.default('Searching...').start();
        const progress = repositories.map((repository) => __awaiter(this, void 0, void 0, function* () {
            spinner.text = `Searching ${repository.getConfig().repository}`;
            return yield repository.searchMaterial(name, categoryName);
        }));
        const result = yield Promise.all(progress);
        spinner.succeed('Done');
        if (result.flat().length === 0)
            throw new err_1.default('No results in all repository');
        result.forEach((repo, index) => {
            const repositoryName = repositories[index].getConfig().repository;
            repo.forEach((r) => {
                const record = core_1.History.transform(r);
                const name = record.name;
                const category = record.category;
                const author = record.author;
                console.log(`${chalk_1.default.green(name)} in repository ${repositoryName} category ${category} by ${author}`);
            });
        });
    });
}
function searchInRepository(name, repositoryName, categoryName) {
    return __awaiter(this, void 0, void 0, function* () {
        const repository = core_1.Repository.find(repositoryName);
        if (repository === null) {
            throw new err_1.default(`repository ${repositoryName} does not does not exist`);
        }
        const spinner = ora_1.default(`Searching ${name} in repository ${repositoryName}`).start();
        const result = yield repository.searchMaterial(name, categoryName);
        spinner.succeed('Done');
        if (result.length === 0)
            throw new err_1.default(`No results in ${repositoryName}`);
        result.forEach((r) => {
            const record = core_1.History.transform(r);
            const name = record.name;
            const category = record.category;
            const author = record.author;
            console.log(`${chalk_1.default.green(name)} in category ${category} by ${author}`);
        });
    });
}
exports.default = {
    command: exports.command,
    describe: exports.describe,
    builder,
    handler
};
