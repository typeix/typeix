import { normalize } from "@angular-devkit/core";
import {
  SchematicTestRunner,
  UnitTestTree,
} from "@angular-devkit/schematics/testing";
import * as path from "path";
import { ApplicationOptions } from "../application/application.schema";
import { ModuleOptions } from "../module/module.schema";
import { ProviderOptions } from "./provider.schema";

describe("Provider Factory", () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    ".",
    path.join(process.cwd(), "src/collection.json"),
  );
  it("should manage name only", async () => {
    const options: ProviderOptions = {
      name: "foo",
      skipImport: true,
    };
    const tree: UnitTestTree = await runner.runSchematic("provider", options);
    const files: string[] = tree.files;
    expect(files.find(filename => filename === "/foo.ts")).toBeDefined();
    expect(files.find(filename => filename === "/foo.spec.ts")).toBeDefined();
    expect(tree.readContent("/foo.ts")).toEqual(
      [
        "import { Injectable } from \"@typeix/resty\";\n" +
        "\n" +
        "@Injectable()\n" +
        "export class Foo {}\n"
      ].join("")
    );
  });
  it("should manage name has a path", async () => {
    const options: ProviderOptions = {
      name: "bar/foo",
      skipImport: true,
    };
    const tree: UnitTestTree = await runner.runSchematic("provider", options);
    const files: string[] = tree.files;
    expect(files.find(filename => filename === "/bar/foo.ts")).toBeDefined();
    expect(
      files.find(filename => filename === "/bar/foo.spec.ts"),
    ).toBeDefined();
    expect(tree.readContent("/bar/foo.ts")).toEqual(
      [
        "import { Injectable } from \"@typeix/resty\";\n" +
        "\n" +
        "@Injectable()\n" +
        "export class Foo {}\n"
      ].join("")
    );
  });
  it("should manage name and path", async () => {
    const options: ProviderOptions = {
      name: "foo",
      path: "bar",
      skipImport: true,
    };
    const tree: UnitTestTree = await runner.runSchematic("provider", options);
    const files: string[] = tree.files;
    expect(files.find(filename => filename === "/bar/foo.ts")).toBeDefined();
    expect(
      files.find(filename => filename === "/bar/foo.spec.ts"),
    ).toBeDefined();
    expect(tree.readContent("/bar/foo.ts")).toEqual(
      [
        "import { Injectable } from \"@typeix/resty\";\n" +
        "\n" +
        "@Injectable()\n" +
        "export class Foo {}\n"
      ].join("")
    );
  });
  it("should manage name to dasherize", async () => {
    const options: ProviderOptions = {
      name: "bar-foo",
      skipImport: true,
    };
    const tree: UnitTestTree = await runner.runSchematic("provider", options);
    const files: string[] = tree.files;
    expect(files.find(filename => filename === "/bar-foo.ts")).toBeDefined();
    expect(
      files.find(filename => filename === "/bar-foo.spec.ts"),
    ).toBeDefined();
    expect(tree.readContent("/bar-foo.ts")).toEqual(
      [
        "import { Injectable } from \"@typeix/resty\";\n" +
        "\n" +
        "@Injectable()\n" +
        "export class BarFoo {}\n"
      ].join("")
    );
  });
  it("should manage javascript file", async () => {
    const options: ProviderOptions = {
      name: "foo",
      skipImport: true,
      language: "js",
    };
    const tree: UnitTestTree = await runner.runSchematic("provider", options);
    const files: string[] = tree.files;
    expect(files.find(filename => filename === "/foo.js")).toBeDefined();
    expect(files.find(filename => filename === "/foo.spec.js")).toBeDefined();
    expect(tree.readContent("/foo.js")).toEqual(
      [
        "import { Injectable } from \"@typeix/resty\";\n" +
        "\n" +
        "@Injectable()\n" +
        "export class Foo {}\n"
      ].join("")
    );
  });
  it("should manage declaration in app module", async () => {
    const app: ApplicationOptions = {
      name: "",
    };
    let tree: UnitTestTree = await runner.runSchematic("application", app);
    const options: ProviderOptions = {
      name: "foo",
    };
    tree = await runner.runSchematic("provider", options, tree);
    expect(tree.readContent(normalize("/src/app.module.ts"))).toEqual(
      [
        "import {Logger, RootModule} from \"@typeix/resty\";\n" +
        "import {AppController} from \"./app.controller\";\n" +
        "import {AppService} from \"./app.service\";\n" +
        "import {Foo} from \"./foo\";\n" +
        "\n" +
        "@RootModule({\n" +
        "  imports: [],\n" +
        "  controllers: [AppController],\n" +
        "  providers: [AppService, Foo],\n" +
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
    const options: ProviderOptions = {
      name: "foo",
      path: "foo",
    };
    tree = await runner.runSchematic("provider", options, tree);
    expect(tree.readContent(normalize("/src/foo/foo.module.ts"))).toEqual(
      [
        "import {Module} from \"@typeix/resty\";\n" +
        "import {Foo} from \"./foo\";\n" +
        "\n" +
        "@Module({\n" +
        "  providers: [Foo]\n" +
        "})\n" +
        "export class FooModule {}\n"
      ].join("")
    );
  });
  it("should remove . from name", async () => {
    const options: ProviderOptions = {
      name: "foo.entity",
      spec: true,
      flat: true,
    };
    const tree: UnitTestTree = await runner.runSchematic("provider", options);
    const files: string[] = tree.files;

    expect(files.find(filename => filename === "/foo.entity.ts")).not.toBeUndefined();
    expect(tree.readContent("/foo.entity.ts")).toEqual([
      "import { Injectable } from \"@typeix/resty\";\n" +
      "\n" +
      "@Injectable()\n" +
      "export class FooEntity {}\n"
    ].join(""));
  });
});
