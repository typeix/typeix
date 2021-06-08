import {createPropertyDecorator} from "@typeix/metadata";
import {ReturnTypeFn} from "./types";

/**
 * Field
 * @decorator
 * @function
 * @name Field
 *
 * @description
 * Field declaration
 */
export function Field(fn?: ReturnTypeFn) {
  return createPropertyDecorator(Field, {fn});
}
