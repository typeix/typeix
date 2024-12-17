import {Path} from "@angular-devkit/core";
import {capitalize, classify} from "@angular-devkit/core/src/utils/strings";
import {ModuleImportDeclarator} from "./module-import.declarator";
import {ModuleMetadataDeclarator} from "./module-metadata.declarator";

/**
 * Represents the options required for declaring a specific entity within a module or path.
 *
 * @interface DeclarationOptions
 *
 * @property {string} metadata - Metadata associated with the declaration.
 * @property {string} [type] - Optional type of the declaration.
 * @property {string} name - The name of the entity being declared.
 * @property {string} [className] - Optional class name associated with the declaration.
 * @property {Path} path - The file path where the declaration resides.
 * @property {Path} module - The module file path associated with the declaration.
 * @property {string} [symbol] - Optional symbol linked to the declaration.
 * @property {Object} [staticOptions] - Optional static configuration for the declaration.
 * @property {string} staticOptions.name - Name of the static option.
 * @property {Record<string, any>} staticOptions.value - Value of the static option as a key-value pair.
 */
export interface DeclarationOptions {
  metadata: string;
  type?: string;
  name: string;
  className?: string;
  path: Path;
  module: Path;
  symbol?: string;
  staticOptions?: {
    name: string;
    value: Record<string, any>;
  };
}

/**
 * A class responsible for declaring and managing module-related code in a structured manner.
 *
 * This class provides functionalities for enriching content with module metadata
 * and imports, based on the provided configuration and options.
 */
export class ModuleDeclarator {
  private static readonly DEFAULT_IMPORTS = new ModuleImportDeclarator();
  private static readonly DEFAULT_METADATA = new ModuleMetadataDeclarator();

  constructor(
    private imports: ModuleImportDeclarator = ModuleDeclarator.DEFAULT_IMPORTS,
    private metadata: ModuleMetadataDeclarator = ModuleDeclarator.DEFAULT_METADATA
  ) {
  }

  /**
   * Declares a content string with the specified declaration options, processes it through metadata, and enriches it with computed symbols.
   *
   * @param content The initial content string to be declared.
   * @param options An object containing the declaration options to customize the declaration process.
   * @return The updated content string after processing and declaration.
   */
  public declare(content: string, options: DeclarationOptions): string {
    const enrichedOptions = this.computeSymbol(options);
    const updatedContent = this.metadata.declare(
      this.imports.declare(content, enrichedOptions),
      enrichedOptions
    );
    return updatedContent;
  }

  /**
   * Computes a symbol based on the given options and returns updated declaration options.
   *
   * @param {DeclarationOptions} options - The options used to determine and compute the symbol.
   * @return {DeclarationOptions} The updated options including the computed symbol.
   */
  private computeSymbol(options: DeclarationOptions): DeclarationOptions {
    return {
      ...options,
      symbol: this.determineSymbol(options)
    };
  }

  /**
   * Determines the symbol name based on the provided options.
   *
   * @param {Object} options - The declaration options.
   * @param {string} options.className - The class name, if available, to be used directly.
   * @param {string} options.type - The type of the declaration, used for constructing the symbol.
   * @param {string} options.name - The base name for the symbol.
   * @return {string} The determined symbol name based on the inputs.
   */
  private determineSymbol({className, type, name}: DeclarationOptions): string {
    if (className) {
      return className;
    }
    if (type !== undefined) {
      return classify(name).concat(capitalize(type));
    }
    return classify(name);
  }
}
