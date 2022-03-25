import {IAfterConstruct, Inject, Injectable} from "@typeix/di";
import {Answers} from "inquirer";
import {CliTools} from "./cli-tools";
import {MESSAGES, chalk} from "../ui";
import {isEqual, isFalsy, isUndefined} from "@typeix/utils";
import {SchematicRunner} from "./runners/schematic.runner";
import {NpmRunner} from "./runners/npm.runner";
import {YarnRunner} from "./runners/yarn.runner";
import {dasherize} from "@angular-devkit/core/src/utils/strings";
import {GitRunner} from "./runners/git.runner";
import {Option} from "./interfaces";

@Injectable()
export class NewCommand implements IAfterConstruct {

  @Inject() schematic: SchematicRunner;
  @Inject() cli: CliTools;
  @Inject() npm: NpmRunner;
  @Inject() yarn: YarnRunner;
  @Inject() git: GitRunner;

  afterConstruct(): void {
    const pkg = this.cli.getPackageJson();
    this.cli.commander()
      .command("new [name]")
      .alias("n")
      .description("Generate Typeix application.")
      .option("--directory [directory]", "Specify the destination directory")
      .option(
        "-d, --dry-run",
        "Report actions that would be performed without writing out results."
      )
      .option("-g, --skip-git", "Skip git repository initialization.")
      .option("-s, --skip-install", "Skip package installation.")
      .option(
        "-p, --package-manager [package-manager]",
        "Specify package manager."
      )
      .option(
        "-l, --language [language]",
        "Programming language to be used (TypeScript or JavaScript)."
      )
      .option(
        "-tpx, --tpx-version [version]",
        "Typeix Version.",
        pkg.version
      )
      .option(
        "-c, --collection [collectionName]",
        "Schematics collection to use."
      )
      .action(async (name: string, command: any) => {
        const options = [];
        const availableLanguages = ["js", "ts", "javascript", "typescript"];
        options.push({name: "directory", value: command.directory});
        options.push({name: "dry-run", value: !!command.dryRun});
        options.push({name: "skip-git", value: !!command.skipGit});
        options.push({name: "skip-install", value: !!command.skipInstall});
        options.push({name: "version", value: command.tpxVersion ?? pkg.version});
        options.push({
          name: "package-manager",
          value: command.packageManager
        });

        if (!!command.language) {
          const lang = command.language.toLowerCase();
          if (!availableLanguages.includes(lang)) {
            throw new Error(
              `Invalid language "${command.language}" selected. Available languages are "typescript" or "javascript"`
            );
          }
          switch (lang) {
            case "javascript":
              command.language = "js";
              break;
            case "typescript":
              command.language = "ts";
              break;
            default:
              command.language = lang;
              break;
          }
        }
        options.push({
          name: "language",
          value: !!command.language ? command.language : "ts"
        });
        options.push({
          name: "collection",
          value: command.collection || "@typeix/schematics"
        });
        options.push({
          name: "name",
          value: name
        });
        return await this.handle(options);
      });
  }

  /**
   * Handle new application
   * @param options
   * @private
   */
  private async handle(options: Array<Option>): Promise<any> {
    const isDryRunEnabled = <boolean>this.cli.getOptionValue(options, "dry-run");
    const directoryOption = this.cli.getOption(options, "directory");
    const applicationOption = this.cli.getOption(options, "name");

    await this.checkInputs(options, applicationOption);
    await this.createApplicationFiles(options).catch(() => process.exit(1));
    const shouldSkipInstall = this.cli.compareOptionValue(options, "skip-install", true);
    const shouldSkipGit = this.cli.compareOptionValue(options, "skip-git", true);
    const projectDirectory = directoryOption?.value ?? dasherize(<string>applicationOption.value);

    if (!shouldSkipInstall) {
      await this.installPackages(options, isDryRunEnabled, <string>projectDirectory);
    }
    if (!isDryRunEnabled) {
      if (!shouldSkipGit) {
        await this.git.init(<string>projectDirectory);
        await this.git.createGitIgnoreFile(<string>projectDirectory);
      }
    }
    process.exit(0);
  }

  /**
   * Install packages
   * @param options
   * @param dryRunMode
   * @param installDirectory
   * @private
   */
  private async installPackages(options: Array<Option>, dryRunMode: boolean, installDirectory: string) {
    let inputPackageManager = <string>this.cli.getOptionValue(options, "package-manager");
    if (dryRunMode) {
      console.info();
      console.info(chalk.green(MESSAGES.DRY_RUN_MODE));
      console.info();
      return;
    }
    try {
      if (isFalsy(inputPackageManager)) {
        const answers = await this.cli.doPrompt([
          this.cli.createSelect(
            "package-manager",
            MESSAGES.PACKAGE_MANAGER_QUESTION,
            [
              "npm",
              "yarn"
            ]
          )
        ]);
        inputPackageManager = Reflect.get(answers, "package-manager");
      }
      const pkgManager: YarnRunner | NpmRunner = Reflect.get(this, inputPackageManager);
      this.cli.print(await pkgManager.install(installDirectory));
    } catch (error) {
      this.cli.print(error, true);
    }
  }

  /**
   * Create application files
   * @param options
   * @private
   */
  private async createApplicationFiles( options: Array<Option>): Promise<void> {
    const collectionName = <string>this.cli.getOptionValue(options, "collection");
    const schematicOptions = options.filter(item =>
      !isEqual(item.name, "skip-install") && !isEqual(item.value, "package-manager")
    );
    await this.schematic.execute(collectionName, "application", schematicOptions);
    console.info();
  }

  /**
   * Check cli options
   * @param options
   * @param nameInput
   * @private
   */
  private async checkInputs(options: Array<Option>, nameInput: Option): Promise<void> {
    console.info(MESSAGES.PROJECT_INFORMATION_START);
    console.info();
    if (!nameInput?.value) {
      const message = "What name would you like to use for the new project?";
      const questions = [
        this.cli.createInput("name", message, "typeix-app")
      ];
      const answers: Answers = await this.cli.doPrompt(questions);
      options.forEach(
        item => {
          if (isUndefined(item.value) && item.name === "name") {
            item.value = Reflect.get(answers, item.name);
          }
        }
      );
    }
  }
}
