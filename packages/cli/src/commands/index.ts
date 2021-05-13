import {SyncInjector, Injector, verifyProviders} from "@typeix/di";
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
import {RemoveCommand} from "./remove.command";
import {EventEmitter} from "events";


export function setup(program: CommanderStatic): SyncInjector {
  const injector = Injector.Sync.createAndResolve(CliTools, [
    {
      provide: "program",
      useValue: program
    },
    EventEmitter
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
      RemoveCommand,
      StartCommand,
      BuildCommand,
      InfoCommand,
      GenerateCommand
    ]
  ).forEach(provider => injector.createAndResolve(provider, providers));
  return injector;
}
