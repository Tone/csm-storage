import { Storage } from '@csm/core';
import { Arguments, Argv } from 'yargs';
export declare const command = "publish [name]";
export declare const describe = "Publish material to repository";
export declare function builder(argv: Argv): Argv<{}>;
export declare function handler(args: Arguments): Promise<Storage | undefined>;
declare const _default: {
    command: string;
    describe: string;
    builder: typeof builder;
    handler: typeof handler;
};
export default _default;
