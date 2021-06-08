import {createClassDecorator} from "@typeix/metadata";
import {ArgOptions} from "./types";

/**
 * InputType
 * @decorator
 * @function
 * @name InputType
 *
 * @description
 * Input type
 */
export function InputType(options: ArgOptions) {
  return createClassDecorator(InputType, {...options});
}
