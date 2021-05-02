import {AfterConstruct, Inject, Injectable} from "@typeix/di";
import {isArray, isDefined} from "@typeix/utils";
import {CLI_ERRORS, MESSAGES} from "../ui";
import {readdir, readFile} from "fs";
import {join} from "path";
import * as chalk from "chalk";
import {CommanderStatic} from "commander";


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
    return new Promise(resolve => {
      readdir(
        process.cwd(),
        (error, files) => {
          if (error) {
            this.print(error, true);
          }
          if (isArray(files) && files.includes("yarn.lock")) {
            resolve("yarn");
          } else {
            resolve("npm");
          }
        }
      );
    });
  }

  /**
   * Get project package
   */
  async getProjectPackage(): Promise<any> {
    return new Promise<{ [key: string]: string }>((resolve, reject) => {
      readFile(
        join(process.cwd(), "package.json"),
        (error: NodeJS.ErrnoException | null, buffer: Buffer) => {
          if (isDefined(error)) {
            reject(error);
          } else {
            resolve(JSON.parse(buffer.toString()));
          }
        }
      );
    });
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
