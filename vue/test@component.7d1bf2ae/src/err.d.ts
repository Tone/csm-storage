export default class CliErr extends Error {
    message: string;
    name: string;
    constructor(message: string);
}
