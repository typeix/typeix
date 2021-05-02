import {IAfterConstruct, Inject, Injectable} from "@typeix/di";
import {CliTools} from "./cli-tools";
import {NpmRunner} from "./runners/npm.runner";
import {YarnRunner} from "./runners/yarn.runner";
import {GitRunner} from "./runners/git.runner";
import {Option} from "./interfaces";
import {isBoolean} from "@typeix/utils";

@Injectable()
export class GenerateCommand implements IAfterConstruct {

  @Inject() cli: CliTools;
  @Inject() npm: NpmRunner;
  @Inject() yarn: YarnRunner;
  @Inject() git: GitRunner;

  afterConstruct(): void {
    this.cli.commander()
      .command("generate <schematic> [name] [path]")
      .alias("g")
      .description("")
      .option(
        "-d, --dry-run",
        "Report actions that would be taken without writing out results."
      )
      .option("-p, --project [project]", "Project in which to generate files.")
      .option("--flat", "Enforce flat structure of generated element.")
      .option(
        "--spec",
        "Enforce spec files generation.",
        () => {
          return {value: true, passedAsInput: true};
        },
        {value: false, passedAsInput: false}
      )
      .option("--no-spec", "Disable spec files generation.", () => {
        return {value: false, passedAsInput: true};
      })
      .option(
        "-c, --collection [collectionName]",
        "Schematics collection to use."
      )
      .action(async (schematic: string, name: string, path: string, command: any) => {
        const options: Option[] = [];
        options.push({name: "dry-run", value: !!command.dryRun});
        options.push({name: "flat", value: command.flat});
        options.push({
          name: "spec",
          value: command.spec.value,
          options: {
            passedAsInput: command.spec.passedAsInput
          }
        });
        options.push({
          name: "collection",
          value: command.collection || "@typeix/schematics"
        });
        options.push({
          name: "project",
          value: command.project
        });

        const inputs: Array<Option> = [];
        inputs.push({name: "schematic", value: schematic});
        inputs.push({name: "name", value: name});
        inputs.push({name: "path", value: path});

        await this.handle(inputs, options);
      });
  }

  private async handle(inputs: Array<Option>, options: Array<Option>): Promise<any> {
    console.log(inputs, options);
  }
}
