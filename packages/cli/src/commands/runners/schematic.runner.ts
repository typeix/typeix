import {AbstractRunner} from "./abstract-runner";
import {Injectable} from "@typeix/di";


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
}
