import {
  SchematicTestRunner,
  UnitTestTree,
} from "@angular-devkit/schematics/testing";
import * as path from "path";
import { InterceptorOptions } from "./interceptor.schema";

describe("Interceptor Factory", () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    ".",
    path.join(process.cwd(), "src/collection.json"),
  );

  it("should manage name only", async () => {
    const options: InterceptorOptions = {
      name: "foo",
      type: "method"
    };
    const tree: UnitTestTree = await runner.runSchematic("interceptor", options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === "/foo.interceptor.ts"),
    ).toBeDefined();
    expect(tree.readContent("/foo.interceptor.ts")).toEqual(
      [
        "\n" +
        "import {createMethodInterceptor, Inject, Injectable, Interceptor, Method} from \"@typeix/resty\";\n" +
        "\n" +
        "@Injectable()\n" +
        "export class FooInterceptor implements Interceptor {\n" +
        "\n" +
        "  @Inject() injector: Injector;\n" +
        "\n" +
        "  async invoke(method: Method): Promise<any> {\n" +
        "    return await method.invoke();\n" +
        "  }\n" +
        "}\n" +
        "/**\n" +
        " *\n" +
        " * @function\n" +
        " * @name Foo\n" +
        " *\n" +
        " * @description\n" +
        " * It\"s possible use method interceptor on any Class method as log is used with Injector it\"s going to be created and executed.\n" +
        " */\n" +
        "export function Foo(value: string) {\n" +
        "  return createMethodInterceptor(Foo, FooInterceptor, {value});\n" +
        "}\n" +
        "\n"
      ].join("")
    );
  });

  it("should manage name as a path", async () => {
    const options: InterceptorOptions = {
      name: "bar/foo",
      type: "method"
    };
    const tree: UnitTestTree = await runner.runSchematic("interceptor", options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === "/bar/foo.interceptor.ts"),
    ).toBeDefined();
    expect(tree.readContent("/bar/foo.interceptor.ts")).toEqual(
      [
        "\n" +
        "import {createMethodInterceptor, Inject, Injectable, Interceptor, Method} from \"@typeix/resty\";\n" +
        "\n" +
        "@Injectable()\n" +
        "export class FooInterceptor implements Interceptor {\n" +
        "\n" +
        "  @Inject() injector: Injector;\n" +
        "\n" +
        "  async invoke(method: Method): Promise<any> {\n" +
        "    return await method.invoke();\n" +
        "  }\n" +
        "}\n" +
        "/**\n" +
        " *\n" +
        " * @function\n" +
        " * @name Foo\n" +
        " *\n" +
        " * @description\n" +
        " * It\"s possible use method interceptor on any Class method as log is used with Injector it\"s going to be created and executed.\n" +
        " */\n" +
        "export function Foo(value: string) {\n" +
        "  return createMethodInterceptor(Foo, FooInterceptor, {value});\n" +
        "}\n" +
        "\n"
      ].join("")
    );
  });

  it("should manage name and path", async () => {
    const options: InterceptorOptions = {
      name: "foo",
      path: "baz",
      type: "method"
    };
    const tree: UnitTestTree = await runner.runSchematic("interceptor", options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === "/baz/foo.interceptor.ts"),
    ).toBeDefined();
    expect(tree.readContent("/baz/foo.interceptor.ts")).toEqual(
       [
         "\n" +
         "import {createMethodInterceptor, Inject, Injectable, Interceptor, Method} from \"@typeix/resty\";\n" +
         "\n" +
         "@Injectable()\n" +
         "export class FooInterceptor implements Interceptor {\n" +
         "\n" +
         "  @Inject() injector: Injector;\n" +
         "\n" +
         "  async invoke(method: Method): Promise<any> {\n" +
         "    return await method.invoke();\n" +
         "  }\n" +
         "}\n" +
         "/**\n" +
         " *\n" +
         " * @function\n" +
         " * @name Foo\n" +
         " *\n" +
         " * @description\n" +
         " * It\"s possible use method interceptor on any Class method as log is used with Injector it\"s going to be created and executed.\n" +
         " */\n" +
         "export function Foo(value: string) {\n" +
         "  return createMethodInterceptor(Foo, FooInterceptor, {value});\n" +
         "}\n" +
         "\n"
       ].join("")
    );
  });

  it("should manage name to dasherize", async () => {
    const options: InterceptorOptions = {
      name: "fooBar",
      type: "method"
    };
    const tree: UnitTestTree = await runner.runSchematic("interceptor", options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === "/foo-bar.interceptor.ts"),
    ).toBeDefined();
    expect(tree.readContent("/foo-bar.interceptor.ts")).toEqual(
      [
        "\n" +
        "import {createMethodInterceptor, Inject, Injectable, Interceptor, Method} from \"@typeix/resty\";\n" +
        "\n" +
        "@Injectable()\n" +
        "export class FooBarInterceptor implements Interceptor {\n" +
        "\n" +
        "  @Inject() injector: Injector;\n" +
        "\n" +
        "  async invoke(method: Method): Promise<any> {\n" +
        "    return await method.invoke();\n" +
        "  }\n" +
        "}\n" +
        "/**\n" +
        " *\n" +
        " * @function\n" +
        " * @name FooBar\n" +
        " *\n" +
        " * @description\n" +
        " * It\"s possible use method interceptor on any Class method as log is used with Injector it\"s going to be created and executed.\n" +
        " */\n" +
        "export function FooBar(value: string) {\n" +
        "  return createMethodInterceptor(FooBar, FooBarInterceptor, {value});\n" +
        "}\n" +
        "\n"
      ].join("")
    );
  });

  it("should manage path to dasherize", async () => {
    const options: InterceptorOptions = {
      name: "barBaz/foo",
      type: "method"
    };
    const tree: UnitTestTree = await runner.runSchematic("interceptor", options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === "/bar-baz/foo.interceptor.ts"),
    ).toBeDefined();
    expect(tree.readContent("/bar-baz/foo.interceptor.ts")).toEqual(
      [
        "\n" +
        "import {createMethodInterceptor, Inject, Injectable, Interceptor, Method} from \"@typeix/resty\";\n" +
        "\n" +
        "@Injectable()\n" +
        "export class FooInterceptor implements Interceptor {\n" +
        "\n" +
        "  @Inject() injector: Injector;\n" +
        "\n" +
        "  async invoke(method: Method): Promise<any> {\n" +
        "    return await method.invoke();\n" +
        "  }\n" +
        "}\n" +
        "/**\n" +
        " *\n" +
        " * @function\n" +
        " * @name Foo\n" +
        " *\n" +
        " * @description\n" +
        " * It\"s possible use method interceptor on any Class method as log is used with Injector it\"s going to be created and executed.\n" +
        " */\n" +
        "export function Foo(value: string) {\n" +
        "  return createMethodInterceptor(Foo, FooInterceptor, {value});\n" +
        "}\n" +
        "\n"
      ].join("")
    );
  });

  it("should manage javascript file", async () => {
    const options: InterceptorOptions = {
      name: "foo",
      language: "js",
      type: "method"
    };
    const tree: UnitTestTree = await runner.runSchematic("interceptor", options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === "/foo.interceptor.js"),
    ).toBeDefined();
    expect(tree.readContent("/foo.interceptor.js")).toEqual(
      [
        "\n" +
        "import {createMethodInterceptor, Inject, Injectable, Interceptor, Method} from \"@typeix/resty\";\n" +
        "\n" +
        "@Injectable()\n" +
        "export class FooInterceptor implements Interceptor {\n" +
        "\n" +
        "  @Inject(Injector) injector;\n" +
        "\n" +
        "  async invoke(method) {\n" +
        "    return await method.invoke();\n" +
        "  }\n" +
        "}\n" +
        "/**\n" +
        " *\n" +
        " * @function\n" +
        " * @name Foo\n" +
        " *\n" +
        " * @description\n" +
        " * It's possible use method interceptor on any Class method as log is used with Injector it's going to be created and executed.\n" +
        " */\n" +
        "export function Foo(value: string) {\n" +
        "  return createMethodInterceptor(Foo, FooInterceptor, {value});\n" +
        "}\n" +
        "\n"
      ].join("")
    );
  });
});
