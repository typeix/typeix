import {createClassDecorator} from "@typeix/metadata";

/**
 * Injectable decorator
 */
export function Injectable() {
  return createClassDecorator(Injectable);
}

