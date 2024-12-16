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
      type: "request"
    };
    const tree: UnitTestTree = await runner.runSchematic("interceptor", options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === "/foo.interceptor.ts"),
    ).toBeDefined();
    expect(tree.readContent("/foo.interceptor.ts")).toEqual(
      [
        "\n" +
        "import {Injectable, Inject, RequestInterceptor, InterceptedRequest} from \"@typeix/resty\";\n" +
        "/**\n" +
        " * @constructor\n" +
        " * @function\n" +
        " * @name FooInterceptor\n" +
        " *\n" +
        " * @description\n" +
        " * You need to assign request interceptor to controller:\n" +
        " * ```\n" +
        " * \\@Controller({\n" +
        " *   interceptors: [FooInterceptor]\n" +
        " * })\n" +
        " * class AppController {}\n" +
        " * ```\n" +
        " * or it can be done using \\@addRequestInterceptor() decorator\n" +
        " ```\n" +
        " * \\@Controller({\n" +
        " *   path: \"/\"\n" +
        " * })\n" +
        " * class AppController {\n" +
        " *\n" +
        " *   \\@GET()\n" +
        " *   \\@addRequestInterceptor(FooInterceptor, {})\n" +
        " *   actionIndex() {\n" +
        " *\n" +
        " *   }\n" +
        " * }\n" +
        " * ```\n" +
        " */\n" +
        "@Injectable()\n" +
        "export class FooInterceptor implements RequestInterceptor {\n" +
        "\n" +
        "  @Inject() injector: Injector;\n" +
        "\n" +
        "  async invoke(method: InterceptedRequest): Promise<any> {\n" +
        "    return await method.handler();\n" +
        "  }\n" +
        "}\n" +
        "\n"
      ].join("")
    );
  });

  it("should manage name as a path", async () => {
    const options: InterceptorOptions = {
      name: "bar/foo",
      type: "request"
    };
    const tree: UnitTestTree = await runner.runSchematic("interceptor", options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === "/bar/foo.interceptor.ts"),
    ).toBeDefined();
    expect(tree.readContent("/bar/foo.interceptor.ts")).toEqual(
      [
        "\n" +
        "import {Injectable, Inject, RequestInterceptor, InterceptedRequest} from \"@typeix/resty\";\n" +
        "/**\n" +
        " * @constructor\n" +
        " * @function\n" +
        " * @name FooInterceptor\n" +
        " *\n" +
        " * @description\n" +
        " * You need to assign request interceptor to controller:\n" +
        " * ```\n" +
        " * \\@Controller({\n" +
        " *   interceptors: [FooInterceptor]\n" +
        " * })\n" +
        " * class AppController {}\n" +
        " * ```\n" +
        " * or it can be done using \\@addRequestInterceptor() decorator\n" +
        " ```\n" +
        " * \\@Controller({\n" +
        " *   path: \"/\"\n" +
        " * })\n" +
        " * class AppController {\n" +
        " *\n" +
        " *   \\@GET()\n" +
        " *   \\@addRequestInterceptor(FooInterceptor, {})\n" +
        " *   actionIndex() {\n" +
        " *\n" +
        " *   }\n" +
        " * }\n" +
        " * ```\n" +
        " */\n" +
        "@Injectable()\n" +
        "export class FooInterceptor implements RequestInterceptor {\n" +
        "\n" +
        "  @Inject() injector: Injector;\n" +
        "\n" +
        "  async invoke(method: InterceptedRequest): Promise<any> {\n" +
        "    return await method.handler();\n" +
        "  }\n" +
        "}\n" +
        "\n"
      ].join("")
    );
  });

  it("should manage name and path", async () => {
    const options: InterceptorOptions = {
      name: "foo",
      path: "baz",
      type: "request"
    };
    const tree: UnitTestTree = await runner.runSchematic("interceptor", options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === "/baz/foo.interceptor.ts"),
    ).toBeDefined();
    expect(tree.readContent("/baz/foo.interceptor.ts")).toEqual(
       [
         "\n" +
         "import {Injectable, Inject, RequestInterceptor, InterceptedRequest} from \"@typeix/resty\";\n" +
         "/**\n" +
         " * @constructor\n" +
         " * @function\n" +
         " * @name FooInterceptor\n" +
         " *\n" +
         " * @description\n" +
         " * You need to assign request interceptor to controller:\n" +
         " * ```\n" +
         " * \\@Controller({\n" +
         " *   interceptors: [FooInterceptor]\n" +
         " * })\n" +
         " * class AppController {}\n" +
         " * ```\n" +
         " * or it can be done using \\@addRequestInterceptor() decorator\n" +
         " ```\n" +
         " * \\@Controller({\n" +
         " *   path: \"/\"\n" +
         " * })\n" +
         " * class AppController {\n" +
         " *\n" +
         " *   \\@GET()\n" +
         " *   \\@addRequestInterceptor(FooInterceptor, {})\n" +
         " *   actionIndex() {\n" +
         " *\n" +
         " *   }\n" +
         " * }\n" +
         " * ```\n" +
         " */\n" +
         "@Injectable()\n" +
         "export class FooInterceptor implements RequestInterceptor {\n" +
         "\n" +
         "  @Inject() injector: Injector;\n" +
         "\n" +
         "  async invoke(method: InterceptedRequest): Promise<any> {\n" +
         "    return await method.handler();\n" +
         "  }\n" +
         "}\n" +
         "\n"
       ].join("")
    );
  });

  it("should manage name to dasherize", async () => {
    const options: InterceptorOptions = {
      name: "fooBar",
      type: "request"
    };
    const tree: UnitTestTree = await runner.runSchematic("interceptor", options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === "/foo-bar.interceptor.ts"),
    ).toBeDefined();
    expect(tree.readContent("/foo-bar.interceptor.ts")).toEqual(
      [
        "\n" +
        "import {Injectable, Inject, RequestInterceptor, InterceptedRequest} from \"@typeix/resty\";\n" +
        "/**\n" +
        " * @constructor\n" +
        " * @function\n" +
        " * @name FooBarInterceptor\n" +
        " *\n" +
        " * @description\n" +
        " * You need to assign request interceptor to controller:\n" +
        " * ```\n" +
        " * \\@Controller({\n" +
        " *   interceptors: [FooBarInterceptor]\n" +
        " * })\n" +
        " * class AppController {}\n" +
        " * ```\n" +
        " * or it can be done using \\@addRequestInterceptor() decorator\n" +
        " ```\n" +
        " * \\@Controller({\n" +
        " *   path: \"/\"\n" +
        " * })\n" +
        " * class AppController {\n" +
        " *\n" +
        " *   \\@GET()\n" +
        " *   \\@addRequestInterceptor(FooBarInterceptor, {})\n" +
        " *   actionIndex() {\n" +
        " *\n" +
        " *   }\n" +
        " * }\n" +
        " * ```\n" +
        " */\n" +
        "@Injectable()\n" +
        "export class FooBarInterceptor implements RequestInterceptor {\n" +
        "\n" +
        "  @Inject() injector: Injector;\n" +
        "\n" +
        "  async invoke(method: InterceptedRequest): Promise<any> {\n" +
        "    return await method.handler();\n" +
        "  }\n" +
        "}\n" +
        "\n"
      ].join("")
    );
  });

  it("should manage path to dasherize", async () => {
    const options: InterceptorOptions = {
      name: "barBaz/foo",
      type: "request"
    };
    const tree: UnitTestTree = await runner.runSchematic("interceptor", options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === "/bar-baz/foo.interceptor.ts"),
    ).toBeDefined();
    expect(tree.readContent("/bar-baz/foo.interceptor.ts")).toEqual(
      [
        "\n" +
        "import {Injectable, Inject, RequestInterceptor, InterceptedRequest} from \"@typeix/resty\";\n" +
        "/**\n" +
        " * @constructor\n" +
        " * @function\n" +
        " * @name FooInterceptor\n" +
        " *\n" +
        " * @description\n" +
        " * You need to assign request interceptor to controller:\n" +
        " * ```\n" +
        " * \\@Controller({\n" +
        " *   interceptors: [FooInterceptor]\n" +
        " * })\n" +
        " * class AppController {}\n" +
        " * ```\n" +
        " * or it can be done using \\@addRequestInterceptor() decorator\n" +
        " ```\n" +
        " * \\@Controller({\n" +
        " *   path: \"/\"\n" +
        " * })\n" +
        " * class AppController {\n" +
        " *\n" +
        " *   \\@GET()\n" +
        " *   \\@addRequestInterceptor(FooInterceptor, {})\n" +
        " *   actionIndex() {\n" +
        " *\n" +
        " *   }\n" +
        " * }\n" +
        " * ```\n" +
        " */\n" +
        "@Injectable()\n" +
        "export class FooInterceptor implements RequestInterceptor {\n" +
        "\n" +
        "  @Inject() injector: Injector;\n" +
        "\n" +
        "  async invoke(method: InterceptedRequest): Promise<any> {\n" +
        "    return await method.handler();\n" +
        "  }\n" +
        "}\n" +
        "\n"
      ].join("")
    );
  });

  it("should manage javascript file", async () => {
    const options: InterceptorOptions = {
      name: "foo",
      language: "js",
      type: "request"
    };
    const tree: UnitTestTree = await runner.runSchematic("interceptor", options);
    const files: string[] = tree.files;
    expect(
      files.find(filename => filename === "/foo.interceptor.js"),
    ).toBeDefined();
    expect(tree.readContent("/foo.interceptor.js")).toEqual(
      [
        "\n" +
        "import {Injectable, Inject, RequestInterceptor, InterceptedRequest} from \"@typeix/resty\";\n" +
        "/**\n" +
        " * @constructor\n" +
        " * @function\n" +
        " * @name FooInterceptor\n" +
        " *\n" +
        " * @description\n" +
        " * You need to assign request interceptor to controller:\n" +
        " * ```\n" +
        " * \\@Controller({\n" +
        " *   interceptors: [FooInterceptor]\n" +
        " * })\n" +
        " * class AppController {}\n" +
        " * ```\n" +
        " * or it can be done using \\@addRequestInterceptor() decorator\n" +
        " ```\n" +
        " * \\@Controller({\n" +
        " *   path: \"/\"\n" +
        " * })\n" +
        " * class AppController {\n" +
        " *\n" +
        " *   \\@GET()\n" +
        " *   \\@addRequestInterceptor(FooInterceptor, {})\n" +
        " *   actionIndex() {\n" +
        " *\n" +
        " *   }\n" +
        " * }\n" +
        " * ```\n" +
        " */\n" +
        "@Injectable()\n" +
        "export class FooInterceptor implements RequestInterceptor {\n" +
        "\n" +
        "  async invoke(method) {\n" +
        "    return await method.handler();\n" +
        "  }\n" +
        "}\n" +
        "\n"
      ].join("")
    );
  });
});
