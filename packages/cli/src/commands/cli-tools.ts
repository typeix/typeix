import {AfterConstruct, Inject, Injectable} from "@typeix/di";
import {isDefined} from "@typeix/utils";
import {CommanderStatic} from "commander";
import {CLI_ERRORS, MESSAGES} from "../ui";
import {readFile} from "fs";
import {join} from "path";


@Injectable()
export class CliTools {

  @Inject("program") private program: CommanderStatic;

  @AfterConstruct()
  onProgramInit() {
    this.program.on("command:*", () => {
      console.error(CLI_ERRORS.INVALID_COMMAND, this.program.args.join(" "));
      console.log(MESSAGES.AVAILABLE_COMMANDS);
      process.exit(1);
    });
  }

  commander(): CommanderStatic {
    return this.program;
  }

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

  createInput(name: string, message: string, defaultAnswer: string) {
    return {
      type: "input",
      name,
      message,
      default: defaultAnswer
    };
  }

  createSelect(name: string, message: string, choices: string[]) {
    return {
      type: "list",
      name,
      message,
      choices
    };
  }
}
