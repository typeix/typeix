/**
 * @license
 * Copyright nestjs. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/nestjs/schematics/blob/master/LICENSE
 */

import {
  ArrayLiteralExpression,
  CallExpression,
  createSourceFile,
  Decorator,
  Expression,
  Identifier,
  Node,
  NodeArray,
  ObjectLiteralElement,
  ObjectLiteralExpression,
  PropertyAssignment,
  ScriptTarget,
  SourceFile,
  StringLiteral,
  SyntaxKind
} from "typescript";
import { DeclarationOptions } from "./module.declarator";

export class MetadataManager {
  constructor(private content: string) {}

  public insert(
    metadata: string,
    symbol: string,
    staticOptions?: DeclarationOptions["staticOptions"]
  ): string | undefined {
    const source: SourceFile = createSourceFile(
      "filename.ts",
      this.content,
      ScriptTarget.ES2017
    );
    const moduleDecoratorNode = this.findFirstDecoratorMetadata(
      source,
      "Module"
    ) ?? this.findFirstDecoratorMetadata(
      source,
      "RootModule"
    );
    // If there is no occurrence of `@Module` decorator, nothing will be inserted
    if (!moduleDecoratorNode) {
      return;
    }
    const matchingProperties: ObjectLiteralElement[] =
      moduleDecoratorNode.properties
        .filter((prop) => prop.kind === SyntaxKind.PropertyAssignment)
        .filter((prop: PropertyAssignment) => {
          const name = prop.name;
          switch (name.kind) {
            case SyntaxKind.Identifier:
              return (name as Identifier).getText(source) === metadata;
            case SyntaxKind.StringLiteral:
              return (name as StringLiteral).text === metadata;
            default:
              return false;
          }
        });

    symbol = this.mergeSymbolAndExpr(symbol, staticOptions);
    const addBlankLinesIfDynamic = () => {
      symbol = staticOptions ? this.addBlankLines(symbol) : symbol;
    };
    if (matchingProperties.length === 0) {
      const expr = moduleDecoratorNode as ObjectLiteralExpression;
      if (expr.properties.length === 0) {
        addBlankLinesIfDynamic();
        return this.insertMetadataToEmptyModuleDecorator(
          expr,
          metadata,
          symbol
        );
      } else {
        addBlankLinesIfDynamic();
        return this.insertNewMetadataToDecorator(
          expr,
          source,
          metadata,
          symbol
        );
      }
    } else {
      return this.insertSymbolToMetadata(
        source,
        matchingProperties,
        symbol,
        staticOptions
      );
    }
  }

  private findFirstDecoratorMetadata(
    source: SourceFile,
    identifier: string
  ): ObjectLiteralExpression | undefined {
    for (const node of this.getSourceNodes(source)) {
      const isDecoratorFactoryNode =
        node.kind === SyntaxKind.Decorator &&
        (node as Decorator).expression.kind === SyntaxKind.CallExpression;
      if (!isDecoratorFactoryNode) {
        continue;
      }

      const expr = (node as Decorator).expression as CallExpression;

      const isExpectedExpression =
        expr.arguments[0]?.kind === SyntaxKind.ObjectLiteralExpression;
      if (!isExpectedExpression) {
        continue;
      }

      if (expr.expression.kind === SyntaxKind.Identifier) {
        const escapedText = (expr.expression as Identifier).escapedText;
        const isTargetIdentifier = escapedText
          ? escapedText.toLowerCase() === identifier.toLowerCase()
          : true;
        if (isTargetIdentifier) {
          return expr.arguments[0] as ObjectLiteralExpression;
        }
      }
    }
  }

  private getSourceNodes(sourceFile: SourceFile): Node[] {
    const nodes: Node[] = [sourceFile];
    const result = [];
    while (nodes.length > 0) {
      const node = nodes.shift();
      if (node) {
        result.push(node);
        if (node.getChildCount(sourceFile) >= 0) {
          nodes.unshift(...node.getChildren(sourceFile));
        }
      }
    }
    return result;
  }

  private insertMetadataToEmptyModuleDecorator(
    expr: ObjectLiteralExpression,
    metadata: string,
    symbol: string
  ): string {
    const position = expr.getEnd() - 1;
    const toInsert = `  ${metadata}: [${symbol}]`;
    return this.content.split("").reduce((content, char, index) => {
      if (index === position) {
        return `${content}\n${toInsert}\n${char}`;
      } else {
        return `${content}${char}`;
      }
    }, "");
  }

  private insertNewMetadataToDecorator(
    expr: ObjectLiteralExpression,
    source: SourceFile,
    metadata: string,
    symbol: string
  ): string {
    const node = expr.properties[expr.properties.length - 1];
    const position = node.getEnd();
    const text = node.getFullText(source);
    const matches = text.match(/^\r?\n\s*/);
    let toInsert: string;
    if (matches) {
      toInsert = `,${matches[0]}${metadata}: [${symbol}]`;
    } else {
      toInsert = `, ${metadata}: [${symbol}]`;
    }
    return this.content.split("").reduce((content, char, index) => {
      if (index === position) {
        return `${content}${toInsert}${char}`;
      } else {
        return `${content}${char}`;
      }
    }, "");
  }

  private insertSymbolToMetadata(
    source: SourceFile,
    matchingProperties: ObjectLiteralElement[],
    symbol: string,
    staticOptions?: DeclarationOptions["staticOptions"]
  ): string {
    const assignment = matchingProperties[0] as PropertyAssignment;
    let node: Node | NodeArray<Expression>;
    const arrLiteral = assignment.initializer as ArrayLiteralExpression;
    if (!arrLiteral.elements) {
      // "imports" is not an array but rather function/constant
      return this.content;
    }
    if (arrLiteral.elements.length === 0) {
      node = arrLiteral;
    } else {
      node = arrLiteral.elements;
    }
    if (Array.isArray(node)) {
      const nodeArray = node as unknown as Node[];
      const symbolsArray = nodeArray.map((childNode) =>
        childNode.getText(source)
      );
      if (symbolsArray.includes(symbol)) {
        return this.content;
      }
      node = node[node.length - 1];
    }
    let toInsert: string;
    let position = (node as Node).getEnd();

    if ((node as Node).kind === SyntaxKind.ArrayLiteralExpression) {
      position--;
      toInsert = staticOptions ? this.addBlankLines(symbol) : `${symbol}`;
    } else {
      const text = (node as Node).getFullText(source);
      const itemSeparator = (text.match(/^\r?\n(\r?)\s+/) ||
        text.match(/^\r?\n/) ||
        " ")[0];
      toInsert = `,${itemSeparator}${symbol}`;
    }
    return this.content.split("").reduce((content, char, index) => {
      if (index === position) {
        return `${content}${toInsert}${char}`;
      } else {
        return `${content}${char}`;
      }
    }, "");
  }

  private mergeSymbolAndExpr(
    symbol: string,
    staticOptions?: DeclarationOptions["staticOptions"]
  ): string {
    if (!staticOptions) {
      return symbol;
    }
    const spacing = 6;
    let options = JSON.stringify(staticOptions.value, null, spacing);
    symbol += `.${staticOptions.name}(${options})`;
    return symbol;
  }

  private addBlankLines(expr: string): string {
    return `\n    ${expr}\n  `;
  }
}
