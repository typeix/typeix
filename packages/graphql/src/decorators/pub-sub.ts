import {createParameterDecorator} from "@typeix/metadata";

/**
 * PubSub
 * @decorator
 * @function
 * @name PubSub
 *
 * @description
 * pub sub
 */
export function PubSub() {
  return createParameterDecorator(PubSub, {});
}
