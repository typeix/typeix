export interface Option {
  name: string;
  value: boolean | string;
  options?: any;
}

export interface Schematic {
  name: string;
  value: boolean | string | number;
}

export interface PluginOption {
  name: string;
  path?: string;
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

export interface TpxCliConfig {
  [key: string]: any;
  language?: string;
  compiler?: string;
  collection?: string;
  sourceRoot?: string;
  distRoot?: string;
  entryFile?: string;
  monorepo?: boolean;
  compilerOptions?: CompilerOptions;
  generateOptions?: SchematicOptions;
  projects?: {
    [key: string]: Project;
  };
}
