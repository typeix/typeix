import {Injector, verifyProvider} from "@typeix/di";
import {YarnRunner} from "./runners/yarn.runner";
import {NpmRunner} from "./runners/npm.runner";
import {CliTools} from "./cli-tools";
import {UpdateCommand} from "./update.command";

describe("Remove command", () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let action = (...args: Array<any>) => {
    // not defined now
  };
  const packageManagerMock = {
    upgrade: () => {
      //
    },
    update: () => {
      //
    }
  };
  let programMock;
  const cliMock = {
    commander: () => programMock,
    getOptionValue: (options, key) => {
      return options.find(option => option.name === key).value;
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


  test("Define Remove", async () => {
    spyOn(process, "exit");
    const programCommandSpy = spyOn(programMock, "command").and.callThrough();
    const pkgMock = spyOn(packageManagerMock, "update").and.callThrough();
    const injector = Injector.Sync.createAndResolve(verifyProvider(UpdateCommand), [
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
    await action("typescript", {dryRun: false});
    expect(programCommandSpy).toHaveBeenCalledWith("update <package>");
    expect(pkgMock).toBeCalledWith("typescript", "");
  });

  test("Define Remove DryRun", async () => {
    spyOn(process, "exit");
    const programCommandSpy = spyOn(programMock, "command").and.callThrough();
    Injector.Sync.createAndResolve(verifyProvider(UpdateCommand), [
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
    await action("typescript", {dryRun: true});
    expect(programCommandSpy).toHaveBeenCalledWith("update <package>");
  });
});
