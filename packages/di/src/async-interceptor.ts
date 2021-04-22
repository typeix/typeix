import {createMethodDecorator} from "@typeix/metadata";

/**
 * Tells executor that this method is Async
 */
export function AsyncInterceptor() {
  return createMethodDecorator(AsyncInterceptor, {});
}
