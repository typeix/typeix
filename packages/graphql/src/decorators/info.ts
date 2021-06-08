import {createPropertyDecorator} from "@typeix/metadata";

/**
 * Info
 * @decorator
 * @function
 * @name Info
 *
 * @description
 * Info resolver
 */
export function Info() {
  return createPropertyDecorator(Info, {});
}
