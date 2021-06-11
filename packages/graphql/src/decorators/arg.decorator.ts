import {createParameterDecorator} from "@typeix/metadata";
import {ArgsOptions} from "../types";

/**
 * Arg
 * @decorator
 * @function
 * @name Arg
 *
 * @description
 * Inject one argument
 */
export function Arg(name: string, options?: ArgsOptions) {
  return createParameterDecorator(Arg, {name, ...options});
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
export function Args(options?: ArgsOptions) {
  return createParameterDecorator(Args, {...options});
}
