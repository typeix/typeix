import {createParameterAndPropertyDecorator} from "@typeix/metadata";
import {IProvider} from "../interfaces";
import {verifyProvider} from "../helpers/provider";

/**
 * CreateInstance
 * @param {IProvider} token
 */
export function CreateProvider(token: Function | IProvider) {
  return createParameterAndPropertyDecorator(CreateProvider, {token: verifyProvider(token)});
}
