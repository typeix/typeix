import * as ts from "typescript";


export interface Option {
  name: string;
  value: boolean | string;
  options?: any;
}

export interface Schematic {
  name: string;
  value: boolean | string;
}

export interface TpxConfiguration {
  tse: typeof ts;
  tsConfig: ts.ParsedCommandLine;
  cliConfig: TypeixCliConfig;
}

export interface PluginExtension {
  before: (program: ts.Program | ts.BuilderProgram) => ts.CustomTransformerFactory;
  after: (program:  ts.Program | ts.BuilderProgram) => ts.CustomTransformerFactory;
}

export interface PluginOption {
  name: string;
  options?: {
    [key: string]: any;
  };
}

interface CompilerOptions {
  tsConfigPath?: string;
  webpack?: boolean;
  webpackConfigPath?: string;
  plugins?: Array<PluginOption>;
  assets?: Array<string>;
  deleteOutDir?: boolean;
}

interface SchematicOptions {
  spec?: boolean | Record<string, boolean>;
}

export interface Project {
  type?: string;
  root?: string;
  entryFile?: string;
  sourceRoot?: string;
  compilerOptions?: CompilerOptions;
}

export interface TypeixCliConfig {
  [key: string]: any;
  language?: string;
  collection?: string;
  sourceRoot?: string;
  entryFile?: string;
  monorepo?: boolean;
  compilerOptions?: CompilerOptions;
  generateOptions?: SchematicOptions;
  projects?: {
    [key: string]: Project;
  };
}
