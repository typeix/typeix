import {AfterConstruct, Inject, Injectable} from "@typeix/di";
import {isArray, isDefined, isFunction, isUndefined} from "@typeix/utils";
import {MESSAGES} from "../ui";
import {existsSync, readdir, readFile} from "fs";
import {join} from "path";
import {Question} from "inquirer";
import {CommanderStatic} from "commander";
import {Option, TpxCliConfig} from "./interfaces";
import {normalize} from "@angular-devkit/core";
import * as chalk from "chalk";
import * as inquirer from "inquirer";
import * as ts from "typescript";
import {
  CompilerPluginExtension,
  TpxConfiguration,
  CLI_CONFIG,
  TpxCompilerOptions,
  LoadedCompilerPlugins,
  TpxReport
} from "./configs";
import {EventEmitter} from "events";
const nodeExternals = require("webpack-node-externals");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
import * as webpack from "webpack";

@Injectable()
export class CliTools {

  @Inject("program") private commanderStatic: CommanderStatic;
  @Inject() private eventEmitter: EventEmitter;

  @AfterConstruct()
  onProgramInit() {
    this.commanderStatic.on("command:*", () => {
      console.error(MESSAGES.INVALID_COMMAND, this.commanderStatic.args.join(" "));
      console.log(MESSAGES.AVAILABLE_COMMANDS);
      process.exit(1);
    });
  }

  /**
   * Return commander
   */
  commander(): CommanderStatic {
    return this.commanderStatic;
  }

  /**
   * Get package manager name
   */
  async getPackageManagerName(): Promise<string> {
    try {
      const files = await this.readDir("");
      return files.includes("yarn.lock") ? "yarn" : "npm";
    } catch {
      return "npm";
    }
  }

  /**
   * Webpackconfig
   * @param tpxCompilerOptions
   */
  async useWebpackCompiler(tpxCompilerOptions: TpxCompilerOptions) {
    const {tsConfigPath, tpxConfigPath, compilerOptions} = tpxCompilerOptions;
    const {cliConfig} = await this.loadTypescriptWithConfig(tsConfigPath, tpxConfigPath, compilerOptions);
    const config: webpack.Configuration = {
      entry: tpxCompilerOptions.entryFile,
      devtool: tpxCompilerOptions?.isDebugEnabled ? "inline-source-map" : false,
      target: "node",
      output: {
        filename: tpxCompilerOptions.entryFile
      },
      externalsPresets: {node: true},
      externals: [nodeExternals()],
      module: {
        rules: [
          {
            test: /.tsx?$/,
            use: [
              {
                loader: "ts-loader",
                options: {
                  transpileOnly: !cliConfig?.compilerOptions?.plugins,
                  configFile: tsConfigPath,
                  getCustomTransformers: async (program: any) =>
                    await this.loadCompilerPlugins(cliConfig, tpxConfigPath, program)
                }
              }
            ],
            exclude: /node_modules/
          }
        ]
      },
      resolve: {
        extensions: [".tsx", ".ts", ".js"],
        plugins: [
          new TsconfigPathsPlugin({
            configFile: tsConfigPath
          })
        ]
      },
      mode: "none",
      optimization: {
        nodeEnv: false
      },
      node: {
        __filename: false,
        __dirname: false
      },
      plugins: [
        new ForkTsCheckerWebpackPlugin({
          typescript: {
            configFile: tsConfigPath
          }
        })
      ]
    };
    const compiler = webpack(config);
    if (tpxCompilerOptions.watchMode || config.watch) {
      compiler.watch(config.watchOptions || {}, () => this.eventEmitter.emit("spawn"));
    } else {
      compiler.run(() => this.eventEmitter.emit("spawn"));
    }
  }

