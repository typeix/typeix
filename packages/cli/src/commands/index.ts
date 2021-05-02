import {Injector, verifyProviders} from "@typeix/di";
import {CommanderStatic} from "commander";
import {CliTools} from "./cli-tools";
import {InfoCommand} from "./info.command";
import {NewCommand} from "./new.command";
import {SchematicRunner} from "./runners/schematic.runner";
import {NpmRunner} from "./runners/npm.runner";
import {YarnRunner} from "./runners/yarn.runner";
import {GitRunner} from "./runners/git.runner";
import {AddCommand} from "./add.command";
import {BuildCommand} from "./build.command";
import {GenerateCommand} from "./generate.command";
import {StartCommand} from "./start.command";
import {UpdateCommand} from "./update.command";


export function setup(program: CommanderStatic): Injector {
  const injector = Injector.createAndResolve(CliTools, [
    {
      provide: "program",
      useValue: program
    }
  ]);
  const providers = verifyProviders([
    GitRunner,
    SchematicRunner,
    NpmRunner,
    YarnRunner
  ]);
  verifyProviders(
    [
      NewCommand,
      AddCommand,
      UpdateCommand,
      StartCommand,
      BuildCommand,
      InfoCommand,
      GenerateCommand
    ]
  ).forEach(provider => injector.createAndResolve(provider, providers));
  return injector;
}
