import {ArgOptions} from "./types";
import {createMethodDecorator} from "@typeix/metadata";

/**
 * FieldResolver
 * @decorator
 * @function
 * @name FieldResolver
 *
 * @description
 * Field resolvers
 */
export function FieldResolver(options?: ArgOptions) {
  return createMethodDecorator(FieldResolver, {options});
}
