import {createPropertyDecorator} from "@typeix/metadata";
import {ReturnTypeFn, FieldOptions} from "./types";
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
export function Field(options: FieldOptions): PropertyDecorator;
export function Field(fn?: ReturnTypeFn, options?: FieldOptions): PropertyDecorator;
export function Field(fn?: ReturnTypeFn | FieldOptions, options?: FieldOptions) {
  if (isObject(options) && isFunction(fn)) {
    return createPropertyDecorator(Field, {fn, options});
  } else if (isUndefined(options) && isObject(fn)) {
    return createPropertyDecorator(Field, {options: fn});
  }
  return createPropertyDecorator(Field, {fn});
}
