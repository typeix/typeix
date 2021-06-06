import {Injector} from "@typeix/di";
import {YarnRunner} from "./yarn.runner";
import {CliTools} from "../cli-tools";
import {AbstractPackageRunner} from "./abstract-package-runner";


describe("Yarn", () => {
  const cliTools = {};
  let runner: AbstractPackageRunner & YarnRunner;
  beforeEach(() => {
    let injector = Injector.Sync.createAndResolve(YarnRunner, [
      {
        provide: Array,
        useValue: []
      },
      {
        provide: CliTools,
        useValue: cliTools
      }
    ]);
    runner = injector.get(YarnRunner);
  });

  test("install", async () => {
    const pkgInstallSpy = spyOn<any>(AbstractPackageRunner.prototype, "pkgInstall");
    await runner.install("","@typeix/cli");
    expect(pkgInstallSpy).toBeCalledWith("install @typeix/cli", "");
  });

  test("add", async () => {
    const pkgInstallSpy = spyOn<any>(AbstractPackageRunner.prototype, "pkgProgress");
    await runner.add("","@typeix/cli");
    expect(pkgInstallSpy).toBeCalledWith("add @typeix/cli", "");
  });

  test("update", async () => {
    const pkgInstallSpy = spyOn<any>(AbstractPackageRunner.prototype, "pkgProgress");
    await runner.update("","@typeix/cli");
    expect(pkgInstallSpy).toBeCalledWith("upgrade @typeix/cli", "");
  });

  test("delete", async () => {
    const pkgInstallSpy = spyOn<any>(AbstractPackageRunner.prototype, "pkgProgress");
    await runner.delete("","@typeix/cli");
    expect(pkgInstallSpy).toBeCalledWith("remove @typeix/cli", "");
  });

  test("upgrade", async () => {
    const delSpy = spyOn<any>(runner, "delete").and.returnValue(Buffer.alloc(10));
    const addSpy = spyOn<any>(runner, "add").and.returnValue(Buffer.alloc(10));
    await runner.upgrade("","@typeix/cli");
    expect(delSpy).toHaveBeenCalled();
    expect(addSpy).toHaveBeenCalled();
  });

  test("list", async () => {
    const pkgInstallSpy = spyOn<any>(AbstractPackageRunner.prototype, "pkgList");
    await runner.list(true);
    expect(pkgInstallSpy).toBeCalledWith(true);
  });

  test("version", async () => {
    const pkgInstallSpy = spyOn<any>(AbstractPackageRunner.prototype, "pkgVersion");
    await runner.version();
    expect(pkgInstallSpy).toHaveBeenCalled();
  });
});
