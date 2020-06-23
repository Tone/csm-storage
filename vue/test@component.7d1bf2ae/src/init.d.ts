import { Arguments, Argv, CommandModule } from 'yargs';
declare class Init implements CommandModule {
    readonly command = "init [storageDir]";
    readonly describe = "Init local storage";
    builder(argv: Argv): Argv<{}>;
    handler(args: Arguments): Promise<void>;
}
declare const _default: Init;
export default _default;