  /**
   * Compile Typescript
   * @param tpxCompilerOptions
   */
  async compileTypescript(tpxCompilerOptions: TpxCompilerOptions) {
    const {tsConfigPath, tpxConfigPath, compilerOptions, watchMode} = tpxCompilerOptions;
    const {
      tse,
      tsConfig,
      cliConfig,
      configPath
    } = await this.loadTypescriptWithConfig(tsConfigPath, tpxConfigPath, compilerOptions);
    const {options, fileNames, projectReferences} = tsConfig;
    const createProgram: any = tse.createIncrementalProgram ?? tse.createProgram;
    let program = createProgram.call(tse, {
      rootNames: fileNames,
      projectReferences,
      options
    });
    if (watchMode) {
      const host = tse.createWatchCompilerHost(
        configPath,
        {
          ...tsConfig.options,
          ...compilerOptions
        },
        tse.sys,
        tse.createEmitAndSemanticDiagnosticsBuilderProgram,
        null,
        (diagnostic: ts.Diagnostic, newLine: string, tsOptions: ts.CompilerOptions, errorCount?: number) => {
          this.printTypescriptReport(
            {
              errors: [diagnostic],
              errorCount,
              format: tse.formatDiagnosticsWithColorAndContext,
              newLine,
              currentDir: tse.sys.getCurrentDirectory()
            },
            false
          );
          if (errorCount === 0) {
            this.eventEmitter.emit("spawn");
          }
        }
      );
      program = tse.createWatchProgram(host).getProgram();
    }
    const {before, after} = await this.loadCompilerPlugins(cliConfig, tpxConfigPath, program);
    const result: ts.EmitResult = program.emit(
      undefined, // targetSourceFile
      undefined, // writeFile
      undefined, // cancellationToken
      false,
      {
        before,
        after,
        afterDeclarations: []
      }
    );
    const errors = tse.getPreEmitDiagnostics(program).concat(result.diagnostics);
    if (errors.length > 0 && !watchMode) {
      this.printTypescriptReport(
        {
          errors,
          errorCount: errors.length,
          format: tse.formatDiagnosticsWithColorAndContext,
          newLine: tse.sys.newLine,
          currentDir: tse.sys.getCurrentDirectory()
        }
      );
      process.exit(1);
    }
    if (!watchMode) {
      this.eventEmitter.emit("spawn");
    }
  }

  /**
   * Print typescript compiling report
   * @param report
   * @param printInfo
   */
  printTypescriptReport(report: TpxReport, printInfo = true) {
    console.error(
      report.format(report.errors, {
        getCanonicalFileName: path => path,
        getCurrentDirectory: () => report.currentDir,
        getNewLine: () => report.newLine
      })
    );
    if (printInfo) {
      console.info(`Found ${report.errorCount} error(s).` + report.newLine);
    }
  }

  /**
   * Load compiler Plugins
   * @param cliConfig
   * @param tpxConfigPath
   * @param program
   */
  async loadCompilerPlugins(
    cliConfig: TpxCliConfig,
    tpxConfigPath: string,
    program: ts.Program
  ): Promise<LoadedCompilerPlugins> {
    const before: Array<ts.TransformerFactory<ts.SourceFile> | ts.CustomTransformerFactory> = [];
    const after: Array<ts.TransformerFactory<ts.SourceFile> | ts.CustomTransformerFactory> = [];
    const plugins = cliConfig?.compilerOptions?.plugins;
    if (isArray(plugins)) {
      for (const item of plugins) {
        const pkgName = isDefined(item.path) ? normalize(join(process.cwd(), tpxConfigPath, item.path)) : item.name;
        const plugin = await this.loadBinary<CompilerPluginExtension>(pkgName);
        if (isFunction(plugin.before)) {
          before.push(plugin.before(program, item.options));
        }
        if (isFunction(plugin.after)) {
          after.push(plugin.after(program, item.options));
        }
      }
    }
    return {
      before,
      after
    };
  }

  /**
   * Configuration dir
   * @param tsConfigPath
   * @param tpxConfigPath
   * @param options
   */
  async loadTypescriptWithConfig(tsConfigPath: string, tpxConfigPath = "", options: ts.CompilerOptions): Promise<TpxConfiguration> {
    const configPath = join(process.cwd(), tsConfigPath);
    if (!existsSync(configPath)) {
      throw new Error(MESSAGES.MISSING_TYPESCRIPT_PATH(tsConfigPath));
    }
    const tse = await this.loadTypescript();
    const cliConfig = await this.getConfiguration(tpxConfigPath);
    try {
      const tsConfig = tse.getParsedCommandLineOfConfigFile(
        configPath,
        {
          ...options
        },
        <ts.ParseConfigFileHost><unknown>tse.sys
      );
      return {
        tse,
        tsConfig,
        cliConfig,
        configPath
      };
    } catch (e) {
      this.print(e.stack, true);
      throw new Error(MESSAGES.MISSING_TYPESCRIPT_PATH(tsConfigPath));
    }
  }

  /**
   * Loads typescript binary
   */
  async loadTypescript(): Promise<typeof ts> {
    return await this.loadBinary("typescript");
  }

  /**
   * Load binary
   * @param packageName
   * @param dir
   */
  async loadBinary<T>(packageName, dir = ["node_modules"]): Promise<T> {
    try {
      const binPath = require.resolve(packageName, {
        paths: [normalize(join(process.cwd(), ...dir))]
      });
      return require(binPath);
    } catch {
      throw new Error(
        `${packageName} could not be found! Please, install "${packageName}" package.`
      );
    }
  }

