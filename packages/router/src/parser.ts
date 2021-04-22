import {isArray, isFalsy, isUndefined} from "@typeix/utils";
import {RouterError} from "./router-error";

const PATTERN_MATCH = /<((\w+):)?([^>]+)>/g;
const HAS_GROUP_START = /^\(/;
const HAS_GROUP_END = /\)$/;

/**
 * Route parser
 * @name RouteParser
 * @constructor
 *
 */
export class RouteParser {

  private readonly variableSize: number = 0;
  private urlMatchPattern: RegExp;
  private variables: Map<string, { pattern: RegExp; index: number }> = new Map();

  constructor(path: string) {
    let pattern, anyPattern = "([\\s\\S]+)";
    if (isFalsy(path) || [ "/", "*" ].indexOf(path.charAt(0)) === -1) {
      throw new RouterError(
        "Url must start with \/ or it has to be * which match all patterns",
        500,
        {
          path
        }
      );
    } else if (PATTERN_MATCH.test(path)) {
      let vIndex = 0;
      pattern = path.replace(PATTERN_MATCH, (replace, key, source, index) => {
        let replacePattern = index;
        if (isUndefined(key)) {
          replacePattern = anyPattern;
        } else if (!HAS_GROUP_START.test(index) || !HAS_GROUP_END.test(index)) {
          replacePattern = "(" + index + ")";
        }
        this.variables.set(
          isUndefined(key) ? index : key.slice(0, -1),
          {
            pattern: new RegExp((isUndefined(key) ? anyPattern : index)),
            index: vIndex
          }
        );
        vIndex++;
        return replacePattern;
      });
      this.variableSize = vIndex + 1;
    } else if (path === "*") {
      pattern = anyPattern;
    } else {
      pattern = path;
    }
    this.urlMatchPattern = new RegExp("^" + pattern + "$");
  }

  /**
   * Get parameters
   * @param {string} path
   * @returns {Object}
   */
  public getParams(path: string): { [key: string]: string } {
    let params = {};
    let matches = this.urlMatchPattern.exec(path);
    if (isArray(matches)) {
      let found = matches.slice(1, this.variableSize + 1);
      for (let [ key, value ] of this.variables) {
        params[key] = found[value.index];
      }
    }
    return params;
  }

  /**
   * Is valid path
   * @param {string} path
   * @returns {boolean}
   */
  public isValid(path: string): boolean {
    return this.urlMatchPattern.test(path);
  }
}
