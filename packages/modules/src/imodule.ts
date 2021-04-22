import {IProvider} from "@typeix/di";

/**
 * @since 1.0.0
 * @interface
 * @name IModuleMetadata
 * @param {Array<Function|IProvider>} imports
 * @param {Array<Function|IProvider>} exports
 * @param {Array<IProvider|Function>} providers
 *
 * @description
 * Bootstrap class config metadata
 */
export interface IModuleMetadata {
  imports?: Array<Function | IProvider>;
  exports?: Array<Function | IProvider>;
  providers: Array<Function | IProvider>;
}
