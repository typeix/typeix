import {Injector, verifyProvider} from "@typeix/di";
import {YarnRunner} from "./runners/yarn.runner";
import {NpmRunner} from "./runners/npm.runner";
import {CliTools} from "./cli-tools";
import {BuildCommand} from "./build.command";
import {join, normalize} from "path";

describe("Build command", () => {
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
  });


  test("Define Build", async () => {
    const programCommandSpy = spyOn(programMock, "command").and.callThrough();
    const compilerCall = spyOn(cliMock, "compileTypescript");
    Injector.Sync.createAndResolve(verifyProvider(BuildCommand), [
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
      }
    ]);
    await action({dryRun: false, path: "tsconfig.build.json", file: "dist/bootstrap.js"});
    expect(programCommandSpy).toHaveBeenCalledWith("build");
    expect(compilerCall).toHaveBeenCalled();
  });


  test("Define Build useWebpackCompiler", async () => {
    const programCommandSpy = spyOn(programMock, "command").and.callThrough();
    const compilerCall = spyOn(cliMock, "useWebpackCompiler");
    Injector.Sync.createAndResolve(verifyProvider(BuildCommand), [
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
      }
    ]);
    await action({dryRun: false, path: "tsconfig.build.json", file: "dist/bootstrap.js", webpack: true, webpackPath: "."});
    expect(programCommandSpy).toHaveBeenCalledWith("build");
    expect(compilerCall).toHaveBeenCalled();
  });

  test("Define Build DryRun", async () => {
    const programCommandSpy = spyOn(programMock, "command").and.callThrough();
    Injector.Sync.createAndResolve(verifyProvider(BuildCommand), [
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
      }
    ]);
    await action({dryRun: false, path: "tsconfig.build.json", file: "dist/bootstrap.js"});
    expect(programCommandSpy).toHaveBeenCalledWith("build");
  });

  test("Define Build getOutDir", async () => {
    const programCommandSpy = spyOn(programMock, "command").and.callThrough();
    const command = Injector.Sync.createAndResolve(verifyProvider(BuildCommand), [
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
      }
    ]).get(BuildCommand);
    await action({dryRun: false, path: "tsconfig.build.json", file: "dist/bootstrap.js"});
    expect(programCommandSpy).toHaveBeenCalledWith("build");
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
