/**
 * This file has been moved to the "@typeix/schematics" package to avoid pulling the entire "@schematics/angular" into Typeix projects.
 * REF https://github.com/angular/angular-cli/blob/master/packages/schematics/angular/utility/json-file.ts
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {JsonValue} from "@angular-devkit/core";
import {Tree} from "@angular-devkit/schematics";
import {
  Node,
  ParseError,
  applyEdits,
  findNodeAtLocation,
  getNodeValue,
  modify,
  parseTree,
  printParseErrorCode
} from "jsonc-parser";

export type InsertionIndex = (properties: string[]) => number;
export type JSONPath = (string | number)[];

export class JSONFile {
  content: string;

  private _jsonAst: Node | undefined;

  private readonly formattingOptions = {
    insertSpaces: true,
    tabSize: 2
  };

  /**
   * Creates an instance of the class.
   *
   * @param {Tree} host - The file tree structure where the path resides.
   * @param {string} path - The specific path within the tree to be used.
   * @return {Object} An instance of the class with initialized content.
   */
  constructor(private readonly host: Tree, private readonly path: string) {
    this.content = this._initializeContent();
  }

  /**
   * Retrieves the JSON Abstract Syntax Tree (AST) representation of the content.
   * If the JSON AST is already parsed and stored, it returns the stored AST.
   * Otherwise, it parses the content, stores the resulting AST, and handles possible parsing errors.
   *
   * @return {Node | undefined} The parsed JSON AST as a Node object if parsing is successful, or undefined if unsuccessful.
   * @throws {Error} If there is an error in parsing the JSON content.
   */
  private get jsonAst(): Node | undefined {
    if (this._jsonAst) {
      return this._jsonAst;
    }

    const errors: ParseError[] = [];
    this._jsonAst = parseTree(this.content, errors, {
      allowTrailingComma: true
    });

    if (errors.length) {
      const {error, offset} = errors[0];
      throw new Error(
        `Failed to parse "${this.path}" as JSON AST Object. ${printParseErrorCode(
          error
        )} at location: ${offset}.`
      );
    }

    return this._jsonAst;
  }

  /**
   * Retrieves the value at the specified JSON path from the JSON abstract syntax tree (AST).
   *
   * @param {JSONPath} jsonPath - The JSON path indicating the location of the value to retrieve.
   * @return {unknown} The value located at the given JSON path, or undefined if the path is invalid or the value does not exist.
   */
  get(jsonPath: JSONPath): unknown {
    const jsonAstNode = this.jsonAst;
    if (!jsonAstNode) {
      return undefined;
    }

    if (jsonPath.length === 0) {
      return getNodeValue(jsonAstNode);
    }

    const node = findNodeAtLocation(jsonAstNode, jsonPath);
    return node === undefined ? undefined : getNodeValue(node);
  }

  /**
   * Modifies the content at the given JSON path with the provided value. It allows for optional
   * insertion of the value in a specified order.
   *
   * @param {JSONPath} jsonPath - The path in the JSON structure to be modified.
   * @param {JsonValue | undefined} value - The value to insert or update at the specified JSON path.
   *                                       If undefined, it may remove the value at the given path.
   * @param {InsertionIndex | false} [insertInOrder] - Optional. Determines the insertion order:
   *                                                   provide an index or false to append without ordering.
   * @return {void} No value is returned, the content is modified in place.
   */
  modify(
    jsonPath: JSONPath,
    value: JsonValue | undefined,
    insertInOrder?: InsertionIndex | false
  ): void {
    const getInsertionIndex = this._resolveInsertionIndex(jsonPath, insertInOrder);

    const edits = modify(this.content, jsonPath, value, {
      getInsertionIndex,
      formattingOptions: this.formattingOptions
    });

    this.content = applyEdits(this.content, edits);
    this.host.overwrite(this.path, this.content);
    this._jsonAst = undefined; // Clear cached AST
  }

  /**
   * Removes a value from the data structure at the specified JSONPath.
   *
   * @param {JSONPath} jsonPath - The JSONPath that identifies the location of the value to be removed.
   * @return {void} This method does not return any value.
   */
  remove(jsonPath: JSONPath): void {
    this.modify(jsonPath, undefined);
  }

  /**
   * Reads the content of a file from the specified path and initializes it as a string.
   * Throws an error if the file cannot be read.
   *
   * @return {string} The content of the file as a string.
   */
  private _initializeContent(): string {
    const buffer = this.host.read(this.path);
    if (buffer) {
      return buffer.toString();
    } else {
      throw new Error(`Could not read '${this.path}'.`);
    }
  }

  /**
   * Resolves the insertion index for a given JSON path, considering an optional insertion order.
   *
   * @param {JSONPath} jsonPath - The JSON path indicating the location where an element is to be inserted.
   * @param {InsertionIndex | false} [insertInOrder] - An optional parameter specifying either a custom insertion index,
   * or `false` to signal that no specific ordering is required. If undefined, the index is determined automatically.
   * @return {InsertionIndex | undefined} - The resolved insertion index if applicable, or undefined if no insertion is required.
   */
  private _resolveInsertionIndex(
    jsonPath: JSONPath,
    insertInOrder?: InsertionIndex | false
  ): InsertionIndex | undefined {
    if (insertInOrder === undefined) {
      const property = jsonPath.slice(-1)[0];
      return (properties) =>
        [...properties, property].sort().findIndex((p) => p === property);
    } else if (insertInOrder !== false) {
      return insertInOrder;
    }
    return undefined;
  }
}
