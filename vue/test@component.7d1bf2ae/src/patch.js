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
exports.command = 'patch <name> [dir]';
exports.describe = 'Patch material';
function builder(argv) {
    argv.positional('name', {
        describe: 'material name',
        type: 'string'
    });
    argv.positional('dir', {
        describe: 'Patch file dir',
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
        const dir = args.dir;
        const repositoryName = args.repository;
        const category = args.category;
        let srcDir = process.cwd();
        if (dir !== undefined) {
            srcDir = path_1.default.resolve(srcDir, dir);
        }
        if (!fs_extra_1.default.pathExistsSync(srcDir)) {
            throw new err_1.default(`Patch dir ${srcDir} does not exists`);
        }
        if (repositoryName !== undefined && category !== undefined) {
            yield initiative(name, repositoryName, category, srcDir);
        }
        else {
            yield interactive(name, srcDir);
        }
    });
}
exports.handler = handler;
function interactive(name, dir) {
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
            }
        ];
        const answers = yield inquirer_1.default.prompt(question);
        const inputCategory = answers.category;
        const inputRepository = answers.repositoryName;
        yield submit(name, dir, repository[inputRepository], inputCategory);
    });
}
function initiative(name, repositoryName, categoryName, srcDir) {
    return __awaiter(this, void 0, void 0, function* () {
        const repository = core_1.Repository.find(repositoryName);
        if (repository === null) {
            throw new err_1.default(`repository ${repositoryName} does not does not exist`);
        }
        yield submit(name, srcDir, repository, categoryName);
    });
}
function submit(name, srcDir, repository, categoryName) {
    return __awaiter(this, void 0, void 0, function* () {
        const repositoryName = repository.getConfig().repository;
        const material = yield repository.find(name, categoryName);
        if (material === null) {
            throw new err_1.default(`No material ${name} was found in repository ${repositoryName}`);
        }
        const localAuthor = yield core_1.Storage.storage().author();
        const author = material.config.author;
        const materialName = material.config.name;
        if (localAuthor !== author) {
            throw new err_1.default(`Material ${materialName} author is ${author}, but local is ${localAuthor}`);
        }
        yield material.submit(srcDir);
    });
}
exports.default = {
    command: exports.command,
    describe: exports.describe,
    builder,
    handler
};
