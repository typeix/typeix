import {createParameterDecorator} from "@typeix/metadata";

/**
 * Ctx
 * @decorator
 * @function
 * @name Ctx
 *
 * @description
 * Get context by name
 */
export function Ctx(name?: string) {
  return createParameterDecorator(Ctx, {name});
}
