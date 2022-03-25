import {CliTools} from "./cli-tools";
import {EventEmitter} from "events";
import {Injector, SyncInjector, verifyProvider} from "@typeix/di";
import {InfoCommand} from "./info.command";
import {BANNER, chalk, osName} from "../ui";
import {platform, release} from "os";
import {join, normalize} from "path";


describe("Info command", () => {
  const eventEmitter = new EventEmitter();
  let injector: SyncInjector;
  let action = () => {
    // not defined now
  };
  let programMock;
  beforeEach(() => {
    programMock = {
      option: () => {
        // none for now
        return programMock;
      },
      command: () => {
        // none for now
        return programMock;
      },
      action: (callback) => {
        action = callback;
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
    injector = Injector.Sync.createAndResolve(CliTools, [
      {
        provide: "program",
        useValue: programMock
      },
      {
        provide: EventEmitter,
        useValue: eventEmitter
      }
    ]);
  });

  test("Define Info", async () => {
    const programCommandSpy = spyOn(programMock, "command").and.callThrough();
    const programDescriptionSpy = spyOn(programMock, "description").and.callThrough();
    const infoSpy = spyOn(console, "info").and.callThrough();
    injector.createAndResolve(verifyProvider(InfoCommand), []);
    action();
    const pkg = require(normalize(join("..", "..", "package.json")));
    expect(programCommandSpy).toHaveBeenCalledWith("info");
    expect(programDescriptionSpy).toHaveBeenCalledWith("Display Typeix project details.");
    expect(infoSpy).toHaveBeenNthCalledWith(1, chalk.red(BANNER), "\n");
    expect(infoSpy).toHaveBeenNthCalledWith(2, chalk.green("[System Information]"));
    expect(infoSpy).toHaveBeenNthCalledWith(3, "OS Version     :", chalk.blue(osName(platform(), release())));
    expect(infoSpy).toHaveBeenNthCalledWith(4, "NodeJS Version :", chalk.blue(process.version), "\n");
    expect(infoSpy).toHaveBeenNthCalledWith(5, chalk.green("[Typeix CLI]"));
    expect(infoSpy).toHaveBeenNthCalledWith(6, "Typeix CLI Version :", chalk.blue(pkg.version), "\n");
  });
});
