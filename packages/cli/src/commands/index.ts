import {Injector, verifyProvider, verifyProviders} from "@typeix/di";
import {CommanderStatic} from "commander";
import {CliTools} from "./cli-tools";
import {InfoCommand} from "./info.command";
import {NewCommand} from "./new.command";
import {SchematicRunner} from "./runners/schematic.runner";
import {NpmRunner} from "./runners/npm.runner";
import {YarnRunner} from "./runners/yarn.runner";
import {GitRunner} from "./runners/git.runner";


export function setup(program: CommanderStatic): Injector {
  const injector = Injector.createAndResolve(CliTools, [
    {
      provide: "program",
      useValue: program
    },
    GitRunner,
    SchematicRunner,
    NpmRunner,
    YarnRunner
  ]);
  injector.createAndResolve(verifyProvider(InfoCommand), []);
  injector.createAndResolve(verifyProvider(NewCommand), []);
  return injector;
}
