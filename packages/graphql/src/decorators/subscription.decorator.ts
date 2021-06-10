import {createMethodDecorator} from "@typeix/metadata";
import {ReturnTypeFn, SubscriptionOptions} from "./types";
import {isFunction} from "@typeix/utils";

/**
 * Subscription
 * @decorator
 * @function
 * @name Subscription
 *
 * @description
 * subscription
 */
export function Subscription(): MethodDecorator;
export function Subscription(name: string): MethodDecorator;
export function Subscription(name: string, options: Pick<SubscriptionOptions, "filter" | "resolve">): MethodDecorator;
export function Subscription(fn: ReturnTypeFn, options?: SubscriptionOptions): MethodDecorator;
export function Subscription(fn?: string | ReturnTypeFn, options: SubscriptionOptions = {}) {
  if (isFunction(fn)) {
    return createMethodDecorator(Subscription, {fn, ...options});
  }
  return createMethodDecorator(Subscription, {name: fn, ...options});
}
