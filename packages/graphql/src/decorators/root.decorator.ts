import {createParameterDecorator} from "@typeix/metadata";

/**
 * Root
 * @decorator
 * @function
 * @name Root
 *
 * @description
 * root property name
 */
export function Root(name?: string) {
  return createParameterDecorator(Root, {name});
}
