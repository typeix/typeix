import {Injector} from "@typeix/di";
import {CliTools} from "../cli-tools";
import {AbstractPackageRunner} from "./abstract-package-runner";
import {NpmRunner} from "./npm.runner";


describe("Yarn", () => {
  const cliTools = {};
  let runner: AbstractPackageRunner & NpmRunner;
  beforeEach(() => {
    let injector = Injector.Sync.createAndResolve(NpmRunner, [
      {
        provide: Array,
        useValue: []
      },
      {
        provide: CliTools,
        useValue: cliTools
      }
    ]);
    runner = injector.get(NpmRunner);
  });

  test("install", async () => {
    const pkgInstallSpy = spyOn<any>(AbstractPackageRunner.prototype, "pkgInstall");
    await runner.install("","@typeix/cli");
    expect(pkgInstallSpy).toBeCalledWith("install @typeix/cli", "");
  });

  test("add", async () => {
    const pkgInstallSpy = spyOn<any>(AbstractPackageRunner.prototype, "pkgProgress");
    await runner.add("","@typeix/cli");
    expect(pkgInstallSpy).toBeCalledWith("install @typeix/cli", "");
  });

  test("update", async () => {
    const pkgInstallSpy = spyOn<any>(AbstractPackageRunner.prototype, "pkgProgress");
    await runner.update("","@typeix/cli");
    expect(pkgInstallSpy).toBeCalledWith("update @typeix/cli", "");
  });

  test("delete", async () => {
    const pkgInstallSpy = spyOn<any>(AbstractPackageRunner.prototype, "pkgProgress");
    await runner.delete("","@typeix/cli");
    expect(pkgInstallSpy).toBeCalledWith("uninstall @typeix/cli", "");
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
