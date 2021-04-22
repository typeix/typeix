import {isArray} from "@typeix/utils";
import {IProvider, verifyProviders} from "@typeix/di";
import {createClassDecorator} from "@typeix/metadata";
import {RequestInterceptorConstructor} from "../interfaces";

/**
 * @since 1.0.0
 * @interface
 * @name IControllerMetadata
 *
 * @description
 * ControllerResolver metadata
 */
export interface IControllerMetadata {
  path: string;
  interceptors?: Array<RequestInterceptorConstructor>;
  providers?: Array<IProvider|Function>;
}
/**
 * ControllerResolver
 * @decorator
 * @function
 * @name Controller
 *
 * @param {IModuleMetadata} config
 * @returns {function(any): any}
 *
 * @description
 * Define controller of application
 */
export function Controller(config: IControllerMetadata) {
  if (!isArray(config.providers)) {
    config.providers = [];
  }
  config.providers = verifyProviders(config.providers);
  return createClassDecorator(Controller, config);
}
