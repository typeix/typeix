import {
  ArrayLiteralExpression,
  CallExpression,
  createSourceFile,
  Decorator,
  Identifier,
  Node,
  ObjectLiteralExpression,
  PropertyAssignment,
  ScriptTarget,
  SourceFile,
  StringLiteral,
  SyntaxKind
} from "typescript";

import {DeclarationOptions} from "./module.declarator";

export class MetadataManager {
  private static readonly PROPERTY_KIND = SyntaxKind.PropertyAssignment;
  private readonly source: SourceFile;

  constructor(private content: string) {
    this.source = createSourceFile("filename.ts", this.content, ScriptTarget.ES2017);
  }

  /**
   * Inserts a metadata symbol into the module decorator or updates an existing metadata property.
   *
   * @param {string} metadata - The metadata key to which the symbol should be added or updated.
   * @param {string} symbol - The symbol to insert into the specified metadata.
   * @param {DeclarationOptions["staticOptions"]} [staticOptions] - Optional static options for the declaration.
   * @return {string | undefined} Returns the updated metadata as a string if the operation is successful, or undefined if no module decorator is found.
   */
  public insert(metadata: string, symbol: string, staticOptions?: DeclarationOptions["staticOptions"]): string | undefined {
    const moduleDecoratorNode = this.findModuleDecorator();
    if (!moduleDecoratorNode) {
      return undefined;
    }

    const matchingProperties = this.findMatchingMetadataProperties(moduleDecoratorNode, metadata);
    symbol = this.mergeSymbolAndExpr(symbol, staticOptions);

    if (matchingProperties.length === 0) {
      return moduleDecoratorNode.properties.length === 0
        ? this.insertMetadataToEmptyModuleDecorator(moduleDecoratorNode, metadata, symbol, staticOptions)
        : this.insertNewMetadataToDecorator(moduleDecoratorNode, metadata, symbol, staticOptions);
    }
    return this.insertSymbolToMetadata(matchingProperties, symbol, staticOptions);
  }

  /**
   * Searches for a module decorator within the provided source code and returns
   * its associated object literal expression, if present.
   *
   * This method checks for decorators with the names "Module" and "RootModule"
   * in the source and retrieves their respective metadata.
   *
   * @returns {ObjectLiteralExpression | undefined} The object literal expression
   * representing the module decorator if found, otherwise undefined.
   */
  private findModuleDecorator(): ObjectLiteralExpression | undefined {
    return (
      this.findDecoratorMetadata(this.source, "Module") ||
      this.findDecoratorMetadata(this.source, "RootModule")
    );
  }

  /**
   * Finds and returns the metadata properties within the provided `ObjectLiteralExpression` node
   * that match the specified key.
   *
   * @param node The `ObjectLiteralExpression` to search for matching metadata properties.
   * @param key The name of the property to match against the metadata properties.
   * @return An array of `PropertyAssignment` objects that match the provided key.
   */
  private findMatchingMetadataProperties(node: ObjectLiteralExpression, key: string): PropertyAssignment[] {
    return node.properties
      .filter((prop) => prop.kind === MetadataManager.PROPERTY_KIND)
      .filter((prop: PropertyAssignment) => {
        const name = prop.name;
        if (name.kind === SyntaxKind.Identifier) {
          return (name as Identifier).getText(this.source) === key;
        }
        if (name.kind === SyntaxKind.StringLiteral) {
          return (name as StringLiteral).text === key;
        }
        return false;
      }) as PropertyAssignment[];
  }

  /**
   * Finds and retrieves the metadata object literal expression associated with a specific decorator
   * identifier in the given source file.
   *
   * @param {SourceFile} source - The source file to scan and search for the decorator.
   * @param {string} identifier - The name of the decorator whose metadata should be located.
   * @returns {ObjectLiteralExpression | undefined} The object literal expression containing
   * metadata for the specified decorator, or undefined if not found.
   */
  private findDecoratorMetadata(source: SourceFile, identifier: string): ObjectLiteralExpression | undefined {
    for (const node of this.getSourceNodes(source)) {
      if (node.kind === SyntaxKind.Decorator && (node as Decorator).expression.kind === SyntaxKind.CallExpression) {
        const expr = (node as Decorator).expression as CallExpression;
        if (expr.arguments[0]?.kind === SyntaxKind.ObjectLiteralExpression) {
          const exprText = (expr.expression as Identifier).escapedText?.toString().toLowerCase();
          if (identifier.toLowerCase() === exprText) {
            return expr.arguments[0] as ObjectLiteralExpression;
          }
        }
      }
    }
    return undefined;
  }

  /**
   * Inserts metadata into an empty module decorator by adding appropriate metadata and symbol values.
   *
   * @param {ObjectLiteralExpression} expr - The object literal expression where the metadata should be inserted.
   * @param {string} metadata - The metadata key to be added.
   * @param {string} symbol - The symbol value to be included in the metadata array.
   * @param {DeclarationOptions["staticOptions"]} [staticOptions] - Optional static options that may determine the format of the inserted metadata.
   * @return {string} The updated content after inserting the metadata at the specified position.
   */
  private insertMetadataToEmptyModuleDecorator(
    expr: ObjectLiteralExpression,
    metadata: string,
    symbol: string,
    staticOptions?: DeclarationOptions["staticOptions"]
  ): string {
    const position = expr.getEnd() - 1;
    symbol = staticOptions ? this.addBlankLines(symbol) : symbol;
    const toInsert = `  ${metadata}: [${symbol}]`;
    return this.insertTextAtPosition(this.content, position, `\n${toInsert}\n`);
  }

