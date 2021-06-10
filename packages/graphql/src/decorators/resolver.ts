import {createClassDecorator, createMethodDecorator} from "@typeix/metadata";
import {TypeOptions, ReturnTypeFn, Type} from "./types";
import {isString} from "@typeix/utils";


export type ResolverTypeFn = (of?: void) => Function;
/**
 * Resolver
 * @decorator
 * @function
 * @name Resolver
 *
 * @description
 * resolver type
 */
export function Resolver(): ClassDecorator;
export function Resolver(fn?: ResolverTypeFn | Type) {
  return createClassDecorator(Resolver, {fn});
}

/**
 * ResolveField
 * @decorator
 * @function
 * @name ResolveField
 *
 * @description
 * resolver field type
 */
export function ResolveField(fn?: ReturnTypeFn, options?: TypeOptions): MethodDecorator;
export function ResolveField(name?: string, fn?: ReturnTypeFn, options?: TypeOptions): MethodDecorator;
export function ResolveField(name?: string | ReturnTypeFn, fn?: ReturnTypeFn | TypeOptions, options?: TypeOptions) {
  if (isString(name)) {
    return createMethodDecorator(ResolveField, {name, fn, ...options});
  }
  return createMethodDecorator(ResolveField, {
    fn,
    ...options
  });
}
