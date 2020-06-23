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
const config_1 = require("./config");
const fs_extra_1 = __importDefault(require("fs-extra"));
const err_1 = __importDefault(require("./err"));
function default_1() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!fs_extra_1.default.pathExistsSync(config_1.CONF_FILE)) {
            throw new err_1.default('local storage dir is not set, please run init first');
        }
        else {
            const { dir } = fs_extra_1.default.readJsonSync(config_1.CONF_FILE);
            if (dir === undefined || dir === '')
                throw new err_1.default('local storage dir is not set, please run init first');
            try {
                yield core_1.Storage.check(dir);
                yield core_1.Storage.init(dir);
            }
            catch (e) {
                if ((e === null || e === void 0 ? void 0 : e.message) !== undefined) {
                    throw new err_1.default(e.message);
                }
                throw e;
            }
        }
    });
}
exports.default = default_1;
