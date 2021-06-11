import {createClassDecorator} from "@typeix/metadata";
import { TypeOptions} from "../types";
import {isObject} from "@typeix/utils";

/**
 * InputType
 * @decorator
 * @function
 * @name InputType
 *
 * @description
 * Input type
 */
export function InputType(): ClassDecorator;
export function InputType(options: TypeOptions): ClassDecorator;
export function InputType(name: string, options?: TypeOptions): ClassDecorator;
export function InputType(name?: string | TypeOptions, options?: TypeOptions) {
  if (isObject(name)) {
    return createClassDecorator(InputType, {...<object>name});
  }
  return createClassDecorator(InputType, {name, ...options});
}
