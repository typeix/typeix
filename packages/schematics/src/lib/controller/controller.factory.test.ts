import {normalize} from "@angular-devkit/core";
import {
  SchematicTestRunner,
  UnitTestTree,
} from "@angular-devkit/schematics/testing";
import * as path from "path";
import {ApplicationOptions} from "../application/application.schema";
import {ModuleOptions} from "../module/module.schema";
import {ControllerOptions} from "./controller.schema";

describe("Controller Factory", () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    ".",
    path.join(process.cwd(), "src/collection.json"),
  );
  it("should manage name only", async () => {
    const options: ControllerOptions = {
      name: "foo",
      skipImport: true,
      spec: false,
      flat: false,
    };
    const tree: UnitTestTree = await runner.runSchematic("controller", options);
    const files: string[] = tree.files;

    expect(
      files.find(filename => filename === "/foo/foo.controller.ts"),
    ).toBeDefined();
    expect(
      files.find(filename => filename === "/foo/foo.controller.spec.ts"),
    ).not.toBeDefined();
    expect(tree.readContent("/foo/foo.controller.ts")).toEqual(
      [
        "import { Controller } from \"@typeix/resty\";\n" +
        "\n" +
        "@Controller({\n" +
        "  path: \"/foo\"\n" +
        "})\n" +
        "export class FooController {}\n"
      ].join("")
    );
  });
  it("should manage name has a path", async () => {
    const options: ControllerOptions = {
      name: "bar/foo",
      skipImport: true,
    };
    const tree: UnitTestTree = await runner.runSchematic("controller", options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === "/bar/foo/foo.controller.ts"),
    ).toBeDefined();
    expect(
      files.find(filename => filename === "/bar/foo/foo.controller.spec.ts"),
    ).toBeDefined();
    expect(tree.readContent("/bar/foo/foo.controller.ts")).toEqual(
      [
        "import { Controller } from \"@typeix/resty\";\n" +
        "\n" +
        "@Controller({\n" +
        "  path: \"/foo\"\n" +
        "})\n" +
        "export class FooController {}\n"
      ].join("")
    );
  });
  it("should manage name and path", async () => {
    const options: ControllerOptions = {
      name: "foo",
      path: "bar",
      skipImport: true,
    };
    const tree: UnitTestTree = await runner.runSchematic("controller", options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === "/bar/foo/foo.controller.ts"),
    ).toBeDefined();
    expect(
      files.find(filename => filename === "/bar/foo/foo.controller.spec.ts"),
    ).toBeDefined();
    expect(tree.readContent("/bar/foo/foo.controller.ts")).toEqual(
      [
        "import { Controller } from \"@typeix/resty\";\n" +
        "\n" +
        "@Controller({\n" +
        "  path: \"/foo\"\n" +
        "})\n" +
        "export class FooController {}\n"
      ].join("")
    );
  });
  it("should manage name to dasherize", async () => {
    const options: ControllerOptions = {
      name: "fooBar",
      skipImport: true,
    };
    const tree: UnitTestTree = await runner.runSchematic("controller", options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === "/foo-bar/foo-bar.controller.ts"),
    ).toBeDefined();
    expect(
      files.find(
        filename => filename === "/foo-bar/foo-bar.controller.spec.ts",
      ),
    ).toBeDefined();
    expect(tree.readContent("/foo-bar/foo-bar.controller.ts")).toEqual(
      [
        "import { Controller } from \"@typeix/resty\";\n" +
        "\n" +
        "@Controller({\n" +
        "  path: \"/foo-bar\"\n" +
        "})\n" +
        "export class FooBarController {}\n"
      ].join("")
    );
  });
  it("should manage path to dasherize", async () => {
    const options: ControllerOptions = {
      name: "barBaz/foo",
      skipImport: true,
    };
    const tree: UnitTestTree = await runner.runSchematic("controller", options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === "/bar-baz/foo/foo.controller.ts"),
    ).toBeDefined();
    expect(
      files.find(
        filename => filename === "/bar-baz/foo/foo.controller.spec.ts",
      ),
    ).toBeDefined();
    expect(tree.readContent("/bar-baz/foo/foo.controller.ts")).toEqual(
      [
        "import { Controller } from \"@typeix/resty\";\n" +
        "\n" +
        "@Controller({\n" +
        "  path: \"/foo\"\n" +
        "})\n" +
        "export class FooController {}\n"
      ].join("")
    );
  });
  it("should manage javascript file", async () => {
    const options: ControllerOptions = {
      name: "foo",
      language: "js",
      skipImport: true,
    };
    const tree: UnitTestTree = await runner.runSchematic("controller", options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === "/foo/foo.controller.js"),
    ).toBeDefined();
    expect(
      files.find(filename => filename === "/foo/foo.controller.spec.js"),
    ).toBeDefined();
    expect(tree.readContent("/foo/foo.controller.js")).toEqual(
      [
        "import { Controller } from \"@typeix/resty\";\n" +
        "\n" +
        "@Controller({\n" +
        "  path: \"/foo\"\n" +
        "})\n" +
        "export class FooController {}\n"
      ].join("")
    );
  });
  it("should manage declaration in app module", async () => {
    const app: ApplicationOptions = {
      name: "",
    };
    let tree: UnitTestTree = await runner.runSchematic("application", app);
    const options: ControllerOptions = {
      name: "foo",
    };
    tree = await runner.runSchematic("controller", options, tree);
    expect(tree.readContent(normalize("/src/app.module.ts"))).toEqual(
      [
        "import {Logger, RootModule} from \"@typeix/resty\";\n" +
        "import {AppController} from \"./app.controller\";\n" +
        "import {AppService} from \"./app.service\";\n" +
        "import {FooController} from \"./foo/foo.controller\";\n" +
        "\n" +
        "@RootModule({\n" +
        "  imports: [],\n" +
        "  controllers: [AppController, FooController],\n" +
        "  providers: [AppService],\n" +
        "  shared_providers: [\n" +
        "    {\n" +
        "      provide: Logger,\n" +
        "      useFactory: () => {\n" +
        "        return new Logger({\n" +
        "          options: {\n" +
        "            transport: {\n" +
        "              target: \"pino-pretty\",\n" +
        "              options: {\n" +
        "                colorize: true\n" +
        "              }\n" +
        "            }\n"   +
        "          }\n" +
        "        });\n" +
        "      }\n" +
        "    }\n" +
        "  ]\n" +
        "})\n" +
        "export class AppModule {\n" +
        "}\n"
      ].join("")
    );
  });
  it("should manage declaration in foo module", async () => {
    const app: ApplicationOptions = {
      name: "",
    };
    let tree: UnitTestTree = await runner.runSchematic("application", app);
    const module: ModuleOptions = {
      name: "foo",
    };
    tree = await runner.runSchematic("module", module, tree);
    ;
    const options: ControllerOptions = {
      name: "foo",
    };
    tree = await runner.runSchematic("controller", options, tree);
    expect(tree.readContent(normalize("/src/foo/foo.module.ts"))).toEqual(
      [
        "import {Module} from \"@typeix/resty\";\n" +
        "import {FooController} from \"./foo.controller\";\n" +
        "\n" +
        "@Module({\n" +
        "  providers: [],\n" +
        "  controllers: [FooController]\n" +
        "})\n" +
        "export class FooModule {}\n"
      ].join("")
    );
  });
});
