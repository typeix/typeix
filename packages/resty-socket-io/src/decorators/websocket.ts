import {IProvider, verifyProviders, createClassDecorator, isArray} from "@typeix/resty";
import {ServerOptions} from "socket.io";
import {MiddlewareClass} from "./events";

/**
 * @since 8.4.0
 * @interface
 * @name ISocketControllerOptions
 * @description
 * Websocket config
 */
export interface ISocketControllerOptions {
  providers?: Array<IProvider|Function>;
  middlewares?: Array<MiddlewareClass>;
  socketOptions?: Partial<ServerOptions>;
}
/**
 * ControllerResolver
 * @decorator
 * @function
 * @name WebSocket
 *
 * @param {IModuleMetadata} config
 * @returns {function(any): any}
 *
 * @description
 * Define controller of application
 */
export function SocketIOController(config: ISocketControllerOptions = {}) {
  if (!isArray(config.providers)) {
    config.providers = [];
  }
  config.providers = verifyProviders(config.providers);
  return createClassDecorator(SocketIOController, config);
}
