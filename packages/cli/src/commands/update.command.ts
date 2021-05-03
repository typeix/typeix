import {IAfterConstruct, Inject, Injectable} from "@typeix/di";
import {CliTools} from "./cli-tools";
import {NpmRunner} from "./runners/npm.runner";
import {YarnRunner} from "./runners/yarn.runner";
import {GitRunner} from "./runners/git.runner";
import {Option} from "./interfaces";
import * as chalk from "chalk";
import {MESSAGES} from "../ui";

@Injectable()
export class UpdateCommand implements IAfterConstruct {

  @Inject() cli: CliTools;
  @Inject() npm: NpmRunner;
  @Inject() yarn: YarnRunner;
  @Inject() git: GitRunner;

  afterConstruct(): void {
    this.cli.commander()
      .command("update <package>")
      .alias("u")
      .description("Updates package in your project.")
      .option(
        "-f, --force",
        "Remove and re-install dependencies (instead of update)."
      )
      .action(async (packageName: string, command: any) => {
        const options: Array<Option> = [];
        options.push({name: "force", value: !!command.force});
        options.push({name: "tag", value: command.tag});
        options.push({name: "package", value: packageName});
        await this.handle( options);
      });
  }

  private async handle(options: Array<Option>): Promise<any> {
    const libraryName = <string>this.cli.getOptionValue(options, "package");
    const isDryRunEnabled = <boolean>this.cli.getOptionValue(options, "dry-run");
    const isForced = <boolean>this.cli.getOptionValue(options, "force");
    if (!libraryName) {
      throw new Error("No library found in command input");
    }
    try {
      const args = this.cli.getRemainingFlags();
      const pkgManager: YarnRunner | NpmRunner = Reflect.get(this, await this.cli.getPackageManagerName());
      const result = isForced ? await pkgManager.upgrade(libraryName, args): await pkgManager.update(libraryName, args);
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
