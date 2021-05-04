import {AfterConstruct, Inject, Injectable} from "@typeix/di";
import {isArray, isDefined, isFunction,  isUndefined} from "@typeix/utils";
import {MESSAGES} from "../ui";
import {existsSync, readdir, readFile} from "fs";
import {join} from "path";
import {Question} from "inquirer";
import {CommanderStatic} from "commander";
import {Option, PluginExtension, TpxConfiguration, TypeixCliConfig} from "./interfaces";
import {normalize} from "@angular-devkit/core";
import {CustomTransformerFactory,  SourceFile, TransformerFactory} from "typescript";
import * as chalk from "chalk";
import * as inquirer from "inquirer";
import * as ts from "typescript";

const CLI_DEFAULT: TypeixCliConfig = {
  language: "ts",
  sourceRoot: "src",
  collection: "@typeix/schematics",
  entryFile: "main",
  projects: {},
  monorepo: false,
  compilerOptions: {
    tsConfigPath: "tsconfig.build.json",
    webpack: false,
    webpackConfigPath: "webpack.config.js",
    plugins: [],
    assets: []
  },
  generateOptions: {}
};

@Injectable()
export class CliTools {

  @Inject("program") private commanderStatic: CommanderStatic;

  @AfterConstruct()
  onProgramInit() {
    this.commanderStatic.on("command:*", () => {
      console.error(MESSAGES.INVALID_COMMAND, this.commanderStatic.args.join(" "));
      console.log(MESSAGES.AVAILABLE_COMMANDS);
      process.exit(1);
    });
  }

  /**
   * Return commander
   */
  commander(): CommanderStatic {
    return this.commanderStatic;
  }

  /**
   * Get package manager name
   */
  async getPackageManagerName(): Promise<string> {
    try {
      const files = await this.readDir("");
      return files.includes("yarn.lock") ? "yarn" : "npm";
    } catch {
      return "npm";
    }
  }

  /**
   * Compile project
   * @param tsConfigPath
   * @param tpxConfigPath
   */
  async compileTypescript(tsConfigPath: string, tpxConfigPath = "") {
    const compiler = await this.loadTypescriptWithConfig(tsConfigPath, tpxConfigPath);
    const tse = compiler.tse;
    const createProgram = tse.createIncrementalProgram ?? tse.createProgram;
    const {options, fileNames, projectReferences} = compiler.tsConfig;
    const program = createProgram.call(tse, {
      rootNames: fileNames,
      projectReferences: projectReferences,
      options
    });
    const before: Array<TransformerFactory<SourceFile> | CustomTransformerFactory> = [];
    const after: Array<TransformerFactory<SourceFile> | CustomTransformerFactory> = [];
    const plugins = compiler?.cliConfig?.compilerOptions?.plugins;
    if (isArray(plugins)) {
      for (const item of plugins) {
        const bProgram = (<ts.BuilderProgram>program);
        const pkgName = isDefined(item.path) ? normalize(join(process.cwd(), tpxConfigPath,  item.path)) : item.name;
        const plugin = await this.loadBinary<PluginExtension>(pkgName);
        const currentProgram = isFunction(bProgram.getProgram) ? bProgram.getProgram() : program;
        if (isFunction(plugin.before)) {
          before.push(plugin.before(currentProgram, item.options));
        }
        if (isFunction(plugin.after)) {
          after.push(plugin.after(currentProgram, item.options));
        }
      }
    }
    const result = program.emit(
      undefined,
      undefined,
      undefined,
      undefined,
      {
        before,
        after,
        afterDeclarations: []
      }
    );
    const diagnostics = tse.getPreEmitDiagnostics(<ts.Program>program).concat(result.diagnostics);

    if (diagnostics.length > 0) {
      console.error(
        tse.formatDiagnosticsWithColorAndContext(diagnostics, {
          getCanonicalFileName: path => path,
          getCurrentDirectory: tse.sys.getCurrentDirectory,
          getNewLine: () => tse.sys.newLine
        })
      );
      console.info(`Found ${diagnostics.length} error(s).` + tse.sys.newLine);
      process.exit(1);
    }
  }

  /**
   * Configuration dir
   * @param tsConfigPath
   * @param tpxConfigPath
   */
  async loadTypescriptWithConfig(tsConfigPath: string, tpxConfigPath = ""): Promise<TpxConfiguration> {
    const configPath = join(process.cwd(), tsConfigPath);
    if (!existsSync(configPath)) {
      throw new Error(MESSAGES.MISSING_TYPESCRIPT_PATH(tsConfigPath));
    }
    const tse = await this.loadTypescript();
    const cliConfig = await this.getConfiguration(tpxConfigPath);
    try {
      const tsConfig = tse.getParsedCommandLineOfConfigFile(
        configPath,
        {},
        <ts.ParseConfigFileHost><unknown>tse.sys
      );
      return {
        tse,
        tsConfig,
        cliConfig
      };
    } catch (e) {
      this.print(e.stack, true);
      throw new Error(MESSAGES.MISSING_TYPESCRIPT_PATH(tsConfigPath));
    }
  }

  /**
   * Loads typescript binary
   */
  async loadTypescript(): Promise<typeof ts> {
    return await this.loadBinary("typescript");
  }

