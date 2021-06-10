import {TypeOptions, ReturnTypeFn} from "./types";
import {createMethodDecorator} from "@typeix/metadata";
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
export function Mutation(fn?: ReturnTypeFn, options?: TypeOptions): PropertyDecorator;
export function Mutation(fn?: ReturnTypeFn | string, options?: TypeOptions) {
  if (isObject(options) && isFunction(fn)) {
    return createMethodDecorator(Mutation, {fn, options});
  } else if (isUndefined(options) && isString(fn)) {
    return createMethodDecorator(Mutation, {name: fn});
  }
  return createMethodDecorator(Mutation, {});
}
