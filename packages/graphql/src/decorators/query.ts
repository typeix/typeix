import {createMethodDecorator} from "@typeix/metadata";
import {ArgOptions, ArgType} from "./types";

/**
 * Query
 * @decorator
 * @function
 * @name Query
 *
 * @description
 * Query
 */
export function Query(arg: ArgType, options?: ArgOptions) {
  return createMethodDecorator(Query, {arg, options});
}
