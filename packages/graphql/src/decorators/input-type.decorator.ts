import {createClassDecorator} from "@typeix/metadata";
import {InputTypeOptions} from "./types";
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
export function InputType(options: InputTypeOptions): ClassDecorator;
export function InputType(name: string, options?: InputTypeOptions): ClassDecorator;
export function InputType(name?: string | InputTypeOptions, options?: InputTypeOptions) {
  if (isObject(name)) {
    return createClassDecorator(InputType, {...<object>name});
  }
  return createClassDecorator(InputType, {name, ...options});
}
