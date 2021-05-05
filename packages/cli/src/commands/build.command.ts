import {IAfterConstruct, Inject, Injectable} from "@typeix/di";
import {CliTools} from "./cli-tools";
import {NpmRunner} from "./runners/npm.runner";
import {YarnRunner} from "./runners/yarn.runner";
import {GitRunner} from "./runners/git.runner";
import {Option} from "./interfaces";
import {join, dirname, normalize, isAbsolute} from "path";

@Injectable()
export class BuildCommand implements IAfterConstruct {

  @Inject() cli: CliTools;
  @Inject() npm: NpmRunner;
  @Inject() yarn: YarnRunner;
  @Inject() git: GitRunner;

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
      .option("--file [filePtah]", "Application start file", "dist/bootstrap.js")
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
        options.push({name: "file", value: command.file});
        try {
          await this.handle(options);
        } catch (e) {
          this.cli.print(e.stack, true);
        }
      });
  }

  /**
   * Application start
   * @param options
   * @protected
   */
  protected getBinFile(options: Array<Option>) {
    const config = this.getConfigDirs(options);
    const fileName = <string>this.cli.getOptionValue(options, "file");
    const dirs = [fileName];
    if (!isAbsolute(config.tsConfigPath)) {
      dirs.unshift(dirname(config.tsConfigPath));
    }
    return normalize(join(process.cwd(), ...dirs));
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
   * Get out dir
   * @param options
   * @private
   */
  protected async getOutDir(options: Array<Option>): Promise<string> {
    const tsConfigPath = <string>this.cli.getOptionValue(options, "path") ?? ".";
    const tsConfigFileName = /^(.*)\.json$/.test(tsConfigPath) ? "" : "tsconfig.json";
    const tsConfigFile = normalize(join(tsConfigPath, tsConfigFileName));
    const tsConfigBuffer = await this.cli.readFile(tsConfigFile);
    const tsConfig = JSON.parse(tsConfigBuffer.toString());
    const outDir = tsConfig?.compilerOptions?.outDir;
    return normalize(join(process.cwd(), !!outDir ? outDir : "dist"));
  }

  /**
   * Handle
   * @param options
   * @protected
   */
  protected async handle(options: Array<Option>): Promise<any> {
    const config = this.getConfigDirs(options);
    const entryFile = this.getBinFile(options);
    const useWebpackCompiler = <boolean>this.cli.getOptionValue(options, "webpack");
    const watchMode = <boolean>this.cli.getOptionValue(options, "watch");
    const preserveWatchOutput = <boolean>this.cli.getOptionValue(options, "preserveWatchOutput");
    const compilerConfig = {
      ...config,
      entryFile,
      watchMode,
      compilerOptions: {
        preserveWatchOutput
      }
    };
    if (useWebpackCompiler) {
      return await this.cli.useWebpackCompiler(compilerConfig);
    } else {
      return await this.cli.compileTypescript(compilerConfig);
    }
  }
}
