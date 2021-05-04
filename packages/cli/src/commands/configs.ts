import * as ts from "typescript";
import {TpxCliConfig} from "./interfaces";

export interface TpxConfiguration {
  tse: typeof ts;
  tsConfig: ts.ParsedCommandLine;
  cliConfig: TpxCliConfig;
}

declare type TpxTransformerFactory = ts.TransformerFactory<ts.SourceFile> | ts.CustomTransformerFactory;

export interface PluginExtension {
  before: (program: ts.Program | ts.BuilderProgram, options?: { [key: string]: any }) => TpxTransformerFactory;
  after: (program: ts.Program | ts.BuilderProgram, options?: { [key: string]: any }) => TpxTransformerFactory;
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
