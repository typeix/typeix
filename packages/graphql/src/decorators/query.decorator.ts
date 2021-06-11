import {createMethodDecorator} from "@typeix/metadata";
import {ReturnTypeFn, TypeOptions} from "../types";
import {isFunction, isObject, isString, isUndefined} from "@typeix/utils";

/**
 * Query
 * @decorator
 * @function
 * @name Query
 *
 * @description
 * Query
 */
export function Query(): PropertyDecorator;
export function Query(name: string): MethodDecorator;
export function Query(fn?: ReturnTypeFn, options?: TypeOptions): PropertyDecorator;
export function Query(fn?: ReturnTypeFn | string, options?: TypeOptions) {
  if (isObject(options) && isFunction(fn)) {
    return createMethodDecorator(Query, {fn, options});
  } else if (isUndefined(options) && isString(fn)) {
    return createMethodDecorator(Query, {name: fn});
  }
  return createMethodDecorator(Query, {});
}
