import {IAfterConstruct, Inject, Injectable} from "@typeix/di";
import {CliTools} from "./cli-tools";
import {NpmRunner} from "./runners/npm.runner";
import {YarnRunner} from "./runners/yarn.runner";
import {GitRunner} from "./runners/git.runner";
import {Option} from "./interfaces";
import {MESSAGES} from "../ui";
import * as chalk from "chalk";

@Injectable()
export class AddCommand implements IAfterConstruct {

  @Inject() cli: CliTools;
  @Inject() npm: NpmRunner;
  @Inject() yarn: YarnRunner;
  @Inject() git: GitRunner;

  afterConstruct(): void {
    this.cli.commander()
      .command("add <package>")
      .allowUnknownOption()
      .description("Adds package to your project.")
      .option(
        "-d, --dry-run",
        "Report actions that would be performed without writing out results."
      )
      .action(async (packageName: string, command: any) => {
        const options: Array<Option> = [];
        options.push({name: "dry-run", value: !!command.dryRun});
        try {
          await this.handle([{name: "package", value: packageName}], options);
        } catch (err) {
          process.exit(0);
        }
      });
  }

  /**
   * Handler
   * @param inputs
   * @param options
   * @private
   */
  private async handle(inputs: Array<Option>, options: Array<Option>): Promise<any> {
    const libraryName = <string>inputs.find(item => item.name === "package")?.value;
    const isDryRunEnabled = <boolean>options.find(option => option.name === "dry-run")?.value;
    if (!libraryName) {
      throw new Error("No library found in command input");
    }
    try {
      const pkgManager: YarnRunner | NpmRunner = Reflect.get(this, await this.cli.getPackageManagerName());
      const result = await pkgManager.add(libraryName, this.cli.getRemainingFlags());
      if (!isDryRunEnabled) {
        this.cli.print(result);
      }
    } catch (error) {
      console.error(
        chalk.red(
          MESSAGES.LIBRARY_INSTALLATION_FAILED_BAD_PACKAGE(libraryName)
        )
      );
      if (!isDryRunEnabled) {
        this.cli.print(error, true);
      }
    }
  }
}
