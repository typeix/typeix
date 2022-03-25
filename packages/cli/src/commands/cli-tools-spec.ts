import {Injector} from "@typeix/di";
import {EventEmitter} from "events";
import {CliTools} from "./cli-tools";
import {join} from "path";
import {CLI_CONFIG} from "./configs";
import {Question} from "inquirer";

let webpackCfg = {};
jest.mock("webpack", () => {
  return jest.fn(cfg => {
    webpackCfg = cfg;
    let r = {};
    return {
      watch: () => r,
      run: () => r
    };
  });
});
jest.mock("tsconfig-paths-webpack-plugin", () => {
  return jest.fn(data => data);
});
jest.mock("fork-ts-checker-webpack-plugin", () => {
  return jest.fn(data => data);
});
jest.mock("webpack-node-externals", () => {
  return jest.fn(data => data);
});
jest.mock("inquirer", () => {
  return {
    createPromptModule: () => async (questions: Array<Question>) => questions
  };
});

describe("Cli Tools", () => {

  const programMock = {
    option: () => {
      // none for now
      return programMock;
    },
    command: () => {
      // none for now
      return programMock;
    },
    action: () => {
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
  let eventEmitter: EventEmitter;
  let cliTools: CliTools;

  beforeEach(async () => {
    eventEmitter = new EventEmitter();
    cliTools = Injector.Sync.createAndResolve(CliTools, [
      {
        provide: "program",
        useValue: programMock
      },
      {
        provide: EventEmitter,
        useValue: eventEmitter
      }
    ]).get(CliTools);
  });

  test("getPackageManagerName yarn", async () => {
    spyOn(cliTools, "readDir").and.returnValue(["yarn.lock"]);
    const result = await cliTools.getPackageManagerName();
    expect(result).toBe("yarn");
  });

  test("getPackageManagerName npm", async () => {
    spyOn(cliTools, "readDir").and.returnValue([]);
    const result = await cliTools.getPackageManagerName();
    expect(result).toBe("npm");
  });

  test("getPackageManagerName error", async () => {
    spyOn(cliTools, "readDir").and.throwError("Cannot Load Dir");
    const result = await cliTools.getPackageManagerName();
    expect(result).toBe("npm");
  });

  test("useWebpackCompiler", async () => {

    const typescriptCfg = {
      cliConfig: {
        entryFile: "bootstrap.js",
        distRoot: "dist",
        sourceRoot: "src"
      }
    };

    spyOn(cliTools, "loadCompilerPlugins").and.returnValue({});
    spyOn(cliTools, "loadTypescriptWithConfig").and.returnValue(typescriptCfg);
    await cliTools.useWebpackCompiler({
      tsConfigPath: "config",
      tpxConfigPath: "config",
      watchMode: false,
      compilerOptions: {},
      entryFile: "bootstrap.js",
      isDebugEnabled: false
    });
    const result = {
      "devtool": false,
      "entry": "bootstrap.js",
      "externals": [
        undefined
      ],
      "externalsPresets": {
        "node": true
      },
      "mode": "none",
      "module": {
        "rules": [
          {
            "exclude": /node_modules/,
            "test": /.tsx?$/,
            "use": [
              {
                "loader": "ts-loader",
                "options": {
                  "compiler": undefined,
                  "configFile": "config",
                  "transpileOnly": true
                }
              }
            ]
          }
        ]
      },
      "node": {
        "__dirname": false,
        "__filename": false
      },
      "optimization": {
        "nodeEnv": false
      },
      "output": {
        "filename": "bootstrap.js"
      },
      "plugins": [
        {
          "typescript": {
            "configFile": "config"
          }
        }
      ],
      "resolve": {
        "extensions": [
          ".tsx",
          ".ts",
          ".js"
        ],
        "plugins": [
          {
            "configFile": "config"
          }
        ]
      },
      "target": "node"
    };
    expect(webpackCfg).toMatchObject(result);
  });

  test("compileTypescript", async () => {
    const result = {
      diagnostics: []
    };
    const resultOne = [1];
    const program = {
      emit: () => result
    };
    const typescriptCfg = {
      tse: {
        createIncrementalProgram: () => program,
        createProgram: () => program,
        createWatchCompilerHost: data => data,
        createEmitAndSemanticDiagnosticsBuilderProgram: data => data,
        formatDiagnosticsWithColorAndContext: data => data,
        sys: {
          newLine: "\n",
          getCurrentDirectory: () => "dir"
        },
        createWatchProgram: () => {
          return {
            getProgram: () => program
          };
        },
        getPreEmitDiagnostics: () => resultOne
      },
      tsConfig: {
        options: {}
      },
      configPath: "config",
      cliConfig: {
        entryFile: "bootstrap.js",
        distRoot: "dist",
        sourceRoot: "src"
      }
    };
    const plugins = {
      before: () => {
        //
      },
      after: () => {
        //
      }
    };
    spyOn(process, "exit").and.returnValue(0);
    const emitSpy = spyOn(program, "emit").and.callThrough();
    const printTsReportSpy = spyOn(cliTools, "printTypescriptReport");
    spyOn(cliTools, "loadCompilerPlugins").and.returnValue(plugins);
    spyOn(cliTools, "loadTypescriptWithConfig").and.returnValue(typescriptCfg);
    await cliTools.compileTypescript({
      tsConfigPath: "config",
      tpxConfigPath: "config",
      watchMode: false,
      compilerOptions: {},
      entryFile: "bootstrap.js",
      isDebugEnabled: false
    });
    expect(printTsReportSpy).toBeCalledWith({
      errors: resultOne,
      errorCount: 1,
      format: typescriptCfg.tse.formatDiagnosticsWithColorAndContext,
      newLine: typescriptCfg.tse.sys.newLine,
      currentDir: typescriptCfg.tse.sys.getCurrentDirectory()
    });
    expect(emitSpy).toBeCalledWith(undefined, // targetSourceFile
      undefined, // writeFile
      undefined, // cancellationToken
      false,
      {
        before: plugins.before,
        after: plugins.after,
        afterDeclarations: []
      });
  });

  test("printTypescriptReport", () => {
    let args = [];
    const obj = {
      format: (a, b) => {
        //
        args.push(a);
        args.push(b);
        return "123";
      }
    };
    const errorCallSpy = spyOn(console, "error");
    const infoCallSpy = spyOn(console, "info");
    const formatSpy = spyOn(obj, "format").and.callThrough();
    cliTools.printTypescriptReport({
      format: obj.format,
      errors: [],
      newLine: "\n",
      currentDir: "dir",
      errorCount: 3
    }, false);
    expect(infoCallSpy).not.toBeCalled();
    expect(errorCallSpy).toBeCalledWith("123");
    expect(formatSpy).toBeCalled();
    args = [];
    cliTools.printTypescriptReport({
      format: obj.format,
      errors: [],
      newLine: "\n",
      currentDir: "dir",
      errorCount: 3
    }, true);
    expect(infoCallSpy).toBeCalledWith("Found 3 error(s).\n");
    const [a, b] = args;
    expect(a).toEqual([]);
    expect(Object.keys(b)).toEqual(["getCanonicalFileName", "getCurrentDirectory", "getNewLine"]);
  });

  test("loadCompilerPlugins", async () => {
    const obj = {
      before: () => {
        //
        return 1;
      },
      after: () => {
        //
        return 1;
      }
    };

    spyOn(cliTools, "loadBinary").and.returnValue(obj);

    const result = await cliTools.loadCompilerPlugins(
      {
        compilerOptions: {
          plugins: [{
            name: "schematics"
          }]
        }
      },
      "dir",
      null
    );

    expect(result).toEqual({
      before: [1],
      after: [1]
    });
  });

  test("loadTypescriptWithConfig", async () => {
    const obj = {
      sys: null,
      getParsedCommandLineOfConfigFile: () => {
        //
      }
    };
    const confSpy = spyOn(cliTools, "getConfiguration").and.returnValue({
      compiler: "tsc"
    });
    const loadSpy = spyOn(cliTools, "loadBinary").and.returnValue(obj);
    const opts = {};
    const result = await cliTools.loadTypescriptWithConfig("./tsconfig.json", "", opts);
    expect(result).toEqual({
      "cliConfig": {
        "compiler": "tsc"
      },
      "configPath": join(process.cwd(), "tsconfig.json"),
      "tsConfig": undefined,
      "tse": obj
    });
    expect(confSpy).toBeCalledWith("");
    expect(loadSpy).toBeCalledWith("tsc");
  });

  test("loadBinary", async () => {
    const packageName = "./cli-tools";
    try {
      await cliTools.loadBinary(packageName);
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect(e.message).toContain(`${packageName} could not be found! Please, install "${packageName}" package.`);
    }

    const bin = await cliTools.loadBinary(packageName, ["src", "commands"]);
    expect(bin).toMatchObject({
      CliTools: CliTools
    });
  });

  test("getConfiguration", async () => {
    const obj = {
      readDir: () => {
        //
      },
      readFile: () => {
        //
      }
    };
    const readDirSpy = spyOn(obj, "readDir").and.returnValue(["typeix.json"]);
    const readFileSpy = spyOn(obj, "readFile").and.returnValue(JSON.stringify({language: "js"}));
    const config = await cliTools.getConfiguration.call(obj);
    expect(config).toMatchObject({
      ...CLI_CONFIG,
      language: "js"
    });
    expect(readDirSpy).toBeCalledWith("");
    expect(readFileSpy).toBeCalledWith(["", "typeix.json"]);
  });

  test("getConfiguration compilerOptions", async () => {
    const obj = {
      readDir: () => {
        //
      },
      readFile: () => {
        //
      }
    };
    const readDirSpy = spyOn(obj, "readDir").and.returnValue(["typeix.json"]);
    const readFileSpy = spyOn(obj, "readFile").and.returnValue(JSON.stringify({
      language: "js",
      compilerOptions: {
        tsConfigPath: "tsconfig.build.json",
        webpack: true,
        webpackConfigPath: "webpack.config.js",
        plugins: [],
        assets: []
      }
    }));
    const config = await cliTools.getConfiguration.call(obj);
    expect(config).toMatchObject({
      ...CLI_CONFIG,
      language: "js",
      compilerOptions: {
        ...CLI_CONFIG.compilerOptions,
        webpack: true
      }
    });
    expect(readDirSpy).toBeCalledWith("");
    expect(readFileSpy).toBeCalledWith(["", "typeix.json"]);
  });

  test("readDir", async () => {
    const dirList = await cliTools.readDir("./src/commands");
    expect(dirList).toContain("cli-tools-spec.ts");
  });

  test("readFile", async () => {
    const file = await cliTools.readFile("./package.json");
    const data = JSON.parse(file.toString());
    expect(data.name).toContain("@typeix/cli");
  });

  test("readDir list", async () => {
    const dirList = await cliTools.readDir(["./src/commands"]);
    expect(dirList).toContain("cli-tools-spec.ts");
  });

  test("readFile list", async () => {
    const file = await cliTools.readFile(["./package.json"]);
    const data = JSON.parse(file.toString());
    expect(data.name).toContain("@typeix/cli");
  });

  test("getProjectPackage", async () => {
    const data = await cliTools.getProjectPackage();
    expect(data.name).toContain("@typeix/cli");
  });

  test("filterOptions", async () => {
    const options = [
      {
        name: "debug",
        value: true
      },
      {
        name: "debug2",
        value: true
      }
    ];

    const data = await cliTools.filterOptions(options, ["debug2"]);
    expect(data).toEqual([{
      name: "debug",
      value: true
    }]);
  });

  test("compareOptionValue", async () => {
    const options = [
      {
        name: "debug",
        value: true
      }
    ];
    expect(await cliTools.compareOptionValue(options, "debug", true)).toBeTruthy();
    expect(await cliTools.compareOptionValue(options, "debug", false)).toBeFalsy();
  });

  test("getOptionValue", async () => {
    const options = [
      {
        name: "debug",
        value: true
      }
    ];
    expect(await cliTools.getOptionValue(options, "debug")).toBeTruthy();
  });

  test("getOption", async () => {
    const options = [
      {
        name: "debug",
        value: true
      }
    ];
    expect(await cliTools.getOption(options, "debug")).toEqual({
      name: "debug",
      value: true
    });
  });

  test("createInput", async () => {
    expect(await cliTools.createInput("type", "message", "yes")).toEqual({
      type: "input",
      name: "type",
      message: "message",
      default: "yes"
    });
  });

  test("createSelect", async () => {
    expect(await cliTools.createSelect("type", "message", ["yes", "no"])).toEqual({
      type: "list",
      name: "type",
      message: "message",
      choices: ["yes", "no"]
    });
  });

  test("doPrompt", async () => {
    const questions = [];
    expect(await cliTools.doPrompt(questions)).toBe(questions);
  });

  test("print", async () => {
    const logs = [
      "WARN line",
      "INFO line",
      "ERROR line"
    ];
    const errSpy = spyOn(console, "error");
    const warnSpy = spyOn(console, "warn");
    const logSpy = spyOn(console, "log");
    cliTools.print(Buffer.from(logs.join("\n")));
    cliTools.print("INFO", true);
    cliTools.print("INFO");
    expect(errSpy).toBeCalled();
    expect(warnSpy).toBeCalled();
    expect(logSpy).toBeCalled();
  });

  test("camelCase", () => {
    expect(cliTools.camelCase("index-name-works")).toEqual("indexNameWorks");
  });

  test("getRemainingFlags", () => {
    const context = {
      camelCase: val => cliTools.camelCase(val),
      command: {
        args: [
          "--debug=true",
          "--watch",
          "--name=Igor",
          "--no-cache"
        ]
      }
    };
    expect(cliTools.getRemainingFlags.call(context)).toEqual("--debug=true --watch --name=Igor --no-cache");
  });
});
