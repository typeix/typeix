import {createParameterDecorator} from "@typeix/metadata";
import {ValidatorOptions} from "class-validator";
import {ReturnType} from "./types";

export interface ArgOptions {
  nullable?: boolean | "items" | "itemsAndList";
  defaultValue?: any;
  description?: string;
  validate?:  boolean | ValidatorOptions;
}
/**
 * Arg
 * @decorator
 * @function
 * @name Arg
 *
 * @description
 * Arg
 */
export function Arg(name: string, options?: ReturnType | ArgOptions) {
  return createParameterDecorator(Arg, {name, options});
}
