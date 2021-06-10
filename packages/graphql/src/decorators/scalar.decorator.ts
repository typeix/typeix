import {ReturnTypeFn} from "./types";
import {createClassDecorator} from "@typeix/metadata";

/**
 * Scalar
 * @decorator
 * @function
 * @name Scalar
 *
 * @description
 * Scalar type
 */
export function Scalar(name: string): ClassDecorator;
export function Scalar(name: string, fn: ReturnTypeFn): ClassDecorator;
export function Scalar(name: string, fn?: ReturnTypeFn) {
  return createClassDecorator(Scalar, {name, fn});
}
