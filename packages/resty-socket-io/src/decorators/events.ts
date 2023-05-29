import {createMethodDecorator, Inject} from "@typeix/resty";
import {Socket} from "socket.io";
export const EVENT_ARGS = "@typeix:webSocketEventArgs";
export const EVENT_ARG = "@typeix:webSocketEventArg";
/**
 * Event
 * @decorator
 * @function
 * @name Subscribe
 *
 * @param {string} name
 * @param {string} namespace defaults to "/"
 * @returns {function(any): any}
 *
 * @description
 * Define controller of application
 */
export function Subscribe(name: string, namespace = "/") {
  return createMethodDecorator(Subscribe, {name, namespace});
}

/**
 * EventArgs
 * @decorator
 * @function
 * @name Args
 *
 * @description
 * Event Args
 */
export function Args() {
  return Inject(EVENT_ARGS);
}

/**
 * EventBody
 * @decorator
 * @function
 * @name Args
 *
 * @description
 * Event argument body
 */
export function Arg() {
  return Inject(EVENT_ARG);
}

/**
 * Middleware
 * @interface
 *
 * @description
 * Middleware definition
 */
export interface MiddlewareClass {
  new(): Middleware;
}

export interface Middleware {
  use(socket: Socket, next: (err?: Error) => void);
}
