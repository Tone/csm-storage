"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
exports.CONF_FILE = path_1.default.resolve(os_1.default.homedir(), '.csm.conf');
exports.ERR_NAME = 'CLI_ERR';
