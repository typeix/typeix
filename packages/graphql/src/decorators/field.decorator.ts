import {createPropertyDecorator} from "@typeix/metadata";
import {ReturnTypeFn, TypeOptions} from "./types";
import {isFunction, isObject, isUndefined} from "@typeix/utils";
/**
 * Field
 * @decorator
 * @function
 * @name Field
 *
 * @description
 * Field declaration
 */
export function Field(): PropertyDecorator;
export function Field(options: TypeOptions): PropertyDecorator;
export function Field(fn?: ReturnTypeFn, options?: TypeOptions): PropertyDecorator;
export function Field(fn?: ReturnTypeFn | TypeOptions, options?: TypeOptions) {
  if (isObject(options) && isFunction(fn)) {
    return createPropertyDecorator(Field, {fn, ...options});
  } else if (isUndefined(options) && isObject(fn)) {
    return createPropertyDecorator(Field, {...fn});
  }
  return createPropertyDecorator(Field, {fn});
}
