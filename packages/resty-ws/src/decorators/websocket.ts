import {PerMessageDeflateOptions} from "ws";
import {IProvider, verifyProviders, createClassDecorator, isArray} from "@typeix/resty";

/**
 * @since 8.4.0
 *
 * @description
 * backlog {Number} The maximum length of the queue of pending connections.
 * clientTracking {Boolean} Specifies to track clients.
 * maxPayload {Number} The maximum allowed message size in bytes. Defaults to 100 MiB (104857600 bytes).
 * path {String} Accept only connections matching this path.
 * perMessageDeflate {Boolean|Object} Enable/disable permessage-deflate.
 * skipUTF8Validation {Boolean} Specifies to skip UTF-8 validation for text and close messages. Defaults to false. Set to true only if clients are trusted.
 *
 */
export interface SocketOptions {
  backlog?: number | undefined;
  clientTracking?: boolean | undefined;
  maxPayload?: number | undefined;
  path?: string | undefined;
  perMessageDeflate?: boolean | PerMessageDeflateOptions | undefined;
  skipUTF8Validation?: boolean | undefined;
}

/**
 * @since 8.4.0
 * @interface
 * @name ISocketControllerOptions
 * @description
 * Websocket config
 */
export interface ISocketControllerOptions {
  providers?: Array<IProvider|Function>;
  socketOptions?: SocketOptions;
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
export function WebSocketController(config: ISocketControllerOptions) {
  if (!isArray(config.providers)) {
    config.providers = [];
  }
  config.providers = verifyProviders(config.providers);
  return createClassDecorator(WebSocketController, config);
}
