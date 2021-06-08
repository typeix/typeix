import {createClassDecorator} from "@typeix/metadata";
import {ArgOptions} from "./types";

/**
 * ObjectType
 * @decorator
 * @function
 * @name ObjectType
 *
 * @description
 * object type
 */
export function ObjectType(options: ArgOptions) {
  return createClassDecorator(ObjectType, {...options});
}
