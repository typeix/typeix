import {IAfterConstruct, Inject, Injectable} from "@typeix/di";
import {CliTools} from "./cli-tools";
import {NpmRunner} from "./runners/npm.runner";
import {YarnRunner} from "./runners/yarn.runner";
import {GitRunner} from "./runners/git.runner";
import {Option, Schematic, TypeixCliConfig} from "./interfaces";
import {SchematicRunner} from "./runners/schematic.runner";
import {MESSAGES} from "../ui";
import {isBoolean, isDefined, isObject, isUndefined} from "@typeix/utils";
import {Question} from "inquirer";
import * as inquirer from "inquirer";
import * as chalk from "chalk";

@Injectable()
export class GenerateCommand implements IAfterConstruct {

  @Inject() cli: CliTools;
  @Inject() npm: NpmRunner;
  @Inject() yarn: YarnRunner;
  @Inject() git: GitRunner;
  @Inject() schematic: SchematicRunner;

  afterConstruct(): void {
    this.cli.commander()
      .command("generate <schematic> [name] [path]")
      .alias("g")
      .description(this.schematic.getDescription())
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
          return true;
        },
        false
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
          value: command.spec?.value ?? false,
          options: {
            passedAsInput: command.spec?.passedAsInput ?? false
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

        try {
          await this.handle(inputs.concat(options));
        } catch (e) {
          this.cli.print(e, true);
        }
      });
  }

  /**
   * Handle
   * @param inputs
   * @param options
   * @private
   */
  private async handle(inputs: Array<Option>): Promise<any> {
    const configuration = await this.cli.getConfiguration();
    const collectionOption = <string>this.cli.getOptionValue(inputs, "collection");
    const schematic = <string>this.cli.getOptionValue(inputs, "schematic");
    const appName = <string>this.cli.getOptionValue(inputs, "project");
    const spec = this.cli.getOption(inputs, "spec");

    const schematicOptions: Array<Schematic> = this.cli.filterOptions(inputs, ["schematic", "spec"])
      .concat([
        {
          name: "language",
          value: configuration.language
        }
      ]);

    let sourceRoot = appName ? Reflect.get(configuration, "sourceRoot") ?? appName : configuration.sourceRoot;

    let generateSpec = this.isSpec(
      configuration,
      schematic,
      <boolean>spec.value,
      spec.options.passedAsInput
    );

    if (this.shouldCreateMultiRepo(configuration, schematic, appName)) {
      const label = " [ Default ]";
      let projectName: string = configuration.sourceRoot + label;
      for (const [key, value] of Object.entries(configuration.projects)) {
        if (value.sourceRoot === configuration.sourceRoot) {
          projectName = key + label;
          break;
        }
      }
      let projects: Array<string> = Object.keys(configuration.projects);
      if (configuration.sourceRoot !== "src") {
        projects = projects.filter(i => i !== projectName.replace(label, ""));
      }
      projects.unshift(projectName);

      const questions: Array<Question> = [
        this.cli.createSelect(
          "appName",
          MESSAGES.PROJECT_SELECTION_QUESTION,
          projects
        )
      ];

      const prompt = inquirer.createPromptModule();
      const answers = await prompt(questions);

      const project: string = answers.appName.replace(label, "");
      if (project !== configuration.sourceRoot) {
        sourceRoot = Reflect.get(configuration.projects, project)!.sourceRoot;
      }

      if (answers.appName !== projectName) {
        generateSpec = this.isSpec(
          configuration,
          schematic,
          <boolean>spec.value,
          spec.options.passedAsInput
        );
      }
    }

    schematicOptions.push({name: "sourceRoot", value: sourceRoot});
    schematicOptions.push({name: "spec", value: generateSpec});
    if (!schematic) {
      throw new Error("Unable to find a schematic for this configuration");
    }
    try {
      await this.schematic.execute(collectionOption, schematic, schematicOptions);
    } catch (error) {
      if (error && error.message) {
        console.error(chalk.red(error.message));
      }
    }
  }

  /**
   * Check if is specified
   * @param configuration
   * @param schematic
   * @param specValue
   * @param specPassedAsInput
   * @private
   */
  private isSpec(configuration: TypeixCliConfig, schematic: string, specValue: boolean, specPassedAsInput?: boolean): boolean {
    const spec = configuration?.generateOptions?.spec;
    if (specPassedAsInput || isUndefined(specPassedAsInput)) {
      return specValue;
    } else if (isBoolean(spec)) {
      return <boolean>spec;
    } else if (isObject(spec) && Reflect.has(<object>spec, schematic)) {
      return Reflect.get(<object>spec, schematic);
    }
    return specValue;
  }

  /**
   * Check if should create multi repo
   * @param configuration
   * @param schematic
   * @param appName
   * @private
   */
  private shouldCreateMultiRepo(configuration: TypeixCliConfig, schematic: string, appName: string): boolean {
    return !["app", "sub-app"].includes(schematic) &&
      isDefined(configuration) &&
      isObject(configuration?.projects) &&
      Object.keys(configuration.projects).length > 0 &&
      !appName;
  }


}
