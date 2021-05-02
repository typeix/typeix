import {AbstractRunner} from "./abstract-runner";
import {Injectable} from "@typeix/di";
import * as schematics from "./schematics.json";
import {isBoolean, isFalsy, isString} from "@typeix/utils";
import {strings} from "@angular-devkit/core";

interface Schematic {
  name: string;
  value: boolean | string;
}

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

  static getOption(name: string, value: string | boolean): string {
    if (isString(value) && name === "name") {
      return `--${name}=${SchematicRunner.format(value)}`;
    } else if (isString(value) && (name === "version" || name === "path")) {
      return `--${name}=${value}`;
    } else if (isString(value)) {
      return `--${name}="${value}"`;
    } else if (isBoolean(value)) {
      const str = strings.dasherize(name);
      return value ? `--${str}` : `--no-${str}`;
    }
    return `--${strings.dasherize(name)}=${value}`;
  }


  public async execute(collection: string, name: string, options: Array<Schematic>, extraFlags?: string): Promise<string> {
    const optionStr = options.reduce((line, item) =>
      line.concat(` ${SchematicRunner.getOption(item.name, item.value)}`), ""
    );
    let command = `${collection}:${SchematicRunner.validate(name)}${optionStr}`;
    command = extraFlags ? command.concat(` ${extraFlags}`) : command;
    return await this.run(command);
  }

}
