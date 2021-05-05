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

describe("Should create instances", () => {
  let program;
  beforeEach(() => {
    program = {
      option: () => {
        // none for now
        return program;
      },
      command: () => {
        // none for now
        return program;
      },
      action: () => {
        // none for now
        return program;
      },
      description: () => {
        // none for now
        return program;
      },
      on: () => {
        // none for now
        return program;
      },
      alias: () => {
        // none for now
        return program;
      },
      allowUnknownOption: () => program
    };
  });

  test("load setup", async () => {

    const injector = setup((program as any) as CommanderStatic);

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
