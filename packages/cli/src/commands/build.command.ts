import {IAfterConstruct, Inject, Injectable} from "@typeix/di";
import {CliTools} from "./cli-tools";
import {NpmRunner} from "./runners/npm.runner";
import {YarnRunner} from "./runners/yarn.runner";
import {GitRunner} from "./runners/git.runner";
import {Option} from "./interfaces";
import {join} from "path";

@Injectable()
export class BuildCommand implements IAfterConstruct {

  @Inject() cli: CliTools;
  @Inject() npm: NpmRunner;
  @Inject() yarn: YarnRunner;
  @Inject() git: GitRunner;

  afterConstruct(): void {
    this.cli.commander()
      .command("build [app]")
      .option("-c, --config [path]", "Path to typeix-cli configuration file.")
      .option("-p, --path [path]", "Path to tsconfig file.")
      .option("-w, --watch", "Run in watch mode (live-reload).")
      .option("--webpack", "Use webpack for compilation.")
      .option("--webpackPath [path]", "Path to webpack configuration.")
      .option("--tsc", "Use tsc for compilation.")
      .option("--preserveWatchOutput", "Preserve watch output")
      .description("Build Typeix application.")
      .action(async (app: string, command: any) => {
        const isWebpackEnabled = command.tsc ? false : command.webpack;
        const options: Array<Option> = [];
        options.push({name: "config", value: command.config});
        options.push({name: "webpack", value: isWebpackEnabled});
        options.push({name: "watch", value: !!command.watch});
        options.push({name: "watchAssets", value: !!command.watchAssets});
        options.push({name: "path", value: command.path});
        options.push({name: "webpackPath", value: command.webpackPath});
        options.push({name: "preserveWatchOutput", value: !!command.preserveWatchOutput});
        options.push({name: "app", value: app});
        await this.handle(options);
      });
  }

  private async handle(options: Array<Option>): Promise<any> {
    try {
      const tpxConfigPath = <string>this.cli.getOptionValue(options, "config") ?? ".";
      const tsConfigPath = <string>this.cli.getOptionValue(options, "path") ?? ".";
      const watchMode = <boolean>this.cli.getOptionValue(options, "watch");
      const preserveWatchOutput = <boolean>this.cli.getOptionValue(options, "preserveWatchOutput");
      const tsConfigFile =  /^(.*)\.json$/.test(tsConfigPath) ? "" : "tsconfig.build.json";
      await this.cli.compileTypescript(
        {
          tsConfigPath: join(tsConfigPath, tsConfigFile),
          tpxConfigPath,
          watchMode,
          compilerOptions: {
            preserveWatchOutput
          }
        }
      );
    } catch (e) {
      this.cli.print(e.stack, true);
    }
  }
}
