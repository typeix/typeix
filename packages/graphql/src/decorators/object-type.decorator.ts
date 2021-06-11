import {createClassDecorator} from "@typeix/metadata";
import {ObjectTypeOptions} from "../types";
import {isObject} from "@typeix/utils";

/**
 * ObjectType
 * @decorator
 * @function
 * @name ObjectType
 *
 * @description
 * object type
 */
export function ObjectType(name: string | ObjectTypeOptions, options?: ObjectTypeOptions) {
  if (isObject(name)) {
    return createClassDecorator(ObjectType, {...<object>name});
  }
  return createClassDecorator(ObjectType, {name, ...options});
}
