import {createMethodDecorator} from "@typeix/metadata";

/**
 * Subscription
 * @decorator
 * @function
 * @name Subscription
 *
 * @description
 * subscription
 */
export function Subscription() {
  return createMethodDecorator(Subscription, {});
}