  /**
   * Get typeix configuration file
   * @param dir
   */
  async getConfiguration(dir = ""): Promise<TpxCliConfig> {
    const configFiles = [
      ".typeixcli.json",
      ".typeix-cli.json",
      "typeix-cli.json",
      "typeix.json"
    ];
    const files = await this.readDir(dir);
    const configFile = files.find(item => configFiles.includes(item));
    if (isUndefined(configFile)) {
      throw new Error(MESSAGES.INFORMATION_CLI_MANAGER_FAILED);
    }
    const file = await this.readFile([dir, configFile]);
    const data = <TpxCliConfig>JSON.parse(file.toString());
    if (data.compilerOptions) {
      return {
        ...CLI_CONFIG,
        ...data,
        compilerOptions: {
          ...CLI_CONFIG.compilerOptions,
          ...data.compilerOptions
        }
      };
    }
    return {
      ...CLI_CONFIG,
      ...data
    };
  }

  /**
   * Read dir
   * @param dir
   */
  async readDir(dir: string | Array<string>): Promise<Array<string>> {
    if (isArray(dir)) {
      dir = join(...dir);
    }
    return new Promise((resolve, reject) => {
      readdir(
        normalize(join(process.cwd(), <string>dir)),
        (error, files) => {
          if (error) {
            this.print(error, true);
            reject(error);
          } else {
            resolve(files);
          }
        }
      );
    });
  }

  /**
   * Read file
   * @param file
   */
  async readFile(file: string | Array<string>): Promise<Buffer> {
    if (isArray(file)) {
      file = join(...file);
    }
    return new Promise((resolve, reject) => {
      readFile(
        normalize(join(process.cwd(), <string>file)),
        (error: NodeJS.ErrnoException, buffer: Buffer) => {
          if (isDefined(error)) {
            reject(error);
          } else {
            resolve(buffer);
          }
        }
      );
    });
  }

  /**
   * Get project package
   */
  async getProjectPackage(): Promise<{ [key: string]: any }> {
    const file = await this.readFile("package.json");
    return JSON.parse(file.toString());
  }

  /**
   * Filter options
   * @param options
   * @param exclude
   */
  filterOptions(options: Array<Option>, exclude: Array<string>): Array<Option> {
    return options.filter(item => isDefined(item.value) && !exclude.includes(item.name));
  }

  /**
   * Compare option value
   * @param options
   * @param key
   * @param compareVal
   */
  compareOptionValue(options: Array<Option>, key: string, compareVal: string | boolean) {
    return this.getOptionValue(options, key) === compareVal;
  }

  /**
   * Returns commander option value
   * @param options
   * @param key
   */
  getOptionValue(options: Array<Option>, key: string): string | boolean {
    return this.getOption(options, key)!.value;
  }

  /**
   * Returns commander option
   * @param options
   * @param key
   */
  getOption(options: Array<Option>, key: string): Option {
    return options.find(option => option.name === key);
  }

  /**
   * Create input
   * @param name
   * @param message
   * @param defaultAnswer
   */
  createInput(name: string, message: string, defaultAnswer: string) {
    return {
      type: "input",
      name,
      message,
      default: defaultAnswer
    };
  }

  /**
   * Create select
   * @param name
   * @param message
   * @param choices
   */
  createSelect(name: string, message: string, choices: string[]) {
    return {
      type: "list",
      name,
      message,
      choices
    };
  }

  /**
   * Prompt question
   * @param questions
   */
  async doPrompt(questions: Array<Question>): Promise<any> {
    const prompt = inquirer.createPromptModule();
    return await prompt(questions);
  }

  /**
   * outputLines
   * @param data
   * @param isError
   */
  print(data: any, isError = false): void {
    if (data instanceof Buffer) {
      data.toString()
        .split("\n")
        .forEach(line => {
          if (line.includes("WARN")) {
            console.warn(chalk.yellow(line));
          } else if (line.includes("ERR") || isError) {
            console.error(chalk.red(line));
          } else {
            console.log(line);
          }
        });
    } else if (isError) {
      console.error(chalk.red(data));
    } else {
      console.log(data);
    }
  }

  /**
   * Gets remaining flags
   * @param cli
   */
  getRemainingFlags(): string {
    const rawArgs = [...this.commanderStatic.args];
    return rawArgs.splice(Math.max(rawArgs.findIndex((item: string) => item.startsWith("--")), 0))
      .filter((item: string, index: number, array: string[]) => {
        const prevKey = array[index - 1];
        if (prevKey) {
          const key = this.camelCase(
            prevKey.replace("--", "").replace("no", "")
          );
          if (Reflect.get(this.commanderStatic, key) === item) {
            return false;
          }
        }
        return true;
      }).join(" ");
  }

  /**
   * Camel case
   * @param value
   */
  camelCase(value: string) {
    return value.split("-").reduce((str, word) => {
      return str + word[0].toUpperCase() + word.slice(1);
    });
  }
}
