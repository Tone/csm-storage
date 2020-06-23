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
const fs_extra_1 = __importDefault(require("fs-extra"));
const config_1 = require("./config");
class Init {
    constructor() {
        this.command = 'init [storageDir]';
        this.describe = 'Init local storage';
    }
    builder(argv) {
        argv.positional('storageDir', {
            describe: 'local storage dir',
            type: 'string'
        });
        argv.options({
            remote: {
                alias: 'r',
                type: 'string',
                describe: 'remote repository url',
                require: false
            }
        });
        return argv;
    }
    handler(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const storageDir = args.storageDir;
            const remoteUrl = args.remote;
            const { dir } = yield core_1.Storage.init(storageDir, remoteUrl);
            yield fs_extra_1.default.writeJSON(config_1.CONF_FILE, { dir });
        });
    }
}
exports.default = new Init();
