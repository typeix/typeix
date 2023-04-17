import { normalize } from "@angular-devkit/core";
import {
  SchematicTestRunner,
  UnitTestTree,
} from "@angular-devkit/schematics/testing";
import * as path from "path";
import { ApplicationOptions } from "../application/application.schema";
import { ModuleOptions } from "./module.schema";

describe("Module Factory", () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    ".",
    path.join(process.cwd(), "src/collection.json"),
  );
  it("should manage name only", async () => {
    const options: ModuleOptions = {
      name: "foo",
      skipImport: true,
    };
    const tree: UnitTestTree = await runner.runSchematicAsync("module", options).toPromise();
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === "/foo/foo.module.ts"),
    ).not.toBeUndefined();
    expect(tree.readContent("/foo/foo.module.ts")).toEqual(
        [
          "import {Module} from \"@typeix/resty\";\n" +
          "\n" +
          "@Module({\n" +
          "  providers: []\n" +
          "})\n" +
          "export class FooModule {}\n"
        ].join("")
    );
  });
  it("should manage name as a path", async () => {
    const options: ModuleOptions = {
      name: "bar/foo",
      skipImport: true,
    };
    const tree: UnitTestTree = await runner.runSchematicAsync("module", options).toPromise();
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === "/bar/foo/foo.module.ts"),
    ).not.toBeUndefined();
    expect(tree.readContent("/bar/foo/foo.module.ts")).toEqual(
      [
        "import {Module} from \"@typeix/resty\";\n" +
        "\n" +
        "@Module({\n" +
        "  providers: []\n" +
        "})\n" +
        "export class FooModule {}\n"
      ].join()
    );
  });
  it("should manage name and path", async () => {
    const options: ModuleOptions = {
      name: "foo",
      path: "bar",
      skipImport: true,
    };
    const tree: UnitTestTree = await runner.runSchematicAsync("module", options).toPromise();
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === "/bar/foo/foo.module.ts"),
    ).not.toBeUndefined();
    expect(tree.readContent("/bar/foo/foo.module.ts")).toEqual(
      [
        "import {Module} from \"@typeix/resty\";\n" +
        "\n" +
        "@Module({\n" +
        "  providers: []\n" +
        "})\n" +
        "export class FooModule {}\n"
      ].join("")
    );
  });
  it("should manage name to dasherize", async () => {
    const options: ModuleOptions = {
      name: "fooBar",
      skipImport: true,
    };
    const tree: UnitTestTree = await runner.runSchematicAsync("module", options).toPromise();
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === "/foo-bar/foo-bar.module.ts"),
    ).not.toBeUndefined();
    expect(tree.readContent("/foo-bar/foo-bar.module.ts")).toEqual(
      [
        "import {Module} from \"@typeix/resty\";\n" +
        "\n" +
        "@Module({\n" +
        "  providers: []\n" +
        "})\n" +
        "export class FooBarModule {}\n"
      ].join("")
    );
  });
  it("should manage name and path", async () => {
    const options: ModuleOptions = {
      name: "foo",
      path: "bar",
      skipImport: true,
    };
    const tree: UnitTestTree = await runner.runSchematicAsync("module", options).toPromise();
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === "/bar/foo/foo.module.ts"),
    ).not.toBeUndefined();
    expect(tree.readContent("/bar/foo/foo.module.ts")).toEqual(
      [
        "import {Module} from \"@typeix/resty\";\n" +
        "\n" +
        "@Module({\n" +
        "  providers: []\n" +
        "})\n" +
        "export class FooModule {}\n"
      ].join("")
    );
  });
  it("should not create a directory if flat is true", async () => {
    const options: ModuleOptions = {
      name: "fooBar",
      skipImport: true,
      flat: true,
    };
    const tree: UnitTestTree = await runner.runSchematicAsync("module", options).toPromise();
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === "/foo-bar.module.ts"),
    ).not.toBeUndefined();
    expect(tree.readContent("foo-bar.module.ts")).toEqual(
      [
        "import {Module} from \"@typeix/resty\";\n" +
        "\n" +
        "@Module({\n" +
        "  providers: []\n" +
        "})\n" +
        "export class FooBarModule {}\n"
      ].join("")
    );
  });
  it("should manage path to dasherize", async () => {
    const options: ModuleOptions = {
      name: "barBaz/foo",
      skipImport: true,
    };
    const tree: UnitTestTree = await runner.runSchematicAsync("module", options).toPromise();
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === "/bar-baz/foo/foo.module.ts"),
    ).not.toBeUndefined();
    expect(tree.readContent("/bar-baz/foo/foo.module.ts")).toEqual(
      [
        "import {Module} from \"@typeix/resty\";\n" +
        "\n" +
        "@Module({\n" +
        "  providers: []\n" +
        "})\n" +
        "export class FooModule {}\n"
      ].join("")
    );
  });
  it("should manage javascript file", async () => {
    const options: ModuleOptions = {
      name: "foo",
      skipImport: true,
      language: "js",
    };
    const tree: UnitTestTree = await runner.runSchematicAsync("module", options).toPromise();
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === "/foo/foo.module.js"),
    ).not.toBeUndefined();
    expect(tree.readContent("/foo/foo.module.js")).toEqual(
      [
        "import {Module} from '@typeix/resty';\n" +
        "\n" +
        "@Module({\n" +
        "  providers: []\n" +
        "})\n" +
        "export class FooModule {}\n"
      ].join("")
    );
  });
  it("should manage declaration in app module", async () => {
    const app: ApplicationOptions = {
      name: "",
    };
    let tree: UnitTestTree = await runner.runSchematicAsync("application", app).toPromise();
    const options: ModuleOptions = {
      name: "foo",
    };
    tree = await runner.runSchematicAsync("module", options, tree).toPromise()
    expect(tree.readContent(normalize("/src/app.module.ts"))).toEqual(
      [
        "import {Logger, RootModule} from \"@typeix/resty\";\n" +
        "import {AppController} from \"./app.controller\";\n" +
        "import {AppService} from \"./app.service\";\n" +
        "import { FooModule } from './foo/foo.module';\n" +
        "\n" +
        "@RootModule({\n" +
        "  imports: [FooModule],\n" +
        "  controllers: [AppController],\n" +
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
  it("should manage declaration in bar module", async () => {
    const app: ApplicationOptions = {
      name: "",
    };
    let tree: UnitTestTree = await runner.runSchematicAsync("application", app).toPromise();
    const module: ModuleOptions = {
      name: "bar",
    };
    tree = await runner.runSchematicAsync("module", module, tree).toPromise();;
    const options: ModuleOptions = {
      name: "bar/foo",
    };
    tree = await runner.runSchematicAsync("module", options, tree).toPromise();
    expect(tree.readContent(normalize("/src/bar/bar.module.ts"))).toEqual(
      [
        "import {Module} from \"@typeix/resty\";\n" +
        "import { FooModule } from './foo/foo.module';\n" +
        "\n" +
        "@Module({\n" +
        "  providers: [],\n" +
        "  imports: [FooModule]\n" +
        "})\n" +
        "export class BarModule {}\n"
      ].join("")
    );
  });
});
