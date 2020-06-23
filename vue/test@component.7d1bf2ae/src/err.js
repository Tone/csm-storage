"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
class CliErr extends Error {
    constructor(message) {
        super();
        this.name = config_1.ERR_NAME;
        this.message = message;
    }
}
exports.default = CliErr;
