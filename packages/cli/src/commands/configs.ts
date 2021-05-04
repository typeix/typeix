import * as ts from "typescript";
import {TpxCliConfig} from "./interfaces";
import {CustomTransformerFactory, SourceFile, TransformerFactory} from "typescript";

export interface TpxReport {
  format: typeof ts.formatDiagnosticsWithColorAndContext;
  errors: Array<ts.Diagnostic>;
  newLine: string;
  currentDir: string;
  errorCount: number;
}

export interface TpxConfiguration {
  tse: typeof ts;
  tsConfig: ts.ParsedCommandLine;
  cliConfig: TpxCliConfig;
  configPath: string;
}

export interface TpxCompilerOptions {
  tsConfigPath: string;
  tpxConfigPath: string;
  watchMode: boolean;
  compilerOptions: ts.CompilerOptions;
}

declare type TpxTransformerFactory = ts.TransformerFactory<ts.SourceFile> | ts.CustomTransformerFactory;

export interface CompilerPluginExtension {
  before: (program: ts.Program | ts.BuilderProgram, options?: { [key: string]: any }) => TpxTransformerFactory;
  after: (program: ts.Program | ts.BuilderProgram, options?: { [key: string]: any }) => TpxTransformerFactory;
}

export interface LoadedCompilerPlugins {
  before: Array<TransformerFactory<SourceFile> | CustomTransformerFactory>;
  after: Array<TransformerFactory<SourceFile> | CustomTransformerFactory>;
}

export const CLI_CONFIG: TpxCliConfig = {
  language: "ts",
  sourceRoot: "src",
  collection: "@typeix/schematics",
  entryFile: "main",
  projects: {},
  monorepo: false,
  compilerOptions: {
    tsConfigPath: "tsconfig.build.json",
    webpack: false,
    webpackConfigPath: "webpack.config.js",
    plugins: [],
    assets: []
  },
  generateOptions: {}
};
