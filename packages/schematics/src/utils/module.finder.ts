import {join, Path, PathFragment} from "@angular-devkit/core";
import {DirEntry, Tree} from "@angular-devkit/schematics";

/**
 * Options object used to specify search criteria for finding resources or items.
 *
 * @interface FindOptions
 *
 * @property {string} [name] - Optional name to narrow the search. If specified, the search will match resources or items with this name.
 *
 * @property {Path} path - Mandatory property representing the path or location where the search will be performed.
 *
 * @property {string} [kind] - Optional type or category of the resource or item to filter relevant results.
 */
export interface FindOptions {
  name?: string;
  path: Path;
  kind?: string;
}

/**
 * A utility class that provides functionality to locate module files within a given directory tree.
 */
export class ModuleFinder {
  constructor(private tree: Tree) {}
  /**
   * Searches for a module based on the provided options.
   *
   * @param {FindOptions} options - An object containing the options for the search, including the target path.
   * @return {Path | null} The path to the found module, or null if no module is found.
   */
  public find(options: FindOptions): Path | null {
    const dirPath: Path = options.path;
    const directory: DirEntry = this.tree.getDir(dirPath);
    return this.findModuleInDirectory(directory);
  }

  /**
   * Recursively searches for a module file in the specified directory and its parent directories.
   *
   * @param {DirEntry} directory - The directory in which to search for the module.
   * @return {Path | null} The path to the module file if found, or null if no module file is found.
   */
  private findModuleInDirectory(directory: DirEntry): Path | null {
    if (!directory) {
      return null;
    }

    const moduleFilename = this.getModuleFilename(directory);
    return moduleFilename
      ? join(directory.path, moduleFilename.valueOf())
      : this.findModuleInDirectory(directory.parent as DirEntry);
  }

  /**
   * Retrieves the name of the module file from a given directory if it exists.
   *
   * @param {DirEntry} directory - The directory in which to search for the module file.
   * @return {PathFragment | undefined} The name of the module file if found, or undefined if no module file is found in the directory.
   */
  private getModuleFilename(directory: DirEntry): PathFragment | undefined {
    return directory.subfiles.find((filename) => /\.module\.(t|j)s$/.test(filename));
  }
}
