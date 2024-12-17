import {normalize, Path} from "@angular-devkit/core";
import {DeclarationOptions} from "./module.declarator";
import {PathSolver} from "./path.solver";

/**
 * The `ModuleImportDeclarator` class facilitates the declaration of
 * additional import statements within a given content block. It enables
 * dynamic construction and injection of import statements using
 * customizable options such as module paths and symbols to import.
 */
export class ModuleImportDeclarator {
  private static readonly IMPORT_STATEMENT_REGEX = /\} from ('|")/;

  constructor(private solver: PathSolver = new PathSolver()) {
  }

  /**
   * Declares a content block with an additional import statement injected.
   *
   * @param {string} content - The content into which the import statement will be injected.
   * @param {DeclarationOptions} options - Configuration options to build the import statement.
   * @return {string} - The modified content with the added import declaration.
   */
  public declare(content: string, options: DeclarationOptions): string {
    const importStatement = this.buildImportStatement(options);
    const contentLines = content.split("\n");
    const lastImportIndex = this.findLastImportIndex(contentLines);
    contentLines.splice(lastImportIndex + 1, 0, importStatement);
    return contentLines.join("\n");
  }

  /**
   * Constructs an import statement string based on the provided declaration options.
   *
   * @param {DeclarationOptions} options - The options containing details required to build the import statement.
   * Includes the symbol to import and the relative path calculation.
   * @return {string} The constructed import statement as a string.
   */
  private buildImportStatement(options: DeclarationOptions): string {
    return `import {${options.symbol}} from "${this.computeRelativePath(options)}";`;
  }

  /**
   * Computes and returns the relative path between the given module and its corresponding import module path.
   *
   * @param {DeclarationOptions} options - The options object containing the module path and other configuration data.
   * @return {string} The computed relative path between the module and the import module path.
   */
  private computeRelativePath(options: DeclarationOptions): string {
    const importModulePath = this.normalizeImportModulePath(options);
    return this.solver.relative(options.module, importModulePath);
  }

  /**
   * Normalizes the import module path by combining the given options into a normalized file path.
   *
   * @param {DeclarationOptions} options - The options object containing details for path normalization.
   * @param {string} options.path - The base path for the import.
   * @param {string} options.name - The name of the file/module.
   * @param {string} [options.type] - An optional file type or extension to include in the path.
   * @return {Path} - The normalized module path as a `Path` object.
   */
  private normalizeImportModulePath(options: DeclarationOptions): Path {
    const filePath = `/${options.path}/${options.name}`;
    return normalize(options.type ? `${filePath}.${options.type}` : filePath);
  }

  /**
   * Finds the index of the last import statement in the given array of content lines.
   *
   * @param {string[]} contentLines - An array of strings representing the lines of content to search for import statements.
   * @return {number} The index of the last import statement in the content lines, or 0 if no import statement is found.
   */
  private findLastImportIndex(contentLines: string[]): number {
    const reverseImports = contentLines
      .slice()
      .reverse()
      .find(line => ModuleImportDeclarator.IMPORT_STATEMENT_REGEX.test(line));
    return reverseImports ? contentLines.indexOf(reverseImports) : 0;
  }
}
