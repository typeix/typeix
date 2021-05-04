import {IAfterConstruct, Inject, Injectable} from "@typeix/di";
import {Option} from "./interfaces";
import {EventEmitter} from "events";
import {BuildCommand} from "./build.command";
import {isDefined, isNumber} from "@typeix/utils";
import {join, normalize, isAbsolute, dirname} from "path";
import {watch} from "fs";
import {ChildProcess, spawn} from "child_process";
import * as killProcess from "tree-kill";

@Injectable()
export class StartCommand extends BuildCommand implements IAfterConstruct {

  @Inject() eventEmitter: EventEmitter;

  afterConstruct(): void {
    this.cli.commander()
      .command("start")
      .option(
        "-p, --path [path]",
        "Path to Typeix project or tsconfig file.",
        "tsconfig.build.json"
      )
      .option("-w, --watch", "Run in watch mode (live-reload).", false)
      .option("--webpack", "Use webpack for compilation.", false)
      .option("--webpackPath [path]", "Path to webpack configuration.")
      .option("--preserveWatchOutput", "Preserve watch output", false)
      .option("-d, --debug [hostport] ", "Run in debug mode (with --inspect flag).")
      .option("-e, --exec [binary]", "Node Binary", "node")
      .option("--file [file]", "Application start file", "dist/bootstrap.js")
      .option("--tsc", "Use tsc for compilation.", false)
      .description("Run Typeix application.")
      .action(async (command: any) => {
        const isWebpackEnabled = command.tsc ? false : command.webpack;
        const options: Array<Option> = [];
        options.push({name: "config", value: command.config});
        options.push({name: "webpack", value: isWebpackEnabled});
        options.push({name: "debug", value: command.debug});
        options.push({name: "watch", value: !!command.watch});
        options.push({name: "watchAssets", value: !!command.watchAssets});
        options.push({name: "path", value: command.path});
        options.push({name: "webpackPath", value: command.webpackPath});
        options.push({name: "exec", value: command.exec});
        options.push({name: "file", value: command.file});
        options.push({name: "tsc", value: !!command.tsc});
        options.push({
          name: "preserveWatchOutput",
          value:
            !!command.preserveWatchOutput &&
            !!command.watch &&
            !isWebpackEnabled
        });
        await this.handle(options);
      });
  }

  /**
   * Handler
   * @param options
   * @protected
   */
  protected async handle(options: Array<Option>): Promise<any> {
    try {
      let childProcess: ChildProcess = void 0;
      const outDir = await this.getOutDir(options);
      this.eventEmitter.on("spawn", async () =>
        childProcess = await this.reStartServer(outDir, options, childProcess)
      );
      await super.handle(options);
    } catch (e) {
      this.cli.print(e.stack, true);
    }
  }

  /**
   * Restart server
   * @param outDir
   * @param options
   * @param childProcess
   * @private
   */
  private async reStartServer(outDir: string, options: Array<Option>, childProcess?: ChildProcess): Promise<ChildProcess> {
    if (isDefined(childProcess) && isNumber(childProcess?.pid)) {
      await new Promise((resolve) => {
        killProcess(childProcess.pid, error => {
          if (error) {
            this.cli.print(error, true);
          } else {
            resolve("SIGKILL");
          }
        });
      });
    }
    const config = this.getConfigDirs(options);
    const exec = this.cli.getOptionValue(options, "exec");
    const fileName = <string>this.cli.getOptionValue(options, "file");
    const dirs = [fileName];
    if (!isAbsolute(config.tsConfigPath)) {
      dirs.unshift(dirname(config.tsConfigPath));
    }
    const filePath = normalize(join(process.cwd(), ...dirs));
    const processArgs = [];
    return spawn(`${exec} ${filePath}`, processArgs, {
      stdio: "inherit",
      shell: true
    });
  }

  /**
   * Get out dir
   * @param options
   * @private
   */
  private async getOutDir(options: Array<Option>): Promise<string> {
    const tsConfigPath = <string>this.cli.getOptionValue(options, "path") ?? ".";
    const tsConfigFileName = /^(.*)\.json$/.test(tsConfigPath) ? "" : "tsconfig.json";
    const tsConfigFile = normalize(join(tsConfigPath, tsConfigFileName));
    const tsConfigBuffer = await this.cli.readFile(tsConfigFile);
    const tsConfig = JSON.parse(tsConfigBuffer.toString());
    const outDir = tsConfig?.compilerOptions?.outDir;
    return normalize(join(process.cwd(), !!outDir ? outDir : "dist"));
  }

}
