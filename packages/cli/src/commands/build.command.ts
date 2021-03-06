import {IAfterConstruct, Inject, Injectable} from "@typeix/di";
import {CliTools} from "./cli-tools";
import {NpmRunner} from "./runners/npm.runner";
import {YarnRunner} from "./runners/yarn.runner";
import {Option} from "./interfaces";
import {join, dirname, normalize, isAbsolute} from "path";

@Injectable()
export class BuildCommand implements IAfterConstruct {

  @Inject() cli: CliTools;
  @Inject() npm: NpmRunner;
  @Inject() yarn: YarnRunner;

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
      .option("--file [filePtah]", "Application start file", "dist/bootstrap.js")
      .description("Build Typeix application.")
      .action(async (command: any) => {
        const options: Array<Option> = [];
        options.push({name: "webpack", value: !!command.webpack});
        options.push({name: "watch", value: !!command.watch});
        options.push({name: "watchAssets", value: !!command.watchAssets});
        options.push({name: "webpackPath", value: command.webpackPath});
        options.push({name: "path", value: command.path});
        options.push({name: "file", value: command.file});
        options.push({name: "debug", value: false});
        options.push({
          name: "preserveWatchOutput",
          value:
            !!command.preserveWatchOutput &&
            !!command.watch &&
            !command.webpack
        });
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
   * @param abs
   * @protected
   */
  protected getBinFile(options: Array<Option>, abs = true) {
    const config = this.getConfigDirs(options);
    const fileName = <string>this.cli.getOptionValue(options, "file");
    const dirs = [fileName];
    if (!isAbsolute(config.tsConfigPath)) {
      dirs.unshift(dirname(config.tsConfigPath));
    }
    return abs ? normalize(join(process.cwd(), ...dirs)) : normalize(join(...dirs));
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
    const useWebpackCompiler = <boolean>this.cli.getOptionValue(options, "webpack");
    const entryFile = this.getBinFile(options, !useWebpackCompiler);
    const watchMode = <boolean>this.cli.getOptionValue(options, "watch");
    const preserveWatchOutput = <boolean>this.cli.getOptionValue(options, "preserveWatchOutput");
    const isDebugEnabled = <boolean>this.cli.getOptionValue(options, "debug");
    const compilerConfig = {
      ...config,
      entryFile,
      watchMode,
      isDebugEnabled: !!isDebugEnabled,
      compilerOptions: {
        preserveWatchOutput
      }
    };
    if (useWebpackCompiler) {
      const webPackConfig = <string>this.cli.getOptionValue(options, "webpackPath");
      return await this.cli.useWebpackCompiler({
        ...compilerConfig,
        entryFile
      }, webPackConfig);
    } else {
      return await this.cli.compileTypescript(compilerConfig);
    }
  }
}
