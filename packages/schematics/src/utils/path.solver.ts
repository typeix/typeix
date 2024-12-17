import {basename, dirname, Path, relative} from "@angular-devkit/core";

/**
 * Represents a utility class for solving and computing path-related operations.
 */
export class PathSolver {
  private static readonly PLACEHOLDER: string = "/placeholder"; // Introduced constant

  /**
   * Computes the relative path from one specified path (from) to another path (to).
   *
   * @param {Path} from The starting path from which the relative path is calculated.
   * @param {Path} to The target path to which the relative path is calculated.
   * @return {string} The relative path from the starting path to the target path.
   */
  public relative(from: Path, to: Path): string {
    const relativePath = this.getRelativeDirectory(from, to); // Used extracted function
    return `${relativePath.startsWith(".") ? relativePath : `./${relativePath}`}`.concat(
      relativePath.length === 0 ? "" : "/", basename(to)
    );
  }

  /**
   * Determines the relative directory path between two given paths.
   *
   * @param {Path} from - The base path from which the relative path is calculated.
   * @param {Path} to - The target path to which the relative path is calculated.
   * @return {string} The relative directory path from the "from" path to the "to" path.
   */
  private getRelativeDirectory(from: Path, to: Path): string { // Extract function
    const baseFrom = dirname((PathSolver.PLACEHOLDER + from) as Path);
    const baseTo = dirname((PathSolver.PLACEHOLDER + to) as Path);
    return relative(baseFrom, baseTo);
  }
}
