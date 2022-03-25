import {AbstractRunner} from "./abstract-runner";
import {Injectable} from "@typeix/di";
import * as schematics from "./schematics.json";
import {isBoolean, isFalsy, isString, isTruthy} from "@typeix/utils";
import {strings} from "@angular-devkit/core";
import * as Table from "cli-table3";
import {Schematic} from "../interfaces";
import * as chalk from "chalk";


@Injectable()
export class SchematicRunner extends AbstractRunner {

  constructor() {
    super("node", [`"${SchematicRunner.findClosest()}"`]);
  }

  public static findClosest(): string {
    try {
      return require.resolve(
        "@angular-devkit/schematics-cli/bin/schematics.js",
        {paths: SchematicRunner.getModulePaths()}
      );
    } catch {
      throw new Error("\"schematics\" binary path could not be found!");
    }
  }

  public static getModulePaths() {
    return module.paths;
  }

  static format(value): string {
    return strings.dasherize(value).split("").reduce((content, char) => {
      if (char === "(" || char === ")" || char === "[" || char === "]") {
        return `${content}\\${char}`;
      }
      return `${content}${char}`;
    }, "");
  }

  static validate(name: string) {
    const schematic = schematics.find(i => i.name === name || i.alias === name);
    if (isFalsy(schematic)) {
      throw new Error(`Invalid schematic "${name}". Please, ensure that "${name}" exists in this collection.`);
    }
    return schematic.name;
  }

  static getOption(name: string, value: string | boolean | number): string {
    if (isString(value) && name === "name") {
      return `--${name}=${SchematicRunner.format(value)}`;
    } else if (isString(value) && (name === "version" || name === "path")) {
      return `--${name}=${value}`;
    } else if (isString(value)) {
      return `--${name}="${value}"`;
    } else if (isBoolean(value)) {
      const str = strings.dasherize(name);
      return value ? `--${str}` : `--no-${str}`;
    } else if (isTruthy(value)) {
      return `--${strings.dasherize(name)}=${value}`;
    }
    return "";
  }

  /**
   * Execute
   * @param collection
   * @param name
   * @param options
   * @param extraFlags
   */
  public async execute(collection: string, name: string, options: Array<Schematic>, extraFlags?: string): Promise<Buffer> {
    const optionStr = options.reduce((line, item) =>
      line.concat(` ${SchematicRunner.getOption(item.name, item.value)}`), ""
    );
    let command = `${collection}:${SchematicRunner.validate(name)}${optionStr}`;
    command = extraFlags ? command.concat(` ${extraFlags}`) : command;
    return await this.run(command);
  }

  /**
   * Get description
   */
  public getDescription(): string {
    const leftMargin = "        ";
    const table: any = new Table( {
      head: ["name", "alias", "description"],
      chars: {
        "left": leftMargin.concat("│"),
        "top-left": leftMargin.concat("┌"),
        "bottom-left": leftMargin.concat("└"),
        "mid": "",
        "left-mid": "",
        "mid-mid": "",
        "right-mid": ""
      }
    });
    for (const schematic of schematics) {
      table.push([
        chalk.green(schematic.name),
        chalk.cyan(schematic.alias),
        schematic.description
      ]);
    }
    return (
      "Generate a Typeix element.\n" +
      "  Available schematics:\n" +
      table.toString()
    );
  }
}
