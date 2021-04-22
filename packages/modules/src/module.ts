import {IModuleMetadata} from "./imodule";
import {isArray} from "@typeix/utils";
import {createClassDecorator} from "@typeix/metadata";


/**
 * Module decorator
 * @decorator
 * @function
 * @name Module
 *
 * @param {IModuleMetadata} config
 * @returns {function(any): any}
 *
 * @description
 * Define module in your application
 *
 * @example
 * import {Module} from "@typeix/modules";
 * import {Logger} from "@typeix/utils";
 * import {Router} from "@typeix/router";
 *
 * \@Module({
 *  providers:[Logger, Router]
 * })
 * class Application{
 *    constructor(router: Router) {
 *
 *    }
 * }
 */

export function Module(config: IModuleMetadata) {
  if (!isArray(config.exports)) {
    config.exports = [];
  }
  if (!isArray(config.imports)) {
    config.imports = [];
  }
  return createClassDecorator(Module, config);
}
