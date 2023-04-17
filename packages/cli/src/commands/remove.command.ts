import {IAfterConstruct, Inject, Injectable} from "@typeix/di";
import {CliTools} from "./cli-tools";
import {NpmRunner} from "./runners/npm.runner";
import {YarnRunner} from "./runners/yarn.runner";
import {Option} from "./interfaces";

@Injectable()
export class RemoveCommand implements IAfterConstruct {

  @Inject() cli: CliTools;
  @Inject() npm: NpmRunner;
  @Inject() yarn: YarnRunner;

  afterConstruct(): void {
    this.cli.commander()
      .command("remove <package>")
      .alias("r")
      .description("Removes package in your project.")
      .option(
        "-d, --dry-run",
        "Report actions that would be performed without writing out results."
      )
      .action(async (packageName: string, command: any) => {
        const options: Array<Option> = [];
        options.push({name: "dry-run", value: !!command.dryRun});
        options.push({name: "package", value: packageName});
        await this.handle(options);
      });
  }

  private async handle(options: Array<Option>): Promise<any> {
    const libraryName = <string>this.cli.getOptionValue(options, "package");
    const isDryRunEnabled = <boolean>this.cli.getOptionValue(options, "dry-run");
    if (!libraryName) {
      throw new Error("No library found in command input");
    }
    try {
      const args = this.cli.getRemainingFlags();
      const pkgManager: YarnRunner | NpmRunner = <YarnRunner | NpmRunner>Reflect.get(this, await this.cli.getPackageManagerName());
      const result = await pkgManager.delete(libraryName, args);
      if (!isDryRunEnabled) {
        this.cli.print(result);
      }
    } catch (error) {
      if (!isDryRunEnabled) {
        this.cli.print(error, true);
      }
    }
  }
}
