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
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
exports.command = 'submit [dir]';
exports.describe = 'Submit material to storage';
function builder(argv) {
    argv.positional('dir', {
        describe: 'material dir',
        type: 'string'
    });
    return argv;
}
exports.builder = builder;
function handler(args) {
    return __awaiter(this, void 0, void 0, function* () {
        yield check_1.default();
        const dir = args.dir;
        let srcDir = process.cwd();
        if (dir !== undefined) {
            srcDir = path_1.default.resolve(srcDir, dir);
        }
        if (!fs_extra_1.default.pathExistsSync(srcDir))
            throw new err_1.default(`dir ${srcDir} does not exists`);
        yield interactive(srcDir);
    });
}
exports.handler = handler;
function interactive(dir) {
    return __awaiter(this, void 0, void 0, function* () {
        const { size, repository } = core_1.Repository.repositoryList();
        if (size === 0) {
            throw new err_1.default('No repository exist');
        }
        const materialName = path_1.default.dirname(dir).split('/').pop();
        const author = yield core_1.Storage.storage().author();
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
                message: 'Material name',
                default: materialName,
                validate: (name, answers) => __awaiter(this, void 0, void 0, function* () {
                    const repositoryName = answers.repositoryName;
                    const categoryName = answers.category;
                    const repo = repository[repositoryName];
                    const record = yield repo.searchMaterial(name, categoryName);
                    if (record.length === 0)
                        return true;
                    return `Material ${name} already exists`;
                }),
                require: true
            },
            {
                type: 'input',
                name: 'description',
                message: 'Material description',
                require: false
            },
            {
                type: 'input',
                name: 'tags',
                message: 'Material tags, separated by commas',
                require: false,
                filter: (tags = '') => tags.split(',')
            },
            {
                type: 'editor',
                name: 'inject',
                message: 'Material inject',
                default: '',
                require: false
            },
            {
                type: 'input',
                name: 'packages',
                message: 'Material packages, separated by space name@version',
                filter: (packages = '') => packages === ''
                    ? []
                    : packages.split(' ').map((p) => p.split('@')),
                require: false
            }
        ];
        const answers = yield inquirer_1.default.prompt(question);
        const inputName = answers.name;
        const inputCategory = answers.category;
        const inputRepository = answers.repositoryName;
        const config = {
            repository: inputRepository,
            name: inputName,
            category: inputCategory,
            description: answers.description,
            author,
            tags: answers.tags,
            inject: answers.inject,
            package: answers.packages
        };
        yield submit(dir, repository[inputRepository], config);
    });
}
function submit(srcDir, repository, config) {
    return __awaiter(this, void 0, void 0, function* () {
        const material = yield new core_1.Material(repository, config);
        yield material.submit(srcDir);
    });
}
exports.default = {
    command: exports.command,
    describe: exports.describe,
    builder,
    handler
};
