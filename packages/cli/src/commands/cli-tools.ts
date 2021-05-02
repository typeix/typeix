import {AfterConstruct, Inject, Injectable} from "@typeix/di";
import {isDefined, isUndefined} from "@typeix/utils";
import {CLI_ERRORS, MESSAGES} from "../ui";
import {readdir, readFile} from "fs";
import {join} from "path";
import * as chalk from "chalk";
import {CommanderStatic} from "commander";
import {Option, TypeixCliConfig} from "./interfaces";

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
      console.error(CLI_ERRORS.INVALID_COMMAND, this.commanderStatic.args.join(" "));
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
   * Returns configuration file
   */
  async getConfiguration(): Promise<TypeixCliConfig> {
    const configFiles = [
      ".typeixcli.json",
      ".typeix-cli.json",
      "typeix-cli.json",
      "typeix.json"
    ];
    const files = await this.readDir("");
    const configFile = files.find(item => configFiles.includes(item));
    if (isUndefined(configFile)) {
      throw new Error(MESSAGES.INFORMATION_CLI_MANAGER_FAILED);
    }
    const file = await this.readFile(configFile);
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
  async readDir(dir: string): Promise<Array<string>> {
    return new Promise((resolve, reject) => {
      readdir(
        join(process.cwd(), dir),
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
  async readFile(file: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      readFile(
        join(process.cwd(), file),
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
  filterOptions(options: Array<Option>, exclude: Array<string>): Array<Option>{
    return options.filter(item => isDefined(item.value) && !exclude.includes(item.name));
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
