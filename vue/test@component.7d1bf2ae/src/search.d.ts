import { Arguments, Argv } from 'yargs';
export declare const command = "search <name>";
export declare const describe = "Search material";
export declare function builder(argv: Argv): Argv<{}>;
export declare function handler(args: Arguments): Promise<void>;
declare const _default: {
    command: string;
    describe: string;
    builder: typeof builder;
    handler: typeof handler;
};
export default _default;