  /**
   * Inserts new metadata into a decorator by appending to an object literal expression.
   *
   * @param {ObjectLiteralExpression} expr - The object literal expression where the metadata will be added.
   * @param {string} metadata - The metadata key to insert into the object literal.
   * @param {string} symbol - The symbol or value to associate with the metadata key.
   * @param {DeclarationOptions["staticOptions"]} [staticOptions] - Optional static options to determine if blank lines should be added.
   * @return {string} The updated content after inserting the new metadata.
   */
  private insertNewMetadataToDecorator(
    expr: ObjectLiteralExpression,
    metadata: string,
    symbol: string,
    staticOptions?: DeclarationOptions["staticOptions"]
  ): string {
    const lastProperty = expr.properties[expr.properties.length - 1];
    const position = lastProperty.getEnd();
    symbol = staticOptions ? this.addBlankLines(symbol) : symbol;
    const separator = lastProperty.getFullText(this.source).match(/^\r?\n\s+/)?.[0] || " ";
    const toInsert = `,${separator}${metadata}: [${symbol}]`;
    return this.insertTextAtPosition(this.content, position, toInsert);
  }

  /**
   * Inserts a symbol into an array literal within the metadata properties.
   *
   * @param {PropertyAssignment[]} properties - A collection of property assignments, where the metadata is stored, and the first property is assumed to contain an array literal.
   * @param {string} symbol - The symbol to insert into the array literal.
   * @param {DeclarationOptions["staticOptions"]} [staticOptions] - Optional static options that determine if blank lines are added around the inserted symbol.
   * @return {string} Returns the updated content as a string after the symbol is inserted.
   */
  private insertSymbolToMetadata(
    properties: PropertyAssignment[],
    symbol: string,
    staticOptions?: DeclarationOptions["staticOptions"]
  ): string {
    const assignment = properties[0];
    const arrayLiteral = assignment.initializer as ArrayLiteralExpression;

    if (!arrayLiteral.elements) {
      return this.content;
    }

    const lastElement = arrayLiteral.elements.length > 0
      ? arrayLiteral.elements[arrayLiteral.elements.length - 1]
      : arrayLiteral;

    const position = lastElement.getEnd() + (lastElement.kind === SyntaxKind.ArrayLiteralExpression ? -1 : 0);
    const separator = lastElement.getFullText(this.source).match(/^\r?\n\s+/)?.[0] || " ";
    const toInsert = arrayLiteral.elements.length === 0
      ? staticOptions ? this.addBlankLines(symbol) : `${symbol}`
      : `,${separator}${symbol}`;
    return this.insertTextAtPosition(this.content, position, toInsert);
  }

  /**
   * Merges a symbol with its corresponding expression derived from the provided static options.
   *
   * @param {string} symbol - The base symbol to merge with the expression.
   * @param {DeclarationOptions["staticOptions"]} [staticOptions] - Optional object containing static options
   *        with name and value properties to construct the expression.
   * @return {string} The resulting string that combines the symbol with the derived expression,
   *         or the original symbol if static options are not provided.
   */
  private mergeSymbolAndExpr(symbol: string, staticOptions?: DeclarationOptions["staticOptions"]): string {
    if (!staticOptions) {
      return symbol;
    }
    const options = JSON.stringify(staticOptions.value, null, 2); // Pretty-print options with 2 spaces
    return `${symbol}.${staticOptions.name}(${options})`;
  }

  /**
   * Adds blank lines around a given string expression.
   *
   * @param {string} expr - The string expression to wrap with blank lines.
   * @return {string} The modified string with blank lines added around the input expression.
   */
  private addBlankLines(expr: string): string {
    return `\n    ${expr}\n  `;
  }

  /**
   * Retrieves all source nodes from a given source file.
   *
   * This method traverses the source file's Abstract Syntax Tree (AST)
   * and collects all nodes into an array.
   *
   * @param source The source file from which to retrieve the nodes.
   * @return An array of all nodes found within the source file.
   */
  private getSourceNodes(source: SourceFile): Node[] {
    const nodes: Node[] = [source];
    const result: Node[] = [];
    while (nodes.length > 0) {
      const node = nodes.shift();
      if (node) {
        result.push(node);
        nodes.unshift(...node.getChildren(source));
      }
    }
    return result;
  }

  /**
   * Inserts a specified text at a given position within a string.
   *
   * @param {string} content - The original string where the text will be inserted.
   * @param {number} position - The position in the original string to insert the text. Must be a valid index.
   * @param {string} text - The text to be inserted at the specified position.
   * @return {string} A new string with the text inserted at the specified position.
   */
  private insertTextAtPosition(content: string, position: number, text: string): string {
    return content.substring(0, position) + text + content.substring(position);
  }
}