  /**
   * Load binary
   * @param packageName
   * @param dir
   */
  async loadBinary<T>(packageName, dir = ["node_modules"]): Promise<T> {
    try {
      const binPath = require.resolve(packageName, {
        paths: [normalize(join(process.cwd(), ...dir))]
      });
      return require(binPath);
    } catch {
      throw new Error(
        `${packageName} could not be found! Please, install "${packageName}" package.`
      );
    }
  }

  /**
   * Get typeix configuration file
   * @param dir
   */
  async getConfiguration(dir = ""): Promise<TypeixCliConfig> {
    const configFiles = [
      ".typeixcli.json",
      ".typeix-cli.json",
      "typeix-cli.json",
      "typeix.json"
    ];
    const files = await this.readDir(dir);
    const configFile = files.find(item => configFiles.includes(item));
    if (isUndefined(configFile)) {
      throw new Error(MESSAGES.INFORMATION_CLI_MANAGER_FAILED);
    }
    const file = await this.readFile([dir, configFile]);
    const data = <TypeixCliConfig>JSON.parse(file.toString());
    if (data.compilerOptions) {
      return {
        ...CLI_DEFAULT,
        ...data,
        compilerOptions: {
          ...CLI_DEFAULT.compilerOptions,
          ...data.compilerOptions
        }
      };
    }
    return {
      ...CLI_DEFAULT,
      ...data
    };
  }

  /**
   * Read dir
   * @param dir
   */
  async readDir(dir: string | Array<string>): Promise<Array<string>> {
    if (isArray(dir)) {
      dir = join(...dir);
    }
    return new Promise((resolve, reject) => {
      readdir(
        normalize(join(process.cwd(), <string>dir)),
        (error, files) => {
          if (error) {
            this.print(error, true);
            reject(error);
          } else {
            resolve(files);
          }
        }
      );
    });
  }

  /**
   * Read file
   * @param file
   */
  async readFile(file: string | Array<string>): Promise<Buffer> {
    if (isArray(file)) {
      file = join(...file);
    }
    return new Promise((resolve, reject) => {
      readFile(
        normalize(join(process.cwd(), <string>file)),
        (error: NodeJS.ErrnoException, buffer: Buffer) => {
          if (isDefined(error)) {
            reject(error);
          } else {
            resolve(buffer);
          }
        }
      );
    });
  }

  /**
   * Get project package
   */
  async getProjectPackage(): Promise<{ [key: string]: any }> {
    const file = await this.readFile("package.json");
    return JSON.parse(file.toString());
  }

  /**
   * Filter options
   * @param options
   * @param exclude
   */
  filterOptions(options: Array<Option>, exclude: Array<string>): Array<Option> {
    return options.filter(item => isDefined(item.value) && !exclude.includes(item.name));
  }

  /**
   * Compare option value
   * @param options
   * @param key
   * @param compareVal
   */
  compareOptionValue(options: Array<Option>, key: string, compareVal: string | boolean) {
    return this.getOptionValue(options, key) === compareVal;
  }

  /**
   * Returns commander option value
   * @param options
   * @param key
   */
  getOptionValue(options: Array<Option>, key: string): string | boolean {
    return this.getOption(options, key)!.value;
  }

  /**
   * Returns commander option
   * @param options
   * @param key
   */
  getOption(options: Array<Option>, key: string): Option {
    return options.find(option => option.name === key);
  }

  /**
   * Create input
   * @param name
   * @param message
   * @param defaultAnswer
   */
  createInput(name: string, message: string, defaultAnswer: string) {
    return {
      type: "input",
      name,
      message,
      default: defaultAnswer
    };
  }

  /**
   * Create select
   * @param name
   * @param message
   * @param choices
   */
  createSelect(name: string, message: string, choices: string[]) {
    return {
      type: "list",
      name,
      message,
      choices
    };
  }

  /**
   * Prompt question
   * @param questions
   */
  async doPrompt(questions: Array<Question>): Promise<any> {
    const prompt = inquirer.createPromptModule();
    return await prompt(questions);
  }

  /**
   * outputLines
   * @param data
   * @param isError
   */
  print(data: any, isError = false): void {
    if (data instanceof Buffer) {
      data.toString()
        .split("\n")
        .forEach(line => {
          if (line.includes("WARN")) {
            console.warn(chalk.yellow(line));
          } else if (line.includes("ERR") || isError) {
            console.error(chalk.red(line));
          } else {
            console.log(line);
          }
        });
    } else if (isError) {
      console.error(chalk.red(data));
    } else {
      console.log(data);
    }
  }

  /**
   * Gets remaining flags
   * @param cli
   */
  getRemainingFlags(): string {
    const rawArgs = [...this.commanderStatic.args];
    return rawArgs.splice(Math.max(rawArgs.findIndex((item: string) => item.startsWith("--")), 0))
      .filter((item: string, index: number, array: string[]) => {
        const prevKey = array[index - 1];
        if (prevKey) {
          const key = this.camelCase(
            prevKey.replace("--", "").replace("no", "")
          );
          if (Reflect.get(this.commanderStatic, key) === item) {
            return false;
          }
        }
        return true;
      }).join(" ");
  }

  /**
   * Camel case
   * @param value
   */
  camelCase(value: string) {
    return value.split("-").reduce((str, word) => {
      return str + word[0].toUpperCase() + word.slice(1);
    });
  }
}
