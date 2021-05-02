import {IAfterConstruct, Inject, Injectable} from "@typeix/di";
import {CliTools} from "./cli-tools";
import {NpmRunner} from "./runners/npm.runner";
import {YarnRunner} from "./runners/yarn.runner";
import {GitRunner} from "./runners/git.runner";
import {Option} from "./interfaces";

@Injectable()
export class RemoveCommand implements IAfterConstruct {

  @Inject() cli: CliTools;
  @Inject() npm: NpmRunner;
  @Inject() yarn: YarnRunner;
  @Inject() git: GitRunner;

  afterConstruct(): void {
    this.cli.commander()
      .command("update <package>")
      .alias("r")
      .description("Removes package in your project.")
      .option(
        "-d, --dry-run",
        "Report actions that would be performed without writing out results."
      )
      .action(async (packageName: string, command: any) => {
        const options: Array<Option> = [];
        options.push({name: "dry-run", value: !!command.dryRun});
        await this.handle([{name: "package", value: packageName}], options);
      });
  }

  private async handle(inputs: Array<Option>, options: Array<Option>): Promise<any> {
    const libraryName = <string>inputs.find(item => item.name === "package")?.value;
    const isDryRunEnabled = <boolean>options.find(item => item.name === "dry-run")?.value;
    if (!libraryName) {
      throw new Error("No library found in command input");
    }
    try {
      const args = this.cli.getRemainingFlags();
      const pkgManager: YarnRunner | NpmRunner = Reflect.get(this, await this.cli.getPackageManagerName());
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
