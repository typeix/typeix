import {Injector} from "@typeix/di";
import {SchematicRunner} from "./schematic.runner";

describe("Schematic Runner", () => {
  let runner: SchematicRunner;
  beforeEach(() => {
    let injector = Injector.Sync.createAndResolve(SchematicRunner, []);
    runner = injector.get(SchematicRunner);
  });

  test("execute application", async () => {
    const runSpy = spyOn<any>(runner, "run");
    await runner.execute("@typeix/schematics", "application", []);
    expect(runSpy).toBeCalledWith("@typeix/schematics:application");
  });

  test("execute application options", async () => {
    const runSpy = spyOn<any>(runner, "run");
    await runner.execute("@typeix/schematics", "application", [{name: "key", value: "value"}], "--extraFlag");
    expect(runSpy).toBeCalledWith("@typeix/schematics:application --key=\"value\" --extraFlag");
  });

  test("execute application options bool", async () => {
    const runSpy = spyOn<any>(runner, "run");
    await runner.execute("@typeix/schematics", "application", [{name: "key", value: false}], "--extraFlag");
    expect(runSpy).toBeCalledWith("@typeix/schematics:application --no-key --extraFlag");
  });

  test("execute application options bool false", async () => {
    const runSpy = spyOn<any>(runner, "run");
    await runner.execute("@typeix/schematics", "application", [{name: "key", value: true}], "--extraFlag");
    expect(runSpy).toBeCalledWith("@typeix/schematics:application --key --extraFlag");
  });

  test("execute application options name", async () => {
    const runSpy = spyOn<any>(runner, "run");
    await runner.execute("@typeix/schematics", "application", [{name: "name", value: "igor[name]"}], "--extraFlag");
    expect(runSpy).toBeCalledWith("@typeix/schematics:application --name=igor\\[name\\] --extraFlag");
  });

  test("execute application options number", async () => {
    const runSpy = spyOn<any>(runner, "run");
    await runner.execute("@typeix/schematics", "application", [{name: "number", value: 1}], "--extraFlag");
    expect(runSpy).toBeCalledWith("@typeix/schematics:application --number=1 --extraFlag");
  });

  test("execute application options version", async () => {
    const runSpy = spyOn<any>(runner, "run");
    await runner.execute("@typeix/schematics", "application", [{name: "version", value: "1.0.0"}], "--extraFlag");
    expect(runSpy).toBeCalledWith("@typeix/schematics:application --version=1.0.0 --extraFlag");
  });

  test("execute application options path", async () => {
    const runSpy = spyOn<any>(runner, "run");
    await runner.execute("@typeix/schematics", "application", [{name: "path", value: "./"}], "--extraFlag");
    expect(runSpy).toBeCalledWith("@typeix/schematics:application --path=./ --extraFlag");
  });
});
