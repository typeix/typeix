import {ArgOptions} from "./types";
import {createMethodDecorator} from "@typeix/metadata";

/**
 * Mutation
 * @decorator
 * @function
 * @name Mutation
 *
 * @description
 * Mutation
 */
export function Mutation(options: ArgOptions) {
  return createMethodDecorator(Mutation, {...options});
}
