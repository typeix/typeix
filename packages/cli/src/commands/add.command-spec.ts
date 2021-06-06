import {Injector, verifyProvider} from "@typeix/di";
import {AddCommand} from "./add.command";
import {YarnRunner} from "./runners/yarn.runner";
import {NpmRunner} from "./runners/npm.runner";
import {CliTools} from "./cli-tools";

describe("Add command", () => {
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


  test("Define Add", async () => {
    spyOn(process, "exit");
    const programCommandSpy = spyOn(programMock, "command").and.callThrough();
    const pkgMock = spyOn(packageManagerMock, "add").and.callThrough();
    const injector = Injector.Sync.createAndResolve(verifyProvider(AddCommand), [
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
    expect(programCommandSpy).toHaveBeenCalledWith("add <package>");
    expect(pkgMock).toBeCalledWith("typescript", "");
  });

  test("Define Add DryRun", async () => {
    spyOn(process, "exit");
    const programCommandSpy = spyOn(programMock, "command").and.callThrough();
    const injector = Injector.Sync.createAndResolve(verifyProvider(AddCommand), [
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
    expect(programCommandSpy).toHaveBeenCalledWith("add <package>");
  });
});
