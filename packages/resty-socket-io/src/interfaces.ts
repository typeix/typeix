import {IModuleMetadata as AIModuleMetadata} from "@typeix/modules";
import {IProvider} from "@typeix/di";
import {IMetadata} from "@typeix/metadata";
import {ISocketControllerOptions} from "./decorators/websocket";

/**
 * @since 8.4.0
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
 * @since 8.4.0
 * @interface
 * @name SocketProvider
 *
 * @description
 * Router Provider
 */
export interface SocketProvider<P, M> {
  provider: P;
  metadata: M;
}
/**
 * @since 8.4.0
 * @interface
 * @name SocketDefinition
 *
 * @description
 * Router definitions
 */
export interface SocketDefinition {
  module?: SocketProvider<IProvider, IModuleMetadata>;
  controller: SocketProvider<IProvider, ISocketControllerOptions>;
  allControllerMetadata: Array<IMetadata>;
  events: Array<IMetadata>;
}
