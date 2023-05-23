import {createMethodDecorator, Inject} from "@typeix/resty";

declare type SocketEvent = "close" | "error" | "message" | "open" | "ping" | "pong" | "redirect" | "upgrade" | "unexpected-response";
export const EVENT_ARGS = "@typeix:webSocketEventArgs";
/**
 * Event
 * @decorator
 * @function
 * @name Event
 *
 * @param {string} name
 * @returns {function(any): any}
 *
 * @description
 * Define controller of application
 */
export function Event(name: SocketEvent) {
  return createMethodDecorator(Event, {name});
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
