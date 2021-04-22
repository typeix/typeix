import {createMethodDecorator} from "@typeix/metadata";

/**
 * AfterConstruct
 */
export function AfterConstruct() {
  return createMethodDecorator(AfterConstruct, {});
}
