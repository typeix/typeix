import {Injector, verifyProvider} from "@typeix/di";
import {CommanderStatic} from "commander";
import {CliTools} from "./cli-tools";
import {InfoCommand} from "./info.command";


export function setup(program: CommanderStatic): Injector {
  const injector = Injector.createAndResolve(CliTools, [
    {
      provide: "program",
      useValue: program
    }
  ]);
  injector.createAndResolve(verifyProvider(InfoCommand), []);
  return injector;
}
