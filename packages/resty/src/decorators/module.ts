import {Module as AModule, IModuleMetadata as AIModuleMetadata} from "@typeix/modules";
import {IProvider} from "@typeix/di";
import {isArray, isUndefined} from "@typeix/utils";

/**
 * @since 1.0.0
 * @interface
 * @name RootModuleMetadata
 * @param {Array<Function|IProvider>} imports
 * @param {Array<Function|IProvider>} exports
 * @param {Array<IProvider|Function>} providers
 * @param {Array<IProvider|Function>} controllers
 * @param {String} path
 *
 * @description
 * RootModuleMetadata metadata
 */
export interface RootModuleMetadata extends AIModuleMetadata {
  controllers: Array<Function | IProvider>;
  shared_providers?: Array<Function | IProvider>;
  path?: string;
}

/**
 * @since 1.0.0
 * @interface
 * @name IModuleMetadata
 * @param {Array<Function|IProvider>} imports
 * @param {Array<Function|IProvider>} exports
 * @param {Array<IProvider|Function>} providers
 * @param {Array<IProvider|Function>} controllers
 * @param {String} path
 *
 * @description
 * IModuleMetadata metadata
 */
export interface IModuleMetadata extends AIModuleMetadata {
  controllers?: Array<Function | IProvider>;
  path?: string;
}

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
 * import {Module, Logger, Router} from "@typeix/resty";
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
export function Module(config: IModuleMetadata): ClassDecorator {
  if (!isArray(config.exports)) {
    config.exports = [];
  }
  return AModule(config);
}
/**
 * Module decorator
 * @decorator
 * @function
 * @name RootModule
 *
 * @param {IModuleMetadata} config
 * @returns {function(any): any}
 *
 * @description
 * Define module in your application
 *
 * @example
 * import {Module, Logger, Router} from "@typeix/resty";
 *
 * \@RootModule({
 *  providers:[Logger, Router]
 * })
 * class Application{}
 */
export let RootModule = (config: RootModuleMetadata): ClassDecorator => {
  if (isUndefined(config.shared_providers)) {
    config.shared_providers = [];
  }
  return AModule(config);
};
