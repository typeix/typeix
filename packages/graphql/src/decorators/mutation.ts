import {MutationOptions, ReturnTypeFn} from "./types";
import {createPropertyDecorator} from "@typeix/metadata";
import {isFunction, isObject, isString, isUndefined} from "@typeix/utils";

/**
 * Mutation
 * @decorator
 * @function
 * @name Mutation
 *
 * @description
 * Mutation
 */
export function Mutation(): PropertyDecorator;
export function Mutation(name: string): MethodDecorator;
export function Mutation(fn?: ReturnTypeFn, options?: MutationOptions): PropertyDecorator;
export function Mutation(fn?: ReturnTypeFn | string, options?: MutationOptions) {
  if (isObject(options) && isFunction(fn)) {
    return createPropertyDecorator(Mutation, {fn, options});
  } else if (isUndefined(options) && isString(fn)) {
    return createPropertyDecorator(Mutation, {name: fn});
  }
  return createPropertyDecorator(Mutation, {});
}
