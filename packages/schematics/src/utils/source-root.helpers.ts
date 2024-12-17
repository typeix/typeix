import {join, normalize} from "@angular-devkit/core";
import {Rule, Tree} from "@angular-devkit/schematics";
import {DEFAULT_PATH_NAME} from "../lib/defaults";

const DEFAULT_ROOT_FILES = ["typeix-cli.json", "typeix.json"];

/**
 * Checks if the specified tree contains any of the default root files or additional files provided.
 *
 * @param {Tree} host - The tree structure to search for files.
 * @param {string[]} [extraFiles=[]] - An optional array of additional file names to check for in the tree.
 * @return {boolean} Returns true if any of the files exist in the tree, otherwise false.
 */
export function doesTreeContainFiles(host: Tree, extraFiles: string[] = []): boolean {
  const filesToCheck = [...DEFAULT_ROOT_FILES, ...extraFiles];
  return filesToCheck.some(file => host.exists(file));
}

/**
 * Merges and calculates the source root and path for a given set of options.
 *
 * @param {T} options An object containing `sourceRoot` and `path` properties.
 *                     `sourceRoot` represents the root source directory, and
 *                     `path` optionally specifies a subpath.
 * @return {Rule} A tree rule function that adjusts the tree's path based on the computed source root and path.
 */
export function mergeSourceRoot<
  T extends { sourceRoot?: string; path?: string } = any
>(options: T): Rule {
  const calculatePath = (sourceRoot: string, path?: string) =>
    path !== undefined ? join(normalize(sourceRoot), path) : normalize(sourceRoot);
  return (host: Tree) => {
    const isInRoot = doesTreeContainFiles(host, ["tsconfig.json", "package.json"]);
    if (!isInRoot) {
      return host;
    }
    const defaultSourceRoot = options.sourceRoot ?? DEFAULT_PATH_NAME;
    options.path = calculatePath(defaultSourceRoot, options.path);
    return host;
  };
}
