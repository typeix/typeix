import {Injector, verifyProvider} from "@typeix/di";
import {YarnRunner} from "./runners/yarn.runner";
import {NpmRunner} from "./runners/npm.runner";
import {CliTools} from "./cli-tools";
import {join, normalize} from "path";
import {StartCommand} from "./start.command";
import {EventEmitter} from "events";

describe("Start command", () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let action = (...args: Array<any>) => {
    // not defined now
  };
  const packageManagerMock = {
    add: () => {
      //
    }
  };
  let programMock;
  const cliMock = {
    commander: () => programMock,
    getOptionValue: (options, key) => {
      return options.find(option => option.name === key).value;
    },
    useWebpackCompiler: () => {
      //
    },
    compileTypescript: () => {
      //
    },
    getPackageManagerName: () => {
      //
      return "npm";
    },
    getRemainingFlags: () => {
      //
      return "";
    },
    print: () => {
      //
    },
    readFile: () => {
      //
    }
  };

  let eventEmitter: EventEmitter;

  beforeEach(async () => {
    eventEmitter = new EventEmitter();
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
  });


  test("Define Start", async () => {
    const programCommandSpy = spyOn(programMock, "command").and.callThrough();
    Injector.Sync.createAndResolve(verifyProvider(StartCommand), [
      {
        provide: CliTools,
        useValue: cliMock
      },
      {
        provide: YarnRunner,
        useValue: packageManagerMock
      },
      {
        provide: NpmRunner,
        useValue: packageManagerMock
      },
      {
        provide: EventEmitter,
        useValue: eventEmitter
      }
    ]);
    await action({dryRun: false, path: "tsconfig.build.json", file: "dist/bootstrap.js"});
    expect(programCommandSpy).toHaveBeenCalledWith("start");
  });

  test("Define Start DryRun", async () => {
    const programCommandSpy = spyOn(programMock, "command").and.callThrough();
    Injector.Sync.createAndResolve(verifyProvider(StartCommand), [
      {
        provide: CliTools,
        useValue: cliMock
      },
      {
        provide: YarnRunner,
        useValue: packageManagerMock
      },
      {
        provide: NpmRunner,
        useValue: packageManagerMock
      },
      {
        provide: EventEmitter,
        useValue: eventEmitter
      }
    ]);
    await action({dryRun: false, path: "tsconfig.build.json", file: "dist/bootstrap.js"});
    expect(programCommandSpy).toHaveBeenCalledWith("start");
  });

  test("Define Start getOutDir", async () => {
    const programCommandSpy = spyOn(programMock, "command").and.callThrough();
    const command = Injector.Sync.createAndResolve(verifyProvider(StartCommand), [
      {
        provide: CliTools,
        useValue: cliMock
      },
      {
        provide: YarnRunner,
        useValue: packageManagerMock
      },
      {
        provide: NpmRunner,
        useValue: packageManagerMock
      },
      {
        provide: EventEmitter,
        useValue: eventEmitter
      }
    ]).get(StartCommand);
    await action({dryRun: false, path: "tsconfig.build.json", file: "dist/bootstrap.js"});
    expect(programCommandSpy).toHaveBeenCalledWith("start");
    spyOn(cliMock, "readFile").and.returnValue(
      Buffer.from(JSON.stringify({
        outDir: "."
      }))
    );
    const result = await Reflect.get(command, "getOutDir").call(command, [{
      name: "path",
      value: "."
    }]);
    expect(result).toEqual(
      normalize(join(process.cwd(), "dist"))
    );
  });


});
