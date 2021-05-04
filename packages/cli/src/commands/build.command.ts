import {IAfterConstruct, Inject, Injectable} from "@typeix/di";
import {CliTools} from "./cli-tools";
import {NpmRunner} from "./runners/npm.runner";
import {YarnRunner} from "./runners/yarn.runner";
import {GitRunner} from "./runners/git.runner";
import {Option} from "./interfaces";
import {join, dirname, normalize} from "path";
import {TscRunner} from "./runners/tsc.runner";

@Injectable()
export class BuildCommand implements IAfterConstruct {

  @Inject() cli: CliTools;
  @Inject() npm: NpmRunner;
  @Inject() yarn: YarnRunner;
  @Inject() git: GitRunner;
  @Inject() tsc: TscRunner;

  afterConstruct(): void {
    this.cli.commander()
      .command("build")
      .option(
        "-p, --path [path]",
        "Path to Typeix project or tsconfig file.",
        "tsconfig.build.json"
      )
      .option("-w, --watch", "Run in watch mode (live-reload).", false)
      .option("--webpack", "Use webpack for compilation.", false)
      .option("--webpackPath [path]", "Path to webpack configuration.")
      .option("--preserveWatchOutput", "Preserve watch output", false)
      .option("--tsc", "Use tsc for compilation.", false)
      .description("Build Typeix application.")
      .action(async (app: string, command: any) => {
        const isWebpackEnabled = command.tsc ? false : command.webpack;
        const options: Array<Option> = [];
        options.push({name: "webpack", value: isWebpackEnabled});
        options.push({name: "watch", value: !!command.watch});
        options.push({name: "watchAssets", value: !!command.watchAssets});
        options.push({name: "path", value: command.path});
        options.push({name: "webpackPath", value: command.webpackPath});
        options.push({name: "preserveWatchOutput", value: !!command.preserveWatchOutput});
        options.push({name: "tsc", value: !!command.tsc});
        try {
          await this.handle(options);
        } catch (e) {
          this.cli.print(e.stack, true);
        }
      });
  }

  /**
   * Get config dir
   * @param options
   * @protected
   */
  protected getConfigDirs(options: Array<Option>) {
    const tsConfigPath = <string>this.cli.getOptionValue(options, "path") ?? ".";
    const tsConfigFile = /^(.*)\.json$/.test(tsConfigPath) ? "" : "tsconfig.build.json";
    return {
      tsConfigPath: join(tsConfigPath, tsConfigFile),
      tpxConfigPath: dirname(normalize(join(tsConfigPath, tsConfigFile)))
    };
  }

  /**
   * Handle
   * @param options
   * @protected
   */
  protected async handle(options: Array<Option>): Promise<any> {
    const config = this.getConfigDirs(options);
    const useTscCompiler = <boolean>this.cli.getOptionValue(options, "tsc");
    if (useTscCompiler) {
      return this.tsc.exec();
    } else {
      return await this.cli.compileTypescript(
        {
          ...config,
          watchMode: <boolean>this.cli.getOptionValue(options, "watch"),
          compilerOptions: {
            preserveWatchOutput: <boolean>this.cli.getOptionValue(options, "preserveWatchOutput")
          }
        }
      );
    }
  }
}
