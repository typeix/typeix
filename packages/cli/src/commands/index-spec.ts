import {setup} from "./index";
import {CommanderStatic} from "commander";
import {GitRunner} from "./runners/git.runner";
import {SchematicRunner} from "./runners/schematic.runner";
import {NpmRunner} from "./runners/npm.runner";
import {YarnRunner} from "./runners/yarn.runner";
import {NewCommand} from "./new.command";
import {AddCommand} from "./add.command";
import {UpdateCommand} from "./update.command";
import {RemoveCommand} from "./remove.command";
import {StartCommand} from "./start.command";
import {BuildCommand} from "./build.command";
import {InfoCommand} from "./info.command";
import {GenerateCommand} from "./generate.command";

let programMock = {
  option: () => {
    // none for now
    return programMock;
  },
  command: () => {
    // none for now
    return programMock;
  },
  action: () => {
    // none for now
    return programMock;
  },
  description: () => {
    // none for now
    return programMock;
  },
  on: () => {
    // none for now
    return programMock;
  },
  alias: () => {
    // none for now
    return programMock;
  },
  allowUnknownOption: () => programMock
};

describe("Should create instances", () => {


  test("load setup", async () => {

    const injector = setup((programMock as any) as CommanderStatic);

    expect(injector.has(GitRunner)).toBeTruthy();
    expect(injector.has(SchematicRunner)).toBeTruthy();
    expect(injector.has(NpmRunner)).toBeTruthy();
    expect(injector.has(YarnRunner)).toBeTruthy();

    const commands = [
      NewCommand,
      AddCommand,
      UpdateCommand,
      RemoveCommand,
      StartCommand,
      BuildCommand,
      InfoCommand,
      GenerateCommand
    ];

    for (const command of commands) {
      expect(injector.has(command)).toBeTruthy();
      expect(injector.get(command)).toBeInstanceOf(command);
    }
  });
});
