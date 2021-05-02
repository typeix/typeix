import {IAfterConstruct, Inject, Injectable} from "@typeix/di";
import {CliTools} from "./cli-tools";
import {NpmRunner} from "./runners/npm.runner";
import {YarnRunner} from "./runners/yarn.runner";
import {GitRunner} from "./runners/git.runner";
import {Option} from "./interfaces";

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
      .option("--watchAssets", "Watch non-ts (e.g., .graphql) files mode.")
      .option("--webpack", "Use webpack for compilation.")
      .option("--webpackPath [path]", "Path to webpack configuration.")
      .option("--tsc", "Use tsc for compilation.")
      .description("Build Typeix application.")
      .action(async (app: string, command: any) => {
        const options: Array<Option> = [];

        options.push({
          name: "config",
          value: command.config
        });

        const isWebpackEnabled = command.tsc ? false : command.webpack;
        options.push({name: "webpack", value: isWebpackEnabled});
        options.push({name: "watch", value: !!command.watch});
        options.push({name: "watchAssets", value: !!command.watchAssets});
        options.push({
          name: "path",
          value: command.path
        });
        options.push({
          name: "webpackPath",
          value: command.webpackPath
        });

        await this.handle([{name: "app", value: app}], options);
      });
  }

  private async handle(inputs: Array<Option>, options: Array<Option>): Promise<any> {
    console.log(inputs, options);
  }
}
