import {createParameterAndPropertyDecorator} from "@typeix/metadata";

/**
 * Inject
 * @param {Function | string} token
 * @param {boolean} isMutable
 * @returns {(Class: any, key?: string, paramIndex?: any) => any}
 */
export function Inject(token?: Function | string, isMutable = false) {
  return createParameterAndPropertyDecorator(Inject, {token, isMutable});
}
