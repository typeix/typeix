import {createClassDecorator} from "@typeix/metadata";

/**
 * Resolver
 * @decorator
 * @function
 * @name Resolver
 *
 * @description
 * resolver type
 */
export function Resolver() {
  return createClassDecorator(Resolver, {});
}
