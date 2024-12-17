import {MetadataManager} from "./metadata.manager";
import {DeclarationOptions} from "./module.declarator";

/**
 * A class responsible for declaring metadata and inserting it into module source content.
 * Provides functionality to handle and manipulate metadata within module source code.
 */
export class ModuleMetadataDeclarator {

  /**
   * Declares a module by incorporating provided metadata into the source.
   *
   * @param moduleSource The source code of the module to be declared.
   * @param declarationOpts Options that define metadata and configuration for the declaration process.
   * @return The modified module source with metadata applied, or the original module source if no metadata is inserted.
   */
  public declare(moduleSource: string, declarationOpts: DeclarationOptions): string {
    return this.insertMetadata(moduleSource, declarationOpts) || moduleSource;
  }

  /**
   * Inserts metadata into the provided content using the specified options.
   *
   * @param {string} content - The string content where the metadata will be inserted.
   * @param {DeclarationOptions} options - An object containing metadata, symbol,
   * and other options for the insertion process.
   * @return {string | undefined} The modified content with the metadata inserted,
   * or undefined if the insertion could not be performed.
   */
  private insertMetadata(content: string, options: DeclarationOptions): string | undefined {
    const manager = new MetadataManager(content);
    return manager.insert(options.metadata, options.symbol, options.staticOptions);
  }
}
