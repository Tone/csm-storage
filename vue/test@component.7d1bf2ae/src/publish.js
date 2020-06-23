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
const inquirer_1 = __importDefault(require("inquirer"));
exports.command = 'publish [name]';
exports.describe = 'Publish material to repository';
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
        const category = args.category;
        if (name === undefined) {
            return yield core_1.Storage.storage().push();
        }
        if (repositoryName !== undefined && category !== undefined) {
            yield initiative(repositoryName, category, name);
        }
        else {
            yield interactive(name);
        }
    });
}
exports.handler = handler;
function interactive(name) {
    return __awaiter(this, void 0, void 0, function* () {
        const { size, repository } = core_1.Repository.repositoryList();
        if (size === 0) {
            throw new err_1.default('No repository exist');
        }
        const question = [
            {
                type: 'autocomplete',
                name: 'repositoryName',
                message: 'Choose repository',
                source: (_, input) => __awaiter(this, void 0, void 0, function* () {
                    return Object.keys(repository).filter((repositoryName) => repositoryName.includes(input));
                })
            },
            {
                type: 'autocomplete',
                name: 'category',
                message: 'Choose category',
                source: (answer, input) => __awaiter(this, void 0, void 0, function* () {
                    const repositoryName = answer.repositoryName;
                    const repo = repository[repositoryName];
                    return Object.keys(repo.getConfig().category).filter((c) => c.includes(input));
                })
            },
            {
                type: 'input',
                name: 'name',
                default: name,
                message: 'Material name',
                validate: (name, answers) => __awaiter(this, void 0, void 0, function* () {
                    const repositoryName = answers.repositoryName;
                    const categoryName = answers.category;
                    const repo = repository[repositoryName];
                    const record = yield repo.searchMaterial(name, categoryName);
                    if (record.length !== 0)
                        return true;
                    return `Material ${name} does not exists`;
                })
            }
        ];
        const answers = yield inquirer_1.default.prompt(question);
        const inputName = answers.name;
        const inputCategory = answers.category;
        const inputRepository = answers.repositoryName;
        yield publish(repository[inputRepository], inputCategory, inputName);
    });
}
function initiative(repositoryName, categoryName, name) {
    return __awaiter(this, void 0, void 0, function* () {
        const repository = core_1.Repository.find(repositoryName);
        if (repository === null) {
            throw new err_1.default(`repository ${repositoryName} does not does not exist`);
        }
        yield publish(repository, categoryName, name);
    });
}
function publish(repository, categoryName, name) {
    return __awaiter(this, void 0, void 0, function* () {
        const repositoryName = repository.getConfig().repository;
        const record = yield repository.searchMaterial(name, categoryName);
        if (record.length === 0) {
            throw new err_1.default(`No material ${name} was found in repository ${repositoryName}`);
        }
        const commitHash = core_1.History.transform(record[0]).commitID;
        const storage = core_1.Storage.storage();
        yield storage.push(commitHash);
    });
}
exports.default = {
    command: exports.command,
    describe: exports.describe,
    builder,
    handler
};
