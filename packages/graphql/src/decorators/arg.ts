import {createParameterDecorator} from "@typeix/metadata";
import {ArgType} from "./types";

/**
 * Arg
 * @decorator
 * @function
 * @name Arg
 *
 * @description
 * Inject one argument
 */
export function Arg(name: string, options?: ArgType) {
  return createParameterDecorator(Arg, {name, options});
}

/**
 * Args
 * @decorator
 * @function
 * @name Args
 *
 * @description
 * Get all arguments
 */
export function Args(options: ArgType) {
  return createParameterDecorator(Args, {options});
}
