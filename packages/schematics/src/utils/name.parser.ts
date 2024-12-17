import {basename, dirname, normalize, Path} from "@angular-devkit/core";

/**
 * Represents the options that can be used during a parsing operation.
 *
 * Properties:
 * - `name`: The name of the entity to be parsed. This is a required field.
 * - `path`: An optional file path or location pertaining to the entity being parsed.
 */
export interface ParseOptions {
  name: string;
  path?: string;
}

/**
 * Represents a geographical or logical location.
 *
 * This interface provides a structure for defining a location with
 * a specified name and an associated path.
 *
 * @interface Location
 * @property {string} name - The name of the location.
 * @property {Path} path - The associated path of the location.
 */
export interface Location {
  name: string;
  path: Path;
}

/**
 * The `NameParser` class is responsible for extracting and normalizing
 * details such as name and file path based on provided options.
 */
export class NameParser {
  private static readonly DEFAULT_PATH_SEPARATOR = "/";

  /**
   * Parses the given options to extract location details such as name and path.
   *
   * @param {ParseOptions} options - The options containing the necessary data for parsing.
   * @return {Location} An object containing the parsed name and normalized path.
   */
  public parse(options: ParseOptions): Location {
    const baseName: string = basename(options.name as Path);
    const namePath: string = this.constructNamePath(options);
    return {
      name: baseName,
      path: normalize(NameParser.DEFAULT_PATH_SEPARATOR.concat(namePath))
    };
  }

  /**
   * Constructs a full file path by combining the provided path and name using a default path separator.
   *
   * @param {ParseOptions} options - The options object containing the path and name to construct the full path.
   * @return {string} The constructed full path in string format.
   */
  private constructNamePath(options: ParseOptions): string {
    const combinedPath: string = (options.path || "")
      .concat(NameParser.DEFAULT_PATH_SEPARATOR)
      .concat(options.name);
    return dirname(combinedPath as Path);
  }
}
